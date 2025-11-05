import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import { COATING_TYPES, temperatureFactor, soilFactor } from "./utils";

export default function CoatingFactorsReference({ temperatureC = 25, soilType = "sandy" }) {
  const tf = temperatureFactor(Number(temperatureC));
  const sf = soilFactor(soilType);

  return (
    <ModuleCard title="Coating Breakdown Factors Reference" subtitle={`Temperature Factor: ${tf.toFixed(2)} • Soil Factor: ${sf.toFixed(2)}`}>
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200 dark:divide-gray-800 text-sm">
          <thead className="bg-gray-50 dark:bg-gray-800/60">
            <tr>
              <th className="px-4 py-2 text-left font-semibold">Coating Type</th>
              <th className="px-4 py-2 text-right font-semibold">Initial Factor</th>
              <th className="px-4 py-2 text-right font-semibold">Annual Degradation Rate</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-800">
            {COATING_TYPES.map((c) => (
              <tr key={c.value}>
                <td className="px-4 py-2 whitespace-nowrap">{c.label}</td>
                <td className="px-4 py-2 text-right">{c.initial.toFixed(4)}</td>
                <td className="px-4 py-2 text-right">{c.annual.toFixed(4)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </ModuleCard>
  );
}
