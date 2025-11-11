// /src/pages/groundbed/GroundbedPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import GroundbedForm from "./GroundbedForm";
import GroundbedResults from "./GroundbedResults";
import GroundbedInfoCard from "./GroundbedInfoCard";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";
import { computeAll, seriesForN, seriesForSpacing } from "./utils";

export default class GroundbedPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null, // ✅ used by HeaderSaveBar
    };
    // Right column ref for screenshot in HeaderSaveBar
    this.captureRef = React.createRef();
  }

  onSubmit = (e) => {
    e.preventDefault();
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

        // Basic validation
        if (!config || !(rho_cm > 0) || !(L_m > 0) || !(d_m > 0)) {
          this.setState({
            submitting: false,
            error: "Please fill all required fields with valid positive numbers.",
          });
          return;
        }

        const calc = computeAll({ config, rho_cm, L_m, d_m, N, spacing_m, F: Fnum });

        // Series by N (for multiple configs)
        const series =
          config?.includes("multiple")
            ? seriesForN({
                maxN: Math.max(5, Math.min(40, N || 20)),
                R_single: calc.R_single,
                spacing_m,
                L_m,
              })
            : [];

        // Series by spacing
        const sMin = Math.max(0.5, (spacing_m || 1) * 0.25);
        const sMax = Math.max(sMin + 5, (spacing_m || 1) * 4);
        const sStep = Math.max(0.1, (spacing_m || 1) / 10);
        const spacingSeries = seriesForSpacing({
          config,
          rho_cm,
          L_m,
          d_m,
          spacingMin: sMin,
          spacingMax: sMax,
          step: sStep,
          N,
        });

        const results = {
          R_single: calc.R_single,
          R_total: calc.R_total,
          series,
          spacingSeries,
          spacing_m,
          unitLabel: "Ω",
        };

        const inputs = {
          config,
          rho_cm,
          L_m,
          d_m,
          N,
          spacing_m,
          F: Fnum,
        };

        this.setState({
          results,
          savedInputs: inputs, // ✅ for HeaderSaveBar naming
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

  onResetAll = () =>
    this.setState({
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    });

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="groundbed_resistance_calc"
        moduleLabel="Groundbed Resistance"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        // Explicit backend formula name
        formulaName="Groundbed Resistance"
        modulePath="/pages/groundbed-resistance"
        // Nice record name in server history
        buildName={({ inputs, project }) => {
          const cfg = inputs?.config || "—";
          const n = Number(inputs?.N ?? 0) || 1;
          const s = Number(inputs?.spacing_m ?? 0) || 0;
          const L = Number(inputs?.L_m ?? 0) || 0;
          return `${project?.name || "Default"} • ${cfg} • N=${n} • s=${s} m • L=${L} m`;
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
            <GroundbedForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
            />
          </div>
        }
        right={
          // Attach ref so Save can capture a screenshot of the results area
          <div className="space-y-4" ref={this.captureRef}>
            <GroundbedInfoCard />
            <Tabs
              items={[
                { key: "results", label: "Results" },
                { key: "reference", label: "Reference" },
              ]}
              activeKey={activeTab}
              onChange={this.setTab}
            />
            {activeTab === "results" && <GroundbedResults results={results} />}
            {activeTab === "reference" && (
              <div className="text-sm text-gray-600 dark:text-gray-400">
                No static reference table is provided for this module.
              </div>
            )}
          </div>
        }
      />
    );
  }
}
