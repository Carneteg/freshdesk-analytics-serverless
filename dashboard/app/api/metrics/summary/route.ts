import { NextResponse } from 'next/server';
import { fetchAllTickets, fetchTicketConversations } from '../../_lib/freshdesk';
import { withCache, cacheKey } from '../../_lib/cache';
import { isBacklogStatus, isPublicAgentReply, minutesBetween, median, percentile } from '../../_lib/kpi';

export const runtime = 'nodejs';

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const from = url.searchParams.get('from') ?? '';
    const to = url.searchParams.get('to') ?? '';

    const key = cacheKey({ endpoint: 'summary', from, to });

    const { value, cache } = await withCache({
      key,
      ttlMs: 120_000, // 2 min
      fn: async () => {
        const tickets = await fetchAllTickets();
        const closedStatuses = [4, 5]; // Resolved, Closed
        
        const open = tickets.filter(t => isBacklogStatus(t.status));
        const closed = tickets.filter(t => closedStatuses.includes(t.status));

        // Calculate FRT from conversations (sample)
        const frtValues: number[] = [];
        for (const ticket of tickets.slice(0, 100)) {
          try {
            const convs = await fetchTicketConversations(ticket.id);
            const firstPublicReply = convs.find(c => isPublicAgentReply(c));
            if (firstPublicReply) {
              const frt = minutesBetween(ticket.created_at, firstPublicReply.created_at);
              if (frt >= 0) frtValues.push(frt);
            }
          } catch (e) {
            // Skip
          }
        }

        // Calculate Resolution Time
        const resolutionValues: number[] = [];
        for (const ticket of closed) {
          const resolution = minutesBetween(ticket.created_at, ticket.updated_at);
          if (resolution >= 0) resolutionValues.push(resolution);
        }

        return {
          total_tickets: tickets.length,
          open_tickets: open.length,
          closed_tickets: closed.length,
          median_frt_minutes: median(frtValues),
          p90_frt_minutes: percentile(frtValues, 0.9),
          median_resolution_minutes: median(resolutionValues),
          p90_resolution_minutes: percentile(resolutionValues, 0.9),
        };
      },
    });

    return NextResponse.json(
      { ...value, meta: { cache } },
      {
        headers: {
          'Cache-Control': 'no-store',
        },
      }
    );
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
