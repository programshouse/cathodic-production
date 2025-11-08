import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import SolarSizingForm from "./SolarSizingForm";
import SolarSizingResults from "./SolarSizingResults";
import SolarSizingReference from "./SolarSizingReference";
import { currentToA, voltageToV, hoursToH, efficiencyToUnit, computeSolarSizing, buildCsvRows, buildComponents } from "./utils";

function InfoCard({ onReset, onCsv }) {
  return (
    <ModuleCard
      title="Solar Sizing"
      subtitle="Daily energy, panel requirement, and battery capacity"
      actions={
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCsv} className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">CSV</button>
          <ResetPill onClick={onReset} />
        </div>
      }
    >
      <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Edaily = Ireq · Vreq · 24
Ppanel = Edaily / (PSH · Efficiency)
Npanels = ceil(Ppanel / PanelW)
Cbattery = (Edaily · Days) / (Vreq · 0.8)`}</pre>
    </ModuleCard>
  );
}

const Alert = ({ children }) => (
  <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{children}</div>
);

export default class SolarSizingPage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== 'undefined') {
      try { parsed = JSON.parse(window.localStorage.getItem('solar_sizing_calc') || 'null'); } catch { /* ignore */ }
    }
    this.state = {
      submitting: false,
      results: parsed?.results || null,
      error: null,
      savedInputs: parsed?.inputs || null,
      activeTab: 'results',
    };
  }

  onSubmit = (raw) => {
    const {
      I_req_value, I_req_unit,
      V_req_value, V_req_unit,
      location,
      peak_sun_hours,
      efficiency,
      autonomy_days,
      panel_watt,
    } = raw || {};

    if (!(Number(I_req_value)>0) || !(Number(V_req_value)>0) || !(Number(peak_sun_hours)>0) || !(Number(efficiency)>0) || !(Number(autonomy_days)>=0) || !(Number(panel_watt)>0)) {
      this.setState({ error: 'Please provide all required fields with valid values.' });
      return;
    }

    const inputs = { I_req_value, I_req_unit, V_req_value, V_req_unit, location, peak_sun_hours, efficiency, autonomy_days, panel_watt };

    const I_req_A = currentToA(I_req_value, I_req_unit);
    const V_req_V = voltageToV(V_req_value, V_req_unit);
    const PSH = hoursToH(peak_sun_hours);
    const eff = efficiencyToUnit(efficiency);

    const core = computeSolarSizing({ I_req_A, V_req_V, peak_sun_hours: PSH, efficiency: eff, autonomy_days: Number(autonomy_days||0), panel_watt: Number(panel_watt||0) });
    const csvRows = buildCsvRows(core);
    const components = buildComponents({ Npanels: core.Npanels, panel_watt: Number(panel_watt||0), V_req_V });
    const results = { ...core, csvRows, components, inputs };

    try { window.localStorage.setItem('solar_sizing_calc', JSON.stringify({ inputs, results })); } catch { /* ignore */ }
    this.setState({ results, savedInputs: inputs, error: null, activeTab: 'results' });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('solar_sizing_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, savedInputs: null });
  };

  componentWillUnmount() {
    try { window.localStorage.removeItem('solar_sizing_calc'); } catch { /* ignore */ }
  }

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;
    const rows = [
      ['metric','value','unit'],
      ['Edaily_Wh', Number(results.Edaily_Wh||0), 'Wh/day'],
      ['Ppanel_W', Number(results.Ppanel_W||0), 'W'],
      ['Npanels', Number(results.Npanels||0), '-'],
      ['Cbatt_Ah', Number(results.Cbatt_Ah||0), 'Ah'],
    ];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'solar-sizing-results.csv';
    document.body.appendChild(a); a.click(); document.body.removeChild(a); URL.revokeObjectURL(url);
  };

  setTab = (key) => this.setState({ activeTab: key });

  render() {
    const { submitting, results, error, savedInputs, activeTab } = this.state;

    return (
      <CalculatorPanel
        header={
          <div className="mb-6">
            <div className="relative overflow-hidden rounded-2xl">
              <div className="absolute inset-0 bg-gradient-to-r from-brand-600 via-brand-500 to-brand-400 opacity-90" />
              <div className="relative px-5 py-5 md:px-7 md:py-6">
                <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Solar Sizing</h2>
                <p className="text-brand-50/90 text-sm md:text-base mt-1">Enter load and site parameters to compute energy, panel power/count, and battery capacity.</p>
              </div>
            </div>
          </div>
        }
        left={
          <div>
            {error ? <Alert>{error}</Alert> : null}
            <SolarSizingForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} initialValues={savedInputs || {}} />
          </div>
        }
        right={
          <div className="space-y-4">
            <InfoCard onReset={this.onResetAll} onCsv={this.downloadResultsCsv} />
            <Tabs items={[{ key: 'results', label: 'Results' }, { key: 'reference', label: 'Reference' }]} activeKey={activeTab} onChange={this.setTab} />
            {activeTab === 'results' && <SolarSizingResults results={results} />}
            {activeTab === 'reference' && <SolarSizingReference />}
          </div>
        }
      />
    );
  }
}
