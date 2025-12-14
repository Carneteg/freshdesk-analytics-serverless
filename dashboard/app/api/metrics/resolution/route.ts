import { NextResponse } from 'next/server';
import { fetchAllTickets } from '../../_lib/freshdesk';

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
    const closedStatuses = [4, 5]; // Resolved, Closed
    const closed = tickets.filter(t => closedStatuses.includes(t.status));

    const resolutionValues: number[] = [];
    for (const ticket of closed) {
      const resolution = minutesBetween(ticket.created_at, ticket.updated_at);
      if (resolution >= 0) resolutionValues.push(resolution);
    }

    return NextResponse.json({
      median_resolution_minutes: percentile(resolutionValues, 50),
      p90_resolution_minutes: percentile(resolutionValues, 90),
      sample_size: resolutionValues.length
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
