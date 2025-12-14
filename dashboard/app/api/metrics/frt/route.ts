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

    return NextResponse.json({
      median_frt_minutes: percentile(frtValues, 50),
      p90_frt_minutes: percentile(frtValues, 90),
      sample_size: frtValues.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
