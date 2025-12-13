# FRESHDESK ANALYTICS DASHBOARD - COMPLETE CODE

> **100% Production-Ready Next.js 14 Dashboard**  
> TypeScript • Tailwind • shadcn/ui • Recharts • React Query

Denna fil innehåller all kod du behöver för att bygga en komplett, UX-vänlig Customer Care Manager dashboard.

## 📋 Table of Contents

1. [Quick Start](#quick-start)
2. [Configuration Files](#configuration-files)
3. [Library & Utilities](#library--utilities)
4. [Components](#components)
5. [Pages](#pages)
6. [Backend API Endpoints](#backend-api-endpoints)
7. [Deployment](#deployment)

---

## Quick Start

```bash
# 1. Create Next.js project (if not done)
cd dashboard
npm install

# 2. Set environment variables
cp .env.example .env.local
# Edit .env.local with your API_BASE_URL

# 3. Run development server
npm run dev

# 4. Build for production
npm run build
npm start
```

---

## Configuration Files

### `package.json`

```json
{
  "name": "freshdesk-dashboard",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint"
  },
  "dependencies": {
    "next": "14.0.4",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@tanstack/react-query": "^5.17.0",
    "recharts": "^2.10.3",
    "date-fns": "^3.0.6",
    "lucide-react": "^0.303.0",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.1.0",
    "tailwind-merge": "^2.2.0"
  },
  "devDependencies": {
    "typescript": "^5.3.3",
    "@types/node": "^20.10.6",
    "@types/react": "^18.2.46",
    "@types/react-dom": "^18.2.18",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.32",
    "tailwindcss": "^3.4.0",
    "eslint": "^8.56.0",
    "eslint-config-next": "14.0.4"
  }
}
```


### `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2017",
    "lib": ["dom", "dom.iterable", "esnext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "esnext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "preserve",
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ],
    "paths": {
      "@/*": ["./*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

### `tailwind.config.ts`

```typescript
import type { Config } from "tailwindcss";

const config: Config = {
  darkMode: ["class"],
  content: [
    "./pages/**/*.{ts,tsx}",
    "./components/**/*.{ts,tsx}",
    "./app/**/*.{ts,tsx}",
  ],
  theme: {
    container: {
      center: true,
      padding: "2rem",
      screens: {
        "2xl": "1400px",
      },
    },
    extend: {
      colors: {
        border: "hsl(var(--border))",
        input: "hsl(var(--input))",
        ring: "hsl(var(--ring))",
        background: "hsl(var(--background))",
        foreground: "hsl(var(--foreground))",
        primary: {
          DEFAULT: "hsl(var(--primary))",
          foreground: "hsl(var(--primary-foreground))",
        },
        secondary: {
          DEFAULT: "hsl(var(--secondary))",
          foreground: "hsl(var(--secondary-foreground))",
        },
        destructive: {
          DEFAULT: "hsl(var(--destructive))",
          foreground: "hsl(var(--destructive-foreground))",
        },
        muted: {
          DEFAULT: "hsl(var(--muted))",
          foreground: "hsl(var(--muted-foreground))",
        },
        accent: {
          DEFAULT: "hsl(var(--accent))",
          foreground: "hsl(var(--accent-foreground))",
        },
        popover: {
          DEFAULT: "hsl(var(--popover))",
          foreground: "hsl(var(--popover-foreground))",
        },
        card: {
          DEFAULT: "hsl(var(--card))",
          foreground: "hsl(var(--card-foreground))",
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
    },
  },
  plugins: [require("tailwindcss-animate")],
};

export default config;
```

### `next.config.js`

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  env: {
    API_BASE_URL: process.env.API_BASE_URL || 'http://localhost:8000',
  },
};

module.exports = nextConfig;
```

### `.env.example`

```bash
# API Configuration
API_BASE_URL=http://localhost:8000

# Optional: Dashboard Authentication (if implementing)
DASHBOARD_AUTH=false
```

---

## Library & Utilities

### `lib/types.ts`

```typescript
// API Response Types
export interface SyncStatus {
  last_run_at: string | null;
  last_status: 'success' | 'failed' | 'running';
  last_error: string | null;
  tickets_synced: number;
  conversations_synced: number;
  agents_synced: number;
}

export interface MetricsSummary {
  period_start: string;
  period_end: string;
  total_tickets: number;
  open_tickets: number;
  resolved_tickets: number;
  backlog: number;
  median_frt_seconds: number | null;
  p90_frt_seconds: number | null;
  median_resolution_seconds: number | null;
  p90_resolution_seconds: number | null;
}

export interface VolumeDataPoint {
  date: string;
  created: number;
  resolved: number;
}

export interface BacklogDataPoint {
  date: string;
  backlog: number;
}

export interface FRTMetric {
  ticket_id: number;
  subject: string;
  frt_seconds: number | null;
  first_reply_at: string | null;
  created_at: string;
}

export interface ResolutionMetric {
  ticket_id: number;
  subject: string;
  resolution_seconds: number | null;
  created_at: string;
  resolved_at: string | null;
}

export interface OldestTicket {
  ticket_id: number;
  subject: string;
  created_at: string;
  age_days: number;
  status: string;
  priority: string;
  group_id: number | null;
  agent_id: number | null;
}

export interface TagCount {
  tag: string;
  count: number;
}

export interface Agent {
  id: number;
  name: string;
  email: string;
  active: boolean;
}

export interface Group {
  id: number;
  name: string;
  description: string | null;
}

export interface TicketDetail {
  id: number;
  subject: string;
  description: string;
  status: string;
  priority: string;
  created_at: string;
  updated_at: string;
  resolved_at: string | null;
  closed_at: string | null;
  requester_id: number;
  agent_id: number | null;
  group_id: number | null;
  tags: string[];
  frt_seconds: number | null;
  frt_explanation: string;
  conversations: Conversation[];
}

export interface Conversation {
  id: number;
  body: string;
  created_at: string;
  incoming: boolean;
  private: boolean;
  user_id: number;
  source: string;
}

// Filter State
export interface FilterState {
  from: Date;
  to: Date;
  group_id: number | null;
  agent_id: number | null;
  tag: string | null;
}

// Chart Data
export interface ChartDataPoint {
  name: string;
  value: number;
  [key: string]: any;
}
```

### `lib/api-client.ts`

```typescript
import { format } from 'date-fns';
import type {
  SyncStatus,
  MetricsSummary,
  VolumeDataPoint,
  BacklogDataPoint,
  FRTMetric,
  ResolutionMetric,
  OldestTicket,
  TagCount,
  Agent,
  Group,
  TicketDetail,
  FilterState,
} from './types';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || process.env.API_BASE_URL || 'http://localhost:8000';

class APIClient {
  private baseURL: string;

  constructor(baseURL: string = API_BASE_URL) {
    this.baseURL = baseURL;
  }

  private async fetch<T>(endpoint: string, options?: RequestInit): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    
    try {
      const response = await fetch(url, {
        ...options,
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error(`Failed to fetch ${endpoint}:`, error);
      throw error;
    }
  }

  private buildQueryParams(filters: Partial<FilterState>): string {
    const params = new URLSearchParams();
    
    if (filters.from) {
      params.append('from', format(filters.from, 'yyyy-MM-dd'));
    }
    if (filters.to) {
      params.append('to', format(filters.to, 'yyyy-MM-dd'));
    }
    if (filters.group_id) {
      params.append('group_id', filters.group_id.toString());
    }
    if (filters.agent_id) {
      params.append('agent_id', filters.agent_id.toString());
    }
    if (filters.tag) {
      params.append('tag', filters.tag);
    }

    return params.toString();
  }

  // Sync Status
  async getSyncStatus(): Promise<SyncStatus> {
    return this.fetch<SyncStatus>('/status');
  }

  // Metrics
  async getMetricsSummary(filters: Partial<FilterState>): Promise<MetricsSummary> {
    const query = this.buildQueryParams(filters);
    return this.fetch<MetricsSummary>(`/metrics/summary?${query}`);
  }

  async getVolumeData(filters: Partial<FilterState>): Promise<VolumeDataPoint[]> {
    const query = this.buildQueryParams(filters);
    return this.fetch<VolumeDataPoint[]>(`/metrics/volume?${query}`);
  }

  async getBacklogData(filters: Partial<FilterState>): Promise<BacklogDataPoint[]> {
    const query = this.buildQueryParams(filters);
    return this.fetch<BacklogDataPoint[]>(`/metrics/backlog?${query}`);
  }

  async getFRTMetrics(filters: Partial<FilterState>): Promise<FRTMetric[]> {
    const query = this.buildQueryParams(filters);
    return this.fetch<FRTMetric[]>(`/metrics/frt?${query}`);
  }

  async getResolutionMetrics(filters: Partial<FilterState>): Promise<ResolutionMetric[]> {
    const query = this.buildQueryParams(filters);
    return this.fetch<ResolutionMetric[]>(`/metrics/resolution?${query}`);
  }

  async getOldestOpenTickets(filters: Partial<FilterState>): Promise<OldestTicket[]> {
    const query = this.buildQueryParams(filters);
    return this.fetch<OldestTicket[]>(`/metrics/oldest_open?${query}`);
  }

  async getTopTags(filters: Partial<FilterState>): Promise<TagCount[]> {
    const query = this.buildQueryParams(filters);
    return this.fetch<TagCount[]>(`/metrics/top_tags?${query}`);
  }

  // Reference Data
  async getAgents(): Promise<Agent[]> {
    return this.fetch<Agent[]>('/reference/agents');
  }

  async getGroups(): Promise<Group[]> {
    return this.fetch<Group[]>('/reference/groups');
  }

  // Ticket Detail
  async getTicketDetail(ticketId: number): Promise<TicketDetail> {
    return this.fetch<TicketDetail>(`/tickets/${ticketId}`);
  }
}

export const apiClient = new APIClient();
export default apiClient;
```

### `lib/utils.ts`

```typescript
import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format } from 'date-fns';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatDuration(seconds: number | null): string {
  if (seconds === null || seconds === undefined) return 'N/A';
  
  const hours = Math.floor(seconds / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (hours > 0) {
    return `${hours}h ${minutes}m`;
  }
  return `${minutes}m`;
}

export function formatTimeAgo(dateString: string): string {
  try {
    return formatDistanceToNow(new Date(dateString), { addSuffix: true });
  } catch {
    return 'Unknown';
  }
}

export function formatDate(dateString: string): string {
  try {
    return format(new Date(dateString), 'MMM d, yyyy HH:mm');
  } catch {
    return 'Invalid date';
  }
}

export function formatNumber(num: number | null): string {
  if (num === null || num === undefined) return '0';
  return new Intl.NumberFormat('sv-SE').format(num);
}

export function getStatusColor(status: string): string {
  const statusMap: Record<string, string> = {
    'open': 'bg-blue-100 text-blue-800',
    'pending': 'bg-yellow-100 text-yellow-800',
    'resolved': 'bg-green-100 text-green-800',
    'closed': 'bg-gray-100 text-gray-800',
  };
  return statusMap[status.toLowerCase()] || 'bg-gray-100 text-gray-800';
}

export function getPriorityColor(priority: string): string {
  const priorityMap: Record<string, string> = {
    'urgent': 'bg-red-100 text-red-800',
    'high': 'bg-orange-100 text-orange-800',
    'medium': 'bg-yellow-100 text-yellow-800',
    'low': 'bg-green-100 text-green-800',
  };
  return priorityMap[priority.toLowerCase()] || 'bg-gray-100 text-gray-800';
}
```

---

## Components

### `components/kpi-card.tsx`

```typescript
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { InfoIcon } from 'lucide-react';
import { formatNumber, formatDuration } from '@/lib/utils';

interface KPICardProps {
  title: string;
  value: string | number | null;
  subtitle?: string;
  icon?: React.ReactNode;
  tooltip?: string;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  format?: 'number' | 'duration' | 'percentage';
}

export function KPICard({ title, value, subtitle, icon, tooltip, trend, format = 'number' }: KPICardProps) {
  const formatValue = (val: string | number | null): string => {
    if (val === null || val === undefined) return 'N/A';
    if (typeof val === 'string') return val;
    
    switch (format) {
      case 'duration':
        return formatDuration(val);
      case 'percentage':
        return `${val.toFixed(1)}%`;
      default:
        return formatNumber(val);
    }
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">
          <div className="flex items-center gap-2">
            {title}
            {tooltip && (
              <TooltipProvider>
                <Tooltip>
                  <TooltipTrigger>
                    <InfoIcon className="h-4 w-4 text-muted-foreground" />
                  </TooltipTrigger>
                  <TooltipContent>
                    <p className="max-w-xs">{tooltip}</p>
                  </TooltipContent>
                </Tooltip>
              </TooltipProvider>
            )}
          </div>
        </CardTitle>
        {icon}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{formatValue(value)}</div>
        {subtitle && <p className="text-xs text-muted-foreground mt-1">{subtitle}</p>}
        {trend && (
          <div className={`text-xs mt-2 ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </div>
        )}
      </CardContent>
    </Card>
  );
}
```

### `components/sync-status.tsx`

```typescript
'use client';

import { useQuery } from '@tanstack/react-query';
import { apiClient } from '@/lib/api-client';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { RefreshCwIcon, AlertCircleIcon, CheckCircleIcon } from 'lucide-react';
import { formatTimeAgo } from '@/lib/utils';

export function SyncStatus() {
  const { data, isLoading, error } = useQuery({
    queryKey: ['sync-status'],
    queryFn: () => apiClient.getSyncStatus(),
    refetchInterval: 30000, // Refetch every 30s
  });

  if (isLoading) {
    return (
      <div className="flex items-center gap-2 text-sm text-muted-foreground">
        <RefreshCwIcon className="h-4 w-4 animate-spin" />
        Loading...
      </div>
    );
  }

  if (error || !data) {
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger>
            <div className="flex items-center gap-2">
              <AlertCircleIcon className="h-4 w-4 text-red-500" />
              <Badge variant="destructive">Sync Error</Badge>
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p>Unable to fetch sync status</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  const getStatusBadge = () => {
    switch (data.last_status) {
      case 'success':
        return <Badge variant="default" className="bg-green-500">Synced</Badge>;
      case 'failed':
        return <Badge variant="destructive">Failed</Badge>;
      case 'running':
        return <Badge variant="secondary">Running</Badge>;
      default:
        return <Badge variant="outline">Unknown</Badge>;
    }
  };

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger>
          <div className="flex items-center gap-2">
            {data.last_status === 'success' && <CheckCircleIcon className="h-4 w-4 text-green-500" />}
            {data.last_status === 'failed' && <AlertCircleIcon className="h-4 w-4 text-red-500" />}
            {data.last_status === 'running' && <RefreshCwIcon className="h-4 w-4 animate-spin text-blue-500" />}
            {getStatusBadge()}
          </div>
        </TooltipTrigger>
        <TooltipContent>
          <div className="space-y-1">
            <p className="font-semibold">Last Sync Status</p>
            {data.last_run_at && <p>Last run: {formatTimeAgo(data.last_run_at)}</p>}
            <p>Tickets: {data.tickets_synced}</p>
            <p>Conversations: {data.conversations_synced}</p>
            <p>Agents: {data.agents_synced}</p>
            {data.last_error && <p className="text-red-500 text-xs">{data.last_error}</p>}
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}
```

