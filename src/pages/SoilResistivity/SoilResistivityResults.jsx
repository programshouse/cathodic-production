import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line, Legend } from "recharts";

export default function SoilResistivityResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see soil resistivity.">
      <div className="text-sm text-gray-500">No results yet.</div>
    </ModuleCard>
  );

  const { rho_ohm_m = 0, unitRho = "ohm-m", inputs = {}, data = [], seriesLabel = "spacing (m)" } = results || {};

  const methodLabel = inputs?.method || "wenner";
  const formula = methodLabel === "schlumberger"
    ? "ρ = π·R · (L²/l − l)"
    : "ρ = 2·π·a·R";

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Result"
        subtitle={<span className="inline-flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-gray-500">Formula</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">{formula}</span></span>}
      >
        <ResultValue
          label="Soil Resistivity"
          formula="ρ"
          value={Number(rho_ohm_m)||0}
          unit={unitRho}
          precision={3}
        />
      </ModuleCard>

      <ModuleCard title="Profile" subtitle="Apparent resistivity versus spacing">
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={Array.isArray(data) ? data : []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x"
                type="number"
                label={{ value: seriesLabel, position: "insideBottomRight", offset: -2 }}
              />
              <YAxis label={{ value: "ρ (Ω·m)", angle: -90, position: "insideLeft" }} />
              <Tooltip
                formatter={(v)=> `${Number(v ?? 0).toFixed(3)} Ω·m`}
                labelFormatter={(l)=> `${seriesLabel.replace(/\s*\(.*\)$/, '')} = ${Number(l ?? 0).toFixed(2)}`}
              />
              <Legend />
              <Line type="monotone" dataKey="rho" name="ρ (Ω·m)" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
