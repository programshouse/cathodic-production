// /src/pages/attenuation/AttenuationReference.jsx
import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function AttenuationReference() {
  return (
    <div className="space-y-4">
      <ModuleCard
        title="Pipeline Attenuation – Design Equations"
        subtitle="Equations follow the Word spec and Excel sheet."
      >
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>
            <strong>Pipe steel cross-sectional area</strong>:
            {"  "}
            AX = π(D/2)² − π(D/2 − t)²
          </li>
          <li>
            <strong>Unit surface area of pipe</strong>:
            {"  "}
            A₁ = πD
          </li>
          <li>
            <strong>Total pipe surface area</strong> (from drain point to X):
            {"  "}
            ATOT = A₁ × Lx
          </li>
          <li>
            <strong>Current required</strong> (one way from DP to X):
            {"  "}
            IREQ = ATOT × cd
          </li>
          <li>
            <strong>Unit pipe linear resistance</strong>:
            {"  "}
            RS = ρsteel / AX
          </li>
          <li>
            <strong>Coating leakage resistance</strong>:
            {"  "}
            RL = ρ / (A₁ × g)
          </li>
          <li>
            <strong>Attenuation constant</strong>:
            {"  "}
            α = √(RS / RL)
          </li>
          <li>
            <strong>Voltage drop / potential attenuation</strong>:
            {"  "}
            E(x) = PotNAT + (PotDP − PotNAT) · e<sup>−αx</sup>
          </li>
          <li>
            <strong>Positions along pipe</strong>:
            {"  "}
            evaluate ATOT, IREQ, RS, RL and E(x) at 0, Δx, 2Δx, …, Lx.
          </li>
        </ul>
      </ModuleCard>

      <ModuleCard title="Units" subtitle="SI units used internally">
        <ul className="list-disc pl-6 text-sm space-y-1">
          <li>
            <strong>Length</strong>: meters (m)
          </li>
          <li>
            <strong>Area</strong>: square meters (m²)
          </li>
          <li>
            <strong>Current density</strong>: A/m²
          </li>
          <li>
            <strong>Resistivity</strong>: Ω·m
          </li>
          <li>
            <strong>Conductivity</strong>: S/m
          </li>
          <li>
            <strong>Resistance</strong>: Ω, Ω/m
          </li>
          <li>
            <strong>Potential</strong>: volts (V)
          </li>
        </ul>
      </ModuleCard>
    </div>
  );
}
