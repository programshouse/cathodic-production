import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { SOURCE_TYPES } from "./utils";

export default function VoltageGradientForm({
  onSubmit,
  submitting,
  onReset,
  initialValues = {},
}) {
  // state
  const [sourceType, setSourceType] = useState(initialValues.sourceType ?? "distributed");
  const [I, setI] = useState(
    initialValues.I !== undefined && initialValues.I !== null ? initialValues.I : ""
  );
  const [IUnit, setIUnit] = useState(initialValues.IUnit ?? "A");
  const [rho, setRho] = useState(
    initialValues.rho !== undefined && initialValues.rho !== null ? initialValues.rho : ""
  );
  // NOTE: utils usually expect 'ohm_m' / 'ohm_cm'
  const [rhoUnit, setRhoUnit] = useState(initialValues.rhoUnit ?? "ohm_m");
  const [spacing, setSpacing] = useState(
    initialValues.spacing !== undefined && initialValues.spacing !== null ? initialValues.spacing : ""
  );
  const [spacingUnit, setSpacingUnit] = useState(initialValues.spacingUnit ?? "m");
  const [pipelineDepth, setPipelineDepth] = useState(
    initialValues.pipelineDepth !== undefined && initialValues.pipelineDepth !== null ? initialValues.pipelineDepth : ""
  );
  const [pipelineDepthUnit, setPipelineDepthUnit] = useState(initialValues.pipelineDepthUnit ?? "m");
  const [anodeDepth, setAnodeDepth] = useState(
    initialValues.anodeDepth !== undefined && initialValues.anodeDepth !== null ? initialValues.anodeDepth : ""
  );
  const [anodeDepthUnit, setAnodeDepthUnit] = useState(initialValues.anodeDepthUnit ?? "m");

  const needsSpacing = sourceType === "distributed" || sourceType === "shallow";

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
                Voltage Gradient Calculator
              </h2>
              <p className="mt-2 text-sm text-white/95">
                Compute Vm and V(x) around anodes for distributed / shallow / point sources.
              </p>
            </div>
            <ResetPill onClick={handleReset} />
          </div>
        </div>
      </div>
    </div>
  );

  // submit as data-object (works with your page’s unified handler)
  const handleSubmit = (e) => {
    e.preventDefault();
    onSubmit?.({
      sourceType,
      I: Number(I),
      IUnit,
      rho: Number(rho),
      rhoUnit,
      spacing: Number(spacing),
      spacingUnit,
      pipelineDepth: Number(pipelineDepth),
      pipelineDepthUnit,
      anodeDepth: Number(anodeDepth),
      anodeDepthUnit,
    });
  };

  const handleReset = () => {
    setSourceType("distributed");
    setI(""); setIUnit("A");
    setRho(""); setRhoUnit("ohm_m");
    setSpacing(""); setSpacingUnit("m");
    setPipelineDepth(""); setPipelineDepthUnit("m");
    setAnodeDepth(""); setAnodeDepthUnit("m");
    onReset?.();
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      {/* Parameters block */}
      <SectionCard title="Parameters">
<div className="grid grid-cols-1 md:grid-cols-2 gap-4">
  {/* Source type */}
  <div>
    <Label>Source Type</Label>
    <Select
      name="sourceType"
      value={sourceType}
      onChange={(e) => setSourceType(e.target.value)}
    >
      {SOURCE_TYPES.map((o) => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </Select>
    <Help>Select the anode representation used in the model.</Help>
  </div>

  {/* Current + unit (compact) */}
  <div>
    <Label>Anode Output Current I</Label>
    <div className="flex">
      <NumberInput
        name="I"
        value={I}
        onChange={(e) => setI(e.target.value)}
        step="0.1"
        min="0"
        required
        placeholder="e.g. 20"
        className="rounded-r-none border-r-0 focus:z-10"
      />
      <Select
        name="IUnit"
        value={IUnit}
        onChange={(e) => setIUnit(e.target.value)}
        className="w-24 rounded-l-none focus:z-10"
      >
        <option value="A">A</option>
        <option value="mA">mA</option>
      </Select>
    </div>
    <p className="mt-1 text-xs text-gray-500">
      Tip: Typical MMO outputs — soil ≈ 8&nbsp;A, seawater ≈ 50&nbsp;A.
    </p>
  </div>

  {/* Spacing (only when needed) */}
  {needsSpacing && (
    <div className="md:col-span-2">
      <Label>Anode Spacing s</Label>
      <div className="flex max-w-md">
        <NumberInput
          name="spacing"
          value={spacing}
          onChange={(e) => setSpacing(e.target.value)}
          step="0.1"
          min="0.01"
          required
          placeholder="e.g. 5"
          className="rounded-r-none border-r-0 focus:z-10"
        />
        <Select
          name="spacingUnit"
          value={spacingUnit}
          onChange={(e) => setSpacingUnit(e.target.value)}
          className="w-24 rounded-l-none focus:z-10"
        >
          <option value="m">m</option>
          <option value="ft">ft</option>
        </Select>
      </div>
    </div>
  )}

  {/* Resistivity + unit (compact) */}
  <div className="md:col-span-2">
    <Label>Soil Resistivity ρ</Label>
    <div className="flex max-w-md">
      <NumberInput
        name="rho"
        value={rho}
        onChange={(e) => setRho(e.target.value)}
        step="1"
        min="1"
        required
        placeholder="e.g. 1000"
        className="rounded-r-none border-r-0 focus:z-10"
      />
      <Select
        name="rhoUnit"
        value={rhoUnit}
        onChange={(e) => setRhoUnit(e.target.value)}
        className="w-32 rounded-l-none focus:z-10"
      >
        {/* matches utils: 'ohm_m' / 'ohm_cm' */}
        <option value="ohm_m">Ω·m</option>
        <option value="ohm_cm">Ω·cm</option>
      </Select>
    </div>
  </div>

  {/* Pipeline depth (compact) */}
  <div>
    <Label>Pipeline Depth</Label>
    <div className="flex">
      <NumberInput
        name="pipelineDepth"
        value={pipelineDepth}
        onChange={(e) => setPipelineDepth(e.target.value)}
        step="0.1"
        min="0"
        required
        placeholder="e.g. 1.5"
        className="rounded-r-none border-r-0 focus:z-10"
      />
      <Select
        name="pipelineDepthUnit"
        value={pipelineDepthUnit}
        onChange={(e) => setPipelineDepthUnit(e.target.value)}
        className="w-24 rounded-l-none focus:z-10"
      >
        <option value="m">m</option>
        <option value="ft">ft</option>
      </Select>
    </div>
  </div>

  {/* Anode depth (compact) */}
  <div>
    <Label>Anode Depth</Label>
    <div className="flex">
      <NumberInput
        name="anodeDepth"
        value={anodeDepth}
        onChange={(e) => setAnodeDepth(e.target.value)}
        step="0.1"
        min="0"
        required
        placeholder="e.g. 2"
        className="rounded-r-none border-r-0 focus:z-10"
      />
      <Select
        name="anodeDepthUnit"
        value={anodeDepthUnit}
        onChange={(e) => setAnodeDepthUnit(e.target.value)}
        className="w-24 rounded-l-none focus:z-10"
      >
        <option value="m">m</option>
        <option value="ft">ft</option>
      </Select>
    </div>
  </div>

  <div className="md:col-span-2">
    <Help>All inputs are converted to SI units internally.</Help>
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
