import { NextResponse } from 'next/server';
import { fetchAllTickets, fetchTicketConversations } from '../../_lib/freshdesk';

function minutesBetween(start: string, end: string): number {
  return (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60);
}

function percentile(arr: number[], p: number): number | null {
  if (arr.length === 0) return null;
  const sorted = [...arr].sort((a, b) => a - b);
  const index = (p / 100) * (sorted.length - 1);
  const lower = Math.floor(index);
  const upper = Math.ceil(index);
  const weight = index - lower;
  return sorted[lower] * (1 - weight) + sorted[upper] * weight;
}

export async function GET() {
  try {
    const tickets = await fetchAllTickets();
    const openStatuses = [2, 3, 6]; // Open, Pending, Waiting (excl Resolved/Closed)
    const closedStatuses = [4, 5]; // Resolved, Closed
    
    const open = tickets.filter(t => openStatuses.includes(t.status));
    const closed = tickets.filter(t => closedStatuses.includes(t.status));

    // Calculate FRT from conversations (sample)
    const frtValues: number[] = [];
    for (const ticket of tickets.slice(0, 100)) {
      try {
        const convs = await fetchTicketConversations(ticket.id);
        const firstPublicReply = convs.find(c => !c.incoming && (c.private === false || c.private === undefined));
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

    return NextResponse.json({
      total_tickets: tickets.length,
      open_tickets: open.length,
      closed_tickets: closed.length,
      median_frt_minutes: percentile(frtValues, 50),
      p90_frt_minutes: percentile(frtValues, 90),
      median_resolution_minutes: percentile(resolutionValues, 50),
      p90_resolution_minutes: percentile(resolutionValues, 90)
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
