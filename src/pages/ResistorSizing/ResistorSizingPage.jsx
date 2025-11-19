// /src/pages/resistor-sizing/ResistorSizingPage.jsx
import React from "react";

import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
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
      I_design_A: Number(I_design_A),
      V_drop_V: Number(V_drop_V),
      safety_factor: Number(safety_factor),
    };

    const results = computeVariableResistorSizing(inputs);

    this.setState({
      results,
      savedInputs: inputs,
      error: null,
    });
  };

  onResetAll = () => {
    this.setState({
      results: null,
      error: null,
      savedInputs: null,
    });
  };

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;

    const {
      R_nominal = 0,
      R_min = 0,
      R_max = 0,
      P_required = 0,
      P_recommended = 0,
      inputs,
    } = results;

    const rows = [
      ["metric", "value", "unit"],
      ["I_design", inputs?.I_design_A ?? "", "A"],
      ["V_drop", inputs?.V_drop_V ?? "", "V"],
      ["Safety factor", inputs?.safety_factor ?? "", "-"],
      ["R_nominal", R_nominal, "Ω"],
      ["R_min", R_min, "Ω"],
      ["R_max", R_max, "Ω"],
      ["P_required", P_required, "W"],
      ["P_recommended", P_recommended, "W"],
    ];

    const csv = rows
      .map((r) =>
        r
          .map((c) =>
            c === undefined ? "" : `"${String(c).replaceAll('"', '""')}"`
          )
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "resistor-sizing-results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    const { submitting, results, error, savedInputs } = this.state;
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
        header={<div className="mb-6" />}
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
              title="Variable Resistor System"
              subtitle="R = V / I, P = I² × R, adjustable range 0 to 2R."
              actions={
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={this.downloadResultsCsv}
                    className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    CSV
                  </button>
                  <ResetPill onClick={this.onResetAll} />
                </div>
              }
            >
              <div className="text-sm text-gray-700 dark:text-gray-300">
                Design outputs include nominal resistance, recommended
                adjustable range, required power dissipation, and recommended
                resistor power rating with the selected safety factor.
              </div>
            </ModuleCard>

            <ResistorSizingResults results={results} />
          </div>
        }
      />
    );
  }
}
