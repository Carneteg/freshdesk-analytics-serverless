"use client";

import * as React from "react";
import { DefinitionTooltip } from "./DefinitionTooltip";
import { useKpiDefinitions } from "./useKpiDefinitions";

/**
 * Example: KPI Card Header with Tooltip
 * Shows how to use DefinitionTooltip with useKpiDefinitions hook
 */
export function KpiCardHeader({ title, kpiKey }: { title: string; kpiKey: string }) {
  const { defs, loading } = useKpiDefinitions();

  if (loading) {
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
        <div className="h-5 w-5 animate-pulse rounded-full bg-slate-200" />
      </div>
    );
  }

  const def = defs[kpiKey];
  if (!def) {
    return (
      <div className="flex items-center justify-between">
        <div className="text-sm font-semibold text-slate-900">{title}</div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between">
      <div className="text-sm font-semibold text-slate-900">{title}</div>
      <DefinitionTooltip def={def} iconOnly align="right" />
    </div>
  );
}

/**
 * Example: Full KPI Card with Definition
 */
export function KpiCard({
  kpiKey,
  value,
  change,
}: {
  kpiKey: string;
  value: string | number;
  change?: string;
}) {
  const { defs, loading } = useKpiDefinitions();
  const def = defs[kpiKey];

  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <KpiCardHeader title={def?.title || kpiKey} kpiKey={kpiKey} />

      <div className="mt-3">
        <div className="text-3xl font-bold text-slate-900">{value}</div>
        {def?.unit && (
          <div className="mt-1 text-xs text-slate-600">{def.unit}</div>
        )}
        {change && (
          <div className="mt-2 text-sm text-slate-600">{change}</div>
        )}
      </div>
    </div>
  );
}
