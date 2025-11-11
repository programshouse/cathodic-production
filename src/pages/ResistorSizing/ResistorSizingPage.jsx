// /src/pages/resistor-sizing/ResistorSizingPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import Tabs from "../../components/ui/Tabs";
import ResetPill from "../../components/ui/ResetPill";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

import ResistorSizingForm from "./ResistorSizingForm";
import ResistorSizingResults from "./ResistorSizingResults";
import { computeResistorSizing, toVolts, toAmps } from "./utils";

export default class ResistorSizingPage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('resistor_sizing_calc');
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
    // Right column ref for HeaderSaveBar screenshot/PDF
    this.captureRef = React.createRef();
  }

  onSubmit = (raw) => {
    const {
      V_rect_value, V_rect_unit,
      I_target_value, I_target_unit,
      R_circuit_ohm,
      V_shunt_value, V_shunt_unit,
      I_shunt_value, I_shunt_unit,
    } = raw || {};

    if (!(Number(V_rect_value) > 0) || !(Number(I_target_value) > 0) || !(Number(R_circuit_ohm) >= 0)) {
      this.setState({ error: "Provide rectifier voltage, target current, and circuit resistance." });
      return;
    }
    if (!(Number(V_shunt_value) > 0) || !(Number(I_shunt_value) > 0)) {
      this.setState({ error: "Provide shunt voltage and shunt current." });
      return;
    }

    const V_rect_V = toVolts(V_rect_value, V_rect_unit);
    const I_target_A = toAmps(I_target_value, I_target_unit);
    const I_shunt_A = toAmps(I_shunt_value, I_shunt_unit);

    const inputs = {
      V_rect_value, V_rect_unit,
      I_target_value, I_target_unit,
      R_circuit_ohm,
      V_shunt_value, V_shunt_unit,
      I_shunt_value, I_shunt_unit,
    };

    const results = computeResistorSizing({
      V_rect_V,
      I_target_A,
      R_circuit_ohm: Number(R_circuit_ohm || 0),
      V_shunt_value: Number(V_shunt_value || 0),
      V_shunt_unit,
      I_shunt_A,
    });

    try { window.localStorage.setItem('resistor_sizing_calc', JSON.stringify({ inputs, results })); } catch { /* ignore */ }
    this.setState({ results, savedInputs: inputs, error: null, activeTab: "results" });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('resistor_sizing_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, savedInputs: null, activeTab: "results" });
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, savedInputs, activeTab } = this.state;

    const path = (typeof window !== 'undefined' && window.location && window.location.pathname)
      ? window.location.pathname
      : '';
    const isVarShunt = path.toLowerCase().includes('variable-resistor-shunt');
    const pageTitle = isVarShunt
      ? 'Variable Resistor & Shunt Resistor Sizing'
      : 'Resistor Sizing';

    // 🔹 Header save bar under header (consistent with other modules)
    const headerActions = (
      <HeaderSaveBar
        moduleKey="resistor_sizing_calc"                 // maps to your formula map
        moduleLabel={pageTitle}
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName={pageTitle}
        modulePath="/pages/resistor-sizing"
        buildName={({ inputs, project }) => {
          const v = inputs?.V_rect_value ? `${inputs.V_rect_value} ${inputs.V_rect_unit || ''}`.trim() : "—";
          const i = inputs?.I_target_value ? `${inputs.I_target_value} ${inputs.I_target_unit || ''}`.trim() : "—";
          return `${project?.name || "Default"} • Vrect=${v} • Itarget=${i}`;
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
          // 📸 This block is captured in the PDF (no series numbers present in this module)
          <div className="space-y-4" ref={this.captureRef}>
            <ModuleCard
              title="Equations"
              subtitle="Sizing relations"
              actions={<span className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900">Formula</span>}
            >
              <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Variable:  Rv = V/I − Rc    ,   P = I^2 · Rv
Shunt:     R  = V/I        ,   P = I^2 · R`}</pre>
              <div className="mt-2">
                <ResetPill onClick={this.onResetAll} />
              </div>
            </ModuleCard>

            {/* Keep layout parity with other pages using Tabs (single Results tab for now) */}
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
