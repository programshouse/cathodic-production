import React from "react";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
import Tabs from "../../components/ui/Tabs";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";

import TankMMOForm from "./TankMMOForm";
import TankMMOResults from "./TankMMOResults";
import TankMMOReference from "./TankMMOReference";
import { lengthToM, currentToA, computeTankMMO, buildCsvRows } from "./utils";

function InfoCard({ onReset, onCsv }) {
  return (
    <ModuleCard
      title="Tank MMO Anode Sizing"
      subtitle="Ribbons, Ti bars, and connectors"
      actions={
        <div className="flex items-center gap-2">
          <button type="button" onClick={onCsv} className="text-xs px-2 py-1 rounded-full border bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800">CSV</button>
          <ResetPill onClick={onReset} />
        </div>
      }
    >
      <pre className="text-sm md:text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`C = π·D
Rings: L_total = N_rings · C
Longitudinal: L_total = N_ribbons · TankLength
N_feeders = ceil(I_total / I_connmax)
L_Ti = Bars · ConnectionLength`}</pre>
    </ModuleCard>
  );
}

const Alert = ({ children }) => (
  <div className="mb-3 rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{children}</div>
);

export default class TankMMOPage extends React.Component {
  constructor(props) {
    super(props);
    let parsed = null;
    if (typeof window !== 'undefined') {
      try { parsed = JSON.parse(window.localStorage.getItem('tank_mmo_calc') || 'null'); } catch { /* ignore */ }
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
      diameter_value, diameter_unit,
      tank_length_value, tank_length_unit,
      install_type,
      spacing_value, spacing_unit,
      nrings_manual,
      num_bars,
      connection_length_value, connection_length_unit,
      Itotal_value, Itotal_unit,
      Iconnector_max_value,
    } = raw || {};

    if (!(Number(diameter_value)>0) || !(Number(tank_length_value)>0) || !(Number(spacing_value)>0) || !(Number(num_bars)>=0) || !(Number(connection_length_value)>=0) || !(Number(Iconnector_max_value)>0)) {
      this.setState({ error: 'Please provide all required fields with valid values.' });
      return;
    }

    const D = lengthToM(diameter_value, diameter_unit);
    const L = lengthToM(tank_length_value, tank_length_unit);
    const s = lengthToM(spacing_value, spacing_unit);
    const connL = lengthToM(connection_length_value, connection_length_unit);
    const Itotal_A = currentToA(Itotal_value, Itotal_unit);
    const Iconn_A = Number(Iconnector_max_value || 0);

    const core = computeTankMMO({ diameter_m: D, tank_length_m: L, install_type, spacing_m: s, nrings_manual: Number(nrings_manual||0), num_bars: Number(num_bars||0), connection_length_m: connL, Itotal_A, Iconnector_max_A: Iconn_A });
    const csvRows = buildCsvRows(core);
    const results = { ...core, inputs: raw, csvRows };

    try { window.localStorage.setItem('tank_mmo_calc', JSON.stringify({ inputs: raw, results })); } catch { /* ignore */ }
    this.setState({ results, savedInputs: raw, error: null, activeTab: 'results' });
  };

  onResetAll = () => {
    try { window.localStorage.removeItem('tank_mmo_calc'); } catch { /* ignore */ }
    this.setState({ results: null, error: null, savedInputs: null });
  };

  downloadResultsCsv = () => {
    const { results } = this.state || {};
    if (!results) return;
    const rows = [
      ['metric','value','unit'],
      ['C_m', Number(results.C_m||0), 'm'],
      ['Nribbons', Number(results.Nribbons||0), '-'],
      ['Lribbon_total_m', Number(results.Lribbon_total_m||0), 'm'],
      ['L_ti_bar_m', Number(results.L_ti_bar_m||0), 'm'],
      ['N_feeders', Number(results.N_feeders||0), '-'],
    ];
    const csv = rows.map(r => r.map(c => `"${String(c ?? '').replaceAll('"','""')}"`).join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'tank-mmo-sizing-results.csv';
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
                <h2 className="text-white text-xl md:text-2xl font-semibold tracking-tight">Tank MMO Anode Sizing</h2>
                <p className="text-brand-50/90 text-sm md:text-base mt-1">Compute circumference, ribbon lengths, Ti bar length, and connectors from geometry and spacing.</p>
              </div>
            </div>
          </div>
        }
        left={
          <div>
            {error ? <Alert>{error}</Alert> : null}
            <TankMMOForm onSubmit={this.onSubmit} submitting={submitting} onReset={this.onResetAll} initialValues={savedInputs || {}} />
          </div>
        }
        right={
          <div className="space-y-4">
            <InfoCard onReset={this.onResetAll} onCsv={this.downloadResultsCsv} />
            <Tabs items={[{ key: 'results', label: 'Results' }, { key: 'reference', label: 'Reference' }]} activeKey={activeTab} onChange={this.setTab} />
            {activeTab === 'results' && <TankMMOResults results={results} />}
            {activeTab === 'reference' && <TankMMOReference />}
          </div>
        }
      />
    );
  }
}
