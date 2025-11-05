import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { CONFIGS } from "./utils";
import ResetPill from "../../components/ui/ResetPill";

export default function GroundbedForm({ onSubmit, submitting, onReset }) {
  const [config, setConfig] = useState("vertical_single");
  const [rho_cm, setRho] = useState(1000);
  const [L_m, setL] = useState(3);
  const [d_m, setD] = useState(0.3);
  const [N, setN] = useState(1);
  const [spacing_m, setSpacing] = useState(5);
  const [F, setF] = useState("");

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Groundbed Resistance Calculator</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">Choose configuration and provide parameters. Submit to compute resistance.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={(e) => { e.preventDefault(); onSubmit && onSubmit(e); }}
      className="space-y-6"
    >
      <Header />

      <SectionCard
        title="Anode Configuration"
        subtitle="Select configuration and provide anode geometry."
        actions={(
          <ResetPill
            onClick={() => {
              setConfig("vertical_single");
              setRho("");
              setL("");
              setD("");
              setN("");
              setSpacing("");
              setF("");
              onReset && onReset();
            }}
          />
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Anode Configuration</Label>
            <Select name="config" value={config} onChange={(e)=>setConfig(e.target.value)} required>
              {CONFIGS.map(c => (<option key={c.value} value={c.value}>{c.label}</option>))}
            </Select>
            <Help>Vertical/Horizontal (single or multiple) or Deepwell.</Help>
          </div>
          <div>
            <Label required>Soil Resistivity</Label>
            <div className="flex gap-2">
              <NumberInput name="rho_cm" inputMode="decimal" step="any" min="1" value={rho_cm} onChange={(e)=>setRho(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">Ω·cm</span>
            </div>
            <Help>Bulk resistivity in ohm-cm.</Help>
          </div>
          <div>
            <Label required>Anode Length</Label>
            <div className="flex gap-2">
              <NumberInput name="L_m" inputMode="decimal" step="any" min="0.01" value={L_m} onChange={(e)=>setL(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">m</span>
            </div>
          </div>
          <div>
            <Label required>Anode Diameter</Label>
            <div className="flex gap-2">
              <NumberInput name="d_m" inputMode="decimal" step="any" min="0.001" value={d_m} onChange={(e)=>setD(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">m</span>
            </div>
          </div>

          {(config.includes("multiple")) && (
            <>
              <div>
                <Label required>Number of Anodes</Label>
                <NumberInput name="N" inputMode="numeric" step="1" min="1" value={N} onChange={(e)=>setN(e.target.value)} required />
              </div>
              <div>
                <Label required>Anode Spacing</Label>
                <div className="flex gap-2">
                  <NumberInput name="spacing_m" inputMode="decimal" step="any" min="0.1" value={spacing_m} onChange={(e)=>setSpacing(e.target.value)} required />
                  <span className="inline-flex items-center text-sm text-gray-500">m</span>
                </div>
              </div>
              <div className="md:col-span-2">
                <Label>Interaction Factor (optional)</Label>
                <NumberInput name="F" inputMode="decimal" step="any" min="0.1" max="1.0" value={F} onChange={(e)=>setF(e.target.value)} />
                <Help>If left blank, an estimated factor is used based on spacing/length.</Help>
              </div>
            </>
          )}
        </div>
      </SectionCard>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={submitting}>{submitting ? "Calculating..." : "Calculate Resistance"}</PrimaryButton>
      </div>
    </form>
  );
}
