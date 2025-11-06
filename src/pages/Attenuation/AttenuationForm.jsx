import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { LENGTH_UNITS, RES_PER_LENGTH_UNITS, POTENTIAL_UNITS } from "./utils";

export default function AttenuationForm({ onSubmit, submitting, onReset, initialValues = {} }) {
  const [L, setL] = useState(initialValues.L_value ?? "");
  const [Lunit, setLunit] = useState(initialValues.L_unit || "km");
  const [V0, setV0] = useState(initialValues.V0_value ?? "");
  const [V0unit, setV0unit] = useState(initialValues.V0_unit || "V");
  const [Rs, setRs] = useState(initialValues.Rs_value ?? "");
  const [RsUnit, setRsUnit] = useState(initialValues.Rs_unit || "ohm_per_km");
  const [RL, setRL] = useState(initialValues.RL_value ?? "");
  const [RLUnit, setRLUnit] = useState(initialValues.RL_unit || "ohm_per_km");
  const [points, setPoints] = useState(initialValues.points ?? 50);
  const [mode, setMode] = useState(initialValues.mode || "direct");
  // Derived inputs
  const [OD, setOD] = useState(initialValues.OD_value ?? "");
  const [ODUnit, setODUnit] = useState(initialValues.OD_unit || "in");
  const [t, setT] = useState(initialValues.t_value ?? "");
  const [tUnit, setTUnit] = useState(initialValues.t_unit || "mm");
  const [rhoSteel, setRhoSteel] = useState(initialValues.rho_steel_ohm_m ?? 1.6e-7);
  const [RcArea, setRcArea] = useState(initialValues.Rc_per_area_ohm_m2 ?? "");

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Attenuation & Pipeline Potential Profile</h2>
              <p className="text-brand-50/90 text-sm md:text-base mt-1">α = sqrt(Rs / RL),   V(x) = V0 × cosh[α(L − x)] / cosh(αL)</p>
            </div>
            <ResetPill onClick={onReset} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Header />

      <SectionCard title="Inputs">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2">
            <Label>Input Mode</Label>
            <Select name="mode" value={mode} onChange={(e)=>setMode(e.target.value)}>
              <option value="direct">Direct Rs / RL</option>
              <option value="derived">Derived from geometry & coating</option>
            </Select>
          </div>
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <div>
              <Label>Total length L</Label>
              <NumberInput name="L_value" placeholder="e.g. 50" value={L} onChange={(e)=>setL(e.target.value)} />
            </div>
            <div>
              <Label>Length Unit</Label>
              <Select name="L_unit" value={Lunit} onChange={(e)=>setLunit(e.target.value)}>
                {LENGTH_UNITS.map(u=> <option key={u.value} value={u.value}>{u.label}</option>)}
              </Select>
            </div>
            <div>
              <Label>Drain point potential V0</Label>
              <NumberInput name="V0_value" placeholder="e.g. -1.0" step="0.01" value={V0} onChange={(e)=>setV0(e.target.value)} />
            </div>
            <div>
              <Label>V0 Unit</Label>
              <Select name="V0_unit" value={V0unit} onChange={(e)=>setV0unit(e.target.value)}>
                {POTENTIAL_UNITS.map(u=> <option key={u.value} value={u.value}>{u.label}</option>)}
              </Select>
            </div>
          </div>
          {mode === "direct" && (
            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              <div>
                <Label>Series resistance per length Rs</Label>
                <NumberInput name="Rs_value" placeholder="e.g. 0.15" step="0.0001" value={Rs} onChange={(e)=>setRs(e.target.value)} />
              </div>
              <div>
                <Label>Rs Unit</Label>
                <Select name="Rs_unit" value={RsUnit} onChange={(e)=>setRsUnit(e.target.value)}>
                  {RES_PER_LENGTH_UNITS.map(u=> <option key={u.value} value={u.value}>{u.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>Leakage resistance per length RL</Label>
                <NumberInput name="RL_value" placeholder="e.g. 50" step="0.0001" value={RL} onChange={(e)=>setRL(e.target.value)} />
              </div>
              <div>
                <Label>RL Unit</Label>
                <Select name="RL_unit" value={RLUnit} onChange={(e)=>setRLUnit(e.target.value)}>
                  {RES_PER_LENGTH_UNITS.map(u=> <option key={u.value} value={u.value}>{u.label}</option>)}
                </Select>
              </div>
            </div>
          )}

          {mode === "derived" && (
            <div className="grid grid-cols-2 gap-3 md:col-span-2">
              <div>
                <Label>Pipe Outside Diameter OD</Label>
                <NumberInput name="OD_value" placeholder="e.g. 24" value={OD} onChange={(e)=>setOD(e.target.value)} />
              </div>
              <div>
                <Label>OD Unit</Label>
                <Select name="OD_unit" value={ODUnit} onChange={(e)=>setODUnit(e.target.value)}>
                  {LENGTH_UNITS.map(u=> <option key={u.value} value={u.value}>{u.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>Wall Thickness t</Label>
                <NumberInput name="t_value" placeholder="e.g. 12" value={t} onChange={(e)=>setT(e.target.value)} />
              </div>
              <div>
                <Label>t Unit</Label>
                <Select name="t_unit" value={tUnit} onChange={(e)=>setTUnit(e.target.value)}>
                  {LENGTH_UNITS.map(u=> <option key={u.value} value={u.value}>{u.label}</option>)}
                </Select>
              </div>
              <div>
                <Label>Steel resistivity ρ_steel (Ω·m)</Label>
                <NumberInput name="rho_steel_ohm_m" step="1e-8" value={rhoSteel} onChange={(e)=>setRhoSteel(e.target.value)} />
                <Help>Typical ~1.6e-7 Ω·m</Help>
              </div>
              <div>
                <Label>Coating resistance per area (Ω·m²)</Label>
                <NumberInput name="Rc_per_area_ohm_m2" placeholder="e.g. 1000" value={RcArea} onChange={(e)=>setRcArea(e.target.value)} />
              </div>
            </div>
          )}

          <div className="md:col-span-2">
            <Label>Resolution (points)</Label>
            <NumberInput name="points" placeholder="50" value={points} onChange={(e)=>setPoints(e.target.value)} />
            <Help>Number of samples along 0..L</Help>
          </div>
        </div>
      </SectionCard>

      <div className="flex justify-start">
        <PrimaryButton type="submit" disabled={submitting}>Calculate Profile</PrimaryButton>
      </div>
    </form>
  );
}
