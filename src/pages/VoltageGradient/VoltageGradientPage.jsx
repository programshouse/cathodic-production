// /src/pages/voltage-gradient/VoltageGradientPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

import VoltageGradientForm from "./VoltageGradientForm";
import VoltageGradientResults from "./VoltageGradientResults";
import VoltageGradientReference from "./VoltageGradientReference";

import { computeVoltageGradient } from "./utils";

export default class VoltageGradientPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    };

    this.captureRef = React.createRef();
  }

  onSubmit = (inputs) => {
    const { I_A, L_m, rho_ohm_m, X_r_m } = inputs || {};

    if (!(Number(I_A) > 0) || !(Number(L_m) > 0) || !(Number(rho_ohm_m) > 0)) {
      this.setState({
        error:
          "Please provide positive values for current, anode length, and soil resistivity.",
        activeTab: "results",
      });
      return;
    }

    const results = computeVoltageGradient({
      I_A: Number(I_A),
      L_m: Number(L_m),
      rho_ohm_m: Number(rho_ohm_m),
      X_r_m:
        X_r_m === null || X_r_m === undefined || X_r_m === ""
          ? null
          : Number(X_r_m),
    });

    this.setState({
      results,
      savedInputs: {
        I_A: Number(I_A),
        L_m: Number(L_m),
        rho_ohm_m: Number(rho_ohm_m),
        X_r_m:
          X_r_m === null || X_r_m === undefined || X_r_m === ""
            ? ""
            : Number(X_r_m),
      },
      error: null,
      activeTab: "results",
      submitting: false,
    });
  };

  onResetAll = () => {
    this.setState({
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    });
  };

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;

    const rows = [
      ["metric", "value", "unit"],
      ["I", results.inputs?.I_A ?? "", "A"],
      ["L", results.inputs?.L_m ?? "", "m"],
      ["rho", results.inputs?.rho_ohm_m ?? "", "Ω·m"],
      ["Xr", results.X_r_m ?? "", "m"],
      ["Vr_max", results.Vr_max ?? "", "V"],
      ["Vr_at_Xr", results.Vr_at_Xr ?? "", "V"],
      ["Vr_perA_at_Xr", results.Vr_perA_at_Xr ?? "", "V/A"],
    ];

    const csv = rows
      .map((r) =>
        r
          .map((c) => `"${String(c ?? "").replaceAll('"', '""')}"`)
          .join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "voltage-gradient-results.csv";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  setTab = (key) => this.setState({ activeTab: key });

  InfoCard = () => (
    <ModuleCard
      title="Voltage Gradient Around a Vertical Anode"
      subtitle="Step 2: Calculate voltage rise Vᵣ at any point Xᵣ from the anode"
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
      <div className="text-sm text-gray-700 dark:text-gray-300 space-y-1">
        <p>
          The module uses the classical vertical rod equation to compute
          voltage rise in the earth with respect to remote earth.
        </p>
        <p>
          Step 4: It plots voltage rise per ampere (V/A) versus distance on a
          logarithmic scale from 0.1&nbsp;m to 100&nbsp;m, similar to the sample
          chart in the design notes.
        </p>
      </div>
    </ModuleCard>
  );

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="voltage_gradient_module"
        moduleLabel="Voltage Gradient Module"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName="Voltage Gradient Module"
        modulePath="/pages/voltage-gradient"
        buildName={({ inputs, project }) => {
          const I = inputs?.I_A ?? "—";
          const L = inputs?.L_m ?? "—";
          const rho = inputs?.rho_ohm_m ?? "—";
          return `${project?.name || "Default"} • I=${I} A • L=${L} m • ρ=${rho} Ω·m`;
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

            <VoltageGradientForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              initialValues={savedInputs || {}}
            />
          </div>
        }
        right={
          <div className="space-y-4" ref={this.captureRef}>
            <this.InfoCard />
            <Tabs
              items={[
                { key: "results", label: "Results" },
                { key: "reference", label: "Reference" },
              ]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && (
              <VoltageGradientResults results={results} />
            )}
            {activeTab === "reference" && <VoltageGradientReference />}
          </div>
        }
      />
    );
  }
}
