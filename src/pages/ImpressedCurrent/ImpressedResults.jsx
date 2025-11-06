import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResultValue from "../../components/ui/ResultValue";
import { ResponsiveContainer, LineChart, XAxis, YAxis, Tooltip, CartesianGrid, Line, ReferenceLine } from "recharts";

export default function ImpressedResults({ results }) {
  if (!results) return (
    <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
      <div className="text-sm text-gray-500">No results yet.</div>
    </ModuleCard>
  );

  const { I_A, I_mA, V_system, P_W, E_annual_kWh, anode, series, inputs } = results;

  const allRows = [
    { Label: "Required Current", Value_A: Number(I_A)||0, Unit_A: "A", Value_mA: Number(I_mA)||0, Unit_mA: "mA" },
    { Label: "System Voltage", Value: Number(V_system)||0, Unit: "V" },
    { Label: "Power", Value_W: Number(P_W)||0, Unit_W: "W", Value_kW: Number(P_W)/1000 || 0, Unit_kW: "kW" },
    { Label: "Annual Energy", Value: Number(E_annual_kWh)||0, Unit: "kWh/yr" },
  ];

  const toCSV = (rows) => {
    if (!rows || !rows.length) return "";
    const headers = Object.keys(rows[0]);
    const head = headers.join(",");
    const body = rows.map((row) => headers.map((h) => `"${String(row[h] ?? "").replaceAll('"', '""')}"`).join(",")).join("\n");
    return `${head}\n${body}`;
  };
  const downloadCSV = () => {
    const csv = toCSV(allRows);
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "impressed_current_results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-4">
      <ModuleCard title="Key Results" actions={<button type="button" onClick={downloadCSV} className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">CSV</button>}>
        <div className="space-y-4">
          <ResultValue
            label="Required Current"
            formula="I = A × Jd × f_c"
            value={I_A}
            unit={"A"}
            unitOptions={[{ value: "A", label: "A" }, { value: "mA", label: "mA" }]}
            onUnitChange={() => { /* display only */ }}
            precision={3}
          />
          <ResultValue
            label="System Voltage"
            formula="V = I×R + (E_target − E_native)"
            value={V_system}
            unit={"V"}
            unitOptions={[{ value: "V", label: "V" }, { value: "mV", label: "mV" }]}
            onUnitChange={()=>{}}
            precision={3}
          />
          <ResultValue
            label="Power"
            formula="P = V × I"
            value={P_W}
            unit={"W"}
            unitOptions={[{ value: "W", label: "W" }, { value: "kW", label: "kW" }]}
            onUnitChange={()=>{}}
            precision={2}
          />
          <ResultValue
            label="Annual Energy"
            formula="E_annual = P × 8760 / 1000"
            value={E_annual_kWh}
            unit={"kWh/yr"}
            unitOptions={[{ value: "kWh/yr", label: "kWh/yr" }]}
            onUnitChange={()=>{}}
            precision={1}
          />
        </div>
      </ModuleCard>
      <ModuleCard title="Electrical Summary" subtitle="Required current, voltage, power, and annual energy.">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div><div className="text-gray-500">Current</div><div className="font-semibold">{I_A.toFixed(3)} A ({I_mA.toFixed(0)} mA)</div></div>
          <div><div className="text-gray-500">Voltage</div><div className="font-semibold">{V_system.toFixed(3)} V</div></div>
          <div><div className="text-gray-500">Power</div><div className="font-semibold">{P_W.toFixed(2)} W</div></div>
          <div><div className="text-gray-500">Annual Energy</div><div className="font-semibold">{E_annual_kWh.toFixed(1)} kWh/yr</div></div>
        </div>
      </ModuleCard>

      {inputs?.anode_type === "FeSiCr" && anode && (
        <ModuleCard title="FeSiCr Anode Requirement" subtitle="Total mass and quantity vs design life.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm mb-4">
            <div><div className="text-gray-500">Required Mass</div><div className="font-semibold">{anode.W_required.toFixed(1)} kg</div></div>
            <div><div className="text-gray-500">Unit Mass</div><div className="font-semibold">{anode.W_single} kg</div></div>
            <div><div className="text-gray-500">Safety Factor</div><div className="font-semibold">{inputs.safety_factor}</div></div>
            <div><div className="text-gray-500">Quantity</div><div className="font-semibold">{Math.ceil(anode.N)}</div></div>
          </div>
          <div className="h-64">
            <ResponsiveContainer>
              <LineChart data={series || []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="year" label={{ value: "Year", position: "insideBottomRight", offset: -2 }} />
                <YAxis label={{ value: "Required Weight (kg)", angle: -90, position: "insideLeft" }} />
                <Tooltip formatter={(v)=>`${Number(v).toFixed(1)} kg`} />
                <Line type="monotone" dataKey="weight_kg" stroke="#2563eb" strokeWidth={2} dot={false} />
                <ReferenceLine x={inputs.design_life_years} stroke="#ef4444" strokeDasharray="4 4" label={`t=${inputs.design_life_years}y`} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ModuleCard>
      )}

      {inputs?.anode_type === "MMO" && anode && (
        <ModuleCard title="MMO Anode Requirement" subtitle="Quantity based on current rating per anode.">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div><div className="text-gray-500">Current per Anode</div><div className="font-semibold">{anode.I_single_A} A</div></div>
            <div><div className="text-gray-500">Safety Factor</div><div className="font-semibold">{inputs.safety_factor}</div></div>
            <div><div className="text-gray-500">Total Current</div><div className="font-semibold">{I_A.toFixed(3)} A</div></div>
            <div><div className="text-gray-500">Quantity</div><div className="font-semibold">{Math.ceil(anode.N)}</div></div>
          </div>
        </ModuleCard>
      )}
    </div>
  );
}
