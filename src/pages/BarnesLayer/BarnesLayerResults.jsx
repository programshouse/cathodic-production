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

export default function BarnesLayerResults({ results }) {
  if (!results) {
    return (
      <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  const { layers = [], inputs } = results || {};

  const toNumber = (v) => Number(v ?? 0);

  // total investigated depth
  const totalDepth = layers.reduce(
    (sum, l) => sum + toNumber(l.depth_m ?? l.L ?? 0),
    0
  );

  // build profile data: cumulative depth vs resistivity
  let cumDepth = 0;
  const profileData = layers.map((l) => {
    const d = toNumber(l.depth_m ?? l.L ?? 0);
    cumDepth += d;
    const rho =
      l.resistivity_ohm_m ??
      l.rho_ohm_m ??
      l.resistivity ??
      l.rho ??
      0;
    return {
      depth_m: cumDepth,
      rho_ohm_m: toNumber(rho),
      layer: l.layer ?? "",
    };
  });

  return (
    <div className="space-y-4">
      {/* Key summary card */}
      <ModuleCard title="Barnes Layer Results" subtitle="Layer depths, resistances, and resistivities">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultValue
            label="Number of Layers"
            value={layers.length}
            unit=""
            precision={0}
          />
          <ResultValue
            label="Total Depth Investigated"
            value={totalDepth}
            unit="m"
            precision={3}
          />
          {inputs && (
            <ResultValue
              label="Input Spacings"
              value={""}
              unit=""
              renderValue={() => (
                <span className="text-sm">
                  a₁={toNumber(inputs.a1)} m,&nbsp;
                  a₂={toNumber(inputs.a2)} m,&nbsp;
                  a₃={toNumber(inputs.a3)} m
                </span>
              )}
            />
          )}
        </div>

        {/* Summary table */}
        <div className="mt-6 overflow-x-auto">
          <table className="w-full text-sm border border-gray-300 dark:border-gray-700">
            <thead className="bg-gray-100 dark:bg-gray-800">
              <tr>
                <th className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-left">
                  Layer
                </th>
                <th className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-left">
                  Layer Depth (m)
                </th>
                <th className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-left">
                  Resistance (Ω)
                </th>
                <th className="px-3 py-2 border border-gray-300 dark:border-gray-700 text-left">
                  Resistivity (Ω·m)
                </th>
              </tr>
            </thead>
            <tbody>
              {layers.map((l, idx) => {
                const depth = toNumber(l.depth_m ?? l.L ?? 0);
                const R =
                  l.resistance_ohm ??
                  l.RL ??
                  l.R ??
                  0;
                const rho =
                  l.resistivity_ohm_m ??
                  l.rho_ohm_m ??
                  l.resistivity ??
                  l.rho ??
                  0;

                return (
                  <tr
                    key={idx}
                    className="border-t border-gray-300 dark:border-gray-700"
                  >
                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-700">
                      {l.layer ?? `Layer ${idx + 1}`}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-700">
                      {depth.toFixed(3)}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-700">
                      {toNumber(R).toFixed(3)}
                    </td>
                    <td className="px-3 py-2 border border-gray-300 dark:border-gray-700">
                      {toNumber(rho).toFixed(3)}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </ModuleCard>

      {/* Resistivity profile chart */}
      {profileData.length > 0 && (
        <ModuleCard
          title="Resistivity Profile"
          subtitle="Layer resistivity versus cumulative depth"
        >
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart
                data={profileData}
                margin={{ top: 8, right: 16, left: 0, bottom: 8 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="depth_m"
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Cumulative depth (m)",
                    position: "insideBottomRight",
                    offset: 0,
                  }}
                />
                <YAxis
                  tick={{ fontSize: 11 }}
                  label={{
                    value: "Resistivity (Ω·m)",
                    angle: -90,
                    position: "insideLeft",
                  }}
                />
                <Tooltip
                  formatter={(v) => [
                    `${Number(v).toFixed(3)} Ω·m`,
                    "ρ layer",
                  ]}
                  labelFormatter={(l) =>
                    `Depth ${Number(l).toFixed(3)} m`
                  }
                />
                <Line
                  type="monotone"
                  dataKey="rho_ohm_m"
                  stroke="#2563eb"
                  strokeWidth={2}
                  dot={{ r: 3 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModuleCard>
      )}
    </div>
  );
}
