"use client";
import * as React from "react";

type Row = {
  id: number;
  subject: string;
  status: number;
  priority: number | null;
  created_at: string;
  updated_at: string;
  age_minutes: number;
  tags: string[];
  group_id: number | null;
  agent_id: number | null;
};

function toCsv(rows: Row[]) {
  const header = ["id","subject","status","priority","age_minutes","created_at","updated_at","tags","group_id","agent_id"];
  const esc = (s: any) => `"${String(s ?? "").replaceAll('"', '""')}`;
  const lines = [
    header.join(","),
    ...rows.map(r => [
      r.id,
      esc(r.subject),
      r.status,
      r.priority ?? "",
      r.age_minutes,
      r.created_at,
      r.updated_at,
      esc(r.tags.join("|")),
      r.group_id ?? "",
      r.agent_id ?? "",
    ].join(",")),
  ];
  return lines.join("\n");
}

export function DrilldownDrawer(props: {
  open: boolean;
  onClose: () => void;
  metric: string;
  title: string;
  defaultFilters?: { status?: string; tag?: string; group_id?: string; agent_id?: string; from?: string; to?: string };
}) {
  const { open, onClose, metric, title } = props;
  const [rows, setRows] = React.useState<Row[]>([]);
  const [loading, setLoading] = React.useState(false);

  const [status, setStatus] = React.useState(props.defaultFilters?.status ?? "");
  const [tag, setTag] = React.useState(props.defaultFilters?.tag ?? "");
  const [groupId, setGroupId] = React.useState(props.defaultFilters?.group_id ?? "");
  const [agentId, setAgentId] = React.useState(props.defaultFilters?.agent_id ?? "");
  const [limit, setLimit] = React.useState("100");

  async function load() {
    setLoading(true);
    try {
      const sp = new URLSearchParams();
      sp.set("metric", metric);
      sp.set("limit", limit);

      if (status) sp.set("status", status);
      if (tag) sp.set("tag", tag);
      if (groupId) sp.set("group_id", groupId);
      if (agentId) sp.set("agent_id", agentId);

      const res = await fetch(`/api/drilldown/tickets?${sp.toString()}`);
      const data = await res.json();
      setRows(data.rows ?? []);
    } finally {
      setLoading(false);
    }
  }

  React.useEffect(() => {
    if (open) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

  function exportCsv() {
    const csv = toCsv(rows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `drilldown_${metric}_${new Date().toISOString().slice(0,10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <div className="absolute right-0 top-0 h-full w-[980px] max-w-[95vw] bg-white shadow-2xl">
        <div className="flex items-center justify-between border-b p-4">
          <div>
            <div className="text-sm text-slate-500">Drilldown</div>
            <div className="text-lg font-semibold text-slate-900">{title}</div>
          </div>
          <button onClick={onClose} className="rounded-xl px-3 py-2 text-sm hover:bg-slate-100">
            Stäng ✕
          </button>
        </div>

        <div className="border-b p-4">
          <div className="flex flex-wrap items-end gap-3">
            <div>
              <div className="text-xs text-slate-500">Status</div>
              <input value={status} onChange={(e) => setStatus(e.target.value)}
                placeholder="ex 2" className="mt-1 w-28 rounded-xl border p-2 text-sm" />
            </div>

            <div>
              <div className="text-xs text-slate-500">Tag</div>
              <input value={tag} onChange={(e) => setTag(e.target.value)}
                placeholder="ex payroll" className="mt-1 w-56 rounded-xl border p-2 text-sm" />
            </div>

            <div>
              <div className="text-xs text-slate-500">Group ID</div>
              <input value={groupId} onChange={(e) => setGroupId(e.target.value)}
                placeholder="ex 123" className="mt-1 w-32 rounded-xl border p-2 text-sm" />
            </div>

            <div>
              <div className="text-xs text-slate-500">Agent ID</div>
              <input value={agentId} onChange={(e) => setAgentId(e.target.value)}
                placeholder="ex 456" className="mt-1 w-32 rounded-xl border p-2 text-sm" />
            </div>

            <div>
              <div className="text-xs text-slate-500">Limit</div>
              <input value={limit} onChange={(e) => setLimit(e.target.value)}
                className="mt-1 w-24 rounded-xl border p-2 text-sm" />
            </div>

            <button
              onClick={load}
              className="rounded-2xl border bg-white px-4 py-2 text-sm font-medium shadow-sm hover:bg-slate-50"
            >
              {loading ? "Laddar…" : "Uppdatera"}
            </button>

            <button
              onClick={exportCsv}
              disabled={rows.length === 0}
              className="rounded-2xl bg-slate-900 px-4 py-2 text-sm font-medium text-white disabled:opacity-50"
            >
              Export CSV
            </button>
          </div>
        </div>

        <div className="p-4">
          <div className="mb-2 text-sm text-slate-600">
            Visar <span className="font-medium text-slate-900">{rows.length}</span> tickets
          </div>

          <div className="overflow-auto rounded-2xl border">
            <table className="w-full text-left text-sm">
              <thead className="sticky top-0 bg-slate-50">
                <tr className="text-xs uppercase tracking-wide text-slate-500">
                  <th className="p-3">ID</th>
                  <th className="p-3">Subject</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Age (min)</th>
                  <th className="p-3">Updated</th>
                  <th className="p-3">Tags</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.id} className="border-t hover:bg-slate-50">
                    <td className="p-3 font-medium text-slate-900">#{r.id}</td>
                    <td className="p-3 max-w-[520px] truncate text-slate-900">{r.subject}</td>
                    <td className="p-3 text-slate-700">{r.status}</td>
                    <td className="p-3 text-slate-700">{r.age_minutes}</td>
                    <td className="p-3 text-slate-700">{new Date(r.updated_at).toLocaleString()}</td>
                    <td className="p-3 text-slate-700">{r.tags.join(", ")}</td>
                  </tr>
                ))}
                {rows.length === 0 ? (
                  <tr>
                    <td className="p-6 text-slate-600" colSpan={6}>
                      Inga resultat (eller så är filtret för snävt).
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
