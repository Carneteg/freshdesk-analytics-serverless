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

type Props = {
  def: KpiDefinition;
  label?: string;          // det som syns bredvid info-ikonen (valfritt)
  iconOnly?: boolean;      // bara ikon
  align?: "left" | "right";
};

export function DefinitionTooltip({
  def,
  label,
  iconOnly = false,
  align = "left",
}: Props) {
  const [open, setOpen] = React.useState(false);

  return (
    <span className="relative inline-flex items-center gap-1">
      {!iconOnly && label ? <span className="text-sm text-slate-700">{label}</span> : null}

      <button
        type="button"
        aria-label={`KPI definition: ${def.title}`}
        onClick={() => setOpen((v) => !v)}
        onBlur={() => setOpen(false)}
        className="inline-flex h-5 w-5 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 shadow-sm hover:bg-slate-50"
      >
        <span className="text-xs font-semibold">i</span>
      </button>

      {open ? (
        <div
          className={[
            "absolute z-50 mt-2 w-[360px] max-w-[90vw] rounded-2xl border border-slate-200 bg-white p-4 shadow-lg",
            align === "left" ? "left-0" : "right-0",
          ].join(" ")}
          role="dialog"
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-slate-900">{def.title}</div>
              <div className="mt-1 text-xs text-slate-600">
                {def.unit ? (
                  <>
                    Enhet: <span className="font-medium text-slate-800">{def.unit}</span>
                  </>
                ) : (
                  "Enhet: (ej angiven)"
                )}
              </div>
            </div>

            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setOpen(false)}
              aria-label="Stäng tooltip"
              className="rounded-lg px-2 py-1 text-xs text-slate-600 hover:bg-slate-100"
            >
              ✕
            </button>
          </div>

          <div className="mt-3 text-sm text-slate-800">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Definition
            </div>
            <p className="mt-1 leading-snug">{def.definition}</p>
          </div>

          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              Logik
            </div>
            <ul className="mt-1 list-disc space-y-1 pl-4 text-sm text-slate-800">
              {def.logic.map((row, i) => (
                <li key={i}>{row}</li>
              ))}
            </ul>
          </div>

          <div className="mt-3">
            <div className="text-xs font-semibold uppercase tracking-wide text-slate-500">
              API-fält
            </div>
            <div className="mt-1 flex flex-wrap gap-2">
              {def.fields.map((f) => (
                <span
                  key={f}
                  className="rounded-full bg-slate-100 px-2 py-1 text-xs font-medium text-slate-700"
                >
                  {f}
                </span>
              ))}
            </div>
          </div>
        </div>
      ) : null}
    </span>
  );
}
