# PROMPT: PRODUCTION HARDENING & GO-LIVE REVIEW (Freshdesk Analytics)

Du är en principal engineer / staff+ reviewer med ansvar för att godkänna system för produktion i ett SaaS-bolag.

Du ska granska en färdig, deploybar serverless Freshdesk Ticket Analytics-plattform.

## 🎯 Mål
Identifiera exakta ändringar som krävs för att:
- minimera produktionsrisk
- säkerställa korrekt data (särskilt FRT & incremental sync)
- förhindra driftproblem i Cloud Run + Supabase
- göra lösningen redo för verklig trafik och riktiga Freshdesk-credentials

Prioritera kritiska fixes först, sedan förbättringar.

## 📦 Systemöversikt (byggt och klart)

### Arkitektur
- Worker service: syncar Freshdesk → Postgres (Cloud Scheduler var 30:e minut)
- API service: exponerar KPI-metrics
- UI service: Streamlit dashboard
- DB: Supabase Postgres (RAW + curated + sync_state)
- Deploy: GCP Cloud Run + Cloud Scheduler
- Mock mode: fixtures/*.json via FRESHDESK_MOCK=true

### Teknik
- Python 3.11
- FastAPI
- SQLAlchemy + Alembic
- pandas + duckdb
- Tenacity retry/backoff
- ThreadPoolExecutor (max 5 workers) för conversations
- Docker + docker-compose

## 🧠 Viktiga implementationer
- Incremental sync via updated_since + 5 min overlap buffer
- RAW JSON + curated tables
- FRT beräknas via första conversation där incoming=False och private=False. **FRT ska spegla första publika agentsvar till requester, inte automationer eller systemhändelser.**
- Resolution time = COALESCE(resolved_at, closed_at) - created_at
- Backlog = tickets med status NOT IN (4,5)
- Connection pooling: pool_size=10, max_overflow=20
- Pagination: per_page=100
- Retry: exponential backoff + jitter (429/5xx)

## 🔎 Din granskningsuppgift

### 1️⃣ Kritiska risker (MÅSTE FIXAS)
Identifiera:
- buggar
- race conditions
- datatapp
- felaktiga KPI-definitioner
- risker med Cloud Run autoscaling + DB connections

För varje punkt:
- 🔴 Varför det är kritiskt
- 🛠 Exakt hur det ska fixas
- ✏️ Kod- eller pseudokodförslag

### 2️⃣ Freshdesk-specifik korrekthet
Granska:
- **FRT-definition (agent vs requester, incoming/outgoing, automation)** 
  **FRT ska spegla första publika agentsvar till requester, inte automationer eller systemhändelser.**
- Incremental sync-strategi (watermark, overlap, pagination)
- Retry/backoff & rate limit-hantering
- Edge cases (out-of-order updates, retries, partial failures)

Svara tydligt: vad är korrekt, vad är tveksamt, vad är fel

### 3️⃣ Databas & schema
Bedöm:
- Är RAW + curated rätt för analytics?
- Saknas index för queries som används i dashboard?
- Är sync_state tillräcklig eller bör den delas per entity?
- Är upserts verkligen idempotenta?

Ge konkreta förbättringsförslag.

### 4️⃣ Skalbarhet & prestanda
Analysera:
- ThreadPoolExecutor vs asyncio i detta sammanhang
- Analytics queries (group by + date_trunc)
- Behov av caching / pre-aggregation
- DB-connection pooling i Cloud Run

Prioritera låg komplexitet / hög effekt.

### 5️⃣ Säkerhet & production readiness
Granska:
- Secrets & env vars
- Logging (risk för PII / API-key-läckor)
- UI → API-exponering
- Health checks & failure visibility

Vad som krävs för att klara en extern säkerhetsgranskning

### 6️⃣ Feature gaps (ej blockerande, men viktiga)
Identifiera:
- Saknade KPI:er som brukar krävas i support analytics
- Hur reopen rate kan approximeras utan native reopen-fält
- Vad som är "next obvious step" efter MVP

## 📤 OUTPUT-FORMAT (STRIKT)

Svara strukturerat så här:

### 🔴 Kritiska fixes (måste göras före go-live)
…
…

### 🟡 Viktiga förbättringar (nästa iteration)
…
…

### ⚡ Performance & scale wins
…

### 🔒 Säkerhetsrisker
…

### 💡 Feature gaps
…

### ✅ Go-live rekommendation
**Redo att gå live?** (JA / JA MED FIXES / NEJ)

Kort motivering

---

**Undvik generella råd.**
**Var konkret.**
**Anta att detta ska användas i skarpt SaaS-bolag med riktiga kunder.**

Börja granska nu.