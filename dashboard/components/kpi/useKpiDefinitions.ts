"use client";

import * as React from "react";

type KpiDefinition = {
  key: string;
  title: string;
  unit?: string;
  definition: string;
  logic: string[];
  fields: string[];
};

type KpiDefinitionsResponse = {
  kpi_contract_version: string;
  updated_at: string;
  definitions: KpiDefinition[];
};

export function useKpiDefinitions() {
  const [defs, setDefs] = React.useState<Record<string, KpiDefinition>>({});
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [version, setVersion] = React.useState<string>("");

  React.useEffect(() => {
    (async () => {
      try {
        const res = await fetch("/api/kpi_definitions");
        if (!res.ok) {
          throw new Error(`Failed to fetch KPI definitions: ${res.status}`);
        }
        const data: KpiDefinitionsResponse = await res.json();
        setDefs(Object.fromEntries(data.definitions.map((d) => [d.key, d])));
        setVersion(data.kpi_contract_version);
        setLoading(false);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Unknown error");
        setLoading(false);
      }
    })();
  }, []);

  return { defs, loading, error, version };
}
