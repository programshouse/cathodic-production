// /src/pages/resistor-sizing/ResistorSizingResults.jsx
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
  ReferenceLine,
} from "recharts";

export default function ResistorSizingResults({ results }) {
  if (!results) {
    return (
      <ModuleCard
        title="Results"
        subtitle="Run a calculation to see resistor sizing."
      >
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  const {
    R_nominal = 0,
    R_min = 0,
    R_max = 0,
    P_required = 0,
    P_recommended = 0,
    data = [],
    inputs,
  } = results || {};

  const toNumber = (v) => Number(v ?? 0);

  const I = toNumber(inputs?.I_design_A);
  const V = toNumber(inputs?.V_drop_V);
  const SF = toNumber(inputs?.safety_factor);

  return (
    <div className="space-y-4">
      {/* Key Numbers */}
      <ModuleCard
        title="Variable Resistor Sizing Results"
        subtitle="Nominal resistance, adjustable range, and power rating."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
          {/* Nominal R */}
          <ResultValue
            label="Nominal Resistance"
            formula="R = V / I"
            value={R_nominal}
            unit="Ω"
            precision={3}
          />

          {/* Recommended Adjustable Range – text exactly like HTML tool */}
          <ResultValue
            label="Recommended Adjustable Range"
            formula="0 to 2 × R"
            value={R_max}
            unit="Ω"
            precision={3}
            renderValue={() => (
              <span className="text-sm">
                Recommended Adjustable Range: 0 to{" "}
                {toNumber(R_max).toFixed(3)} Ω
              </span>
            )}
          />

          {/* Required power */}
          <ResultValue
            label="Required Power"
            formula="P = I² × R"
            value={P_required}
            unit="W"
            precision={3}
          />

          {/* Recommended rating */}
          <ResultValue
            label="Recommended Rating"
            formula="P × SF"
            value={P_recommended}
            unit="W"
            precision={3}
          />
        </div>

        {/* Inputs echo */}
        <div className="mt-4 text-xs text-gray-600 dark:text-gray-300">
          I = {I || "—"} A,&nbsp; V = {V || "—"} V,&nbsp; SF ={" "}
          {SF || "—"}
        </div>
      </ModuleCard>

      {/* Chart: Power vs Resistance */}
      {Array.isArray(data) && data.length > 0 && (
        <ModuleCard
          title="Power Dissipation Profile"
          subtitle="P = I² × R across the adjustable resistance range (0–2R)."
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={data}
                margin={{ top: 10, right: 20, left: 0, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="R_ohm"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Resistance (Ω)",
                    position: "insideBottomRight",
                    offset: 0,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Power (W)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                {R_nominal > 0 && (
                  <ReferenceLine
                    x={R_nominal}
                    stroke="#ef4444"
                    strokeDasharray="4 4"
                    label={`R = ${R_nominal.toFixed(3)} Ω`}
                  />
                )}
                <Tooltip
                  formatter={(v, n, e) => {
                    if (e?.dataKey === "P_W") {
                      return [`${Number(v).toFixed(3)} W`, "Power"];
                    }
                    return v;
                  }}
                  labelFormatter={(l) =>
                    `R = ${Number(l).toFixed(3)} Ω`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="P_W"
                  name="Power P (W)"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          <p className="mt-2 text-xs text-gray-500">
            The curve shows how power dissipation increases linearly with
            resistance for the fixed design current I. The dashed line
            marks the nominal resistance R.
          </p>
        </ModuleCard>
      )}
    </div>
  );
}
