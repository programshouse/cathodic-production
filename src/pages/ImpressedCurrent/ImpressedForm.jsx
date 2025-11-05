import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";
import { ANODE_TYPES, ENVIRONMENTS } from "./utils";

export default function ImpressedForm({
  onSubmit,
  submitting,
  onReset,
  initialValues = {},
}) {
  const [structure, setStructure] = useState(initialValues.structure || "pipeline");
  const [area, setArea] = useState(initialValues.area_m2 ?? "");
  const [coatingFactor, setCoatingFactor] = useState(initialValues.coating_factor ?? "");
  const [designLife, setDesignLife] = useState(initialValues.design_life_years ?? "");
  const [jd, setJd] = useState(initialValues.jd_mA_per_m2 ?? "");
  const [jdUnit, setJdUnit] = useState(initialValues.jd_unit || "mA/m2");
  const [rho, setRho] = useState(initialValues.rho_ohm_m ?? "");
  const [R, setR] = useState(initialValues.R_ohm ?? "");
  const [E_native, setEnative] = useState(initialValues.E_native_V ?? "");
  const [E_target, setEtarget] = useState(initialValues.E_target_V ?? "");
  const [areaUnit, setAreaUnit] = useState(initialValues.area_unit || "m2");

  const [anodeType, setAnodeType] = useState(initialValues.anode_type || "FeSiCr");
  const [capacity, setCapacity] = useState(initialValues.capacity_Ah_per_kg ?? 1500);
  const [eta, setEta] = useState(initialValues.eta ?? 0.5);
  const [unitWeight, setUnitWeight] = useState(initialValues.unit_weight_kg ?? "");
  const [I_single, setIsingle] = useState(initialValues.I_single_A ?? 8);
  const [env, setEnv] = useState(initialValues.environment || "soil");
  const [SF, setSF] = useState(initialValues.safety_factor ?? 1.1);

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Impressed Current Calculator</h2>
                  <p className="mt-2 text-sm text-white dark:text-gray-300">Select the structure type and enter parameters with units. All fields marked * are required.</p>
            </div>
     
          </div>
        </div>
      </div>
  
    </div>
  );

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <Header />

<SectionCard
  title="Structure Type"
  actions={<ResetPill onClick={onReset} />}
>
  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
    <div>
      <Label>Structure</Label>
      <Select
        name="structure"
        value={structure}
        onChange={(e) => setStructure(e.target.value)}
      >
        <option value="pipeline">Pipeline</option>
        <option value="tank">Tank</option>
        <option value="other">Other</option>
      </Select>
    </div>

    <div>
      <Label>Environment</Label>
      <Select
        name="environment"
        value={env}
        onChange={(e) => setEnv(e.target.value)}
      >
        {ENVIRONMENTS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.label}
          </option>
        ))}
      </Select>
    </div>

    <div className="md:col-span-2">
      <p className="text-xs text-gray-500">
        Pipeline, tank internal (wetted shell), or other structures; choose environment for unit guidance.
      </p>
    </div>
  </div>
