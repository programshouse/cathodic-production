import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import ModuleCard from "../../components/ui/ModuleCard";
import Tabs from "../../components/ui/Tabs";
import ResetPill from "../../components/ui/ResetPill";

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
      } catch {
        /* ignore malformed storage */
      }
    }
    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      savedInputs: parsed?.inputs || null,
    };
  }

  onSubmit = (raw) => {
    // raw carries ..._value and unit selections
    const {
      V_rect_value, V_rect_unit,
      I_target_value, I_target_unit,
      R_circuit_ohm,
      V_shunt_value, V_shunt_unit,
      I_shunt_value, I_shunt_unit,
    } = raw || {};

    if (!(Number(V_rect_value) > 0) || !(Number(I_target_value) > 0) || !(Number(R_circuit_ohm) >= 0)) {
      this.setState({ error: "Provide rectifier voltage, target current, and circuit resistance.", activeTab: 'results' });
      return;
    }
    if (!(Number(V_shunt_value) > 0) || !(Number(I_shunt_value) > 0)) {
      this.setState({ error: "Provide shunt voltage and shunt current.", activeTab: 'results' });
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
    this.setState({ results, savedInputs: inputs, error: null, activeTab: 'results' });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('resistor_sizing_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, activeTab: 'results', savedInputs: null });
  };

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    return (
      <CalculatorPanel
        title="Resistor Sizing"
        subtitle="Variable resistor and shunt resistor values and power dissipation."
        infoSlot={
          <ModuleCard title="Equations" subtitle="Sizing relations">
            <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Variable:  Rv = V/I − Rc    ,   P = I^2 · Rv
Shunt:     R  = V/I        ,   P = I^2 · R`}</pre>
            <div className="mt-2"><ResetPill onClick={this.onResetAll} /></div>
          </ModuleCard>
        }
        formSlot={<ResistorSizingForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} initialValues={savedInputs || {}} />}
        resultsSlot={
          <Tabs active={activeTab} onChange={(t)=>this.setState({activeTab:t})} tabs={{
            results: { label: 'Results', content: (
              <div className="space-y-4">
                {error && (<div className="bg-red-50 border border-red-200 text-red-700 rounded-md px-3 py-2 text-sm">{error}</div>)}
                <ResistorSizingResults results={results} />
              </div>
            ) },
            reference: { label: 'Reference', content: null },
          }} />
        }
      />
    );
  }
}
