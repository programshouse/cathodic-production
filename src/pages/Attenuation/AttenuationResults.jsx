// /src/pages/attenuation/AttenuationResults.jsx
import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
} from "recharts";

export default function AttenuationResults({ results }) {
  if (!results) {
    return (
      <ModuleCard
        title="Results"
        subtitle="Run a calculation to see the attenuation profile."
      >
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  const {
    AX_m2,
    A1_m2_per_m,
    ATOT_m2,
    IREQ_A,
    RS_ohm_per_m,
    RL_ohm,
    alpha_1_per_m,
    alpha,
    deltaE_DP_V,
    deltaE_calc_V,
    Lx_m,
    PotMIN_V,
    data = [],
  } = results;

  const Vend = data && data.length ? data[data.length - 1].V : null;

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Calculation Summary"
        subtitle="Values follow the Excel sheet: AX, A1, ATOT, IREQ, RS, RL, α and ΔE."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultValue
            label="Pipe Steel Cross-sectional Area AX"
            formula="AX = π(D/2)² − π(D/2 − t)²"
            value={AX_m2}
            unit="m²"
            precision={6}
          />
          <ResultValue
            label="Unit Surface Area A₁"
            formula="A₁ = πD"
            value={A1_m2_per_m}
            unit="m²/m"
            precision={6}
          />
          <ResultValue
            label="Total Pipe Surface Area ATOT"
            formula="ATOT = A₁ × Lx"
            value={ATOT_m2}
            unit="m²"
            precision={3}
          />
          <ResultValue
            label="Current Required IREQ"
            formula="IREQ = ATOT × cd"
            value={IREQ_A}
            unit="A"
            precision={4}
          />
          <ResultValue
            label="Unit Pipe Linear Resistance RS"
            formula="RS = ρsteel / AX"
            value={RS_ohm_per_m}
            unit="Ω/m"
            precision={8}
          />
          <ResultValue
            label="Coating Leakage Resistance RL"
            formula="RL = ρ / (A₁ × g)"
            value={RL_ohm}
            unit="Ω"
            precision={2}
          />
          <ResultValue
            label="Attenuation Constant α"
            formula="α = √(RS / RL)"
            value={alpha_1_per_m ?? alpha}
            unit="1/m"
            precision={8}
          />
          <ResultValue
            label="Potential at End V(Lx)"
            formula="E(Lx) = PotNAT + (PotDP − PotNAT)e^(−αLx)"
            value={Vend}
            unit="V"
            precision={3}
          />
          <ResultValue
            label="ΔE at Drain Point"
            formula="ΔE_DP = PotDP − PotNAT"
            value={deltaE_DP_V}
            unit="V"
            precision={3}
          />
          <ResultValue
            label="ΔE at X (calculated)"
            formula="ΔE_calc = E(Lx) − PotNAT"
            value={deltaE_calc_V}
            unit="V"
            precision={3}
          />
        </div>
        {Number.isFinite(PotMIN_V) && (
          <p className="mt-3 text-xs text-gray-600 dark:text-gray-400">
            Minimum design potential PotMIN ={" "}
            <span className="font-semibold">{PotMIN_V.toFixed(3)} V</span>.
            Profile can be checked against this limit.
          </p>
        )}
      </ModuleCard>

      <ModuleCard
        title="Attenuation & Pipeline Potential Profile"
        subtitle="E(x) = PotNAT + (PotDP − PotNAT) · e^(−αx) along distance from the drain point."
      >
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart
              data={data}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x_m"
                label={{
                  value: "Distance x (m)",
                  position: "insideBottomRight",
                  offset: -2,
                }}
              />
              <YAxis
                label={{
                  value: "Potential E(x) (V)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              <Tooltip
                formatter={(v) => `${Number(v).toFixed(3)} V`}
                labelFormatter={(l) => `x = ${Number(l).toFixed(1)} m`}
              />
              <Line
                type="monotone"
                dataKey="V"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
