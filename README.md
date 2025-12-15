# Freshdesk Analytics Dashboard

Real-time analytics dashboard for Freshdesk ticket management with SLA monitoring, drilldown capabilities, and team performance tracking.

## Features

- **Real-time Metrics**: Backlog, aging tickets, resolution times, and SLA compliance
- **Interactive Drilldown**: Click metrics to view detailed ticket lists
- **Group & Agent Analytics**: Team performance tracking with caching
- **Risk Assessment**: Visual indicators (green/amber/red) for ticket age
- **Responsive Design**: Works on desktop and mobile

## Prerequisites

- Node.js 20.x or higher
- Freshdesk account with API access
- npm or yarn

## Setup

### 1. Clone the repository

```bash
git clone https://github.com/carmeapp/freshdesk-analytics-serverless.git
cd freshdesk-analytics-serverless
```

### 2. Install dependencies

```bash
npm install
```

### 3. Configure environment variables

Copy `.env.example` to `.env.local`:

```bash
cp .env.example .env.local
```

Edit `.env.local` and add your Freshdesk credentials:

```env
FRESHDESK_DOMAIN=https://your-domain.freshdesk.com
FRESHDESK_API_KEY=your_api_key_here
```

**Required environment variables:**

- `FRESHDESK_DOMAIN`: Your Freshdesk domain (e.g., `https://company.freshdesk.com`)
- `FRESHDESK_API_KEY`: Your Freshdesk API key (found in Profile Settings → API Key)

### 4. Run development server

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) to view the dashboard.

## Development

### Available Scripts

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript type checking
```

### Project Structure

```
freshdesk-analytics-serverless/
├── dashboard/
│   ├── app/
│   │   ├── api/
│   │   │   ├── _lib/          # Shared utilities and Freshdesk helpers
│   │   │   ├── drilldown/     # Drilldown API routes
│   │   │   ├── health/        # Health check endpoints
│   │   │   └── metrics/       # Metrics calculation routes
│   │   ├── components/        # React components
│   │   ├── kpi/              # KPI definitions
│   │   ├── layout/           # Layout components
│   │   └── pages/            # Next.js pages
│   ├── node_modules/
│   ├── styles/
│   └── ui/
├── .github/
│   └── workflows/            # CI/CD workflows
├── .env.example              # Environment template
├── .env.local                # Your local config (gitignored)
├── .gitignore
├── package.json
└── README.md
```

### API Endpoints

#### Metrics

- `GET /api/metrics/backlog` - Current backlog count
- `GET /api/metrics/aging-tickets` - Tickets aging analysis
- `GET /api/metrics/resolution-time` - Average resolution times

#### Drilldown

- `GET /api/drilldown/tickets?metric=backlog` - Detailed ticket list with filters

#### Health

- `GET /api/health` - API health check

## Deployment

### Vercel (Recommended)

1. Connect your GitHub repository to Vercel
2. Add environment variables in Vercel dashboard:
   - `FRESHDESK_DOMAIN`
   - `FRESHDESK_API_KEY`
3. Deploy

### Docker

```bash
docker build -t freshdesk-analytics .
docker run -p 3000:3000 \
  -e FRESHDESK_DOMAIN=https://your-domain.freshdesk.com \
  -e FRESHDESK_API_KEY=your_key \
  freshdesk-analytics
```

## Contributing

1. Create a feature branch: `git checkout -b feature/your-feature`
2. Make changes and commit: `git commit -m "feat: add feature"`
3. Push to branch: `git push origin feature/your-feature`
4. Open a Pull Request

### Commit Convention

We use conventional commits:

- `feat:` New feature
- `fix:` Bug fix
- `docs:` Documentation changes
- `chore:` Maintenance tasks
- `refactor:` Code refactoring
- `test:` Test changes

## Security

- **Never commit `.env.local`** - It contains sensitive API keys
- Store secrets in GitHub Secrets for CI/CD
- Use environment-specific configurations for staging/production

## License

Private repository - All rights reserved.

## Support

For issues or questions, open an issue in the GitHub repository.
