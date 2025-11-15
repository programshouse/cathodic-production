// /src/pages/barnes-layer/BarnesLayerPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import BarnesLayerForm from "./BarnesLayerForm";
import BarnesLayerResults from "./BarnesLayerResults";
import { UNIT, toOhmMeter, computeBarnesSingleLayer } from "./utils";
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
    const {
      rho_top_value,
      rho_top_unit,
      t_top_m,
      rho_bottom_value,
      rho_bottom_unit,
      spacing_m,
      measured_R_ohm,
      method,
    } = raw || {};

    if (
      !(Number(rho_top_value) > 0) ||
      !(Number(rho_bottom_value) > 0) ||
      !(Number(t_top_m) >= 0) ||
      !(Number(spacing_m) > 0) ||
      !(Number(measured_R_ohm) > 0)
    ) {
      this.setState({ error: "Fill all required fields with valid values." });
      return;
    }

    const inputs = {
      rho_top_ohm_m: toOhmMeter(rho_top_value, rho_top_unit),
      rho_bottom_ohm_m: toOhmMeter(rho_bottom_value, rho_bottom_unit),
      t_top_m: Number(t_top_m || 0),
      spacing_m: Number(spacing_m || 0),
      measured_R_ohm: Number(measured_R_ohm || 0),
      method,
    };

    const baseResults = computeBarnesSingleLayer(inputs);

    // Build a simple chart series for History: apparent resistivity vs spacing
    const table = Array.isArray(baseResults?.table) ? baseResults.table : [];
    const labels = table.map((row) => Number(row.spacing_m || 0));
    const data = table.map((row) => Number(row.rho_app_ohm_m || 0));
    const chartSeries = {
      labels,
      series: [
        {
          name: "Apparent Resistivity (Ω·m)",
          data,
        },
      ],
    };

    const results = { ...baseResults, chartSeries };

    this.setState({ results, savedInputs: raw, error: null });
  };

  onResetAll = () => {
    this.setState({ results: null, error: null, savedInputs: null });
  };

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;
    const {
      rho_top_ohm_m,
      rho_bottom_ohm_m,
      boundary_depth_m,
      rho_app_ohm_m,
      table = [],
    } = results;

    const rows = [
      ["metric", "value", "unit"],
      ["Top Layer Resistivity", Number(rho_top_ohm_m || 0), "Ω·m"],
      ["Bottom Layer Resistivity", Number(rho_bottom_ohm_m || 0), "Ω·m"],
      ["Layer Boundary Depth", Number(boundary_depth_m || 0), "m"],
      ["Apparent Resistivity", Number(rho_app_ohm_m || 0), "Ω·m"],
      [],
      ["Spacing (m)", "Measured R (Ω)", "Apparent ρ (Ω·m)", "Depth (m)"],
      ...table.map((r) => [
        Number(r.spacing_m || 0),
        Number(r.R_meas_ohm || 0),
        Number(r.rho_app_ohm_m || 0),
        Number(r.depth_m || 0),
      ]),
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

    // Header actions: Save (with folder picker) + Export PDF (text blocks)
    const headerActions = (
      <HeaderSaveBar
        moduleKey="barnes_layer_calc"
        moduleLabel="Barnes Layer"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        // server history formula name
        formulaName="Barnes Layer Resistivity"
        modulePath="/pages/barnes-layer"
        buildName={({ inputs, project }) => {
          // inputs here are the raw (form) values we stored for local recall
          const top = inputs?.rho_top_value
            ? `${inputs.rho_top_value} ${inputs.rho_top_unit || "Ω·m"}`
            : "—";
          const bot = inputs?.rho_bottom_value
            ? `${inputs.rho_bottom_value} ${inputs.rho_bottom_unit || "Ω·m"}`
            : "—";
          const a = inputs?.spacing_m ? `${inputs.spacing_m} m` : "—";
          return `${project?.name || "Default"} • ρ₁=${top} • ρ₂=${bot} • a=${a}`;
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
              subtitle="ρₐ = 2π a R"
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
                Single-layer Barnes method demonstration with apparent
                resistivity vs spacing.
              </div>
            </ModuleCard>

            <BarnesLayerResults results={results} />
          </div>
        }
      />
    );
  }
}
