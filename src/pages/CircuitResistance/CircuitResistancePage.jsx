import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import CircuitResistanceForm from "./CircuitResistanceForm";
import CircuitResistanceResults from "./CircuitResistanceResults";
import { computeCircuit } from "./utils";

export default class CircuitResistancePage extends React.Component {
  constructor(props) {
    super(props);
    const saved = (typeof window !== "undefined")
      ? window.localStorage.getItem("circuit_resistance_calc")
      : null;
    const parsed = saved ? JSON.parse(saved) : null;

    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      savedInputs: parsed?.inputs || null, // kept for parity; only used if your form supports initial values
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);

        const inputs = {
          length_m: Number(fd.get("length_m")),
          cross_section_mm2: Number(fd.get("cross_section_mm2")),
          material: fd.get("material"),
          anode_resistance_ohm: Number(fd.get("anode_resistance_ohm")),
          number_of_anodes: Number(fd.get("number_of_anodes")),
          connection: fd.get("connection"),
          pipeline_resistance_ohm: Number(fd.get("pipeline_resistance_ohm")),
        };

        // Basic validation similar to your other pages
        if (!(inputs.length_m > 0)) {
          this.setState({ submitting: false, error: "Cable length must be > 0.", activeTab: "results" });
          return;
        }
        if (!(inputs.cross_section_mm2 > 0)) {
          this.setState({ submitting: false, error: "Cross section must be > 0.", activeTab: "results" });
          return;
        }
        if (!inputs.material) {
          this.setState({ submitting: false, error: "Select a cable material.", activeTab: "results" });
          return;
        }
        if (!(inputs.number_of_anodes >= 1)) {
          this.setState({ submitting: false, error: "Number of anodes must be ≥ 1.", activeTab: "results" });
          return;
        }
        if (!inputs.connection) {
          this.setState({ submitting: false, error: "Select anode connection (series/parallel).", activeTab: "results" });
          return;
        }

        const r = computeCircuit(inputs);
        const results = { ...r, inputs };

        try {
          window.localStorage.setItem(
            "circuit_resistance_calc",
            JSON.stringify({ inputs, results })
          );
        } catch { /* ignore */ }

        this.setState({
          results,
          activeTab: "results",
          savedInputs: inputs,
        });
      } catch (err) {
        this.setState({
          error: err && err.message ? err.message : "Calculation failed",
        });
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem("circuit_resistance_calc"); } catch { /* ignore */ }
    this.setState({ results: null, error: null, activeTab: "results", savedInputs: null });
  };

  setTab = (key) => this.setState({ activeTab: key });

  InfoCard = () => (
    <ModuleCard
      title="Circuit Resistance"
      subtitle="R_total = R_cable + R_anode_groundbed + R_pipeline"
      actions={<ResetPill onClick={this.onResetAll} />}
    >
      <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Cable:     R_cable = (ρ_material × Length) / Cross Section
Anodes (Series):   R_anode,total = R_anode × n
Anodes (Parallel): R_anode,total = R_anode / n
Total:     R_total = R_cable + R_anode,total + R_pipeline`}</pre>
    </ModuleCard>
  );

  render() {
    const { submitting, results, error, activeTab /*, savedInputs*/ } = this.state;

    return (
      <CalculatorPanel
        title="Circuit Resistance"
        subtitle="Compute cable + groundbed anode + pipeline equivalent resistance."
        infoSlot={<this.InfoCard />}
        formSlot={
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}
            {/* If your form supports initialValues, pass savedInputs here */}
            <CircuitResistanceForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              // initialValues={savedInputs || {}}
            />
          </div>
        }
        resultsSlot={
          <Tabs
            active={activeTab}
            onChange={(t) => this.setState({ activeTab: t })}
            tabs={{
              results: {
                label: "Results",
                content: <CircuitResistanceResults results={results} />,
              },
            }}
          />
        }
      />
    );
  }
}
