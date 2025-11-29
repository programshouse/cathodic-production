import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import BarnesLayerForm from "./BarnesLayerForm";
import BarnesLayerResults from "./BarnesLayerResults";
import { computeBarnesLayers } from "./utils";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

export default class BarnesLayerPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      savedInputs: null,
    };

    // right column capture for PDF/screenshot in HeaderSaveBar
    this.captureRef = React.createRef();
  }

  onSubmit = (raw) => {
    const { a1, a2, a3, R1, R2, R3 } = raw || {};

    if (
      !(Number(a1) > 0) ||
      !(Number(a2) > 0) ||
      !(Number(a3) > 0) ||
      !(Number(R1) > 0) ||
      !(Number(R2) > 0) ||
      !(Number(R3) > 0)
    ) {
      this.setState({
        error: "Please enter positive values for a₁–a₃ and R₁–R₃.",
      });
      return;
    }

    const inputs = {
      a1: Number(a1),
      a2: Number(a2),
      a3: Number(a3),
      R1: Number(R1),
      R2: Number(R2),
      R3: Number(R3),
    };

    const results = computeBarnesLayers(inputs);

    this.setState({
      results,
      savedInputs: inputs,
      error: null,
    });
  };

  onResetAll = () => {
    this.setState({ results: null, error: null, savedInputs: null });
  };

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;

    const { layers = [], inputs } = results;

    const rows = [
      ["Layer", "L (m)", "RL (Ω)", "ρL (Ω·m)"],
      ...layers.map((l, idx) => [
        l.layer ?? `Layer ${idx + 1}`,
        Number(l.L ?? l.depth_m ?? 0),
        Number(l.RL ?? l.resistance_ohm ?? 0),
        Number(l.rho_ohm_m ?? l.resistivity_ohm_m ?? 0),
      ]),
      [],
      ["a1 (m)", inputs?.a1 ?? ""],
      ["a2 (m)", inputs?.a2 ?? ""],
      ["a3 (m)", inputs?.a3 ?? ""],
      ["R1 (Ω)", inputs?.R1 ?? ""],
      ["R2 (Ω)", inputs?.R2 ?? ""],
      ["R3 (Ω)", inputs?.R3 ?? ""],
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
    a.download = "barnes-layer-results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  render() {
    const { submitting, results, error, savedInputs } = this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="barnes_layer_calc"
        moduleLabel="Barnes Layer"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName="Barnes Layer Resistivity"
        modulePath="/pages/barnes-layer"
        buildName={({ inputs, project }) => {
          const a1 = inputs?.a1 ?? "—";
          const a2 = inputs?.a2 ?? "—";
          const a3 = inputs?.a3 ?? "—";
          return `${project?.name || "Default"} • a₁=${a1} m • a₂=${a2} m • a₃=${a3} m`;
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
            <BarnesLayerForm
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
              title="Barnes Layer Calculation"
              subtitle={
                <>
                  RL₁ = R₁,&nbsp;
                  RL₂ = (R₁·R₂)/(R₁ − R₂),&nbsp;
                  RL₃ = (R₂·R₃)/(R₂ − R₃);&nbsp;
                  ρLᵢ = 2π·a₁·RLᵢ
                </>
              }
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
                Three-layer Barnes method using updated RL₂ / RL₃ equations.
              </div>
            </ModuleCard>

            <BarnesLayerResults results={results} />
          </div>
        }
      />
    );
  }
}
