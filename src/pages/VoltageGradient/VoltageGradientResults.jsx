import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import {
  ResponsiveContainer,
  LineChart,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid,
  Line,
  Legend,
  ReferenceLine,
} from "recharts";

export default function VoltageGradientResults({ results }) {
  if (!results) {
    return (
      <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  const {
    Vr_max = 0,
    Vr_at_Xr = null,
    Vr_perA_at_Xr = null,
    X_r_m = null,
    data = [],
    inputs,
  } = results || {};

  const I_A = inputs?.I_A ?? null;
  const L_m = inputs?.L_m ?? null;
  const rho_ohm_m = inputs?.rho_ohm_m ?? null;

  const chartData = Array.isArray(data) ? data : [];

  return (
    <div className="space-y-4">
      {/* Key numerical results */}
      <ModuleCard
        title="Key Results"
        subtitle="Voltage rise in earth around the vertical anode"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Input parameters</div>
            <div className="mt-1 space-y-0.5">
              <div>
                I = <span className="font-semibold">{I_A ?? "—"}</span> A
              </div>
              <div>
                L = <span className="font-semibold">{L_m ?? "—"}</span> m
              </div>
              <div>
                ρ ={" "}
                <span className="font-semibold">
                  {rho_ohm_m ?? "—"} Ω·m
                </span>
              </div>
              {X_r_m != null && X_r_m !== "" && (
                <div>
                  Xᵣ ={" "}
                  <span className="font-semibold">{X_r_m}</span> m (point of
                  interest)
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Voltage rise results</div>
            <div className="mt-1 space-y-0.5">
              <div>
                Maximum voltage rise near anode (within 0.1–100 m):{" "}
                <span className="font-semibold">
                  {Vr_max.toFixed(3)} V
                </span>
              </div>
              {X_r_m != null &&
                X_r_m !== "" &&
                Vr_at_Xr != null &&
                Vr_perA_at_Xr != null && (
                  <>
                    <div>
                      Vᵣ at Xᵣ = {X_r_m} m:{" "}
                      <span className="font-semibold">
                        {Vr_at_Xr.toFixed(3)} V
                      </span>
                    </div>
                    <div>
                      Vᵣ / I at Xᵣ = {X_r_m} m:{" "}
                      <span className="font-semibold">
                        {Vr_perA_at_Xr.toFixed(4)} V/A
                      </span>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </ModuleCard>

      {/* Chart: voltage rise per ampere vs distance (log scale) */}
      <ModuleCard
        title="Step 4: Voltage Rise Profile"
        subtitle="Voltage rise per ampere (V/A) versus distance from anode (log scale)"
      >
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart
              data={chartData}
              margin={{ top: 10, right: 20, left: 0, bottom: 0 }}
            >
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x_m"
                type="number"
                scale="log"
                domain={[0.1, 100]}
                tickFormatter={(v) => v.toFixed(0)}
                label={{
                  value: "Distance X (m)",
                  position: "insideBottomRight",
                  offset: -2,
                }}
              />
              <YAxis
                label={{
                  value: "Voltage rise per ampere Vᵣ / I (V/A)",
                  angle: -90,
                  position: "insideLeft",
                }}
              />
              {X_r_m != null && X_r_m !== "" && (
                <ReferenceLine
                  x={Number(X_r_m)}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={`Xᵣ = ${Number(X_r_m).toFixed(1)} m`}
                />
              )}
              <Tooltip
                formatter={(value, name, entry) => {
                  if (entry?.dataKey === "Vr_perA") {
                    return [`${Number(value ?? 0).toFixed(4)} V/A`, "Vᵣ / I"];
                  }
                  if (entry?.dataKey === "Vr") {
                    return [`${Number(value ?? 0).toFixed(3)} V`, "Vᵣ"];
                  }
                  return value;
                }}
                labelFormatter={(l) => `X = ${Number(l ?? 0).toFixed(2)} m`}
              />
              <Legend />
              <Line
                type="monotone"
                dataKey="Vr_perA"
                name="Voltage rise per ampere Vᵣ / I"
                stroke="#2563eb"
                strokeWidth={2}
                dot={false}
                isAnimationActive={false}
              />
              <Line
                type="monotone"
                dataKey="Vr"
                name="Voltage rise Vᵣ (V)"
                stroke="#a855f7"
                strokeWidth={1}
                dot={false}
                isAnimationActive={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-gray-500">
          The blue curve is Vᵣ / I (V per ampere) as a function of distance.
          Multiply by the actual current to read voltage directly from the
          chart. The purple curve shows the absolute voltage Vᵣ for the entered
          current I.
        </p>
      </ModuleCard>
    </div>
  );
}
