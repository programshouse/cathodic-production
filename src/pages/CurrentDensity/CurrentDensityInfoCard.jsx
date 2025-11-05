import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function CurrentDensityInfoCard() {
  return (
    <ModuleCard title="Current Density" subtitle="Equation and notes">
      <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Jd_final = Jd_@25°C × [1 + 0.02 × (Temperature − 25)]`}</pre>
      <div className="mt-3 text-sm text-gray-600 dark:text-gray-400">
        <div className="font-medium mb-1">Parameters Considered</div>
        <ul className="list-disc pl-5 space-y-1">
          <li>Environment: Soil, Freshwater, Seawater</li>
          <li>Coating condition and type per reference table</li>
          <li>Temperature correction from 25°C</li>
          <li>Soil moisture factor applied for soil only</li>
        </ul>
      </div>
    </ModuleCard>
  );
}
