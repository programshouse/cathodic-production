// /src/pages/current-density/CurrentDensityPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import CurrentDensityForm from "./CurrentDensityForm";
import CurrentDensityResults from "./CurrentDensityResults";
import CurrentDensityInfoCard from "./CurrentDensityInfoCard";
import CurrentDensityReference from "./CurrentDensityReference";
import { TABLES, correctedCurrentDensityAtTemp, applyMoistureFactor } from "./utils";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

export default class CurrentDensityPage extends React.Component {
  constructor(props) {
    super(props);
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("current_density_calc")
        : null;
    const parsed = saved ? JSON.parse(saved) : null;

    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      selectedEnvironment: parsed?.inputs?.environment || "soil",
      savedInputs: parsed?.inputs || null,
    };

    // Right column ref for screenshot in HeaderSaveBar
    this.captureRef = React.createRef();
  }

  findRange = (environment, condition, coatingType) => {
    const rows = TABLES[environment] || [];
    const match = rows.find(
      (r) => r.condition === condition && r.type === coatingType
    );
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
      this.setState({
        error: "Please select a coating type for the chosen condition.",
        results: null,
      });
      return;
    }

    this.setState({ submitting: true, error: null }, () => {
      try {
        // Base recommendation: midpoint of range at 25°C
        const jd25 = (Number(range[0]) + Number(range[1])) / 2;
        // Temperature correction
        let jdCorr = correctedCurrentDensityAtTemp(jd25, temperature);
        // Moisture factor (soil only)
        if (environment === "soil") {
          jdCorr = applyMoistureFactor(jdCorr, moisture);
        }

        const results = {
          range25: range,
          jdFinal: jdCorr,
        };
        const inputs = {
          environment,
          condition,
          coatingType,
          temperature,
          moisture,
        };

        // persist
        try {
          window.localStorage.setItem(
            "current_density_calc",
            JSON.stringify({ inputs, results })
          );
        } catch {
          /* ignore */
        }

        this.setState({
          results,
          selectedEnvironment: environment,
          savedInputs: inputs,
          activeTab: "results",
        });
      } catch (err) {
        this.setError(err?.message ? err.message : "Calculation failed");
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  setError = (msg) => this.setState({ error: msg });

  onResetAll = () => {
    try {
      window.localStorage.removeItem("current_density_calc");
    } catch {
      /* ignore */
    }
    this.setState({
      results: null,
      error: null,
      selectedEnvironment: "soil",
      activeTab: "results",
      savedInputs: null,
    });
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab, selectedEnvironment, savedInputs } =
      this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="current_density_calc"
        moduleLabel="Current Density"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        // explicit backend formula name
        formulaName="Current Density Calculation"
        modulePath="/pages/current-density"
        // nice record name for server history
        buildName={({ inputs, project }) => {
          const env = inputs?.environment || "soil";
          const cond = inputs?.condition || "—";
          const type = inputs?.coatingType || "—";
          const t = inputs?.temperature ?? 25;
          const moist = inputs?.moisture || "—";
          return `${project?.name || "Default"} • ${env}/${cond}/${type} • ${t}°C • ${moist}`;
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
            <CurrentDensityForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              initialValues={savedInputs || {}}
            />
          </div>
        }
        right={
          // Attach ref so Save can capture a screenshot of the results area
          <div className="space-y-4" ref={this.captureRef}>
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
        }
      />
    );
  }
}
