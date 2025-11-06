import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import PrimaryButton from "../../components/ui/PrimaryButton";
import ResetPill from "../../components/ui/ResetPill";
import { METHODS, ENVIRONMENTS } from "./utils";

export default function SoilResistivityForm({
  onSubmit,
  submitting,
  onReset,
  initialValues = {},
}) {
  const [method, setMethod]   = useState(initialValues.method || "wenner");
  const [env, setEnv]         = useState(initialValues.env || "soil");

  const [a, setA]             = useState(initialValues.a ?? "");
  const [aUnit, setAUnit]     = useState(initialValues.aUnit || "m");

  const [L, setL]             = useState(initialValues.L ?? "");
  const [LUnit, setLUnit]     = useState(initialValues.LUnit || "m");

  const [l, setl]             = useState(initialValues.l ?? "");
  const [lUnit, setlUnit]     = useState(initialValues.lUnit || "m");

  const [R_ohm, setR]         = useState(initialValues.R_ohm ?? "");

  const needsWenner = method === "wenner" || method === "four_point";
  const needsSchl   = method === "schlumberger";

  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      method,
      env,
      a: Number(a),
      aUnit,
      L: Number(L),
      LUnit,
      l: Number(l),
      lUnit,
      R_ohm: Number(R_ohm),
    });
  };

  const handleReset = () => {
    setMethod("wenner");
    setEnv("soil");
    setA(""); setAUnit("m");
    setL(""); setLUnit("m");
    setl(""); setlUnit("m");
    setR("");
    onReset?.();
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
            Soil Resistivity Calculator
          </h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">
            Choose method, provide spacing and measured resistance. Output is in Ω·m (SI).
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      <SectionCard
        title="Measurement Parameters"
        subtitle="Select method and fill the required geometry/reading."
        actions={<ResetPill onClick={handleReset} />}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Method */}
          <div>
            <Label required>Measurement Method</Label>
            <Select name="method" value={method} onChange={(e)=>setMethod(e.target.value)} required>
              {METHODS.map(m => (<option key={m.value} value={m.value}>{m.label}</option>))}
            </Select>
            <Help>
              Wenner & Four-Point use equal spacing <em>a</em>. Schlumberger uses half-spacings <em>L</em> (current) and <em>l</em> (potential).
            </Help>
          </div>

          {/* Environment */}
          <div>
            <Label>Environment</Label>
            <Select name="env" value={env} onChange={(e)=>setEnv(e.target.value)}>
              {ENVIRONMENTS.map(x => (<option key={x.value} value={x.value}>{x.label}</option>))}
            </Select>
            <Help>For labeling/guidance only.</Help>
          </div>

          {/* Wenner/Four-Point: a */}
          {needsWenner && (
            <div className="md:col-span-2">
              <Label required>Electrode Spacing a</Label>
              <div className="flex max-w-md">
                <NumberInput
                  name="a"
                  inputMode="decimal"
                  step="any"
                  min="0.01"
                  value={a}
                  onChange={(e)=>setA(e.target.value)}
                  required
                  className="rounded-r-none"
                  placeholder="e.g. 5"
                />
                <Select
                  name="aUnit"
                  value={aUnit}
                  onChange={(e)=>setAUnit(e.target.value)}
                  className="w-24 rounded-l-none"
                >
                  <option value="m">m</option>
                  <option value="cm">cm</option>
                  <option value="ft">ft</option>
                </Select>
              </div>
              <Help>Choose a to match desired exploration depth (commonly 1–50 m).</Help>
            </div>
          )}

          {/* Schlumberger: L and l */}
          {needsSchl && (
            <>
              <div>
                <Label required>Current Half-Spacing L</Label>
                <div className="flex">
                  <NumberInput
                    name="L"
                    inputMode="decimal"
                    step="any"
                    min="0.01"
                    value={L}
                    onChange={(e)=>setL(e.target.value)}
                    required
                    className="rounded-r-none"
                    placeholder="e.g. 25"
                  />
                  <Select
                    name="LUnit"
                    value={LUnit}
                    onChange={(e)=>setLUnit(e.target.value)}
                    className="w-24 rounded-l-none"
                  >
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </Select>
                </div>
                <Help>Distance from array center to A/B (current) electrodes.</Help>
              </div>

              <div>
                <Label required>Potential Half-Spacing l</Label>
                <div className="flex">
                  <NumberInput
                    name="l"
                    inputMode="decimal"
                    step="any"
                    min="0.01"
                    value={l}
                    onChange={(e)=>setl(e.target.value)}
                    required
                    className="rounded-r-none"
                    placeholder="e.g. 2"
                  />
                  <Select
                    name="lUnit"
                    value={lUnit}
                    onChange={(e)=>setlUnit(e.target.value)}
                    className="w-24 rounded-l-none"
                  >
                    <option value="m">m</option>
                    <option value="cm">cm</option>
                    <option value="ft">ft</option>
                  </Select>
                </div>
                <Help>Distance from array center to M/N (potential) electrodes.</Help>
              </div>
            </>
          )}

          {/* Resistance */}
          <div className="md:col-span-2">
            <Label required>Measured Resistance</Label>
            <div className="flex gap-2 max-w-md">
              <NumberInput
                name="R_ohm"
                inputMode="decimal"
                step="any"
                min="0.001"
                value={R_ohm}
                onChange={(e)=>setR(e.target.value)}
                required
                placeholder="e.g. 12.5"
              />
              <span className="inline-flex items-center text-sm text-gray-500">Ω</span>
            </div>
            <Help>Use stabilized readings; average repeats if needed.</Help>
          </div>

          <div className="md:col-span-2">
            <Help>All inputs are converted to SI internally. Output is provided in Ω·m (and optionally Ω·cm).</Help>
          </div>
        </div>

        <div className="mt-4">
          <PrimaryButton type="submit" disabled={!!submitting}>
            {submitting ? "Calculating..." : "Calculate Resistivity"}
          </PrimaryButton>
        </div>
      </SectionCard>
    </form>
  );
}
