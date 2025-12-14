import { NextResponse } from 'next/server';
import { fetchAllTickets } from '../../_lib/freshdesk';

export async function GET() {
  try {
    const tickets = await fetchAllTickets();
    const openStatuses = [2, 3, 6]; // Open, Pending, Waiting (excl Resolved/Closed)
    const now = new Date();

    const oldestOpen = tickets
      .filter(t => openStatuses.includes(t.status))
      .map(t => {
        const created = new Date(t.created_at);
        const ageDays = Math.floor((now.getTime() - created.getTime()) / (1000 * 60 * 60 * 24));
        return {
          id: t.id,
          subject: t.subject,
          created_at: t.created_at,
          age_days: ageDays,
          status: t.status
        };
      })
      .sort((a, b) => b.age_days - a.age_days)
      .slice(0, 20);

    return NextResponse.json({ tickets: oldestOpen });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