</SectionCard>


      <SectionCard title="Input Parameters">
        {/* Block 1: Area */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Total Surface Area A</Label>
            <NumberInput
              name="area_value"
              placeholder="e.g. 1000"
              value={area}
              onChange={(e) => setArea(e.target.value)}
            />
          </div>
          <div>
            <Label>Area Unit</Label>
            <Select
              name="area_unit"
              value={areaUnit}
              onChange={(e) => setAreaUnit(e.target.value)}
            >
              <option value="m2">m²</option>
              <option value="ft2">ft²</option>
            </Select>
          </div>
          <div className="md:col-span-2">
            <Help>Area converts to SI (m²) internally.</Help>
          </div>
        </div>

        {/* Block 2: Factors & life */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Coating Factor f<sub>c</sub></Label>
            <NumberInput
              name="coating_factor"
              placeholder="e.g. 0.6"
              step="0.01"
              value={coatingFactor}
              onChange={(e) => setCoatingFactor(e.target.value)}
            />
          </div>
          <div>
            <Label>Design Life t (years)</Label>
            <NumberInput
              name="design_life_years"
              placeholder="e.g. 20"
              value={designLife}
              onChange={(e) => setDesignLife(e.target.value)}
            />
          </div>
        </div>

        {/* Block 3: Jd */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="grid grid-cols-2 gap-3 md:col-span-2">
            <div>
              <Label>Design Current Density Jd</Label>
              <NumberInput
                name="jd_value"
                placeholder="e.g. 10"
                value={jd}
                onChange={(e) => setJd(e.target.value)}
              />
            </div>
            <div>
              <Label>Jd Unit</Label>
              <Select
                name="jd_unit"
                value={jdUnit}
                onChange={(e) => setJdUnit(e.target.value)}
              >
                <option value="mA/m2">mA/m²</option>
                <option value="mA/ft2">mA/ft²</option>
              </Select>
            </div>
            <div className="col-span-2">
              <Help>Jd converts to SI (mA/m²) internally.</Help>
            </div>
          </div>
        </div>

        {/* Block 4: Electrical */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div>
            <Label>Resistivity ρ (Ω·m) <span className="text-xs text-gray-400">(optional)</span></Label>
            <NumberInput
              name="rho_ohm_m"
              placeholder="optional"
              value={rho}
              onChange={(e) => setRho(e.target.value)}
            />
          </div>
          <div>
            <Label>Circuit Resistance R (Ω)</Label>
            <NumberInput
              name="R_ohm"
              placeholder="e.g. 2"
              value={R}
              onChange={(e) => setR(e.target.value)}
            />
          </div>
          <div>
            <Label>Native Potential E<sub>native</sub> (V)</Label>
            <NumberInput
              name="E_native_V"
              placeholder="e.g. -0.7"
              step="0.01"
              value={E_native}
              onChange={(e) => setEnative(e.target.value)}
            />
          </div>
          <div>
            <Label>Target Potential E<sub>target</sub> (V)</Label>
            <NumberInput
              name="E_target_V"
              placeholder="e.g. -0.95"
              step="0.01"
              value={E_target}
              onChange={(e) => setEtarget(e.target.value)}
            />
          </div>
        </div>
      </SectionCard>

      <SectionCard title="Anode Selection">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>Anode Type</Label>
            <Select
              name="anode_type"
              value={anodeType}
              onChange={(e) => setAnodeType(e.target.value)}
            >
              {ANODE_TYPES.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </Select>
          </div>

          {anodeType === "MMO" && (
            <>
              <div>
                <Label>Current rating per MMO anode I<sub>single</sub> (A)</Label>
                <NumberInput
                  name="I_single_A"
                  value={I_single}
                  onChange={(e) => setIsingle(e.target.value)}
                />
                <Help>Typical: soil 8 A, seawater 50 A</Help>
              </div>
              <div>
                <Label>Safety Factor SF</Label>
                <NumberInput
                  name="safety_factor"
                  step="0.01"
                  value={SF}
                  onChange={(e) => setSF(e.target.value)}
                />
              </div>
            </>
          )}

          {anodeType === "FeSiCr" && (
            <>
              <div>
                <Label>Anode capacity U (Ah/kg)</Label>
                <NumberInput
                  name="capacity_Ah_per_kg"
                  value={capacity}
                  onChange={(e) => setCapacity(e.target.value)}
                />
              </div>
              <div>
                <Label>Utilization η</Label>
                <NumberInput
                  name="eta"
                  step="0.01"
                  value={eta}
                  onChange={(e) => setEta(e.target.value)}
                />
              </div>
              <div>
                <Label>Unit anode weight W<sub>single</sub> (kg)</Label>
                <NumberInput
                  name="unit_weight_kg"
                  placeholder="e.g. 21"
                  value={unitWeight}
                  onChange={(e) => setUnitWeight(e.target.value)}
                />
              </div>
              <div>
                <Label>Safety Factor SF</Label>
                <NumberInput
                  name="safety_factor"
                  step="0.01"
                  value={SF}
                  onChange={(e) => setSF(e.target.value)}
                />
              </div>
            </>
          )}
        </div>
      </SectionCard>

      <div className="flex justify-start">
        <PrimaryButton type="submit" disabled={submitting}>
          Calculate Impressed Current
        </PrimaryButton>
      </div>
    </form>
  );
}
