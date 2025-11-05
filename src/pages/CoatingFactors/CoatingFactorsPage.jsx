import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import CoatingFactorsForm from "./CoatingFactorsForm";
import CoatingFactorsResults from "./CoatingFactorsResults";
import CoatingFactorsInfoCard from "./CoatingFactorsInfoCard";
import CoatingFactorsReference from "./CoatingFactorsReference";
import { breakdownFactor, seriesOverLife } from "./utils";

export default class CoatingFactorsPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
      selectedTemperatureC: 25,
      selectedSoilType: "sandy",
    };
  }

  onSubmit = (e) => {
    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);
        const coatingType = fd.get("coatingType");
        const designLifeYears = Number(fd.get("designLifeYears"));
        const temperatureC = Number(fd.get("temperatureC"));
        const soilType = fd.get("soilType");

        const calc = breakdownFactor({ coatingType, designLifeYears, temperatureC, soilType });
        const series = seriesOverLife({ coatingType, designLifeYears, temperatureC, soilType });
        this.setState({
          results: {
            final: calc.final,
            series,
            unitLabel: "(dimensionless)",
          },
          selectedTemperatureC: temperatureC,
          selectedSoilType: soilType,
          activeTab: "results",
        });
      } catch (err) {
        this.setState({ error: err && err.message ? err.message : "Calculation failed" });
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab, selectedTemperatureC, selectedSoilType } = this.state;

    return (
      <CalculatorPanel

        left={(
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{error}</div>
            ) : null}
            <CoatingFactorsForm onSubmit={this.onSubmit} submitting={submitting} />
          </div>
        )}
        right={(
          <div className="space-y-4">
            <CoatingFactorsInfoCard />
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
              <CoatingFactorsReference temperatureC={selectedTemperatureC} soilType={selectedSoilType} />
            )}
          </div>
        )}
      />
    );
  }
}
