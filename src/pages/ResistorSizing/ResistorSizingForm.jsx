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
  // 3 inputs only – like the HTML tool
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
            Enter design current, desired voltage drop, and power safety
            factor to size the variable resistor.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      {/* === Formulas box (like the original HTML tool) === */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm md:text-base shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-slate-50">
          Formulas Used:
        </p>

        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

        <div className="space-y-1.5 text-slate-700 dark:text-slate-200">
          <div className="flex flex-wrap gap-x-1">
            <span className="font-semibold">Nominal Resistance (R):</span>
            <span>R = V / I</span>
          </div>

          <div className="flex flex-wrap gap-x-1">
            <span className="font-semibold">Power Dissipation (P):</span>
            <span>P = I² × R</span>
          </div>
        </div>
      </div>

      {/* === Inputs card – only 3 inputs like the image === */}
      <SectionCard
        title="Inputs"
        actions={<ResetPill onClick={handleReset} />}
      >
        <div className="space-y-4">
          {/* Design Current */}
          <div>
            <Label required>Design Current (I) in Amperes</Label>
            <NumberInput
              value={I_design}
              onChange={(e) => setIdesign(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 87"
            />
            <Help>I (A)</Help>
          </div>

          {/* Desired Voltage Drop */}
          <div>
            <Label required>Desired Voltage Drop (V) in Volts</Label>
            <NumberInput
              value={V_drop}
              onChange={(e) => setVdrop(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 89"
            />
            <Help>V (Volts)</Help>
          </div>

          {/* Power Safety Factor */}
          <div>
            <Label required>Power Safety Factor</Label>
            <NumberInput
              value={SF}
              onChange={(e) => setSF(e.target.value)}
              inputMode="decimal"
              step="any"
              min="1"
              required
              placeholder="e.g. 28"
            />
            <Help>Multiplier for resistor power rating</Help>
          </div>
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
