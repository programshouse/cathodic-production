import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function AttenuationReference() {
  return (
    <div className="space-y-4">
      <ModuleCard title="Equations" subtitle="Attenuation and potential profile">
        <ul className="list-disc pl-6 text-sm">
          <li>Attenuation constant: α = sqrt(Rs / RL)</li>
          <li>Potential at distance x: V(x) = V0 × cosh[α(L − x)] / cosh(αL)</li>
        </ul>
      </ModuleCard>
      <ModuleCard title="Units" subtitle="Conversions used internally">
        <ul className="list-disc pl-6 text-sm">
          <li>Length: m, km → meters</li>
          <li>Resistance per length: Ω/m, Ω/km → per meter</li>
          <li>Potential: mV, V → volts</li>
        </ul>
      </ModuleCard>
    </div>
  );
}
