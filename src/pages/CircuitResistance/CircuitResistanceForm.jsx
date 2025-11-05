import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { MATERIALS } from "./utils";
import ResetPill from "../../components/ui/ResetPill";

export default function CircuitResistanceForm({ onSubmit, submitting, onReset }) {
  const [length_m, setLength] = useState(100);
  const [cross_section_mm2, setCS] = useState(16);
  const [material, setMaterial] = useState("copper");
  const [anode_resistance_ohm, setAnodeR] = useState(2.5);
  const [number_of_anodes, setN] = useState(10);
  const [connection, setConn] = useState("series");
  const [pipeline_resistance_ohm, setPipeR] = useState(0.1);

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Circuit Resistance Calculator</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">Enter cable, anode, and pipeline parameters to compute total resistance.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={(e)=>{ e.preventDefault(); onSubmit && onSubmit(e); }} className="space-y-6">
      <Header />
      <SectionCard
        title="Circuit Parameters"
        subtitle="Cable, anode, and pipeline inputs"
        actions={(
          <ResetPill
            onClick={() => {
              setLength("");
              setCS("");
              setMaterial("");
              setAnodeR("");
              setN("");
              setConn("");
              setPipeR("");
              onReset && onReset();
            }}
          />
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Cable Length</Label>
            <div className="flex gap-2">
              <NumberInput name="length_m" inputMode="decimal" step="any" min="0" value={length_m} onChange={(e)=>setLength(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">m</span>
            </div>
          </div>
          <div>
            <Label required>Cable Cross Section</Label>
            <div className="flex gap-2">
              <NumberInput name="cross_section_mm2" inputMode="decimal" step="any" min="0.1" value={cross_section_mm2} onChange={(e)=>setCS(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500">mm²</span>
            </div>
          </div>
          <div>
            <Label required>Cable Material</Label>
            <Select name="material" value={material} onChange={(e)=>setMaterial(e.target.value)} required>
              <option value="" disabled>Select material</option>
              {MATERIALS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </Select>
          </div>
          <div>
            <Label required>Anode Resistance (each)</Label>
            <NumberInput name="anode_resistance_ohm" inputMode="decimal" step="any" min="0" value={anode_resistance_ohm} onChange={(e)=>setAnodeR(e.target.value)} required />
          </div>
          <div>
            <Label required>Number of Anodes</Label>
            <NumberInput name="number_of_anodes" inputMode="numeric" step="1" min="1" value={number_of_anodes} onChange={(e)=>setN(e.target.value)} required />
          </div>
          <div>
            <Label required>Connection</Label>
            <Select name="connection" value={connection} onChange={(e)=>setConn(e.target.value)} required>
              <option value="" disabled>Select connection</option>
              <option value="series">Series</option>
              <option value="parallel">Parallel</option>
            </Select>
          </div>
          <div>
            <Label required>Pipeline Resistance</Label>
            <NumberInput name="pipeline_resistance_ohm" inputMode="decimal" step="any" min="0" value={pipeline_resistance_ohm} onChange={(e)=>setPipeR(e.target.value)} required />
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={submitting}>{submitting ? "Calculating..." : "Calculate Circuit Resistance"}</PrimaryButton>
      </div>
    </form>
  );
}
