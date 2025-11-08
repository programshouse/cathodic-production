import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function InterferenceReference() {
  return (
    <div className="space-y-4">
      <ModuleCard title="Equations" subtitle="Coefficients depend on interference type and source">
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Interference voltage:
V_int = (I_source · ρ) / (2π · d · k_type) × k_source

Shift:
V_shift = V_int

New pipe potential:
V_new = V_pipe + V_shift

Typical coefficients (configurable in code):
- k_type: DC = 1.0, AC = 0.3, Telluric = 0.6
- k_source: Foreign CP = 1.0, HVDC = 0.8, AC Traction = 0.5, Power Line = 0.3`}</pre>
      </ModuleCard>

      <ModuleCard title="Workflow steps">
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li>User selects interference type/source, inputs distance, current, soil resistivity, pipe potential.</li>
          <li>Calculates interference voltage, potential shift, new pipe potential.</li>
          <li>Shows warnings or success, and mitigation recommendations.</li>
        </ul>
      </ModuleCard>
    </div>
  );
}
