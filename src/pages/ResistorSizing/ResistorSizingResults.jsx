import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function ResistorSizingResults({ results }) {
  if (!results)
    return (
      <ModuleCard
        title="Results"
        subtitle="Run a calculation to see resistor sizing."
      >
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );

  const {
    R_nominal = 0,
    R_min = 0,
    R_max = 0,
    P_required = 0,
    P_recommended = 0,
  } = results || {};

  const safetyFactor = results?.inputs?.safety_factor;

  // Formatting helper
  const fmt = (v, digits = 3) =>
    Number(v || 0).toLocaleString(undefined, {
      maximumFractionDigits: digits,
      minimumFractionDigits: 0,
    });

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Results"
        subtitle="Variable resistor sizing according to CP equations."
      >
        <div className="space-y-2 text-sm md:text-base">
          {/* Nominal Resistance */}
          <div className="rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 flex flex-wrap gap-1">
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              Nominal Resistance (R = V / I):
            </span>
            <span>{fmt(R_nominal)} Ω</span>
          </div>

          {/* Adjustable Range */}
          <div className="rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 flex flex-wrap gap-1">
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              Recommended Adjustable Range:
            </span>
            <span>
              {fmt(R_min)} to {fmt(R_max)} Ω
            </span>
          </div>

          {/* Required Power Dissipation */}
          <div className="rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 flex flex-wrap gap-1">
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              Required Power Dissipation (P = I² × R):
            </span>
            <span>{fmt(P_required)} Watts</span>
          </div>

          {/* Recommended Power Rating with SF */}
          <div className="rounded-md bg-slate-100 dark:bg-slate-800 px-3 py-2 flex flex-wrap gap-1">
            <span className="font-semibold text-brand-700 dark:text-brand-300">
              {`Recommended Resistor Power Rating (with safety factor${
                safetyFactor ? ` of ${fmt(safetyFactor, 2)}` : ""
              }):`}
            </span>
            <span>{fmt(P_recommended)} Watts</span>
          </div>
        </div>
      </ModuleCard>
    </div>
  );
}
