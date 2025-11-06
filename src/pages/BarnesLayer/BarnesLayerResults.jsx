import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line } from "recharts";

export default function BarnesLayerResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
      <div className="text-sm text-gray-500">No results yet.</div>
    </ModuleCard>
  );

  const { rho_top_ohm_m, rho_bottom_ohm_m, boundary_depth_m, rho_app_ohm_m, table } = results || {};

  // CSV: include key results + table rows
  const csvRows = [
    { Label: "Top Layer Resistivity", Value: Number(rho_top_ohm_m)||0, Unit: "Ω·m" },
    { Label: "Bottom Layer Resistivity", Value: Number(rho_bottom_ohm_m)||0, Unit: "Ω·m" },
    { Label: "Layer Boundary Depth", Value: Number(boundary_depth_m)||0, Unit: "m" },
    { Label: "Apparent Resistivity", Value: Number(rho_app_ohm_m)||0, Unit: "Ω·m" },
    ...((table || []).map(r => ({
      Spacing_m: Number(r.spacing_m)||0,
      Measured_R_ohm: Number(r.R_meas_ohm)||0,
      Apparent_rho_ohm_m: Number(r.rho_app_ohm_m)||0,
      Depth_m: Number(r.depth_m)||0,
    })))
  ];

  const filename = "barnes_layer_results.csv";

  return (
    <div className="space-y-4">
      <ModuleCard title="Calculation Results">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultValue label="Top Layer Resistivity" value={Number(rho_top_ohm_m)||0} unit="Ω·m" precision={3} csvData={csvRows} csvFilename={filename} />
          <ResultValue label="Bottom Layer Resistivity" value={Number(rho_bottom_ohm_m)||0} unit="Ω·m" precision={3} csvData={csvRows} csvFilename={filename} />
          <ResultValue label="Layer Boundary Depth" value={Number(boundary_depth_m)||0} unit="m" precision={3} csvData={csvRows} csvFilename={filename} />
          <ResultValue label="Apparent Resistivity" value={Number(rho_app_ohm_m)||0} unit="Ω·m" precision={3} csvData={csvRows} csvFilename={filename} />
        </div>
      </ModuleCard>

      <ModuleCard title="Apparent Resistivity vs Electrode Spacing" subtitle="Wenner array">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={table || []} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="spacing_m" tick={{ fontSize: 11 }} />
              <YAxis tick={{ fontSize: 11 }} tickFormatter={(v)=>`${v}`} />
              <Tooltip formatter={(v)=>[`${Number(v).toFixed(3)} Ω·m`,`ρa`]} labelFormatter={(l)=>`Spacing ${l} m`} />
              <Line type="monotone" dataKey="rho_app_ohm_m" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
