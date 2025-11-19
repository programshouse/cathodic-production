// /src/pages/soil-resistivity/SoilResistivityPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

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
          <button
            type="button"
            onClick={onCsv}
            className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            CSV
          </button>
          <ResetPill onClick={onReset} />
        </div>
      )}
    >

    </ModuleCard>
  );
}

export default class SoilResistivityPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    };

    // right column ref for HeaderSaveBar screenshot/PDF capture
    this.captureRef = React.createRef();
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
      this.setState({ error: "Electrode spacing a is required for Wenner/Four-Point.", activeTab: "results" });
      return;
    }
    if (method === "schlumberger" && !(Number(L) > 0 && Number(l) > 0)) {
      this.setState({ error: "L and l are required for Schlumberger.", activeTab: "results" });
      return;
    }

    this.setState({ submitting: true, error: null }, () => {
      let results = null;
      try {
        results = computeSoilResistivity(inputs) || null;
      } catch (err) {
        this.setState({ error: err?.message || "Calculation failed", activeTab: "results", submitting: false });
        return;
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
    this.setState({
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
      submitting: false,
    });
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    // header save bar (under header)
    const headerActions = (
      <HeaderSaveBar
        moduleKey="soil_resistivity_calc"
        moduleLabel="Soil Resistivity"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName="Soil Resistivity"
        modulePath="/pages/soil-resistivity"
        buildName={({ inputs, project }) => {
          const m = inputs?.method || "—";
          const a = inputs?.a ? `${inputs.a} m` : (inputs?.L ? `L=${inputs.L}, l=${inputs.l}` : "—");
          return `${project?.name || "Default"} • ${m} • ${a}`;
        }}
      />
    );

    return (
      <CalculatorPanel
        header={
          <div className="mb-6">

          </div>
        }
        headerActions={headerActions}
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
          // This pane (including charts) is what gets captured/exported by HeaderSaveBar
          <div className="space-y-4" ref={this.captureRef}>
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
