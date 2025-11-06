import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line } from "recharts";

export default function AttenuationResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see the attenuation profile.">
      <div className="text-sm text-gray-500">No results yet.</div>
    </ModuleCard>
  );

  const { alpha, data } = results;
  const Vend = data && data.length ? data[data.length - 1].V : null;

  return (
    <div className="space-y-4">
      <ModuleCard title="Key Results">
        <div className="space-y-4">
          <ResultValue
            label="Attenuation Constant"
            formula="α = √(Rs/RL)"
            value={alpha}
            unit={"1/m"}
            precision={5}
            csvData={[["metric","value","unit"],["alpha", alpha, "1/m"]]}
            csvFilename={`attenuation-alpha.csv`}
          />
          <ResultValue
            label="Potential at End"
            formula="V(L)"
            value={Vend}
            unit={"V"}
            precision={3}
            csvData={[["metric","value","unit"],["V(L)", Vend, "V"]]}
            csvFilename={`attenuation-vend.csv`}
          />
        </div>
      </ModuleCard>

      <ModuleCard title="Potential Attenuation Along Pipeline" subtitle="V(x) along distance from drain point">
        <div className="h-64">
          <ResponsiveContainer>
            <LineChart data={data} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="x_m" label={{ value: "Distance x (m)", position: "insideBottomRight", offset: -2 }} />
              <YAxis label={{ value: "Potential V (V)", angle: -90, position: "insideLeft" }} />
              <Tooltip formatter={(v)=>`${Number(v).toFixed(3)} V`} labelFormatter={(l)=>`x=${Number(l).toFixed(1)} m`} />
              <Line type="monotone" dataKey="V" stroke="#2563eb" strokeWidth={2} dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}


