import { NextResponse } from 'next/server';
import { fetchTickets } from '../../_lib/freshdesk';
export async function GET() {
  try {
    const tickets = await fetchTickets();
    const open = tickets.filter(t => [2,3,4,6].includes(t.status));
    const closed = tickets.filter(t => [4,5].includes(t.status));
    return NextResponse.json({
      total_tickets: tickets.length,
      open_tickets: open.length,
      closed_tickets: closed.length,
      median_frt_hours: null,
      p90_frt_hours: null,
      median_resolution_hours: null,
      p90_resolution_hours: null
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
