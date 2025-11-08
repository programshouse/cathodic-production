import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, ComposedChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function TankMMOResults({ results }) {
  if (!results) {
    return (
      <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  const { C_m = 0, Nribbons = 0, Lribbon_total_m = 0, L_ti_bar_m = 0, N_feeders = 0 } = results || {};
  const formula = "C = π·D;  Rings: L_total = N_rings · C;  Longitudinal: L_total = N_ribbons · TankLength;  N_feeders = ceil(I_total/I_connmax);  L_Ti = Bars · ConnectionLength";

  const chartData = [
    { name: "Circumference", m: Number(C_m) || 0 },
    { name: "Ribbon Total", m: Number(Lribbon_total_m) || 0 },
    { name: "Ti Bar Length", m: Number(L_ti_bar_m) || 0 },
  ];

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Results"
        subtitle={<span className="inline-flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-gray-500">Formula</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">{formula}</span></span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <ResultValue label="Tank Circumference" value={Number(C_m)||0} unit="m" precision={3} />
          <ResultValue label="Number of Ribbons" value={Number(Nribbons)||0} unit="-" precision={0} />
          <ResultValue label="Total Ribbon Length" value={Number(Lribbon_total_m)||0} unit="m" precision={2} />
          <ResultValue label="Ti Bar Length" value={Number(L_ti_bar_m)||0} unit="m" precision={2} />
          <ResultValue label="Feeder Connectors" value={Number(N_feeders)||0} unit="-" precision={0} />
        </div>
      </ModuleCard>

      <ModuleCard title="Visual Representation" subtitle="Summary bars">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={chartData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} label={{ value: "m", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v) => `${Number(v).toFixed(2)} m`} />
              <Legend />
              <Bar dataKey="m" name="Length (m)" fill="#3b82f6" radius={[6,6,0,0]} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
