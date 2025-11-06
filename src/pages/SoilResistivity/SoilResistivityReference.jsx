import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function SoilResistivityReference() {
  return (
    <ModuleCard title="Equations & Notes">
      <div className="prose dark:prose-invert">
        <p><strong>Wenner / Four-Point</strong>: ρ = 2·π·a·R (a in meters, R in ohms)</p>
        <p><strong>Schlumberger</strong>: ρ = π·R · (L²/l − l) (L, l are half-spacings in meters)</p>
        <p>All inputs are converted to SI before computation. Output shown in Ω·m.</p>
      </div>
    </ModuleCard>
  );
}
