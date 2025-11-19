import React from "react";

import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import Tabs from "../../components/ui/Tabs";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

import ResistorSizingForm from "./ResistorSizingForm";
import ResistorSizingResults from "./ResistorSizingResults";
import { computeVariableResistorSizing } from "./utils";

export default class ResistorSizingPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      savedInputs: null,
      activeTab: "results",
    };
    this.captureRef = React.createRef();
  }

  onSubmit = (raw) => {
    const { I_design_A, V_drop_V, safety_factor } = raw || {};

    if (
      !(Number(I_design_A) > 0) ||
      !(Number(V_drop_V) > 0) ||
      !(Number(safety_factor) >= 1)
    ) {
      this.setState({
        error:
          "Provide design current (>0), desired voltage drop (>0), and safety factor (>=1).",
      });
      return;
    }

    const inputs = {
      I_design_A,
      V_drop_V,
      safety_factor,
    };

    const results = computeVariableResistorSizing({
      I_design_A: Number(I_design_A || 0),
      V_drop_V: Number(V_drop_V || 0),
      safety_factor: Number(safety_factor || 1),
    });

    this.setState({
      results,
      savedInputs: inputs,
      error: null,
      activeTab: "results",
    });
  };

  onResetAll = () => {
    this.setState({
      results: null,
      error: null,
      savedInputs: null,
      activeTab: "results",
    });
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, savedInputs, activeTab } = this.state;
    const pageTitle = "Variable Resistor Sizing Calculator (CP)";

    const headerActions = (
      <HeaderSaveBar
        moduleKey="variable_resistor_sizing_calc"
        moduleLabel={pageTitle}
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName={pageTitle}
        modulePath="/pages/Variable-Resistor-Shunt"
        buildName={({ inputs, project }) => {
          const i = inputs?.I_design_A ?? "—";
          const v = inputs?.V_drop_V ?? "—";
          const sf = inputs?.safety_factor ?? "—";
          return `${project?.name || "Default"} • I=${i}A • V=${v}V • SF=${sf}`;
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
