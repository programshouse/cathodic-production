import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from "recharts";

export default function ResistorSizingResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see rectifier ratings.">
      <div className="text-sm text-gray-500">No results yet.</div>
    </ModuleCard>
  );

  const { V_required = 0, V_driving = 0, I_rectifier = 0, V_rectifier = 0, P_rectifier = 0 } = results || {};
  const allRows = [
    { Label: "Driving Voltage", Value: Number(V_driving)||0, Unit: "V" },
    { Label: "Required Voltage", Value: Number(V_required)||0, Unit: "V" },
    { Label: "Rectifier Current Rating", Value: Number(I_rectifier)||0, Unit: "A" },
    { Label: "Rectifier Voltage Rating", Value: Number(V_rectifier)||0, Unit: "V" },
    { Label: "Required Power", Value: Number(P_rectifier)||0, Unit: "W" },
  ];
  const filename = "rectifier_sizing_results.csv";
  const powerData = [
    { name: "Power", Power: Number(P_rectifier) || 0 },
  ];

  const formula = "Vreq = I·R + |Eprotect − Enative|; Irated = I·SF; Vrated = Vreq·SF; P = Vreq·I";

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Results"
        subtitle={<span className="inline-flex items-center gap-2"><span className="text-xs uppercase tracking-wide text-gray-500">Formula</span><span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">{formula}</span></span>}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <ResultValue label="Driving Voltage" value={Number(V_driving)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Required Voltage" value={Number(V_required)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Rectifier Current Rating" value={Number(I_rectifier)||0} unit="A" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Rectifier Voltage Rating" value={Number(V_rectifier)||0} unit="V" precision={3} csvData={allRows} csvFilename={filename} />
          <ResultValue label="Required Power" value={Number(P_rectifier)||0} unit="W" precision={3} csvData={allRows} csvFilename={filename} />
        </div>
      </ModuleCard>

      <ModuleCard title="Power" subtitle="Rectifier requirement">
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={powerData} margin={{ top: 8, right: 16, left: 0, bottom: 8 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis tickFormatter={(v)=>`${v}`} />
              <Tooltip formatter={(v)=>[`${Number(v).toFixed(3)} W`,`Power`]} />
              <Legend />
              <Line type="monotone" dataKey="Power" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
