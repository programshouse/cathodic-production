import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import ImpressedForm from "./ImpressedForm";
import ImpressedResults from "./ImpressedResults";
import ImpressedReference from "./ImpressedReference";
import { computeImpressed } from "./utils";

export default class ImpressedPage extends React.Component {
  constructor(props) {
    super(props);
    const saved = (typeof window !== 'undefined') ? window.localStorage.getItem('impressed_current_calc') : null;
    const parsed = saved ? JSON.parse(saved) : null;
    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      activeTab: "results",
      savedInputs: parsed?.inputs || null,
    };
  }

  onSubmit = (e) => {
    e.preventDefault();
    this.setState({ submitting: true, error: null }, () => {
      try {
        const fd = new FormData(e.target);
        // Basic required field validation before conversion
        const required = [
          ['area_value', 'Total Surface Area'],
          ['area_unit', 'Area Unit'],
          ['coating_factor', 'Coating Factor'],
          ['design_life_years', 'Design Life'],
          ['jd_value', 'Design Current Density'],
          ['jd_unit', 'Jd Unit'],
          ['R_ohm', 'Circuit Resistance'],
          ['E_native_V', 'Native Potential'],
          ['E_target_V', 'Target Potential'],
          ['safety_factor', 'Safety Factor'],
        ];
        const anodeTypeSel = fd.get('anode_type') || 'FeSiCr';
        if (anodeTypeSel === 'MMO') {
          required.push(['I_single_A', 'MMO Current per Anode']);
        } else {
          required.push(['capacity_Ah_per_kg', 'FeSiCr Capacity']);
          required.push(['eta', 'FeSiCr Utilization']);
          required.push(['unit_weight_kg', 'FeSiCr Unit Weight']);
        }
        const missing = required.filter(([k]) => {
          const v = fd.get(k);
          return v === null || v === undefined || String(v).trim() === '';
        });
        if (missing.length) {
          const first = missing[0][1];
          this.setState({ submitting: false, error: `Please fill the required field: ${first}.` });
          return;
        }
        // Numeric validation
        const numFields = [
          ['area_value', '> 0'],
          ['coating_factor', '> 0'],
          ['design_life_years', '> 0'],
          ['jd_value', '> 0'],
          ['R_ohm', '>= 0'],
          ['safety_factor', '>= 1'],
        ];
        if (anodeTypeSel === 'MMO') {
          numFields.push(['I_single_A', '> 0']);
        } else {
          numFields.push(['capacity_Ah_per_kg', '> 0']);
          numFields.push(['eta', '> 0']);
          numFields.push(['unit_weight_kg', '> 0']);
        }
        for (const [k, rule] of numFields) {
          const raw = Number(fd.get(k));
          if (!isFinite(raw)) {
            this.setState({ submitting: false, error: `Invalid number for ${k}.` });
            return;
          }
          if (rule === '> 0' && !(raw > 0)) { this.setState({ submitting: false, error: `${k} must be greater than 0.` }); return; }
          if (rule === '>= 0' && !(raw >= 0)) { this.setState({ submitting: false, error: `${k} must be at least 0.` }); return; }
          if (rule === '>= 1' && !(raw >= 1)) { this.setState({ submitting: false, error: `${k} must be at least 1.` }); return; }
        }
        // Units conversion
        const areaVal = Number(fd.get('area_value') || 0);
        const areaUnit = fd.get('area_unit') || 'm2';
        const area_m2 = areaUnit === 'ft2' ? areaVal * 0.09290304 : areaVal;

        const jdVal = Number(fd.get('jd_value') || 0);
        const jdUnit = fd.get('jd_unit') || 'mA/m2';
        const jd_mA_per_m2 = jdUnit === 'mA/ft2' ? jdVal * 10.7639104167 : jdVal;

        const inputs = {
          structure: fd.get('structure') || 'pipeline',
          environment: fd.get('environment') || 'soil',
          area_m2,
          area_unit: areaUnit,
          coating_factor: Number(fd.get('coating_factor') || 1),
          design_life_years: Number(fd.get('design_life_years') || 0),
          jd_mA_per_m2,
          jd_unit: jdUnit,
          rho_ohm_m: fd.get('rho_ohm_m'),
          R_ohm: Number(fd.get('R_ohm') || 0),
          E_native_V: Number(fd.get('E_native_V') || 0),
          E_target_V: Number(fd.get('E_target_V') || 0),
          anode_type: anodeTypeSel,
          I_single_A: Number(fd.get('I_single_A') || ((fd.get('environment') || 'soil') === 'seawater' ? 50 : 8)),
          safety_factor: Number(fd.get('safety_factor') || 1.1),
          capacity_Ah_per_kg: Number(fd.get('capacity_Ah_per_kg') || 1500),
          eta: Number(fd.get('eta') || 0.5),
          unit_weight_kg: Number(fd.get('unit_weight_kg') || 0),
        };
        const calc = computeImpressed(inputs);
        const results = { ...calc, inputs };
        try { window.localStorage.setItem('impressed_current_calc', JSON.stringify({ inputs, results })); } catch { /* ignore */ }
        this.setState({ results, savedInputs: inputs, activeTab: 'results' });
      } catch (err) {
        this.setState({ error: err && err.message ? err.message : 'Calculation failed' });
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('impressed_current_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, activeTab: 'results', savedInputs: null });
  };
  setTab = (key) => this.setState({ activeTab: key });

  InfoCard = () => (
    <ModuleCard title="Impressed Current System" subtitle="I = A×Jd×f_c; V = I×R + (E_target − E_native)" actions={<ResetPill onClick={this.onResetAll} />}> 
      <div className="text-sm text-gray-700 dark:text-gray-300">
        <p>Design outputs include current, system voltage, power and annual energy. Anode quantity by FeSiCr mass or MMO current rating.</p>
      </div>
    </ModuleCard>
  );

  render() {
    const { submitting, results, error, activeTab, savedInputs } = this.state;

    return (
      <CalculatorPanel
        left={(
          <div>
            {error ? (
              <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{error}</div>
            ) : null}
            <ImpressedForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} initialValues={savedInputs || {}} />
          </div>
        )}
        right={(
          <div className="space-y-4">
            <this.InfoCard />
            <Tabs items={[{ key: 'results', label: 'Results' }, { key: 'reference', label: 'Reference' }]} activeKey={activeTab} onChange={this.setTab} />
            {activeTab === 'results' && (<ImpressedResults results={results} />)}
            {activeTab === 'reference' && (<ImpressedReference />)}
          </div>
        )}
      />
    );
  }
}
