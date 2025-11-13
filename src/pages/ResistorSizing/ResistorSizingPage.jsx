// /src/pages/resistor-sizing/ResistorSizingPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import Tabs from "../../components/ui/Tabs";
import ResetPill from "../../components/ui/ResetPill";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

import ResistorSizingForm from "./ResistorSizingForm";
import ResistorSizingResults from "./ResistorSizingResults";
import { computeRectifierSizing, toAmps } from "./utils";

export default class ResistorSizingPage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('rectifier_sizing_calc');
        parsed = saved ? JSON.parse(saved) : null;
      } catch { /* ignore malformed storage */ }
    }
    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      savedInputs: parsed?.inputs || null,
      activeTab: "results",
    };
    this.captureRef = React.createRef();
  }

  onSubmit = (raw) => {
    const {
      I_required_value, I_required_unit,
      R_circuit_ohm,
      E_native_value, E_native_unit,
      E_protect_value, E_protect_unit,
      safety_factor,
    } = raw || {};

    if (!(Number(I_required_value) > 0) || !(Number(R_circuit_ohm) >= 0) || !(Number(safety_factor) >= 1)) {
      this.setState({ error: "Provide required current, circuit resistance, and safety factor (>=1)." });
      return;
    }

    const I_required_A = toAmps(I_required_value, I_required_unit);

    const inputs = {
      I_required_value, I_required_unit,
      R_circuit_ohm,
      E_native_value, E_native_unit,
      E_protect_value, E_protect_unit,
      safety_factor,
    };

    const results = computeRectifierSizing({
      I_required_A,
      R_circuit_ohm: Number(R_circuit_ohm || 0),
      E_native_input: Number(E_native_value || 0),
      E_native_unit,
      E_protect_input: Number(E_protect_value || 0),
      E_protect_unit,
      safety_factor: Number(safety_factor || 1),
    });

    try { window.localStorage.setItem('rectifier_sizing_calc', JSON.stringify({ inputs, results })); } catch { /* ignore */ }
    this.setState({ results, savedInputs: inputs, error: null, activeTab: "results" });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('rectifier_sizing_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, savedInputs: null, activeTab: "results" });
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, savedInputs, activeTab } = this.state;
    const pageTitle = 'Rectifier Sizing';

    const headerActions = (
      <HeaderSaveBar
        moduleKey="rectifier_sizing_calc"
        moduleLabel={pageTitle}
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName={pageTitle}
        modulePath="/pages/Variable-Resistor-Shunt"
        buildName={({ inputs, project }) => {
          const i = inputs?.I_required_value ? `${inputs.I_required_value} ${inputs.I_required_unit || ''}`.trim() : "—";
          const r = inputs?.R_circuit_ohm ?? "—";
          const sf = inputs?.safety_factor ?? "—";
          return `${project?.name || "Default"} • I=${i} • R=${r}Ω • SF=${sf}`;
        }}
      />
    );

    return (
      <CalculatorPanel
        headerActions={headerActions}
        left={
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            <ResistorSizingForm
              title={pageTitle}
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              initialValues={savedInputs || {}}
            />
          </div>
        }
        right={
          <div className="space-y-4" ref={this.captureRef}>
            <ModuleCard
              title="Equations"
              subtitle="Sizing relations"
              actions={<span className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900">Formula</span>}
            >
              <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Required output voltage:
V_required = (I_required × R_circuit) + V_driving
Where V_driving = |E_protect − E_native|

Rectifier current rating:
I_rectifier = I_required × Safety Factor

Rectifier voltage rating:
V_rectifier = V_required × Safety Factor

Required power:
P_rectifier = V_required × I_required`}</pre>
              <div className="mt-2">
                <ResetPill onClick={this.onResetAll} />
              </div>
            </ModuleCard>

            <Tabs
              items={[{ key: "results", label: "Results" }]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && (
              <div className="space-y-4">
                <ResistorSizingResults results={results} />
              </div>
            )}
          </div>
        }
      />
    );
  }
}
