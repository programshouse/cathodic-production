// /src/pages/attenuation/AttenuationPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import AttenuationForm from "./AttenuationForm";
import AttenuationResults from "./AttenuationResults";
import AttenuationReference from "./AttenuationReference";
import {
  computeAttenuation,
  toMeters,
  toPerMeter,
  toVolts,
  Rs_from_geometry,
  RL_from_coating,
} from "./utils";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

export default class AttenuationPage extends React.Component {
  constructor(props) {
    super(props);
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("attenuation_calc")
        : null;
    const parsed = saved ? JSON.parse(saved) : null;

    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      savedInputs: parsed?.inputs || null,
    };

    // Right column ref for screenshot in HeaderSaveBar
    this.captureRef = React.createRef();
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);
        const L_m = toMeters(fd.get("L_value"), fd.get("L_unit"));
        const V0_V = toVolts(fd.get("V0_value"), fd.get("V0_unit"));
        const mode = fd.get("mode") || "direct";
        const points = Number(fd.get("points") || 50);

        let Rs_per_m, RL_per_m;
        if (mode === "derived") {
          const OD_m = toMeters(fd.get("OD_value"), fd.get("OD_unit"));
          const t_m = toMeters(fd.get("t_value"), fd.get("t_unit"));
          const rho_steel_ohm_m = Number(fd.get("rho_steel_ohm_m") || 0);
          const Rc_per_area_ohm_m2 = Number(fd.get("Rc_per_area_ohm_m2") || 0);
          Rs_per_m = Rs_from_geometry({ rho_steel_ohm_m, OD_m, t_m });
          RL_per_m = RL_from_coating({ Rc_per_area_ohm_m2, OD_m });
          if (
            !(OD_m > 0) ||
            !(t_m > 0) ||
            !(rho_steel_ohm_m > 0) ||
            !(Rc_per_area_ohm_m2 > 0)
          ) {
            this.setState({
              submitting: false,
              error:
                "Please fill valid geometry and coating values for derived mode.",
            });
            return;
          }
        } else {
          Rs_per_m = toPerMeter(fd.get("Rs_value"), fd.get("Rs_unit"));
          RL_per_m = toPerMeter(fd.get("RL_value"), fd.get("RL_unit"));
        }

        // rudimentary validation
        if (!(L_m > 0) || !(points >= 2) || !(RL_per_m > 0)) {
          this.setState({
            submitting: false,
            error:
              "Please fill all required fields with valid positive numbers.",
          });
          return;
        }

        const inputs = {
          L_m,
          V0_V,
          Rs_per_m,
          RL_per_m,
          points,
          mode,
          L_unit: fd.get("L_unit"),
          V0_unit: fd.get("V0_unit"),
          Rs_unit: fd.get("Rs_unit"),
          RL_unit: fd.get("RL_unit"),
          OD_value: fd.get("OD_value"),
          OD_unit: fd.get("OD_unit"),
          t_value: fd.get("t_value"),
          t_unit: fd.get("t_unit"),
          rho_steel_ohm_m: fd.get("rho_steel_ohm_m"),
          Rc_per_area_ohm_m2: fd.get("Rc_per_area_ohm_m2"),
        };

        const calc = computeAttenuation(inputs);
        const results = { ...calc, inputs };

        try {
          window.localStorage.setItem(
            "attenuation_calc",
            JSON.stringify({ inputs, results })
          );
        } catch {
          /* ignore */
        }

        this.setState({ results, savedInputs: inputs, activeTab: "results" });
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
    try {
      window.localStorage.removeItem("attenuation_calc");
    } catch {
      /* ignore */
    }
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
      subtitle="Solves V(x) along pipeline using Rs, RL, length L, and source V₀ (direct or derived)."
      actions={<ResetPill onClick={this.onResetAll} />}
    >
      <div className="text-sm md:text-base text-gray-700 dark:text-gray-300">
        <p>
          Use <strong>direct</strong> mode to provide Rs and RL directly, or{" "}
          <strong>derived</strong> mode to compute them from geometry and
          coating parameters.
        </p>
      </div>
    </ModuleCard>
  );

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="attenuation_calc"
        moduleLabel="Attenuation & Pipeline Potential profile"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        // Explicit name used by server history (optional override)
        formulaName="Attenuation & Pipeline Potential profile"
        // Build a good record "name" in server history
        buildName={({ inputs, project }) => {
          const L = inputs?.L_m ? `${inputs.L_m} m` : "—";
          const Rs = inputs?.Rs_per_m ? `${inputs.Rs_per_m} Ω/m` : "—";
          const RL = inputs?.RL_per_m ? `${inputs.RL_per_m} Ω/m` : "—";
          return `${project?.name || "Default"} • L=${L} • Rs=${Rs} • RL=${RL}`;
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
          // Attach ref so Save can capture a screenshot of the results area
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
            {activeTab === "results" && <AttenuationResults results={results} />}
            {activeTab === "reference" && <AttenuationReference />}
          </div>
        }
      />
    );
  }
}
