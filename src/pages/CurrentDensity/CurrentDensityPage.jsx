import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import CurrentDensityForm from "./CurrentDensityForm";
import CurrentDensityResults from "./CurrentDensityResults";
import CurrentDensityInfoCard from "./CurrentDensityInfoCard";
import Tabs from "../../components/ui/Tabs";
import CurrentDensityReference from "./CurrentDensityReference";
import { TABLES, correctedCurrentDensityAtTemp, applyMoistureFactor } from "./utils";

export default class CurrentDensityPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
      selectedEnvironment: "soil",
    };
  }

  findRange = (environment, condition, coatingType) => {
    const rows = TABLES[environment] || [];
    const match = rows.find((r) => r.condition === condition && r.type === coatingType);
    return match ? match.range : null;
  };

  onSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const environment = fd.get("environment") || "soil";
    const condition = fd.get("condition") || "Excellent";
    const coatingType = fd.get("coatingType") || "";
    const temperature = Number(fd.get("temperature") || 25);
    const moisture = fd.get("moisture") || "dry";

    const range = this.findRange(environment, condition, coatingType);
    if (!range) {
      this.setState({ error: "Please select a coating type for the chosen condition.", results: null });
      return;
    }

    this.setState({ submitting: true, error: null }, () => {
      try {
        // Base recommendation: midpoint of range at 25C
        const jd25 = (Number(range[0]) + Number(range[1])) / 2;
        // Apply temperature correction
        let jdCorr = correctedCurrentDensityAtTemp(jd25, temperature);
        // Apply moisture factor if soil
        if (environment === "soil") {
          jdCorr = applyMoistureFactor(jdCorr, moisture);
        }
        this.setState({
          results: {
            range25: range,
            jdFinal: jdCorr,
          },
          selectedEnvironment: environment,
          activeTab: "results",
        });
      } catch (err) {
        this.setError(err && err.message ? err.message : "Calculation failed");
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  setError = (msg) => this.setState({ error: msg });

  onResetAll = () => {
    this.setState({ results: null, error: null, selectedEnvironment: "soil", activeTab: "results" });
  };
  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab, selectedEnvironment } = this.state;

    return (
      <CalculatorPanel
        left={(
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{error}</div>
            ) : null}
            <CurrentDensityForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} />
          </div>
        )}
        right={(
          <div className="space-y-4">
            <CurrentDensityInfoCard />
            <Tabs
              items={[
                { key: "results", label: "Results" },
                { key: "reference", label: "Reference" },
              ]}
              activeKey={activeTab}
              onChange={this.setTab}
            />

            {activeTab === "results" && (
              <CurrentDensityResults results={results} />
            )}
            {activeTab === "reference" && (
              <CurrentDensityReference environment={selectedEnvironment} />
            )}
          </div>
        )}
      />
    );
  }
}
