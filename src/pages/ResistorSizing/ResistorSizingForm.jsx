import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function ResistorSizingForm({ onSubmit, submitting, onReset, initialValues = {}, title = "Rectifier Sizing" }) {
  // Rectifier sizing inputs
  const [I_req, setIreq] = useState(initialValues.I_required_value ?? "");
  const [I_unit, setIunit] = useState(initialValues.I_required_unit || "A");
  const [R_circuit, setRcircuit] = useState(initialValues.R_circuit_ohm ?? "");
  const [E_native, setEnative] = useState(initialValues.E_native_value ?? "");
  const [E_native_unit, setEnativeUnit] = useState(initialValues.E_native_unit || "V");
  const [E_protect, setEprotect] = useState(initialValues.E_protect_value ?? "");
  const [E_protect_unit, setEprotectUnit] = useState(initialValues.E_protect_unit || "V");
  const [SF, setSF] = useState(initialValues.safety_factor ?? "");

  const handleReset = () => {
    setIreq(""); setIunit("A");
    setRcircuit("");
    setEnative(""); setEnativeUnit("V");
    setEprotect(""); setEprotectUnit("V");
    setSF("");
    onReset?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      I_required_value: Number(I_req), I_required_unit: I_unit,
      R_circuit_ohm: Number(R_circuit),
      E_native_value: Number(E_native), E_native_unit,
      E_protect_value: Number(E_protect), E_protect_unit,
      safety_factor: Number(SF),
    });
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">Enter required current, circuit resistance, native and protection potentials, and safety factor.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      <SectionCard title="Inputs" actions={<ResetPill onClick={handleReset} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Required Current</Label>
            <div className="flex">
              <NumberInput value={I_req} onChange={(e)=>setIreq(e.target.value)} inputMode="decimal" step="any" min="0" required className="rounded-r-none border-r-0" placeholder="e.g. 20" />
              <Select value={I_unit} onChange={(e)=>setIunit(e.target.value)} className="w-24 rounded-l-none">
                <option value="A">A</option>
                <option value="mA">mA</option>
              </Select>
            </div>
            <Help>I_required</Help>
          </div>

          <div>
            <Label required>Total Circuit Resistance (Ω)</Label>
            <NumberInput value={R_circuit} onChange={(e)=>setRcircuit(e.target.value)} inputMode="decimal" step="any" min="0" required placeholder="e.g. 1.2" />
            <Help>R_circuit</Help>
          </div>

          <div>
            <Label required>Native Potential (E_native)</Label>
            <div className="flex">
              <NumberInput value={E_native} onChange={(e)=>setEnative(e.target.value)} inputMode="decimal" step="any" className="rounded-r-none border-r-0" placeholder="e.g. -0.85" />
              <Select value={E_native_unit} onChange={(e)=>setEnativeUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="V">V</option>
                <option value="mV">mV</option>
              </Select>
            </div>
            <Help>E_native (pipe native)</Help>
          </div>

          <div>
            <Label required>Protection Potential (E_protect)</Label>
            <div className="flex">
              <NumberInput value={E_protect} onChange={(e)=>setEprotect(e.target.value)} inputMode="decimal" step="any" className="rounded-r-none border-r-0" placeholder="e.g. -1.1" />
              <Select value={E_protect_unit} onChange={(e)=>setEprotectUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="V">V</option>
                <option value="mV">mV</option>
              </Select>
            </div>
            <Help>E_protect</Help>
          </div>

          <div>
            <Label required>Safety Factor</Label>
            <NumberInput value={SF} onChange={(e)=>setSF(e.target.value)} inputMode="decimal" step="any" min="1" required placeholder="e.g. 1.25" />
            <Help>Applies to both I and V ratings</Help>
          </div>
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>{submitting ? "Calculating..." : "Calculate Rectifier Sizing"}</PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
