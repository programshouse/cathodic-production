import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function ImpressedReference() {
  return (
    <div className="space-y-4">
      <ModuleCard title="Key Equations" subtitle="Summary of integrated design equations">
        <ul className="list-disc pl-6 text-sm">
          <li>I = A × Jd × f_c</li>
          <li>V = I × R + (E_target − E_native)</li>
          <li>P = V × I</li>
          <li>E_annual = P × 8760 / 1000</li>
          <li>FeSiCr: W_required = I × t × 8760 / (U × η), N = W_required / W_single × SF</li>
          <li>MMO: N = I / I_single × SF</li>
        </ul>
      </ModuleCard>
      <ModuleCard title="MMO Guidance" subtitle="Typical current rating per anode">
        <div className="text-sm text-gray-700 dark:text-gray-300">
          <p>Use I_single = 8 A for soil groundbeds; I_single = 50 A for seawater.</p>
          <p>Default safety factor SF = 1.1.</p>
        </div>
      </ModuleCard>
    </div>
  );
}
