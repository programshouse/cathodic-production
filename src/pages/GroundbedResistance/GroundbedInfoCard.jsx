import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function GroundbedInfoCard() {
  return (
    <ModuleCard title="Groundbed Resistance Equations" subtitle="Vertical, horizontal, and multiple anode cases">
      <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`R_vertical = (ρ / 2πL) [ ln(8L/d) - 1 ]
R_horizontal ≈ (ρ / 2πL) [ ln(2L/d) - 1 ]
R_total = R_single / (N × F)`}</pre>
      <p className="text-sm md:text-base mt-2 text-gray-600 dark:text-gray-400">ρ: resistivity (Ω·cm), L: anode length (m), d: anode diameter (m), N: number of anodes, F: interaction factor.</p>
    </ModuleCard>
  );
}
