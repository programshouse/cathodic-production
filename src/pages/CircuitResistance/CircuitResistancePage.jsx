// /src/pages/circuit-resistance/CircuitResistancePage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import CircuitResistanceForm from "./CircuitResistanceForm";
import CircuitResistanceResults from "./CircuitResistanceResults";
import { computeCircuit } from "./utils";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

export default class CircuitResistancePage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("circuit_resistance_calc");
        parsed = saved ? JSON.parse(saved) : null;
      } catch { /* ignore */ }
    }

    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      savedInputs: parsed?.inputs || null,
    };

    // right column capture for PDF/screenshot in HeaderSaveBar
    this.captureRef = React.createRef();
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

        // Basic validation
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

        const calc = computeCircuit(inputs);
        const results = { ...calc, inputs };

        try {
          if (typeof window !== "undefined") {
            window.localStorage.setItem(
              "circuit_resistance_calc",
              JSON.stringify({ inputs, results })
            );
          }
        } catch { /* ignore */ }

        this.setState({
          results,
          activeTab: "results",
          savedInputs: inputs,
          submitting: false,
        });
      } catch (err) {
        this.setState({
          error: err?.message || "Calculation failed",
          submitting: false,
        });
      }
    });
  };

  onResetAll = () => {
    try { if (typeof window !== "undefined") window.localStorage.removeItem("circuit_resistance_calc"); } catch {}
    this.setState({
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
      submitting: false,
    });
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="circuit_resistance_calc"
        moduleLabel="Circuit Resistance"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName="Circuit Resistance Module"
        modulePath="/pages/circuit-resistance"
        buildName={({ inputs, project }) => {
          const L = inputs?.length_m ? `${inputs.length_m} m` : "—";
          const A = inputs?.cross_section_mm2 ? `${inputs.cross_section_mm2} mm²` : "—";
          const mat = inputs?.material || "—";
          const conn = inputs?.connection || "—";
          const n = inputs?.number_of_anodes ?? "—";
          return `${project?.name || "Default"} • L=${L} • A=${A} • ${mat} • ${conn} • n=${n}`;
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
            <CircuitResistanceForm
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
              items={[
                { key: "results", label: "Results" },
                // { key: "reference", label: "Reference" },
              ]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && <CircuitResistanceResults results={results} />}
            {/* {activeTab === "reference" && <CircuitResistanceReference />} */}
          </div>
        }
      />
    );
  }
}
