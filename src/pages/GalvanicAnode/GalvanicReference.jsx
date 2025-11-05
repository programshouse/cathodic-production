import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import { MATERIALS } from "./utils";

export default function GalvanicReference() {
  return (
    <ModuleCard title="Anode Material Reference" subtitle="Typical potentials, capacities, efficiencies, densities, and environments">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Material</th>
              <th className="px-4 py-2 text-right font-semibold">Closed-Circuit Potential (Ag/AgCl)</th>
              <th className="px-4 py-2 text-right font-semibold">Capacity (Ah/kg)</th>
              <th className="px-4 py-2 text-right font-semibold">Typical Efficiency (η)</th>
              <th className="px-4 py-2 text-right font-semibold">Density (g/cm³)</th>
              <th className="px-4 py-2 text-left font-semibold">Environment</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {MATERIALS.map((m) => (
              <tr key={m.value}>
                <td className="px-4 py-2 whitespace-nowrap">{m.label}</td>
                <td className="px-4 py-2 text-right">{m.potential_V?.toFixed(2)} V</td>
                <td className="px-4 py-2 text-right">{m.capacity_Ah_per_kg}</td>
                <td className="px-4 py-2 text-right">{(m.eta_default * 100).toFixed(0)}%</td>
                <td className="px-4 py-2 text-right">{m.density_g_cm3}</td>
                <td className="px-4 py-2">{m.environment}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleCard>
  );
}
