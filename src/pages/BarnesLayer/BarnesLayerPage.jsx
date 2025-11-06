import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import BarnesLayerForm from "./BarnesLayerForm";
import BarnesLayerResults from "./BarnesLayerResults";
import { UNIT, toOhmMeter, computeBarnesSingleLayer } from "./utils";

export default class BarnesLayerPage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('barnes_layer_calc');
        parsed = saved ? JSON.parse(saved) : null;
      } catch { /* ignore */ }
    }
    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      savedInputs: parsed?.inputs || null,
    };
  }

  onSubmit = (raw) => {
    const {
      rho_top_value, rho_top_unit,
      t_top_m,
      rho_bottom_value, rho_bottom_unit,
      spacing_m,
      measured_R_ohm,
      method,
    } = raw || {};

    if (!(Number(rho_top_value) > 0) || !(Number(rho_bottom_value) > 0) || !(Number(t_top_m) >= 0) || !(Number(spacing_m) > 0) || !(Number(measured_R_ohm) > 0)) {
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

    const results = computeBarnesSingleLayer(inputs);

    try { window.localStorage.setItem('barnes_layer_calc', JSON.stringify({ inputs: raw, results })); } catch { /* ignore */ }
    this.setState({ results, savedInputs: raw, error: null });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('barnes_layer_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, savedInputs: null });
  };

  render() {
    const { submitting, results, error, savedInputs } = this.state;

    return (
      <CalculatorPanel
        left={
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{error}</div>
            ) : null}
            <BarnesLayerForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} initialValues={savedInputs || {}} />
          </div>
        }
        right={
          <div className="space-y-4">
            <ModuleCard title="Barnes Layer Calculation" subtitle="ρa = 2π a R" actions={<ResetPill onClick={this.onResetAll} />}>
              <div className="text-sm text-gray-700 dark:text-gray-300">Single-layer Barnes method demonstration with apparent resistivity vs spacing.</div>
            </ModuleCard>
            <BarnesLayerResults results={results} />
          </div>
        }
      />
    );
  }
}
