import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function TankMMOReference() {
  return (
    <div className="space-y-4">
      <ModuleCard title="Equations" subtitle="Converted to SI internally">
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`1) Tank circumference:
C = π × D

2) Ribbon anode length
- Rings layout:   L_total = N_rings × C
- Longitudinal:   L_total = N_ribbons × Tank Length

3) Number of ribbons
- Rings:          N_ribbons = N_rings (loops)
- Longitudinal:   N_ribbons = ceil(C / Spacing)

4) Ti conductor bar length
L_Ti = Number of bars × Connection length

5) Power feeder connectors
N_feeders = ceil(I_total / I_connector,max)`}</pre>
      </ModuleCard>

      <ModuleCard title="Workflow steps">
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li>Enter diameter and tank length/height.</li>
          <li>Select installation type (rings or longitudinal), spacing, optional rings override.</li>
          <li>Provide Ti bars and per-bar connection length, total system current, and connector rating.</li>
          <li>Outputs include circumference, ribbon lengths, Ti bar length, and recommended feeder connectors.</li>
        </ul>
      </ModuleCard>
    </div>
  );
}
