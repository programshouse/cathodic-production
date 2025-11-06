import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function VoltageGradientReference() {
  return (
    <ModuleCard title="Equations & Notes">
      <div className="prose dark:prose-invert">
        <p>Distributed (linear): V_m = I·ρ / (2π·d); V(x) = (I·ρ / 2π) ln(s/x)</p>
        <p>Remote (point): V_m = I·ρ / (2π·d^2); V(x) = I·ρ / (2π·x)</p>
        <p>Shallow (line): V_m = I·ρ / (2π·d·s); V(x) = (I·ρ / 2π·s) ln(s/x)</p>
        <p>Pipeline location uses x = |depth_anode − depth_pipe|.</p>
      </div>
    </ModuleCard>
  );
}
