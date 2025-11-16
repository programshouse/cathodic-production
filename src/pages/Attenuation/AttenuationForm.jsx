// /src/pages/attenuation/AttenuationForm.jsx
import React, { useState } from "react";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, NumberInput } from "../../components/ui/FormControls";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function AttenuationForm({
  onSubmit,
  submitting,
  onReset,
  initialValues = {},
}) {
  // Core variables from spec
  const [D, setD] = useState(initialValues.D ?? "");
  const [t, setT] = useState(initialValues.t ?? "");
  const [Lx, setLx] = useState(initialValues.Lx ?? "");
  const [cd, setCd] = useState(initialValues.cd ?? "");
  const [rhoSteel, setRhoSteel] = useState(
    initialValues.rhoSteel ?? 1.6e-7
  );
  const [g, setG] = useState(initialValues.g ?? "");
  const [rhoSoil, setRhoSoil] = useState(initialValues.rhoSoil ?? "");
  const [potNat, setPotNat] = useState(initialValues.PotNAT ?? "");
  const [potDp, setPotDp] = useState(initialValues.PotDP ?? "");
  const [potMin, setPotMin] = useState(initialValues.PotMIN ?? "");
  const [dx, setDx] = useState(initialValues.dx ?? 2); // 0,2,4,...,Lx

  const handleReset = () => {
    setD("");
    setT("");
    setLx("");
    setCd("");
    setRhoSteel(1.6e-7);
    setG("");
    setRhoSoil("");
    setPotNat("");
    setPotDp("");
    setPotMin("");
    setDx(2);
    onReset?.();
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const isNumeric = (val) => {
      if (val === "" || val === null || val === undefined) return false;
      const n = Number(val);
      return Number.isFinite(n);
    };

    // Required numeric fields (negatives allowed for potentials)
    const numericFields = [
      ["Pipe Diameter D", D],
      ["Wall Thickness t", t],
      ["Pipe Protection Length Lx", Lx],
      ["Current Density cd", cd],
      ["Steel Resistivity ρsteel", rhoSteel],
      ["Coating Conductivity g", g],
      ["Soil Resistivity ρ", rhoSoil],
      ["Interval Δx", dx],
      ["Native Potential PotNAT", potNat],
      ["Drain Point Potential PotDP", potDp],
    ];

    const invalidNumericAll = numericFields.filter(([, v]) => !isNumeric(v));
    if (invalidNumericAll.length > 0) {
      const names = invalidNumericAll.map(([name]) => `• ${name}`).join("\n");
      alert(
        "Please fill all required fields with valid numbers (negatives allowed):\n\n" +
          names
      );
      return;
    }

    onSubmit?.(e);
  };

  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">
                Pipeline Attenuation Calculation
              </h2>
              <p className="text-brand-50/90 text-sm md:text-base mt-1">
                Uses AX, A₁, ATOT, IREQ, RS, RL, α, and{" "}
                <span className="font-semibold">
                  E(x) = PotNAT + (PotDP − PotNAT)·e<sup>−αx</sup>
                </span>{" "}
                to build the potential profile.
              </p>
            </div>
            <ResetPill onClick={handleReset} />
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Header />

      <SectionCard
        title="Input Variables"
        subtitle="All inputs are in SI units as in the design equations."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* D, t, Lx */}
          <div>
            <Label required>
              Pipe Diameter D <span className="text-xs">(m)</span>
            </Label>
            <NumberInput
              name="D"
              value={D}
              onChange={(e) => setD(e.target.value)}
              placeholder="e.g. 0.254"
              inputMode="decimal"
              step="any"
              min="0"
              required
            />
            <Help>Outside diameter of the pipeline.</Help>
          </div>

          <div>
            <Label required>
              Wall Thickness t <span className="text-xs">(m)</span>
            </Label>
            <NumberInput
              name="t"
              value={t}
              onChange={(e) => setT(e.target.value)}
              placeholder="e.g. 0.016"
              inputMode="decimal"
              step="any"
              min="0"
              required
            />
            <Help>Steel wall thickness.</Help>
          </div>

          <div>
            <Label required>
              Pipe Protection Length L<sub>x</sub>{" "}
              <span className="text-xs">(m)</span>
            </Label>
            <NumberInput
              name="Lx"
              value={Lx}
              onChange={(e) => setLx(e.target.value)}
              placeholder="e.g. 16000"
              inputMode="decimal"
              step="any"
              min="0"
              required
            />
            <Help>Length of pipe considered for attenuation.</Help>
          </div>

          {/* cd, rhoSteel */}
          <div>
            <Label required>
              Current Density cd <span className="text-xs">(A/m²)</span>
            </Label>
            <NumberInput
              name="cd"
              value={cd}
              onChange={(e) => setCd(e.target.value)}
              placeholder="e.g. 0.00013"
              inputMode="decimal"
              step="0.00001"
              min="0"
              required
            />
            <Help>Design cathodic protection current density.</Help>
          </div>

          <div>
            <Label required>
              Steel Resistivity ρ<sub>steel</sub>{" "}
              <span className="text-xs">(Ω·m)</span>
            </Label>
            <NumberInput
              name="rhoSteel"
              value={rhoSteel}
              onChange={(e) => setRhoSteel(e.target.value)}
              placeholder="e.g. 1.8e-7"
              inputMode="decimal"
              step="1e-8"
              min="0"
              required
            />
            <Help>Typical value ≈ 1.6×10⁻⁷ to 1.8×10⁻⁷ Ω·m.</Help>
          </div>

          {/* g, ρ soil */}
          <div>
            <Label required>
              Coating Conductivity g <span className="text-xs">(S/m)</span>
            </Label>
            <NumberInput
              name="g"
              value={g}
              onChange={(e) => setG(e.target.value)}
              placeholder="e.g. 0.00030"
              inputMode="decimal"
              step="1e-5"
              min="0"
              required
            />
            <Help>
              Inverse of coating resistivity; higher g = more leakage.
            </Help>
          </div>

          <div>
            <Label required>
              Soil Resistivity ρ <span className="text-xs">(Ω·m)</span>
            </Label>
            <NumberInput
              name="rhoSoil"
              value={rhoSoil}
              onChange={(e) => setRhoSoil(e.target.value)}
              placeholder="e.g. 5"
              inputMode="decimal"
              step="any"
              min="0"
              required
            />
            <Help>Bulk resistivity of the surrounding soil.</Help>
          </div>

          {/* Potentials */}
          <div>
            <Label required>
              Native Potential PotNAT <span className="text-xs">(V)</span>
            </Label>
            <NumberInput
              name="PotNAT"
              value={potNat}
              onChange={(e) => setPotNat(e.target.value)}
              placeholder="e.g. -0.55"
              inputMode="decimal"
              step="0.01"
              required
            />
            <Help>Unprotected pipe potential.</Help>
          </div>

          <div>
            <Label required>
              Drain Point Potential PotDP{" "}
              <span className="text-xs">(V)</span>
            </Label>
            <NumberInput
              name="PotDP"
              value={potDp}
              onChange={(e) => setPotDp(e.target.value)}
              placeholder="e.g. -1.60"
              inputMode="decimal"
              step="0.01"
              required
            />
            <Help>Potential at the drainage point / rectifier.</Help>
          </div>

          <div>
            <Label>
              Minimum Allowed Potential PotMIN{" "}
              <span className="text-xs">(V)</span>
            </Label>
            <NumberInput
              name="PotMIN"
              value={potMin}
              onChange={(e) => setPotMin(e.target.value)}
              placeholder="e.g. -1.00"
              inputMode="decimal"
              step="0.01"
            />
            <Help>
              Optional design limit; profile can be checked against this.
            </Help>
          </div>

          {/* Interval for positions 0, 2, 4, …, Lx */}
          <div>
            <Label required>
              Interval Δx for results <span className="text-xs">(m)</span>
            </Label>
            <NumberInput
              name="dx"
              value={dx}
              onChange={(e) => setDx(e.target.value)}
              placeholder="e.g. 2"
              inputMode="decimal"
              step="any"
              min="0.1"
              required
            />
            <Help>
              Values of ATOT, IREQ, RS, RL, and E(x) will be evaluated at 0,
              Δx, 2Δx, …, Lx.
            </Help>
          </div>
        </div>
      </SectionCard>

      {/* Hidden mirror inputs for AttenuationPage (spec mode) */}
      <input type="hidden" name="mode" value="spec" />
      <input type="hidden" name="OD_value" value={D} />
      <input type="hidden" name="t_value" value={t} />
      <input type="hidden" name="L_value" value={Lx} />
      <input type="hidden" name="cd_A_per_m2" value={cd} />
      <input type="hidden" name="rho_steel_ohm_m" value={rhoSteel} />
      <input type="hidden" name="g_S_per_m" value={g} />
      <input type="hidden" name="p_ohm_m" value={rhoSoil} />
      <input type="hidden" name="PotNAT_V" value={potNat} />
      <input type="hidden" name="PotDP_V" value={potDp} />
      {/* points: approximate from Lx & dx */}
      <input
        type="hidden"
        name="points"
        value={
          Math.max(
            2,
            Number.isFinite(Number(Lx)) &&
              Number.isFinite(Number(dx)) &&
              Number(dx) > 0
              ? Math.floor(Number(Lx) / Number(dx)) + 1
              : 50
          )
        }
      />

      <div className="flex justify-start">
        <PrimaryButton type="submit" disabled={!!submitting}>
          {submitting ? "Calculating..." : "Calculate Attenuation Profile"}
        </PrimaryButton>
      </div>
    </form>
  );
}
