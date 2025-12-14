import { NextResponse } from "next/server";
import { fetchAllTickets } from "../../_lib/freshdesk";
import { isBacklogStatus, minutesBetween } from "../../_lib/kpi";

export const runtime = "nodejs";

type Ticket = {
  id: number;
  subject?: string;
  status: number;
  priority?: number;
  created_at: string;
  updated_at: string;
  tags?: string[];
  requester_id?: number;
  group_id?: number;
  responder_id?: number;
};

function parseIntOrNull(v: string | null) {
  if (!v) return null;
  const n = Number(v);
  return Number.isFinite(n) ? n : null;
}

export async function GET(req: Request) {
  const url = new URL(req.url);

  const metric = url.searchParams.get("metric") ?? "backlog"; // backlog | oldest_open | top_tags | volume etc.
  const from = url.searchParams.get("from"); // valfritt (om ni vill begränsa period)
  const to = url.searchParams.get("to");

  const status = parseIntOrNull(url.searchParams.get("status"));
  const tag = url.searchParams.get("tag");
  const groupId = parseIntOrNull(url.searchParams.get("group_id"));
  const agentId = parseIntOrNull(url.searchParams.get("agent_id"));
  const limit = Math.min(500, Math.max(1, parseIntOrNull(url.searchParams.get("limit")) ?? 100));

  // 1) Hämta tickets (paginerat)
  const tickets = await fetchAllTickets({
    query: {
      // OBS: anpassa efter hur ni redan filtrerar i era metrics idag.
      // Om ni INTE har säkra server-side tidsfilter i Freshdesk, filtrera i minnet nedan.
      // Ex: updated_since: from ? new Date(from).toISOString() : undefined,
      // order_by: "created_at",
    },
  });

  // 2) Filtrera konsekvent
  let rows = (tickets as Ticket[]).map((t) => {
    const age_minutes = minutesBetween(t.created_at, new Date().toISOString());
    return {
      id: t.id,
      subject: t.subject ?? "",
      status: t.status,
      priority: t.priority ?? null,
      created_at: t.created_at,
      updated_at: t.updated_at,
      age_minutes,
      tags: t.tags ?? [],
      group_id: t.group_id ?? null,
      agent_id: t.responder_id ?? null,
    };
  });

  // KPI-baserade "default filters"
  if (metric === "backlog" || metric === "oldest_open") {
    rows = rows.filter((r) => isBacklogStatus(r.status));
  }

  // Extra filterparametrar
  if (status !== null) rows = rows.filter((r) => r.status === status);
  if (tag) rows = rows.filter((r) => r.tags.includes(tag));
  if (groupId !== null) rows = rows.filter((r) => r.group_id === groupId);
  if (agentId !== null) rows = rows.filter((r) => r.agent_id === agentId);

  // (valfritt) period i minnet – om ni saknar robust API-filter
  if (from) {
    const fromMs = new Date(from).getTime();
    rows = rows.filter((r) => new Date(r.created_at).getTime() >= fromMs);
  }
  if (to) {
    const toMs = new Date(to).getTime();
    rows = rows.filter((r) => new Date(r.created_at).getTime() <= toMs);
  }

  // sort: oldest först om oldest_open, annars senaste uppdaterade först
  rows.sort((a, b) => {
    if (metric === "oldest_open") return b.age_minutes - a.age_minutes;
    return new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime();
  });

  rows = rows.slice(0, limit);

  return NextResponse.json({
    meta: {
      metric,
      count: rows.length,
      limit,
      filters: { status, tag, groupId, agentId, from, to },
    },
    rows,
  });
}
