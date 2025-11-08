import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function SolarSizingReference() {
  return (
    <div className="space-y-4">
      <ModuleCard title="Equations" subtitle="Converted to SI internally">
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Daily energy requirement:
E_daily = I_required · V_required · 24

Solar panel power:
P_panel = E_daily / (Peak Sun Hours · Efficiency)

Number of panels (nameplate W):
N_panels = ceil(P_panel / Panel_W)

Battery capacity (80% DoD):
C_battery = (E_daily · Autonomy Days) / (V_required · 0.8)`}</pre>
      </ModuleCard>

      <ModuleCard title="Workflow steps">
        <ul className="list-disc ml-5 space-y-1 text-sm">
          <li>Enter required current/voltage, location, peak sun hours, system efficiency, and autonomy days.</li>
          <li>Calculates daily energy, required panel power and count, and battery capacity.</li>
          <li>Displays results and indicative component table.</li>
        </ul>
      </ModuleCard>
    </div>
  );
}
