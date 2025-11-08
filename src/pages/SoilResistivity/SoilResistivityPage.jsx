import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import SoilResistivityForm from "./SoilResistivityForm";
import SoilResistivityResults from "./SoilResistivityResults";
import SoilResistivityReference from "./SoilResistivityReference";
import { computeSoilResistivity } from "./utils";

/** Keep outside the class to avoid class-field transpilation issues */
function InfoCard({ onReset, onCsv }) {
  return (
    <ModuleCard
      title="Soil Resistivity"
      subtitle="Apparent resistivity from field measurements (Wenner / Four-Point / Schlumberger)"
      actions={(
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCsv} className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">CSV</button>
          <ResetPill onClick={onReset} />
        </div>
      )}
    >
      <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Wenner / Four-Point:  ρ_a = 2π a R
Schlumberger:        ρ_a = (π * (L^2 - l^2) / l) * R   (common field approximation)

Notes:
• Use equal electrode spacing for Wenner/Four-Point (a).
• Schlumberger uses current half-spacing (L) and potential half-spacing (l).
• Output reported in Ω·m (SI).`}</pre>
    </ModuleCard>
  );
}

export default class SoilResistivityPage extends React.Component {
  constructor(props) {
    super(props);

    let parsed = null;
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("soil_resistivity_calc");
        parsed = saved ? JSON.parse(saved) : null;
      } catch {
        // ignore malformed JSON / storage errors
      }
    }

    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      savedInputs: parsed?.inputs || null,
    };
  }

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;
    const { rho_ohm_m = 0, unitRho = "ohm-m", data = [], seriesLabel = "spacing (m)" } = results || {};
    const header = ["metric","value","unit"];
    const rows = [
      header,
      ["Soil Resistivity", Number(rho_ohm_m||0), unitRho],
      [],
      [seriesLabel, "ρ (Ω·m)", ""],
      ...data.map(pt => [pt.x, pt.rho, ""]),
    ];
    const csv = rows.map(r => r.map(c => c === undefined ? '' : `"${String(c).replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'soil-resistivity-results.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  onSubmit = (inputs) => {
    const { method, R_ohm, a, L, l } = inputs || {};

    // Basic validation
    if (!method) {
      this.setState({ error: "Select a measurement method.", activeTab: "results" });
      return;
    }
    if (!(Number(R_ohm) > 0)) {
      this.setState({ error: "Measured resistance R must be > 0.", activeTab: "results" });
      return;
    }
    if ((method === "wenner" || method === "four_point") && !(Number(a) > 0)) {
      this.setState({
        error: "Electrode spacing a is required for Wenner/Four-Point.",
        activeTab: "results",
      });
      return;
    }
    if (method === "schlumberger" && !(Number(L) > 0 && Number(l) > 0)) {
      this.setState({
        error: "L and l are required for Schlumberger.",
        activeTab: "results",
      });
      return;
    }

    this.setState({ submitting: true, error: null }, () => {
      // Compute
      let results = null;
      try {
        results = computeSoilResistivity(inputs) || null;
      } catch (err) {
        this.setState({ error: err?.message || "Calculation failed", activeTab: "results", submitting: false });
        return;
      }

      // Persist
      try {
        if (typeof window !== "undefined") {
          window.localStorage.setItem(
            "soil_resistivity_calc",
            JSON.stringify({ inputs, results })
          );
        }
      } catch (err) {
        // ignore quota / storage errors
        if (import.meta && import.meta.env && import.meta.env.DEV) {
          // eslint-disable-next-line no-console
          console.debug("localStorage save failed:", err);
        }
      }

      this.setState({
        results,
        savedInputs: inputs,
        error: null,
        activeTab: "results",
        submitting: false,
      });
    });
  };

  onResetAll = () => {
    try {
      if (typeof window !== "undefined") {
        window.localStorage.removeItem("soil_resistivity_calc");
      }
    } catch {
      if (import.meta && import.meta.env && import.meta.env.DEV) {
        // eslint-disable-next-line no-console
        console.debug("localStorage clear failed");
      }
    } finally {
      this.setState({
        results: null,
        error: null,
        activeTab: "results",
        savedInputs: null,
        submitting: false,
      });
    }
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    return (
      <CalculatorPanel
        left={
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            <SoilResistivityForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              initialValues={savedInputs || {}}
            />
          </div>
        }
        right={
          <div className="space-y-4">
            <InfoCard onReset={this.onResetAll} onCsv={this.downloadResultsCsv} />
            <Tabs
              items={[
                { key: "results", label: "Results" },
                { key: "reference", label: "Reference" },
              ]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && <SoilResistivityResults results={results} />}
            {activeTab === "reference" && <SoilResistivityReference />}
          </div>
        }
      />
    );
  }
}
