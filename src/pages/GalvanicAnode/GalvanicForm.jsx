import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import PrimaryButton from "../../components/ui/PrimaryButton";
import ResetPill from "../../components/ui/ResetPill";
import { MATERIALS } from "./utils";

export default function GalvanicForm({ onSubmit, submitting, onReset }) {
  const [area_m2, setArea] = useState("");
  const [jd_mA_per_m2, setJD] = useState("");
  const [design_life_years, setLife] = useState("");

  const [material, setMaterial] = useState("");
  const [anode_weight_kg, setW] = useState("");
  const [eta, setEta] = useState("");

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Galvanic Anode System</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">Enter structure and anode parameters. Submit to calculate current requirement, anode weight, and count.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSubmit && onSubmit(e); }} className="space-y-6">
      <Header />

      <SectionCard
        title="Structure Parameters"
        subtitle="Surface area, current density, coating factor, design life"
        actions={(
          <ResetPill onClick={() => { setArea(""); setJD(""); setLife(""); onReset && onReset(); }} />
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Surface Area</Label>
            <div className="flex gap-2">
              <NumberInput name="area_m2" inputMode="decimal" step="any" min="0" value={area_m2} onChange={(e)=>setArea(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">m²</span>
            </div>
            <Help>Total protected surface area.</Help>
          </div>
          <div>
            <Label required>Current Density</Label>
            <div className="flex gap-2">
              <NumberInput name="jd_mA_per_m2" inputMode="decimal" step="any" min="0" value={jd_mA_per_m2} onChange={(e)=>setJD(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">mA/m²</span>
            </div>
          </div>
          <div>
            <Label required>Coating Factor</Label>
            <div className="flex items-center gap-2">
              <NumberInput name="coating_factor_display" value="1" disabled readOnly />
         
            </div>
            <input type="hidden" name="coating_factor" value="1" />
          </div>
<div>
  <Label required>Design Life</Label>
  <div className="flex gap-2">
    <NumberInput
      name="design_life_years"
      inputMode="numeric"
      step="1"
      min="1"
      value={design_life_years}
      // block decimals/exponents from keyboard
      onKeyDown={(e) => {
        const blocked = ['.', ',', 'e', 'E', '+', '-'];
        if (blocked.includes(e.key)) e.preventDefault();
      }}
      // keep only digits; clamp to min=1 when not empty
      onChange={(e) => {
        const digitsOnly = e.target.value.replace(/\D+/g, '');
        if (digitsOnly === '') { setLife(''); return; }
        const n = Math.max(1, parseInt(digitsOnly, 10));
        setLife(String(n));
      }}
      required
      placeholder="e.g. 20"
    />
    <span className="inline-flex items-center text-sm text-gray-500">years</span>
  </div>
</div>

        </div>
      </SectionCard>

      <SectionCard
        title="Anode Parameters"
        subtitle="Choose material and provide weight and efficiency"
        actions={(
          <ResetPill onClick={() => { setMaterial(""); setW(""); setEta(""); onReset && onReset(); }} />
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Anode Material</Label>
            <Select name="material" value={material} onChange={(e)=>setMaterial(e.target.value)} required>
              <option value="" disabled>Select material</option>
              {MATERIALS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </Select>
          </div>
          <div>
            <Label required>Anode Weight</Label>
            <div className="flex gap-2">
              <NumberInput name="anode_weight_kg" inputMode="decimal" step="any" min="0" value={anode_weight_kg} onChange={(e)=>setW(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">kg</span>
            </div>
          </div>
          <div>
            <Label>Efficiency (η)</Label>
            <div className="flex gap-2">
              <NumberInput name="eta" inputMode="decimal" step="any" min="0.1" max="1.0" value={eta} onChange={(e)=>setEta(e.target.value)} />
              <span className="inline-flex items-center text-sm text-gray-500">fraction</span>
            </div>
            <Help>If blank, a default efficiency is used based on material.</Help>
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={submitting}>{submitting ? "Calculating..." : "Calculate Anode System"}</PrimaryButton>
      </div>
    </form>
  );
}
