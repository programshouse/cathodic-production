import React, { useMemo, useState } from "react";
import { ENVIRONMENTS, CONDITIONS, MOISTURE, TABLES } from "./utils";
import SectionCard from "../../components/ui/SectionCard";
import { Label, Help, Select, NumberInput } from "../../components/ui/FormControls";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function CurrentDensityForm({ onSubmit, submitting, onReset }) {
  const [env, setEnv] = useState("soil");
  const [condition, setCondition] = useState("Excellent");
  const [coatingType, setCoatingType] = useState("");
  const [temperature, setTemperature] = useState(25);
  const [moisture, setMoisture] = useState("dry");

  const conditionOptions = useMemo(() => CONDITIONS.map((c) => c.value), []);
  const typesForCondition = useMemo(() => {
    const rows = TABLES[env] || [];
    return rows.filter((r) => r.condition === condition).map((r) => r.type);
  }, [env, condition]);


  const Header = () => (
    <div className="mb-6">
      <div className="relative overflow-hidden rounded-2xl">
        <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
        <div className="relative px-5 py-5 md:px-7 md:py-6">
          <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Current Density Calculator</h2>
          <p className="text-brand-50/90 text-sm md:text-base mt-1">
            Select environment and coating details, then enter temperature. Soil applies a moisture factor.
          </p>
        </div>
      </div>
    </div>
  );

  return (
    <form
      onSubmit={(e) => {
        e.preventDefault();
        onSubmit && onSubmit(e);
      }}
      className="space-y-6"
    >
      <Header />

      <SectionCard
        title="Input Parameters"
        subtitle="Choose environment, coating condition/type and enter temperature."
        actions={(
          <button
            type="button"
            onClick={() => {
              setEnv("soil");
              setCondition("Excellent");
              setCoatingType("");
              setTemperature(25);
              setMoisture("dry");
              if (onReset) onReset();
            }}
            className="px-3 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300"
          >
            Reset
          </button>
        )}
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label required>Environment Type</Label>
            <Select
              name="environment"
              value={env}
              onChange={(e) => {
                setEnv(e.target.value);
                setCoatingType("");
              }}
              required
            >
              {ENVIRONMENTS.map((e) => (
                <option key={e.value} value={e.value}>{e.label}</option>
              ))}
            </Select>
            <Help>Soil, freshwater or seawater.</Help>
          </div>

          <div>
            <Label required>Coating Condition</Label>
            <Select
              name="condition"
              value={condition}
              onChange={(e) => {
                setCondition(e.target.value);
                setCoatingType("");
              }}
              required
            >
              {conditionOptions.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </Select>
            <Help>Excellent, Good, Fair or Poor.</Help>
          </div>

          <div>
            <Label required>Coating Type</Label>
            <Select
              name="coatingType"
              value={coatingType}
              onChange={(e) => setCoatingType(e.target.value)}
              required
            >
              {typesForCondition.length === 0 ? (
                <option value="">Select condition first</option>
              ) : (
                typesForCondition.map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))
              )}
            </Select>
            <Help>Options depend on selected condition and environment.</Help>
          </div>

          <div>
            <Label required>Temperature (°C)</Label>
            <NumberInput
              name="temperature"
              inputMode="decimal"
              step="1"
              min="-20"
              max="80"
              value={temperature}
              onChange={(e) => setTemperature(e.target.value)}
              required
            />
            <Help>Equation applies a correction from 25°C.</Help>
          </div>

          {env === "soil" && (
            <div className="md:col-span-2">
              <Label required>Soil Moisture Condition</Label>
              <Select
                name="moisture"
                value={moisture}
                onChange={(e) => setMoisture(e.target.value)}
                required
              >
                {MOISTURE.map((m) => (
                  <option key={m.value} value={m.value}>{m.label}</option>
                ))}
              </Select>
              <Help>A moisture factor is applied in soil environments.</Help>
            </div>
          )}
        </div>
      </SectionCard>

      <div className="flex items-center gap-3">
        <PrimaryButton type="submit" disabled={submitting}>
          {submitting ? (
            <>
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z" />
              </svg>
              Calculating...
            </>
          ) : (
            <>Calculate Current Density</>
          )}
        </PrimaryButton>
      </div>
    </form>
  );
}
