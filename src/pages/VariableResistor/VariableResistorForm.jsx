import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function VariableResistorForm({ onSubmit, submitting, onReset, initialValues = {} }) {
  const [I_req, setIreq] = useState(initialValues.I_req_value ?? "");
  const [I_unit, setIunit] = useState(initialValues.I_req_unit || "A");
  const [R_circuit, setRcircuit] = useState(initialValues.R_circuit_ohm ?? "");
  const [SF, setSF] = useState(initialValues.safety_factor ?? "");
  const [V_drive, setVdrive] = useState(initialValues.V_drive_value ?? "");
  const [V_drive_unit, setVdriveUnit] = useState(initialValues.V_drive_unit || "V");
  const [V_anode, setVanode] = useState(initialValues.V_anode_value ?? "");
  const [V_anode_unit, setVanodeUnit] = useState(initialValues.V_anode_unit || "V");
  const [supply, setSupply] = useState(initialValues.supply_type || "AC");

  const handleReset = () => {
    setIreq(""); setIunit("A");
    setRcircuit("");
    setSF("");
    setVdrive(""); setVdriveUnit("V");
    setVanode(""); setVanodeUnit("V");
    setSupply("AC");
    onReset?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      I_req_value: Number(I_req), I_req_unit: I_unit,
      R_circuit_ohm: Number(R_circuit),
      safety_factor: Number(SF),
      V_drive_value: Number(V_drive), V_drive_unit,
      V_anode_value: Number(V_anode), V_anode_unit,
      supply_type: supply,
    });
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Resistor Sizing</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">Variable Resistor sizing: required voltage, rectifier ratings, and power requirement.</p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      <SectionCard title="Rectifier Parameters" actions={<ResetPill onClick={handleReset} />}>
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
            <Help>Design required current.</Help>
          </div>

          <div>
            <Label required>Total Circuit Resistance (Ω)</Label>
            <NumberInput value={R_circuit} onChange={(e)=>setRcircuit(e.target.value)} inputMode="decimal" step="any" min="0" required placeholder="e.g. 1.2" />
          </div>

          <div>
            <Label required>Safety Factor</Label>
            <NumberInput value={SF} onChange={(e)=>setSF(e.target.value)} inputMode="decimal" step="any" min="1" required placeholder="e.g. 1.25" />
            <Help>Multiplier applied to both current and voltage ratings.</Help>
          </div>

          <div>
            <Label>Driving Voltage</Label>
            <div className="flex">
              <NumberInput value={V_drive} onChange={(e)=>setVdrive(e.target.value)} inputMode="decimal" step="any" min="0" className="rounded-r-none border-r-0" placeholder="e.g. 0.5" />
              <Select value={V_drive_unit} onChange={(e)=>setVdriveUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="V">V</option>
                <option value="mV">mV</option>
              </Select>
            </div>
            <Help>Additional drop (driving head) if applicable.</Help>
          </div>

          <div>
            <Label>Anode Potential</Label>
            <div className="flex">
              <NumberInput value={V_anode} onChange={(e)=>setVanode(e.target.value)} inputMode="decimal" step="any" min="0" className="rounded-r-none border-r-0" placeholder="e.g. 2" />
              <Select value={V_anode_unit} onChange={(e)=>setVanodeUnit(e.target.value)} className="w-24 rounded-l-none">
                <option value="V">V</option>
                <option value="mV">mV</option>
              </Select>
            </div>
            <Help>Driving potential for anodes, if considered.</Help>
          </div>

          <div>
            <Label>Power Supply Type</Label>
            <Select value={supply} onChange={(e)=>setSupply(e.target.value)}>
              <option value="AC">AC</option>
              <option value="DC">DC</option>
            </Select>
          </div>
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>{submitting ? "Calculating..." : "Calculate Variable Resistor"}</PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
