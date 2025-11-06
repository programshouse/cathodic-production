import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";

export default function ResistorSizingResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see resistor values.">
      <div className="text-sm text-gray-500">No results yet.</div>
    </ModuleCard>
  );

  const { Rv_ohm = 0, P_var_W = 0, R_shunt_ohm = 0, P_shunt_W = 0 } = results || {};

  const formula = "Variable: Rv = V/I − Rc,  P = I²·Rv;   Shunt: R = V/I,  P = I²·R";

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Results"
        subtitle={<span className="inline-flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-gray-500">Formula</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">{formula}</span></span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultValue label="Variable Resistor Value" value={Number(Rv_ohm)||0} unit="Ω" precision={3} />
          <ResultValue label="Variable Resistor Power" value={Number(P_var_W)||0} unit="W" precision={3} />
          <ResultValue label="Shunt Resistance" value={Number(R_shunt_ohm)||0} unit="Ω" precision={4} />
          <ResultValue label="Shunt Power Dissipation" value={Number(P_shunt_W)||0} unit="W" precision={3} />
        </div>
      </ModuleCard>
    </div>
  );
}
