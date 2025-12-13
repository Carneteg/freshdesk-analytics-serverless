# CHATGPT PROMPT: GENERATE FRESHDESK DASHBOARD PAGES

> **Använd denna prompt för att få ChatGPT/Claude att generera alla återstående dashboard-sidor**

---

## KONTEXT

Jag bygger en Next.js 14 dashboard för Customer Care Managers som analyserar Freshdesk-support. Jag har redan skapat:
- ✅ lib/types.ts (alla TypeScript interfaces)
- ✅ lib/api-client.ts (komplett API-klient)
- ✅ lib/utils.ts (helper-funktioner)

Nu behöver jag att du genererar alla dashboard-sidor.

---

## FASTSTÄLLT API-KONTRAKT

Du får ENDAST använda dessa funktioner från lib/api-client.ts:

```typescript
// Sync Status
apiClient.getSyncStatus(): Promise<SyncStatus>

// Metrics
apiClient.getMetricsSummary(filters): Promise<MetricsSummary>
apiClient.getVolumeData(filters): Promise<VolumeDataPoint[]>
apiClient.getBacklogData(filters): Promise<BacklogDataPoint[]>
apiClient.getFRTMetrics(filters): Promise<FRTMetric[]>
apiClient.getResolutionMetrics(filters): Promise<ResolutionMetric[]>
apiClient.getOldestOpenTickets(filters): Promise<OldestTicket[]>
apiClient.getTopTags(filters): Promise<TagCount[]>

// Reference Data
apiClient.getAgents(): Promise<Agent[]>
apiClient.getGroups(): Promise<Group[]>

// Ticket Detail
apiClient.getTicketDetail(ticketId): Promise<TicketDetail>
```

**filters** har typen `Partial<FilterState>` med:
```typescript
interface FilterState {
  from: Date;
  to: Date;
  group_id: number | null;
  agent_id: number | null;
  tag: string | null;
}
```

---

## SIDOR SOM SKA GENERERAS

### 1. app/page.tsx - Overview
**Syfte**: Ge Customer Care Manager en snabb översikt: "Var brinner det?"  
**Innehåll**:
- KPI cards: Total tickets, Backlog, Median FRT, P90 FRT, Median Resolution, P90 Resolution
- Volume trend chart (created vs resolved över tid)
- Backlog trend chart
- "Worst performing groups" tabell (groups med högst backlog eller långsammast FRT)
- "Emerging tags" (top 10 tags senaste veckan)

**UX-krav**:
- Använd useQuery från @tanstack/react-query
- Visa loading states
- Visa empty states om ingen data
- Alla KPI cards ska ha tooltips som förklarar definitionen
- FRT tooltip: "First Response Time = tid från ticket skapades till första publika agentsvar (ej automationer)"
- Resolution tooltip: "Resolution Time = tid från skapande till resolved/closed"

### 2. app/backlog/page.tsx - Backlog & Aging
**Syfte**: Visa vad som behöver åtgärdas akut  
**Innehåll**:
- Aging distribution (buckets: 0-24h, 1-3d, 3-7d, 7-14d, 14-30d, 30d+)
- Oldest open tickets table (ticket ID, subject, age, status, priority, group, agent) med klickbara rader → ticket detail
- Backlog trend chart

**UX-krav**:
- Färgkoda aging buckets (grön → röd baserat på ålder)
- Sorterbar tabell
- Click-to-drilldown på ticket ID

### 3. app/team/page.tsx - Team & Agent Performance
**Syfte**: Visa vem som presterar bra/dåligt  
**Innehåll**:
- Agent leaderboard (agent name, solved tickets, avg FRT, avg resolution time)
- Group performance comparison
- Filter: välj specifik grupp eller agent

**UX-krav**:
- Sortable columns
- Highlight top/bottom performers

### 4. app/drivers/page.tsx - Drivers (Tags/Topics)
**Syfte**: Vad orsakar flest tickets?  
**Innehåll**:
- Top tags bar chart
- Tag trend över tid (om möjligt, annars bara static top 10)
- Filter: date range

