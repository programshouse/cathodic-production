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

  return (
    <div className="space-y-4">
      <ModuleCard title="Key Results">
        <div className="space-y-4">
          <ResultValue
            label="Required Current"
            formula="I = A × Jd × f_c"
            value={I_A}
            unit={"A"}
            unitOptions={[{ value: "A", label: "A" }, { value: "mA", label: "mA" }]}
            onUnitChange={() => { /* display only */ }}
            precision={3}
            csvData={[{ metric: 'Required Current', value: I_A, unit: 'A', value_mA: I_mA, unit_mA: 'mA' }]}
            csvFilename={`impressed-current-required-current.csv`}
          />
          <ResultValue
            label="System Voltage"
            formula="V = I×R + (E_target − E_native)"
            value={V_system}
            unit={"V"}
            unitOptions={[{ value: "V", label: "V" }, { value: "mV", label: "mV" }]}
            onUnitChange={()=>{}}
            precision={3}
            csvData={[{ metric: 'System Voltage', value: V_system, unit: 'V' }]}
            csvFilename={`impressed-current-voltage.csv`}
          />
          <ResultValue
            label="Power"
            formula="P = V × I"
            value={P_W}
            unit={"W"}
            unitOptions={[{ value: "W", label: "W" }, { value: "kW", label: "kW" }]}
            onUnitChange={()=>{}}
            precision={2}
            csvData={[{ metric: 'Power', value_W: P_W, value_kW: P_W/1000, unit_W: 'W', unit_kW: 'kW' }]}
            csvFilename={`impressed-current-power.csv`}
          />
          <ResultValue
            label="Annual Energy"
            formula="E_annual = P × 8760 / 1000"
            value={E_annual_kWh}
            unit={"kWh/yr"}
            unitOptions={[{ value: "kWh/yr", label: "kWh/yr" }]}
            onUnitChange={()=>{}}
            precision={1}
            csvData={[{ metric: 'Annual Energy', value: E_annual_kWh, unit: 'kWh/yr' }]}
            csvFilename={`impressed-current-annual-energy.csv`}
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
