import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import Tabs from "../../components/ui/Tabs";
import ResetPill from "../../components/ui/ResetPill";

import VariableResistorForm from "./VariableResistorForm";
import VariableResistorResults from "./VariableResistorResults";
import { computeVariableResistor, toVolts, toAmps } from "./utils";

export default class VariableResistorPage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== 'undefined') {
      try {
        const saved = window.localStorage.getItem('variable_resistor_calc');
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
      I_req_value, I_req_unit,
      R_circuit_ohm,
      safety_factor,
      V_drive_value, V_drive_unit,
      V_anode_value, V_anode_unit,
      supply_type,
    } = raw || {};

    if (!(Number(I_req_value) > 0) || !(Number(R_circuit_ohm) >= 0) || !(Number(safety_factor) >= 1)) {
      this.setState({ error: "Provide required current, circuit resistance, and safety factor (>=1).", activeTab: 'results' });
      return;
    }

    const I_req_A = toAmps(I_req_value, I_req_unit);
    const V_drive_V = toVolts(V_drive_value, V_drive_unit);
    const V_anode_V = toVolts(V_anode_value, V_anode_unit);

    const inputs = {
      I_req_value, I_req_unit,
      R_circuit_ohm,
      safety_factor,
      V_drive_value, V_drive_unit,
      V_anode_value, V_anode_unit,
      supply_type,
    };

    const results = computeVariableResistor({
      I_req_A,
      R_circuit_ohm: Number(R_circuit_ohm || 0),
      V_drive_V: Number(V_drive_V || 0),
      V_anode_V: Number(V_anode_V || 0),
      safety_factor: Number(safety_factor || 1),
    });

    try { window.localStorage.setItem('variable_resistor_calc', JSON.stringify({ inputs, results })); } catch { /* ignore */ }
    this.setState({ results, savedInputs: inputs, error: null });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('variable_resistor_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, savedInputs: null });
  };

  render() {
    const { submitting, results, error, savedInputs } = this.state;

    return (
      <CalculatorPanel
        left={
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}
            <VariableResistorForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} initialValues={savedInputs || {}} />
          </div>
        }
        right={
          <div className="space-y-4">
            <ModuleCard
              title="Variable Resistor Equations"
              subtitle="Required voltage, ratings, and power"
              actions={<span className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900">Formula</span>}
            >
              <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Required voltage:  V_required = I_required · R_circuit + V_driving + V_anode
Current rating:    I_rectifier = I_required × Safety Factor
Voltage rating:    V_rectifier = V_required × Safety Factor
Power:             P = V_required · I_required`}</pre>
              <div className="mt-2"><ResetPill onClick={this.onResetAll} /></div>
            </ModuleCard>
            <div className="space-y-4">
              <VariableResistorResults results={results} />
            </div>
          </div>
        }
      />
    );
  }
}
