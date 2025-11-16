// /src/pages/attenuation/AttenuationPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import AttenuationForm from "./AttenuationForm";
import AttenuationResults from "./AttenuationResults";
import AttenuationReference from "./AttenuationReference";
import { computeAttenuation } from "./utils";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

export default class AttenuationPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    };

    // Right column ref for screenshot in HeaderSaveBar
    this.captureRef = React.createRef();
  }

  onSubmit = (e) => {
    e.preventDefault();

    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);
        const rawInputs = Object.fromEntries(fd.entries());

        const calc = computeAttenuation(rawInputs);

        const distanceSeries = Array.isArray(calc?.data)
          ? calc.data.map((pt) => ({
              d: Number(pt.x_m || 0),
              value: Number(pt.V || 0),
            }))
          : [];

        // Enrich inputs for history naming (L, Rs, RL)
        const L_m = calc.Lx_m ?? 0;
        const Rs_per_m = calc.RS_ohm_per_m ?? 0;
        const RL_per_m =
          L_m > 0 ? (calc.RL_ohm ?? 0) / L_m : 0;

        const enrichedInputs = {
          ...rawInputs,
          L_m,
          Rs_per_m,
          RL_per_m,
        };

        const results = { ...calc, inputs: enrichedInputs, distanceSeries };

        this.setState({
          results,
          savedInputs: enrichedInputs,
          activeTab: "results",
        });
      } catch (err) {
        this.setState({
          error:
            err && err.message ? err.message : "Calculation failed",
        });
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  onResetAll = () => {
    this.setState({
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    });
  };

  setTab = (key) => this.setState({ activeTab: key });

  InfoCard = () => (
    <ModuleCard
      title="Attenuation & Pipeline Potential Profile"
      subtitle="Solves E(x) along the pipeline using AX, A₁, ATOT, IREQ, RS, RL and α from your design inputs."
      actions={<ResetPill onClick={this.onResetAll} />}
    >
      <div className="text-sm md:text-base text-gray-700 dark:text-gray-300">
        <p>
          Enter the geometric, electrical and coating parameters from the
          design sheet. The calculator reproduces the Excel calculations and
          generates the potential attenuation profile along the pipeline.
        </p>
      </div>
    </ModuleCard>
  );

  render() {
    const { submitting, results, error, activeTab, savedInputs } =
      this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="attenuation_calc"
        moduleLabel="Attenuation & Pipeline Potential profile"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName="Attenuation & Pipeline Potential profile"
        buildName={({ inputs, project }) => {
          const L = inputs?.L_m ? `${inputs.L_m} m` : "—";
          const Rs = inputs?.Rs_per_m ? `${inputs.Rs_per_m} Ω/m` : "—";
          const RL = inputs?.RL_per_m ? `${inputs.RL_per_m} Ω/m` : "—";
          return `${
            project?.name || "Default"
          } • L=${L} • Rs=${Rs} • RL=${RL}`;
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
            <AttenuationForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              initialValues={savedInputs || {}}
            />
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
              <AttenuationResults results={results} />
            )}
            {activeTab === "reference" && <AttenuationReference />}
          </div>
        }
      />
    );
  }
}
