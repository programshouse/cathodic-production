// /src/pages/coating-factors/CoatingFactorsPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import CoatingFactorsForm from "./CoatingFactorsForm";
import CoatingFactorsResults from "./CoatingFactorsResults";
import CoatingFactorsInfoCard from "./CoatingFactorsInfoCard";
import CoatingFactorsReference from "./CoatingFactorsReference";
import { breakdownFactor, seriesOverLife } from "./utils";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

export default class CoatingFactorsPage extends React.Component {
  constructor(props) {
    super(props);

    // restore last run (if any)
    let parsed = null;
    if (typeof window !== "undefined") {
      try {
        const saved = window.localStorage.getItem("coating_factors_calc");
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

    // right pane capture for HeaderSaveBar (PDF & server screenshot)
    this.captureRef = React.createRef();
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);
        const coatingType = fd.get("coatingType");
        const designLifeYears = Number(fd.get("designLifeYears"));

        // basic validation
        if (!coatingType || !(designLifeYears > 0)) {
          this.setState({
            submitting: false,
            error: "Please select coating type and enter a design life > 0.",
          });
          return;
        }

        const inputs = { coatingType, designLifeYears };

        const calc = breakdownFactor(inputs);
        const series = seriesOverLife(inputs);
        const results = {
          final: calc.final,
          series,
          unitLabel: "(dimensionless)",
        };

        // persist
        try {
          window.localStorage.setItem(
            "coating_factors_calc",
            JSON.stringify({ inputs, results })
          );
        } catch { /* ignore */ }

        this.setState({
          results,
          savedInputs: inputs,
          activeTab: "results",
        });
      } catch (err) {
        this.setState({
          error: err?.message || "Calculation failed",
        });
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem("coating_factors_calc"); } catch { /* ignore */ }
    this.setState({
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    });
  };

  setTab = (key) => this.setState({ activeTab: key });

  InfoCard = () => (
    <ModuleCard
      title="Coating Factors"
      subtitle="Breakdown factor now and progression over design life, adjusted for temperature & soil type."
      actions={<ResetPill onClick={this.onResetAll} />}
    >
      <div className="text-sm md:text-base text-gray-700 dark:text-gray-300">
        Choose coating type, design life, temperature, and soil type. Results show
        the final breakdown factor and its time-series projection.
      </div>
    </ModuleCard>
  );

  render() {
    const {
      submitting,
      results,
      error,
      activeTab,
      savedInputs,
    } = this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="coating_factors_calc"
        moduleLabel="Coating Factors"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        // explicit name for backend "formula_name"
        formulaName="Coating Factors Calculation"
        modulePath="/pages/coating-factors"
        // good record "name" for server history
        buildName={({ inputs, project }) => {
          const ct = inputs?.coatingType || "—";
          const life = inputs?.designLifeYears ?? "—";
          return `${project?.name || "Default"} • ${ct} • life=${life}y`;
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
            <CoatingFactorsForm onSubmit={this.onSubmit} submitting={submitting} />
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
              <CoatingFactorsResults results={results} />
            )}
            {activeTab === "reference" && (
              <CoatingFactorsReference />
            )}
          </div>
        }
      />
    );
  }
}
