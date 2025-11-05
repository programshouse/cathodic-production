import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import GroundbedForm from "./GroundbedForm";
import GroundbedResults from "./GroundbedResults";
import GroundbedInfoCard from "./GroundbedInfoCard";
import { computeAll, seriesForN } from "./utils";

export default class GroundbedPage extends React.Component {
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
        const config = fd.get("config");
        const rho_cm = Number(fd.get("rho_cm"));
        const L_m = Number(fd.get("L_m"));
        const d_m = Number(fd.get("d_m"));
        const N = Number(fd.get("N"));
        const spacing_m = Number(fd.get("spacing_m"));
        const F = fd.get("F");
        const Fnum = F === null || F === "" ? undefined : Number(F);

        const calc = computeAll({ config, rho_cm, L_m, d_m, N, spacing_m, F: Fnum });
        const series = (config.includes("multiple")) ? seriesForN({ maxN: Math.max(5, Math.min(40, N || 20)), R_single: calc.R_single, spacing_m, L_m }) : [];
        this.setState({
          results: {
            R_single: calc.R_single,
            R_total: calc.R_total,
            series,
            unitLabel: "Ω",
          },
          activeTab: "results",
        });
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

    return (
      <CalculatorPanel

        left={(
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{error}</div>
            ) : null}
            <GroundbedForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} />
          </div>
        )}
        right={(
          <div className="space-y-4">
            <GroundbedInfoCard />
            <Tabs
              items={[
                { key: "results", label: "Results" },
                { key: "reference", label: "Reference" },
              ]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && (
              <GroundbedResults results={results} />
            )}
            {activeTab === "reference" && (
              <div className="text-sm text-gray-600 dark:text-gray-400">No static reference table is provided for this module.</div>
            )}
          </div>
        )}
      />
    );
  }
}
