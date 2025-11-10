// /src/pages/galvanic/GalvanicPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import GalvanicForm from "./GalvanicForm";
import GalvanicResults from "./GalvanicResults";
import GalvanicReference from "./GalvanicReference";
import { computeGalvanic, lifeSeries, MATERIALS } from "./utils";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

export default class GalvanicPage extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      submitting: false,
      results: null,
      savedInputs: null,
      error: null,
      activeTab: "results",
    };
    this.captureRef = React.createRef();
  }

  onSubmit = async (e) => {
    e.preventDefault();
    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);
        const area_m2 = Number(fd.get("area_m2"));
        const jd_mA_per_m2 = Number(fd.get("jd_mA_per_m2"));
        const coating_factor = Number(fd.get("coating_factor"));
        const design_life_years = Number(fd.get("design_life_years"));
        const material = fd.get("material");
        const anode_weight_kg = Number(fd.get("anode_weight_kg"));
        const eta = fd.get("eta");
        const etaNum = eta === null || eta === "" ? undefined : Number(eta);

        const submittedInputs = {
          area_m2,
          jd_mA_per_m2,
          coating_factor,
          design_life_years,
          material,
          anode_weight_kg,
          eta: etaNum,
        };

        // Local calculation only (no API here)
        const calc = computeGalvanic({
          area_m2,
          jd_mA_per_m2,
          coating_factor,
          design_life_years,
          material,
          eta: etaNum,
          anode_weight_kg,
        });

        const lifeSeriesData = lifeSeries({
          area_m2,
          jd_mA_per_m2,
          coating_factor,
          years_max: Math.max(5, design_life_years || 30),
          material,
          eta: etaNum,
          anode_weight_kg,
        });

        const results = { ...calc, lifeSeriesData };

        this.setState({
          results,
          savedInputs: submittedInputs, // HeaderSaveBar uses these
          activeTab: "results",
        });
      } catch (err) {
        this.setState({ error: err?.message || "Calculation failed" });
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  onResetAll = () =>
    this.setState({
      results: null,
      savedInputs: null,
      error: null,
      activeTab: "results",
    });

  setTab = (key) => this.setState({ activeTab: key });

  InfoCard = () => (
    <ModuleCard
      title="Galvanic Anode System"
      subtitle="I = A × Jd × f_c;  W_required = I × t × 8760 / (U × η);  N = W_required / W_single"
      actions={<ResetPill onClick={this.onResetAll} />}
    >
      <div className="text-sm md:text-base text-gray-700 dark:text-gray-300">
        <p>Material capacities (Ah/kg) and typical efficiencies:</p>
        <ul className="list-disc pl-6">
          {MATERIALS.map((m) => (
            <li key={m.value}>
              {m.label}: {m.capacity_Ah_per_kg} Ah/kg • η≈{(m.eta_default * 100).toFixed(0)}%
            </li>
          ))}
        </ul>
      </div>
    </ModuleCard>
  );

  render() {
    const { submitting, results, savedInputs, error, activeTab } = this.state;

    const headerActions = (
      <HeaderSaveBar
        moduleKey="galvanic_calc"
        moduleLabel="Galvanic Anode"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        // optional but explicit:
        formulaName="Galvanic Anode System Calculation"
        buildName={({ moduleLabel, inputs, project }) =>
          `${project?.name || "Default"} • ${inputs?.material || "—"} • ${inputs?.area_m2 || 0} m²`
        }
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
            <GalvanicForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} />
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
            {activeTab === "results" && <GalvanicResults results={results} />}
            {activeTab === "reference" && <GalvanicReference />}
          </div>
        }
      />
    );
  }
}
