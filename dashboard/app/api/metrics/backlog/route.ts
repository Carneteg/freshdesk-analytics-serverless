import { NextResponse } from 'next/server';
import { fetchAllTickets } from '../../_lib/freshdesk';

export async function GET() {
  try {
    const tickets = await fetchAllTickets();
    const openStatuses = [2, 3, 6]; // Open, Pending, Waiting (excl Resolved/Closed)
    const openTickets = tickets.filter(t => openStatuses.includes(t.status));

    return NextResponse.json({
      current_backlog: openTickets.length,
      tickets: openTickets.map(t => ({
        id: t.id,
        subject: t.subject,
        status: t.status,
        created_at: t.created_at
      }))
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
