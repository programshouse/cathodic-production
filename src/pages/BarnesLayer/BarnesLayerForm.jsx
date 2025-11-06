import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { UNIT } from "./utils";

export default function BarnesLayerForm({ onSubmit, submitting, onReset, initialValues = {} }) {
  const [rhoTop, setRhoTop] = useState(initialValues.rho_top_value ?? "");
  const [rhoTopUnit, setRhoTopUnit] = useState(initialValues.rho_top_unit || UNIT.OHM_M);
  const [tTop, setTtop] = useState(initialValues.t_top_m ?? "");
  const [rhoBottom, setRhoBottom] = useState(initialValues.rho_bottom_value ?? "");
  const [rhoBottomUnit, setRhoBottomUnit] = useState(initialValues.rho_bottom_unit || UNIT.OHM_M);
  const [spacing, setSpacing] = useState(initialValues.spacing_m ?? "");
  const [measuredR, setMeasuredR] = useState(initialValues.measured_R_ohm ?? "");
  const [method, setMethod] = useState(initialValues.method || "Single Layer");

  const handleReset = () => {
    setRhoTop(""); setRhoTopUnit(UNIT.OHM_M);
    setTtop("");
    setRhoBottom(""); setRhoBottomUnit(UNIT.OHM_M);
    setSpacing("");
    setMeasuredR("");
    setMethod("Single Layer");
    onReset?.();
  };

  const submit = (e) => {
    e.preventDefault();
    onSubmit?.({
      rho_top_value: Number(rhoTop), rho_top_unit: rhoTopUnit,
      t_top_m: Number(tTop),
      rho_bottom_value: Number(rhoBottom), rho_bottom_unit: rhoBottomUnit,
      spacing_m: Number(spacing),
      measured_R_ohm: Number(measuredR),
      method,
    });
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Barnes Layer Resistivity</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">Enter top/bottom layer resistivities, top layer thickness, spacing, and measured resistance.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={submit} className="space-y-6">
      <Header />
      <SectionCard title="Barnes Layer Parameters" actions={<ResetPill onClick={handleReset} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Top Layer Resistivity</Label>
            <div className="flex">
              <NumberInput value={rhoTop} onChange={(e)=>setRhoTop(e.target.value)} inputMode="decimal" step="any" min="0" required className="rounded-r-none border-r-0" placeholder="e.g. 1000" />
              <Select value={rhoTopUnit} onChange={(e)=>setRhoTopUnit(e.target.value)} className="w-28 rounded-l-none">
                <option value={UNIT.OHM_M}>{UNIT.OHM_M}</option>
                <option value={UNIT.OHM_CM}>{UNIT.OHM_CM}</option>
              </Select>
            </div>
            <Help>Top layer apparent resistivity.</Help>
          </div>
          <div>
            <Label required>Top Layer Thickness (m)</Label>
            <NumberInput value={tTop} onChange={(e)=>setTtop(e.target.value)} inputMode="decimal" step="any" min="0" required placeholder="e.g. 3" />
          </div>
          <div>
            <Label required>Bottom Layer Resistivity</Label>
            <div className="flex">
              <NumberInput value={rhoBottom} onChange={(e)=>setRhoBottom(e.target.value)} inputMode="decimal" step="any" min="0" required className="rounded-r-none border-r-0" placeholder="e.g. 5000" />
              <Select value={rhoBottomUnit} onChange={(e)=>setRhoBottomUnit(e.target.value)} className="w-28 rounded-l-none">
                <option value={UNIT.OHM_M}>{UNIT.OHM_M}</option>
                <option value={UNIT.OHM_CM}>{UNIT.OHM_CM}</option>
              </Select>
            </div>
          </div>
          <div>
            <Label required>Electrode Spacing (m)</Label>
            <NumberInput value={spacing} onChange={(e)=>setSpacing(e.target.value)} inputMode="decimal" step="any" min="0" required placeholder="e.g. 10" />
            <Help>Wenner spacing parameter a.</Help>
          </div>
          <div>
            <Label required>Measured Resistance (Ω)</Label>
            <NumberInput value={measuredR} onChange={(e)=>setMeasuredR(e.target.value)} inputMode="decimal" step="any" min="0" required placeholder="e.g. 5" />
          </div>
          <div>
            <Label required>Barnes Method</Label>
            <Select value={method} onChange={(e)=>setMethod(e.target.value)}>
              <option>Single Layer</option>
            </Select>
          </div>
        </div>
        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>{submitting ? "Calculating..." : "Calculate Barnes Layer"}</PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
