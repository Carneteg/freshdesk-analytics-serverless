# GCP SECRET MANAGER SETUP GUIDE

## 1. Skapa Secrets i GCP Secret Manager

```bash
# Logga in i GCP
gcloud auth login

# Sätt ditt projekt
gcloud config set project YOUR_PROJECT_ID

# Skapa secrets
echo -n "simployer.freshdesk.com" | gcloud secrets create freshdesk-domain --data-file=-
echo -n "7A0j7iVEYJnIw4GMViUb" | gcloud secrets create freshdesk-api-key --data-file=-

# Verifiera
gcloud secrets list
```

## 2. Ge Cloud Run-tjänsten access till secrets

```bash
# Få service account för din Cloud Run-tjänst
SERVICE_ACCOUNT=$(gcloud run services describe YOUR_SERVICE_NAME \
  --region=YOUR_REGION \
  --format='value(spec.template.spec.serviceAccountName)')

# Ge rättigheter
gcloud secrets add-iam-policy-binding freshdesk-domain \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"

gcloud secrets add-iam-policy-binding freshdesk-api-key \
  --member="serviceAccount:$SERVICE_ACCOUNT" \
  --role="roles/secretmanager.secretAccessor"
```

## 3. Uppdatera Cloud Run deployment

### Option A: Via gcloud CLI

```bash
gcloud run deploy freshdesk-worker \
  --image gcr.io/YOUR_PROJECT/freshdesk-worker:latest \
  --region YOUR_REGION \
  --set-secrets="FRESHDESK_DOMAIN=freshdesk-domain:latest,FRESHDESK_API_KEY=freshdesk-api-key:latest"
```

### Option B: Via YAML (cloud-run.yaml)

```yaml
apiVersion: serving.knative.dev/v1
kind: Service
metadata:
  name: freshdesk-worker
spec:
  template:
    metadata:
      annotations:
        run.googleapis.com/secrets/FRESHDESK_DOMAIN: projects/YOUR_PROJECT_ID/secrets/freshdesk-domain:latest
        run.googleapis.com/secrets/FRESHDESK_API_KEY: projects/YOUR_PROJECT_ID/secrets/freshdesk-api-key:latest
    spec:
      containers:
      - image: gcr.io/YOUR_PROJECT/freshdesk-worker:latest
        env:
        - name: FRESHDESK_DOMAIN
          valueFrom:
            secretKeyRef:
              name: freshdesk-domain
              key: latest
        - name: FRESHDESK_API_KEY
          valueFrom:
            secretKeyRef:
              name: freshdesk-api-key
              key: latest
```

## 4. Uppdatera Python-kod för Secret Manager

### Install dependencies

```bash
pip install google-cloud-secret-manager
```

### Skapa `src/utils/secrets.py`

```python
import os
from google.cloud import secretmanager
from functools import lru_cache

class SecretManager:
    def __init__(self):
        self.project_id = os.getenv('GCP_PROJECT_ID')
        self.client = secretmanager.SecretManagerServiceClient() if self.project_id else None
    
    @lru_cache(maxsize=128)
    def get_secret(self, secret_name: str, version: str = 'latest') -> str:
        """
        Hämta secret från GCP Secret Manager.
        Fallback till miljövariabler för lokal utveckling.
        """
        # Lokal utveckling: använd .env.local
        if not self.client:
            return os.getenv(secret_name.upper().replace('-', '_'))
        
        # Produktion: hämta från Secret Manager
        name = f"projects/{self.project_id}/secrets/{secret_name}/versions/{version}"
        
        try:
            response = self.client.access_secret_version(request={"name": name})
            return response.payload.data.decode('UTF-8')
        except Exception as e:
            print(f"Error fetching secret {secret_name}: {e}")
            # Fallback till env vars
            return os.getenv(secret_name.upper().replace('-', '_'))

secret_manager = SecretManager()
```

### Uppdatera `src/services/freshdesk_client.py`

```python
import requests
from requests.auth import HTTPBasicAuth
from src.utils.secrets import secret_manager

class FreshdeskClient:
    def __init__(self):
        self.domain = secret_manager.get_secret('freshdesk-domain')
        self.api_key = secret_manager.get_secret('freshdesk-api-key')
        self.base_url = f"https://{self.domain}/api/v2"
        self.auth = HTTPBasicAuth(self.api_key, 'X')
    
    def get_tickets(self, updated_since=None, per_page=100, page=1):
        params = {
            'per_page': per_page,
            'page': page
        }
        if updated_since:
            params['updated_since'] = updated_since
        
        response = requests.get(
            f"{self.base_url}/tickets",
            auth=self.auth,
            params=params,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
    
    def get_conversations(self, ticket_id: int):
        response = requests.get(
            f"{self.base_url}/tickets/{ticket_id}/conversations",
            auth=self.auth,
            timeout=30
        )
        response.raise_for_status()
        return response.json()
```

## 5. Lokal utveckling (.env.local)

För lokal utveckling, skapa `.env.local`:

```bash
# Freshdesk
FRESHDESK_DOMAIN=simployer.freshdesk.com
FRESHDESK_API_KEY=7A0j7iVEYJnIw4GMViUb

# GCP (lämna tom för lokal dev)
GCP_PROJECT_ID=

# Database
DATABASE_URL=postgresql://user:password@localhost:5432/freshdesk

# API
API_BASE_URL=http://localhost:8000
```

## 6. Säkerhetsbest practices

✅ **Gör**:
- Använd Secret Manager för produktion
- Rotera secrets regelbundet
- Använd minsta möjliga rättigheter (principle of least privilege)
- Logga inte secrets i kod eller loggar
- Använd `.env.local` för lokal dev (aldrig committa)

❌ **Gör INTE**:
- Commita `.env.local` till Git
- Logga API-nycklar i kod
- Dela secrets via chat/email
- Använd samma secrets för dev/staging/prod

## 7. Testa lokalt

```bash
# Installera dependencies
pip install -r requirements.txt

# Kör med lokal .env.local
python -m src.worker.sync_service
```

## 8. Deploy till Cloud Run

```bash
# Bygg och deploya
gcloud builds submit --tag gcr.io/YOUR_PROJECT/freshdesk-worker

gcloud run deploy freshdesk-worker \
  --image gcr.io/YOUR_PROJECT/freshdesk-worker:latest \
  --region europe-north1 \
  --set-secrets="FRESHDESK_DOMAIN=freshdesk-domain:latest,FRESHDESK_API_KEY=freshdesk-api-key:latest" \
  --set-env-vars="GCP_PROJECT_ID=YOUR_PROJECT_ID"
```

---

## 🔐 Secrets rotation (best practice)

Rotera secrets var 90:e dag:

```bash
# Skapa ny version
echo -n "NEW_API_KEY" | gcloud secrets versions add freshdesk-api-key --data-file=-

# Uppdatera Freshdesk API key i Freshdesk admin panel
# Verifiera att nya nyckeln fungerar

# Inaktivera gammal version
gcloud secrets versions disable 1 --secret=freshdesk-api-key
```