### 5. app/health/page.tsx - Data Health
**Syfte**: Säkerställ att data är pålitlig  
**Innehåll**:
- Sync status card (från getSyncStatus)
- Last sync timestamp
- Tickets synced, Conversations synced, Agents synced
- Error log (om last_error finns)

### 6. app/ticket/[id]/page.tsx - Ticket Detail
**Syfte**: Full kontext om ett specifikt ärende  
**Innehåll**:
- Ticket metadata (subject, status, priority, created, resolved, requester, agent, group)
- Tags
- FRT calculation explanation (visa `frt_explanation` från API)
- Conversation timeline (sorted by created_at, visa incoming/private status)

**UX-krav**:
- Visa FRT med färgkodning (grön om <1h, gul om 1-4h, röd om >4h)
- Visa tydligt hur FRT beräknades

---

## TEKNISKA KRAV

**Måste-krav**:
1. All data fetching via apiClient (aldrig direkt fetch)
2. Använd useQuery från @tanstack/react-query med cacheTime: 5 minuter
3. Alla komponenter ska vara 'use client'
4. Använd shadcn/ui komponenter: Card, Table, Badge, Button
5. Använd Recharts för charts: LineChart, BarChart
6. Responsive layout (Tailwind grid/flex)
7. Error boundaries & empty states
8. Loading skeletons

**Kodstandard**:
```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Card } from '@/components/ui/card';
// ...

export default function OverviewPage() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['metrics-summary', filters],
    queryFn: () => apiClient.getMetricsSummary(filters),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) return <LoadingSkeleton />;
  if (error) return <ErrorState />;
  if (!data) return <EmptyState />;

  return (
    <div className="p-6 space-y-6">
      {/* content */}
    </div>
  );
}
```

---

## OUTPUT-FORMAT

Ge mig komplett, körklar kod för varje sida i separata kodblock.

Format:
```markdown
### app/page.tsx (Overview)
```typescript
'use client';
// full kod här
```

### app/backlog/page.tsx
```typescript
// full kod här
```
```

---

## EXEMPEL: KORREKT ANVÄNDNING AV API-KLIENTEN

Här är ett komplett exempel på en sida som följer alla regler:

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { useState } from 'react';
import { apiClient } from '@/lib/api-client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { formatDuration, formatNumber } from '@/lib/utils';
import { subDays } from 'date-fns';

export default function ExamplePage() {
  const [filters, setFilters] = useState({
    from: subDays(new Date(), 7),
    to: new Date(),
    group_id: null,
    agent_id: null,
    tag: null,
  });

  const { data: summary, isLoading, error } = useQuery({
    queryKey: ['metrics-summary', filters],
    queryFn: () => apiClient.getMetricsSummary(filters),
    staleTime: 5 * 60 * 1000,
  });

  if (isLoading) {
    return (
      <div className="p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-32 bg-gray-200 rounded"></div>
          <div className="h-32 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6">
        <Card className="border-red-200 bg-red-50">
          <CardContent className="pt-6">
            <p className="text-red-600">Failed to load data. Please try again.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!summary) {
    return (
      <div className="p-6">
        <Card>
          <CardContent className="pt-6">
            <p className="text-muted-foreground">No data available for the selected period.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Total Tickets</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.total_tickets)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {summary.period_start} - {summary.period_end}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Backlog</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatNumber(summary.backlog)}</div>
            <p className="text-xs text-muted-foreground mt-1">Open tickets</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-sm font-medium">Median FRT</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{formatDuration(summary.median_frt_seconds)}</div>
            <p className="text-xs text-muted-foreground mt-1">
              P90: {formatDuration(summary.p90_frt_seconds)}
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
```

---

## VIKTIGA PÅMINNELSER

❌ **Gör INTE**:
- Skapa nya API-endpoints
- Ändra API-kontrakt eller response-typer
- Använd direkt fetch() istället för apiClient
- Skapa nya interfaces som inte finns i lib/types.ts

✅ **Gör**:
- Följ exemplet ovan exakt
- Använd ENDAST apiClient-funktioner
- Använd ENDAST typer från lib/types.ts
- Fokusera på UX: loading states, error states, empty states
- Lägg till tooltips för att förklara KPI:er
- Gör tabeller klickbara för drilldown

---

Genererera nu alla 6 sidorna enligt ovan.
