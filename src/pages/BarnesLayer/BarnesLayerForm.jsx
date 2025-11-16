import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function BarnesLayerForm({
  onSubmit,
  submitting,
  onReset,
  initialValues = {},
}) {
  // aᵢ (electrode spacing / depth points)
  const [a1, setA1] = useState(initialValues.a1 ?? "");
  const [a2, setA2] = useState(initialValues.a2 ?? "");
  const [a3, setA3] = useState(initialValues.a3 ?? "");

  // Rᵢ (measured resistances at each spacing)
  const [R1, setR1] = useState(initialValues.R1 ?? "");
  const [R2, setR2] = useState(initialValues.R2 ?? "");
  const [R3, setR3] = useState(initialValues.R3 ?? "");

  const handleReset = () => {
    setA1("");
    setA2("");
    setA3("");
    setR1("");
    setR2("");
    setR3("");
    onReset?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      a1: Number(a1),
      a2: Number(a2),
      a3: Number(a3),
      R1: Number(R1),
      R2: Number(R2),
      R3: Number(R3),
    });
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
            Barnes Layer Resistivity Module
          </h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">
            Step 1 – Input field data (electrode spacing a₁–a₃ and
            corresponding resistances R₁–R₃).
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      <SectionCard
        title="Input Field Data"
        subtitle="User input resistance and depth for three measurements (a₁,R₁), (a₂,R₂), (a₃,R₃)."
        actions={<ResetPill onClick={handleReset} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* a1, R1 */}
          <div className="md:col-span-1">
            <Label required>Depth / Spacing a₁ (m)</Label>
            <NumberInput
              name="a1"
              value={a1}
              onChange={(e) => setA1(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 1"
            />
            <Help>First electrode spacing / depth point.</Help>
          </div>
          <div className="md:col-span-1">
            <Label required>Resistance R₁ (Ω)</Label>
            <NumberInput
              name="R1"
              value={R1}
              onChange={(e) => setR1(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 4.2"
            />
            <Help>Measured resistance at spacing a₁.</Help>
          </div>

          {/* spacer for layout on md */}
          <div className="hidden md:block" />

          {/* a2, R2 */}
          <div className="md:col-span-1">
            <Label required>Depth / Spacing a₂ (m)</Label>
            <NumberInput
              name="a2"
              value={a2}
              onChange={(e) => setA2(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 2"
            />
            <Help>Second electrode spacing / depth point.</Help>
          </div>
          <div className="md:col-span-1">
            <Label required>Resistance R₂ (Ω)</Label>
            <NumberInput
              name="R2"
              value={R2}
              onChange={(e) => setR2(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 3.8"
            />
            <Help>Measured resistance at spacing a₂.</Help>
          </div>

          <div className="hidden md:block" />

          {/* a3, R3 */}
          <div className="md:col-span-1">
            <Label required>Depth / Spacing a₃ (m)</Label>
            <NumberInput
              name="a3"
              value={a3}
              onChange={(e) => setA3(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 3"
            />
            <Help>Third electrode spacing / depth point.</Help>
          </div>
          <div className="md:col-span-1">
            <Label required>Resistance R₃ (Ω)</Label>
            <NumberInput
              name="R3"
              value={R3}
              onChange={(e) => setR3(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 3.1"
            />
            <Help>Measured resistance at spacing a₃.</Help>
          </div>
        </div>

        {/* Equations hint for next steps */}
        <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border px-4 py-3 text-xs leading-relaxed">
          <div className="font-semibold mb-1">Next Steps (calculated by module)</div>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              Layer depths: L₁ = a₁, L₂ = a₂ − a₁, L₃ = a₃ − a₂
            </li>
            <li>
              Layer resistances: RL₁ = R₁, RL₂ = (a₂·R₂ − a₁·R₁)/(a₂ − a₁), RL₃ = (a₃·R₃ − a₂·R₂)/(a₃ − a₂)
            </li>
            <li>
              Layer resistivities: ρLᵢ = 2π·a₁·RLᵢ (for i = 1,2,3)
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>
            {submitting ? "Calculating..." : "Calculate Barnes Layers"}
          </PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
