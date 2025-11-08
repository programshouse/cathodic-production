import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import InterferenceForm from "./InterferenceForm";
import InterferenceResults from "./InterferenceResults";
import InterferenceReference from "./InterferenceReference";
import {
  currentToA,
  resistivityToOhmM,
  lengthToM,
  potentialToV,
  computeInterference,
  seriesForDistance,
} from "./utils";

/** Small sticky info card like SurfaceAreaPage */
function InfoCard({ onReset, onCsv }) {
  const baseClass =
    "rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur p-4 md:p-6 sticky top-4";
  return (
    <div className={baseClass}>
      <div className="flex items-center justify-between mb-3">
        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">
          Interference Calculation
        </h3>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={onCsv}
            className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            CSV
          </button>
          <ResetPill onClick={onReset} />
        </div>
      </div>

      <span className="text-xs px-2 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-100 dark:border-brand-800">
        Formula
      </span>

      <pre className="mt-2 text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`V_int = (I · ρ) / (2π · d · k_type) × k_source
V_shift = V_int
V_new = V_pipe + V_shift`}</pre>

      <p className="text-base mt-2 text-gray-600 dark:text-gray-400">
        Inputs converted to SI (A, Ω·m, m, V) internally.
      </p>
    </div>
  );
}

/** Inline alert like SurfaceAreaPage */
const Alert = ({ children }) => (
  <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
    {children}
  </div>
);

export default class InterferencePage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== "undefined") {
      try {
        parsed = JSON.parse(window.localStorage.getItem("interference_calc") || "null");
      } catch {
        /* ignore malformed JSON */
      }
    }
    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      savedInputs: parsed?.inputs || null,
      activeTab: "results",
    };
  }

  onSubmit = (raw) => {
    const { type, source, I, IUnit, rho, rhoUnit, d, dUnit, Vpipe, VpipeUnit } = raw || {};

    // Basic validation
    if (
      !type ||
      !source ||
      !(Number(I) > 0) ||
      !(Number(rho) > 0) ||
      !(Number(d) > 0) ||
      Vpipe === "" ||
      Vpipe === null ||
      Vpipe === undefined
    ) {
      this.setState({ error: "Please fill all required fields with valid values." });
      return;
    }

    const inputs = { type, source, I, IUnit, rho, rhoUnit, d, dUnit, Vpipe, VpipeUnit };

    // Convert to SI
    const I_A = currentToA(I, IUnit);
    const rho_ohm_m = resistivityToOhmM(rho, rhoUnit);
    const d_m = lengthToM(d, dUnit);
    const V_pipe_V = potentialToV(Vpipe, VpipeUnit);

    // Compute core + series (profile vs distance)
    const core = computeInterference({ type, source, I_A, rho_ohm_m, d_m, V_pipe_V });
    const series = seriesForDistance({
      type,
      source,
      I_A,
      rho_ohm_m,
      d_from: Math.max(0.1, d_m * 0.25),
      d_to: Math.max(d_m * 4, d_m + 10),
      step: Math.max(0.1, d_m / 10),
    });

    const results = { ...core, series, inputs, d_m };

    try {
      window.localStorage.setItem("interference_calc", JSON.stringify({ inputs, results }));
    } catch {
      /* ignore storage errors */
    }

    this.setState({ results, savedInputs: inputs, error: null });
  };

  onResetAll = () => {
    try {
      window.localStorage.removeItem("interference_calc");
    } catch {
      /* ignore */
    }
    this.setState({ results: null, error: null, savedInputs: null });
  };

  setTab = (key) => this.setState({ activeTab: key });

  componentWillUnmount() {
    try {
      window.localStorage.removeItem("interference_calc");
    } catch {
      /* ignore */
    }
  }

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;
    const rows = [
      ["metric", "value", "unit"],
      ["V_int", Number(results.V_int || 0), "V"],
      ["V_shift", Number(results.V_shift || 0), "V"],
      ["V_new", Number(results.V_new || 0), "V"],
      ["k_type", Number(results.k_type || 0), "-"],
      ["k_src", Number(results.k_src || 0), "-"],
      ["severity", String(results.severity || ""), ""],
      ["status", String(results.status || ""), ""],
    ];
    const csv = rows
      .map((r) => r.map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`).join(","))
      .join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "interference-results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    const { submitting, results, error, savedInputs, activeTab } = this.state;

    // Header actions area (kept empty for now to mirror SurfaceAreaPage pattern)
    const headerActions = <></>;

    return (
      <CalculatorPanel
        header={
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
              <div className="relative px-5 py-5 md:px-7 md:py-6">
                <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Interference Calculator</h2>
                <p className="text-brand-50/90 text-sm md:text-base mt-1">Select type/source and enter distance, current, soil resistivity, and pipe potential to compute interference voltage and potential shift.</p>
              </div>
            </div>
          </div>
        }
        headerActions={headerActions}
        left={
          <div>
            {error ? <Alert>{error}</Alert> : null}
            <InterferenceForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              initialValues={savedInputs || {}}
            />
          </div>
        }
        right={
          <>
            <InfoCard onReset={this.onResetAll} onCsv={this.downloadResultsCsv} />
            <Tabs
              items={[{ key: "results", label: "Results" }, { key: "reference", label: "Reference" }]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && <InterferenceResults results={results} />}
            {activeTab === "reference" && (
              <ModuleCard title="Reference" subtitle="Background & assumptions">
                <InterferenceReference />
              </ModuleCard>
            )}
          </>
        }
      />
    );
  }
}
