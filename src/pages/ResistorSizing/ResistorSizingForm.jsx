// /src/pages/resistor-sizing/ResistorSizingForm.jsx
import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import {
  Label,
  Help,
  NumberInput,
} from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function ResistorSizingForm({
  onSubmit,
  submitting,
  onReset,
  initialValues = {},
  title = "Variable Resistor Sizing (CP)",
}) {
  // 3 inputs only – like the original HTML tool
  const [I_design, setIdesign] = useState(initialValues.I_design_A ?? "");
  const [V_drop, setVdrop] = useState(initialValues.V_drop_V ?? "");
  const [SF, setSF] = useState(initialValues.safety_factor ?? "");

  const handleReset = () => {
    setIdesign("");
    setVdrop("");
    setSF("");
    onReset?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      I_design_A: Number(I_design),
      V_drop_V: Number(V_drop),
      safety_factor: Number(SF),
    });
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
            {title}
          </h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">
            Step 1 – Input design current, desired voltage drop and power
            safety factor to size the variable resistor.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      <SectionCard
        title="Input Parameters"
        subtitle="These three inputs reproduce the original CP tool."
        actions={<ResetPill onClick={handleReset} />}
      >
        <div className="space-y-4">
          {/* Design Current */}
          <div>
            <Label required>Design Current I (A)</Label>
            <NumberInput
              value={I_design}
              onChange={(e) => setIdesign(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 87"
            />
            <Help>Current through the variable resistor in amperes.</Help>
          </div>

          {/* Desired Voltage Drop */}
          <div>
            <Label required>Desired Voltage Drop V (V)</Label>
            <NumberInput
              value={V_drop}
              onChange={(e) => setVdrop(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 89"
            />
            <Help>Voltage drop required across the resistor.</Help>
          </div>

          {/* Power Safety Factor */}
          <div>
            <Label required>Power Safety Factor (SF)</Label>
            <NumberInput
              value={SF}
              onChange={(e) => setSF(e.target.value)}
              inputMode="decimal"
              step="any"
              min="1"
              required
              placeholder="e.g. 28"
            />
            <Help>Multiplier applied to required power to select rating.</Help>
          </div>
        </div>

        {/* Formula hint like Barnes */}
        <div className="mt-4 rounded-lg bg-slate-50 dark:bg-slate-900/40 border px-4 py-3 text-xs leading-relaxed">
          <div className="font-semibold mb-1">Equations (Step 2–3)</div>
          <ul className="list-disc list-inside space-y-0.5">
            <li>
              Nominal resistance:{" "}
              <span className="font-semibold">R = V / I</span>
            </li>
            <li>
              Adjustable range:{" "}
              <span className="font-semibold">
                R_min = 0, R_max = 2 × R
              </span>
            </li>
            <li>
              Required power:{" "}
              <span className="font-semibold">P_required = I² × R</span>
            </li>
            <li>
              Recommended rating:{" "}
              <span className="font-semibold">
                P_recommended = P_required × SF
              </span>
            </li>
          </ul>
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>
            {submitting ? "Calculating..." : "Calculate"}
          </PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
