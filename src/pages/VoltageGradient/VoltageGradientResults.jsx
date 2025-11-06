import React, { useMemo, useState } from "react";
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
  Legend,
  ReferenceLine,
} from "recharts";
import { gradientConvert } from "./utils";

export default function VoltageGradientResults({ results }) {
  // Hooks first (run every render)
  const [vmUnit, setVmUnit] = useState("V/m");

  // Safe destructure
  const {
    Vm_max = 0,
    V_pipe = 0,
    Vm_pipe = 0,
    d_pipe = 0,
    data = [],
    unitV = "V",
    inputs,
  } = results || {};

  const sourceType = inputs?.sourceType || "distributed";
  const formula =
    sourceType === "distributed"
      ? "Vm = I·ρ / (2π·d);   V(x) = (I·ρ / 2π) ln(s/x)"
      : sourceType === "remote"
      ? "Vm = I·ρ / (2π·d²);  V(x) = I·ρ / (2π·x)"
      : "Vm = I·ρ / (2π·d·s); V(x) = (I·ρ / 2π·s) ln(s/x)";

  // Memo for unit-converted displays
  const display = useMemo(
    () => ({
      Vm_max: Number(gradientConvert(Number(Vm_max) || 0, vmUnit) || 0),
      Vm_pipe: Number(gradientConvert(Number(Vm_pipe) || 0, vmUnit) || 0),
    }),
    [Vm_max, Vm_pipe, vmUnit]
  );

  // Helper for small table
  const nearestFor = (x) => {
    if (!Array.isArray(data) || data.length === 0) return { x_m: x, Vm: 0, V: 0 };
    let best = data[0];
    let bd = Math.abs(Number(best?.x_m ?? 0) - x);
    for (const p of data) {
      const dd = Math.abs(Number(p?.x_m ?? 0) - x);
      if (dd < bd) { best = p; bd = dd; }
    }
    return {
      x_m: Number(best?.x_m ?? x),
      Vm: Number(best?.Vm ?? 0),
      V: Number(best?.V ?? 0),
    };
  };

  const maxX = Number(data?.[data.length - 1]?.x_m ?? 0);
  const sampleDistances = [0.5, 1, 2, 5, 10, 20, 50].filter((x) => x <= maxX && x > 0);

  // Conditional render AFTER hooks
  if (!results) {
    return (
      <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  return (
    <div className="space-y-4">
      {/* Key Results */}
      <ModuleCard
        title="Key Results"
        subtitle={
          <span className="inline-flex items-center gap-2">
            <span className="text-xs uppercase tracking-wide text-gray-500">Formula</span>
            <span className="text-xs px-2 py-0.5 rounded-full bg-gray-100 dark:bg-gray-800 border text-gray-700 dark:text-gray-300">
              {formula}
            </span>
          </span>
        }
      >
        <div className="space-y-4">
          <ResultValue
            label="Maximum Voltage Gradient"
            formula="Vm (max) near the anode"
            value={display.Vm_max}
            unit={vmUnit}
            unitOptions={[{ value: "V/m", label: "V/m" }, { value: "V/cm", label: "V/cm" }]}
            onUnitChange={setVmUnit}
            precision={4}
          />

          <ResultValue
            label="Voltage at Pipeline Location"
            formula="x = |depth_anode − depth_pipe|"
            value={Number(V_pipe)||0}
            unit={unitV}
            unitOptions={[{ value: "V", label: "V" }, { value: "mV", label: "mV" }]}
            onUnitChange={()=>{}}
            precision={3}
          />

          <ResultValue
            label="Gradient at Pipeline Location"
            formula={`d = ${Number(d_pipe||0).toFixed(3)} m`}
            value={display.Vm_pipe}
            unit={vmUnit}
            unitOptions={[{ value: "V/m", label: "V/m" }, { value: "V/cm", label: "V/cm" }]}
            onUnitChange={setVmUnit}
            precision={4}
          />

          {/* Compact summary */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm pt-2">
            <div><div className="text-gray-500">x at Pipe</div><div className="font-semibold">{Number(d_pipe||0).toFixed(3)} m</div></div>
            <div><div className="text-gray-500">Vm (max)</div><div className="font-semibold">{display.Vm_max.toFixed(4)} {vmUnit}</div></div>
            <div><div className="text-gray-500">Vm at Pipe</div><div className="font-semibold">{display.Vm_pipe.toFixed(4)} {vmUnit}</div></div>
            <div><div className="text-gray-500">V at Pipe</div><div className="font-semibold">{Number(V_pipe||0).toFixed(3)} {unitV}</div></div>
          </div>

          {!!sampleDistances.length && (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-gray-600 dark:text-gray-300 border-b">
                    <th className="py-1 pr-2">Distance x (m)</th>
                    <th className="py-1 pr-2">Gradient (V/m)</th>
                    <th className="py-1 pr-2">Potential (V)</th>
                  </tr>
                </thead>
                <tbody>
                  {sampleDistances.map((x) => {
                    const p = nearestFor(x);
                    return (
                      <tr key={x} className="border-b last:border-b-0">
                        <td className="py-1 pr-2">{x.toFixed(2)}</td>
                        <td className="py-1 pr-2">{Number(p?.Vm ?? 0).toFixed(4)}</td>
                        <td className="py-1 pr-2">{Number(p?.V ?? 0).toFixed(3)}</td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </ModuleCard>

      {/* Profiles chart */}
      <ModuleCard title="Profiles" subtitle="Voltage gradient and potential vs distance from anode">
        <div className="h-72">
          <ResponsiveContainer>
            <LineChart data={Array.isArray(data) ? data : []} margin={{ top: 10, right: 20, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis
                dataKey="x_m"
                type="number"
                domain={["auto", "auto"]}
                label={{ value: "Distance x (m)", position: "insideBottomRight", offset: -2 }}
              />
              <YAxis yAxisId="left" label={{ value: "Gradient (V/m)", angle: -90, position: "insideLeft" }} />
              <YAxis yAxisId="right" orientation="right" label={{ value: "Potential (V)", angle: -90, position: "insideRight" }} />
              {Number(d_pipe) > 0 && (
                <ReferenceLine
                  x={Number(d_pipe)}
                  stroke="#ef4444"
                  strokeDasharray="4 4"
                  label={`x=${Number(d_pipe).toFixed(2)} m`}
                />
              )}
              <Tooltip
                formatter={(value, _n, entry) => {
                  const key = entry?.dataKey;
                  if (key === "Vm") return `${Number(value ?? 0).toFixed(4)} V/m`;
                  if (key === "V") return `${Number(value ?? 0).toFixed(3)} V`;
                  return `${Number(value ?? 0)}`;
                }}
                labelFormatter={(l) => `x=${Number(l ?? 0).toFixed(1)} m`}
              />
              <Legend />
              <Line yAxisId="left" type="monotone" dataKey="Vm" name="Voltage Gradient (V/m)" stroke="#ef4444" strokeWidth={2} dot={false} isAnimationActive={false} />
              <Line yAxisId="right" type="monotone" dataKey="V" name="Potential (V)" stroke="#2563eb" strokeWidth={2} dot={false} isAnimationActive={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </ModuleCard>
    </div>
  );
}
