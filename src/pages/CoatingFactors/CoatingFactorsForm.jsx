import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { COATING_TYPES, SOIL_TYPES } from "./utils";
import ResetPill from "../../components/ui/ResetPill";

export default function CoatingFactorsForm({ onSubmit, submitting }) {
  const [coatingType, setCoatingType] = useState("liquid_epoxy");
  const [designLifeYears, setDesignLifeYears] = useState(25);
  const [temperatureC, setTemperatureC] = useState(25);
  const [soilType, setSoilType] = useState("sandy");

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Coating Factors Calculator</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">
            Enter coating type, design life, operating temperature, and soil type.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit(e);
      }}
      className="space-y-6"
    >
      <Header />

      <SectionCard
        title="Input Parameters"
        subtitle="Provide parameters to compute coating breakdown factor."
        actions={(<ResetPill onClick={() => { setCoatingType("liquid_epoxy"); setDesignLifeYears(""); setTemperatureC(""); setSoilType("sandy"); onSubmit && void 0; }} />)}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Coating Type</Label>
            <Select name="coatingType" value={coatingType} onChange={(e) => setCoatingType(e.target.value)} required>
              {COATING_TYPES.sort((a,b)=>a.label.localeCompare(b.label)).map((c) => (
                <option key={c.value} value={c.value}>{c.label}</option>
              ))}
            </Select>
            <Help>Select the coating.</Help>
          </div>

          <div>
            <Label required>Design Life</Label>
            <div className="flex gap-2">
              <NumberInput name="designLifeYears" inputMode="numeric" min="0" step="1" value={designLifeYears} onChange={(e)=>setDesignLifeYears(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">years</span>
            </div>
            <Help>The target design life in years.</Help>
          </div>

          <div>
            <Label required>Operating Temperature</Label>
            <div className="flex gap-2">
              <NumberInput name="temperatureC" inputMode="decimal" step="1" min="-20" max="120" value={temperatureC} onChange={(e)=>setTemperatureC(e.target.value)} required />
              <span className="inline-flex items-center text-sm text-gray-500 dark:text-gray-400">°C</span>
            </div>
            <Help>Used to apply a temperature factor.</Help>
          </div>

          <div>
            <Label required>Soil Type</Label>
            <Select name="soilType" value={soilType} onChange={(e) => setSoilType(e.target.value)} required>
              {SOIL_TYPES.map((s) => (
                <option key={s.value} value={s.value}>{s.label}</option>
              ))}
            </Select>
            <Help>Applies a soil factor.</Help>
          </div>
        </div>
      </SectionCard>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={submitting}>{submitting ? "Calculating..." : "Calculate Coating Factors"}</PrimaryButton>
      </div>
    </form>
  );
}
