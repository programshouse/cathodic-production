
import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function VoltageGradientForm({
  onSubmit,
  submitting,
  onReset,
  initialValues = {},
}) {
  const [I_A, setI] = useState(
    initialValues.I_A !== undefined && initialValues.I_A !== null
      ? initialValues.I_A
      : ""
  );
  const [L_m, setL] = useState(
    initialValues.L_m !== undefined && initialValues.L_m !== null
      ? initialValues.L_m
      : ""
  );
  const [rho_ohm_m, setRho] = useState(
    initialValues.rho_ohm_m !== undefined && initialValues.rho_ohm_m !== null
      ? initialValues.rho_ohm_m
      : ""
  );
  const [X_r_m, setXr] = useState(
    initialValues.X_r_m !== undefined && initialValues.X_r_m !== null
      ? initialValues.X_r_m
      : ""
  );

  const handleReset = () => {
    setI("");
    setL("");
    setRho("");
    setXr("");
    onReset?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      I_A: Number(I_A),
      L_m: Number(L_m),
      rho_ohm_m: Number(rho_ohm_m),
      X_r_m: X_r_m === "" ? null : Number(X_r_m),
    });
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
                Voltage Gradient Module
              </h2>
              <p className="mt-2 text-sm text-white/95">
                Step&nbsp;1: Enter current, rod length, soil resistivity, and
                distance from the anode. Step&nbsp;2: the calculator evaluates
                the voltage rise in earth around the anode.
              </p>
            </div>
            <ResetPill onClick={handleReset} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      {/* Formulas box like the Word doc */}
      <div className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm md:text-base shadow-sm dark:bg-slate-900 dark:border-slate-700">
        <p className="font-semibold text-slate-900 dark:text-slate-50">
          Equation (Voltage rise in earth at distance X<sub>r</sub> from center
          of anode):
        </p>

        <div className="my-2 h-px bg-slate-200 dark:bg-slate-700" />

        <p className="text-slate-700 dark:text-slate-200">
          V<sub>r</sub>(X<sub>r</sub>) ={" "}
          <span className="font-semibold">
            (ρ · I / 2πL)&nbsp;ln[(L + √(L² + X<sub>r</sub>²)) / X<sub>r</sub>]
          </span>
        </p>

        <div className="mt-3 text-xs text-slate-600 dark:text-slate-300 space-y-0.5">
          <p>I = current delivered by the anode (A)</p>
          <p>L = length of anode below grade (m)</p>
          <p>X<sub>r</sub> = distance from anode to point of interest (m)</p>
          <p>ρ = soil resistivity (Ω·m)</p>
          <p>
            V<sub>r</sub> = voltage rise at X<sub>r</sub> with respect to
            remote earth (V)
          </p>
        </div>
      </div>

      <SectionCard title="Input Required Data">
        <div className="space-y-4">
          <div>
            <Label required>I: Current delivered by the anode (A)</Label>
            <NumberInput
              value={I_A}
              onChange={(e) => setI(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0"
              required
              placeholder="e.g. 10"
            />
            <Help>Current output of the anode in amperes.</Help>
          </div>

          <div>
            <Label required>L: Length of anode below grade (m)</Label>
            <NumberInput
              value={L_m}
              onChange={(e) => setL(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0.01"
              required
              placeholder="e.g. 3"
            />
            <Help>Effective buried length of the anode rod in metres.</Help>
          </div>

          <div>
            <Label required>ρ: Soil resistivity (Ω·m)</Label>
            <NumberInput
              value={rho_ohm_m}
              onChange={(e) => setRho(e.target.value)}
              inputMode="decimal"
              step="any"
              min="1"
              required
              placeholder="e.g. 100"
            />
            <Help>Average resistivity of the earth surrounding the anode.</Help>
          </div>

          <div>
            <Label>
              X<sub>r</sub>: Distance from anode to point of interest (m)
            </Label>
            <NumberInput
              value={X_r_m}
              onChange={(e) => setXr(e.target.value)}
              inputMode="decimal"
              step="any"
              min="0.01"
              placeholder="e.g. 10 (optional)"
            />
            <Help>
              If provided, the calculator reports V<sub>r</sub> specifically at
              this distance in addition to the full profile.
            </Help>
          </div>
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>
            Calculate Voltage Gradient
          </PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
