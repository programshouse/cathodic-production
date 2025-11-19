import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function VoltageGradientReference() {
  return (
    <ModuleCard title="Design Notes: Voltage Gradient Module">
      <div className="prose dark:prose-invert max-w-none text-sm">
        <h3>Step 1: Input Required Data</h3>
        <ul>
          <li>
            <strong>I</strong>: Current delivered by the anode (A)
          </li>
          <li>
            <strong>L</strong>: Length of anode below grade (m)
          </li>
          <li>
            <strong>Xᵣ</strong>: Distance from the anode to the point of
            interest (m)
          </li>
          <li>
            <strong>ρ</strong>: Soil resistivity (Ω·m)
          </li>
        </ul>

        <h3>Step 2: Voltage Rise at Any Point Xᵣ from Anode</h3>
        <p>
          Voltage rise in earth at distance Xᵣ from the center of a vertical
          anode rod is given by:
        </p>
        <p>
          <strong>
            Vᵣ(Xᵣ) = (ρ · I / 2πL)&nbsp;ln[(L + √(L² + Xᵣ²)) / Xᵣ]
          </strong>
        </p>
        <p>
          where Vᵣ is the voltage rise at Xᵣ with respect to remote earth (V).
        </p>

        <h3>Step 4: Chart</h3>
        <ul>
          <li>
            The module plots <strong>voltage rise per ampere</strong> Vᵣ / I
            versus distance X on a logarithmic scale.
          </li>
          <li>
            Distance scale: 0.1–100&nbsp;m (log scale). Voltage axis can be
            read directly in V/A; for a given current multiply by I to obtain
            volts.
          </li>
          <li>
            The sample chart in the notes (0–1.40&nbsp;V over 0–100&nbsp;m) can
            be reproduced by choosing suitable I, L and ρ.
          </li>
        </ul>
      </div>
    </ModuleCard>
  );
}
