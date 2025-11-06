import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function ResistorSizingForm({ onSubmit, submitting, onReset, initialValues = {}, title = "Variable Resistor & Shunt Resistor Sizing" }) {
  // Variable resistor inputs
  const [V_rect, setVrect] = useState(initialValues.V_rect_value ?? "");
  const [V_rect_unit, setVrectUnit] = useState(initialValues.V_rect_unit || "V");
  const [I_target, setItarget] = useState(initialValues.I_target_value ?? "");
  const [I_target_unit, setItargetUnit] = useState(initialValues.I_target_unit || "A");
  const [R_circuit, setRcircuit] = useState(initialValues.R_circuit_ohm ?? "");

  // Shunt inputs
  const [V_shunt, setVshunt] = useState(initialValues.V_shunt_value ?? "");
  const [V_shunt_unit, setVshuntUnit] = useState(initialValues.V_shunt_unit || "mV");
  const [I_shunt, setIshunt] = useState(initialValues.I_shunt_value ?? "");
  const [I_shunt_unit, setIshuntUnit] = useState(initialValues.I_shunt_unit || "A");

  const handleReset = () => {
    setVrect(""); setVrectUnit("V");
    setItarget(""); setItargetUnit("A");
    setRcircuit("");
    setVshunt(""); setVshuntUnit("mV");
    setIshunt(""); setIshuntUnit("A");
    onReset?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      // variable
      V_rect_value: Number(V_rect), V_rect_unit,
      I_target_value: Number(I_target), I_target_unit,
      R_circuit_ohm: Number(R_circuit),
      // shunt
      V_shunt_value: Number(V_shunt), V_shunt_unit,
      I_shunt_value: Number(I_shunt), I_shunt_unit,
    });
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">{title}</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">Enter rectifier voltage/current, circuit resistance, and shunt voltage/current. Output in Ω and W.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      <SectionCard title="Variable Resistor Sizing" actions={<ResetPill onClick={handleReset} />}>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Rectifier Voltage</Label>
            <div className="flex">
              <NumberInput value={V_rect} onChange={(e)=>setVrect(e.target.value)} inputMode="decimal" step="any" min="0" required className="rounded-r-none border-r-0" placeholder="e.g. 24" />
              <Select value={V_rect_unit} onChange={(e)=>setVrectUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="V">V</option>
                <option value="mV">mV</option>
              </Select>
            </div>
            <Help>Rectifier output voltage.</Help>
          </div>

          <div>
            <Label required>Target Current</Label>
            <div className="flex">
              <NumberInput value={I_target} onChange={(e)=>setItarget(e.target.value)} inputMode="decimal" step="any" min="0" required className="rounded-r-none border-r-0" placeholder="e.g. 15" />
              <Select value={I_target_unit} onChange={(e)=>setItargetUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="A">A</option>
                <option value="mA">mA</option>
              </Select>
            </div>
            <Help>Desired current setpoint.</Help>
          </div>

          <div className="md:col-span-2">
            <Label required>Circuit Resistance (Ω)</Label>
            <NumberInput value={R_circuit} onChange={(e)=>setRcircuit(e.target.value)} inputMode="decimal" step="any" min="0" required placeholder="e.g. 1.2" />
            <Help>Known resistance of the circuit without variable resistor.</Help>
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Shunt Resistor Sizing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Shunt Voltage</Label>
            <div className="flex">
              <NumberInput value={V_shunt} onChange={(e)=>setVshunt(e.target.value)} inputMode="decimal" step="any" min="0" required className="rounded-r-none border-r-0" placeholder="e.g. 50" />
              <Select value={V_shunt_unit} onChange={(e)=>setVshuntUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="mV">mV</option>
                <option value="V">V</option>
              </Select>
            </div>
            <Help>Typical shunt rating is in mV (e.g., 50 mV, 60 mV, 75 mV).</Help>
          </div>

          <div>
            <Label required>Shunt Current</Label>
            <div className="flex">
              <NumberInput value={I_shunt} onChange={(e)=>setIshunt(e.target.value)} inputMode="decimal" step="any" min="0" required className="rounded-r-none border-r-0" placeholder="e.g. 20" />
              <Select value={I_shunt_unit} onChange={(e)=>setIshuntUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="A">A</option>
                <option value="mA">mA</option>
              </Select>
            </div>
            <Help>Full-scale current across the shunt.</Help>
          </div>
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>{submitting ? "Calculating..." : "Calculate Resistor Sizing"}</PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
