import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import CircuitResistanceForm from "./CircuitResistanceForm";
import CircuitResistanceResults from "./CircuitResistanceResults";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import { computeCircuit } from "./utils";

export default class CircuitResistancePage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
    };
  }

  onSubmit = (e) => {
    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);
        const length_m = Number(fd.get("length_m"));
        const cross_section_mm2 = Number(fd.get("cross_section_mm2"));
        const material = fd.get("material");
        const anode_resistance_ohm = Number(fd.get("anode_resistance_ohm"));
        const number_of_anodes = Number(fd.get("number_of_anodes"));
        const connection = fd.get("connection");
        const pipeline_resistance_ohm = Number(fd.get("pipeline_resistance_ohm"));

        const r = computeCircuit({ length_m, cross_section_mm2, material, anode_resistance_ohm, number_of_anodes, connection, pipeline_resistance_ohm });
        this.setState({ results: r, activeTab: "results" });
      } catch (err) {
        this.setState({ error: err && err.message ? err.message : "Calculation failed" });
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  onResetAll = () => this.setState({ results: null, error: null, activeTab: "results" });
  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab } = this.state;

    const InfoCard = () => (
      <ModuleCard title="Circuit Resistance" subtitle="R_total = R_cable + R_anode_groundbed + R_pipeline" actions={<ResetPill onClick={this.onResetAll} /> }>
        <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Cable: R_cable = (ρ_material × Length) / Cross Section
Anode (Series): R_anode,total = R_anode × n
Anode (Parallel): R_anode,total = R_anode / n
Total: R_total = R_cable + R_anode,total + R_pipeline`}</pre>
      </ModuleCard>
    );

    return (
      <CalculatorPanel
        left={(
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{error}</div>
            ) : null}
            <CircuitResistanceForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} />
          </div>
        )}
        right={(
          <div className="space-y-4">
            <InfoCard />
            <Tabs
              items={[
                { key: "results", label: "Results" },
              ]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && (
              <CircuitResistanceResults results={results} />
            )}
          </div>
        )}
      />
    );
  }
}
