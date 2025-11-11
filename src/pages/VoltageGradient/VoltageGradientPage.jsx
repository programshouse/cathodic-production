// /src/pages/voltage-gradient/VoltageGradientPage.jsx
import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import HeaderSaveBar from "../../components/ui/HeaderSaveBar";

import VoltageGradientForm from "./VoltageGradientForm";
import VoltageGradientResults from "./VoltageGradientResults";
import VoltageGradientReference from "./VoltageGradientReference";

import {
  computeVoltageGradient,
  currentToA,
  resistivityToOhmM,
  lengthToM,
} from "./utils";

export default class VoltageGradientPage extends React.Component {
  constructor(props) {
    super(props);
    const saved =
      typeof window !== "undefined"
        ? window.localStorage.getItem("voltage_gradient_calc")
        : null;
    const parsed = saved ? JSON.parse(saved) : null;

    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      savedInputs: parsed?.inputs || null,
    };

    // Right pane ref for HeaderSaveBar screenshot/PDF capture
    this.captureRef = React.createRef();
  }

  // Unified handler: supports both (e) form submit and (inputsObj) direct-call
  onSubmit = (arg) => {
    // Form submit path
    if (arg && typeof arg.preventDefault === "function") {
      arg.preventDefault();
      const e = arg;

      this.setState({ submitting: true, error: null }, () => {
        try {
          const fd = new FormData(e.target);

          const sourceType = fd.get("sourceType") || "";
          const I = Number(fd.get("I") || 0);
          const IUnit = fd.get("IUnit") || "A";
          const rho = Number(fd.get("rho") || 0);
          const rhoUnit = fd.get("rhoUnit") || "ohm_m";
          const spacing = Number(fd.get("spacing") || 0);
          const spacingUnit = fd.get("spacingUnit") || "m";
          const pipelineDepth = Number(fd.get("pipelineDepth") || 0);
          const pipelineDepthUnit = fd.get("pipelineDepthUnit") || "m";
          const anodeDepth = Number(fd.get("anodeDepth") || 0);
          const anodeDepthUnit = fd.get("anodeDepthUnit") || "m";

          // Validation
          if (
            !sourceType ||
            !(I > 0) ||
            !(rho > 0) ||
            !(pipelineDepth >= 0) ||
            !(anodeDepth >= 0)
          ) {
            this.setState({
              submitting: false,
              error: "Please fill all required fields with valid values.",
              activeTab: "results",
            });
            return;
          }
          if (
            (sourceType === "distributed" || sourceType === "shallow") &&
            !(spacing > 0)
          ) {
            this.setState({
              submitting: false,
              error: "Anode spacing s is required for the selected source type.",
              activeTab: "results",
            });
            return;
          }

          // Convert to SI
          const I_SI = currentToA(I, IUnit);
          const rho_SI = resistivityToOhmM(rho, rhoUnit);
          const s_SI =
            sourceType === "distributed" || sourceType === "shallow"
              ? lengthToM(spacing, spacingUnit)
              : 0;
          const pipeDepth_SI = lengthToM(pipelineDepth, pipelineDepthUnit);
          const anodeDepth_SI = lengthToM(anodeDepth, anodeDepthUnit);

          const inputs = {
            sourceType,
            I,
            IUnit,
            rho,
            rhoUnit,
            spacing,
            spacingUnit,
            pipelineDepth,
            pipelineDepthUnit,
            anodeDepth,
            anodeDepthUnit,
          };

          const results = computeVoltageGradient({
            sourceType,
            I: I_SI,
            rho: rho_SI,
            spacing: s_SI,
            pipelineDepth: pipeDepth_SI,
            anodeDepth: anodeDepth_SI,
          });

          try {
            window.localStorage.setItem(
              "voltage_gradient_calc",
              JSON.stringify({ inputs, results })
            );
          } catch {}

          this.setState({
            submitting: false,
            results,
            savedInputs: inputs,
            error: null,
            activeTab: "results",
          });
        } catch (err) {
          this.setState({
            submitting: false,
            error: err?.message || "Calculation failed",
          });
        }
      });
      return;
    }

    // Direct-call path (old pattern)
    const formInputs = arg || {};
    const {
      sourceType,
      I,
      IUnit,
      rho,
      rhoUnit,
      spacing,
      spacingUnit,
      pipelineDepth,
      pipelineDepthUnit,
      anodeDepth,
      anodeDepthUnit,
    } = formInputs;

    if (
      !sourceType ||
      !(I > 0) ||
      !(rho > 0) ||
      !(pipelineDepth >= 0) ||
      !(anodeDepth >= 0)
    ) {
      this.setState({
        error: "Please fill all required fields with valid values.",
        activeTab: "results",
      });
      return;
    }
    if (
      (sourceType === "distributed" || sourceType === "shallow") &&
      !(spacing > 0)
    ) {
      this.setState({
        error: "Anode spacing s is required for the selected source type.",
        activeTab: "results",
      });
      return;
    }

    const I_SI = currentToA(I, IUnit);
    const rho_SI = resistivityToOhmM(rho, rhoUnit);
    const s_SI =
      sourceType === "distributed" || sourceType === "shallow"
        ? lengthToM(spacing, spacingUnit)
        : 0;
    const pipeDepth_SI = lengthToM(pipelineDepth, pipelineDepthUnit);
    const anodeDepth_SI = lengthToM(anodeDepth, anodeDepthUnit);

    const results = computeVoltageGradient({
      sourceType,
      I: I_SI,
      rho: rho_SI,
      spacing: s_SI,
      pipelineDepth: pipeDepth_SI,
      anodeDepth: anodeDepth_SI,
    });

    try {
      window.localStorage.setItem(
        "voltage_gradient_calc",
        JSON.stringify({ inputs: formInputs, results })
      );
    } catch {}

    this.setState({
      results,
      savedInputs: formInputs,
      error: null,
      activeTab: "results",
    });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem("voltage_gradient_calc"); } catch {}
    this.setState({
      results: null,
      error: null,
      activeTab: "results",
      savedInputs: null,
    });
  };

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;
    const rows = [
      ["metric", "value", "unit"],
      ["Vm_max",  Number(results.Vm_max  || 0), "V/m"],
      ["Vm_pipe", Number(results.Vm_pipe || 0), "V/m"],
      ["V_pipe",  Number(results.V_pipe  || 0), "V"],
      ["d_pipe",  Number(results.d_pipe  || 0), "m"],
    ];
    const csv  = rows.map(r => r.map(c => `"${String(c ?? "").replaceAll('"','""')}"`).join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url; a.download = "voltage-gradient-results.csv";
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  setTab = (key) => this.setState({ activeTab: key });

  InfoCard = () => (
    <ModuleCard
      title="Voltage Gradient"
      subtitle="Potential/gradient around anodes"
      actions={
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={this.downloadResultsCsv}
            className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800"
          >
            CSV
          </button>
          <ResetPill onClick={this.onResetAll} />
        </div>
      }
    >
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <p>
          Supports distributed, shallow, and point sources. Converts all inputs
          to SI and returns gradient/potential vs. depth and spacing.
        </p>
      </div>
    </ModuleCard>
  );

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    // ✅ Header Save Bar (under the banner). Captures the right pane so PDF shows charts (no raw series numbers).
    const headerActions = (
      <HeaderSaveBar
        moduleKey="voltage_gradient_calc"
        moduleLabel="Voltage Gradient"
        inputs={savedInputs}
        results={results}
        captureRef={this.captureRef}
        formulaName="Voltage Gradient"
        modulePath="/pages/voltage-gradient"
        buildName={({ inputs, project }) => {
          const t   = inputs?.sourceType || "—";
          const I   = inputs?.I != null ? `${inputs.I} ${inputs.IUnit || ""}`.trim() : "—";
          const rho = inputs?.rho != null ? `${inputs.rho} ${inputs.rhoUnit || ""}`.trim() : "—";
          const s   = inputs?.spacing != null ? `${inputs.spacing} ${inputs.spacingUnit || ""}`.trim() : "—";
          return `${project?.name || "Default"} • ${t} • I=${I} • ρ=${rho} • s=${s}`;
        }}
      />
    );

    return (
      <CalculatorPanel
        header={
          <div className="mb-6">

          </div>
        }
        headerActions={headerActions}
        left={
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">
                {error}
              </div>
            ) : null}

            {/* Works with both event-submit and direct object submit */}
            <VoltageGradientForm
              onSubmit={this.onSubmit}
              submitting={submitting}
              onReset={this.onResetAll}
              initialValues={savedInputs || {}}
            />
          </div>
        }
        right={
          // 📸 Everything here is included in the exported PDF image (charts over raw series numbers)
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
            {activeTab === "results" && <VoltageGradientResults results={results} />}
            {activeTab === "reference" && <VoltageGradientReference />}
          </div>
        }
      />
    );
  }
}
