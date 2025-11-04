import React from "react";
import { m2ToFt2 } from "./utils";
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, Tooltip, Legend, CartesianGrid } from "recharts";
export default class SurfaceAreaResults extends React.Component {
  constructor(props) {
    super(props);
    this.state = { copied: null, unit: "m2" };
  }

  fmt(n, digits = 4) {
    const num = Number(n || 0);
    const fixed = num.toFixed(digits);
    const [i, d] = fixed.split(".");
    const intFmt = i.replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return d ? `${intFmt}.${d}` : intFmt;
  }

  copy(text, label) {
    if (!navigator?.clipboard) return;
    navigator.clipboard.writeText(String(text)).then(() => {
      this.setState({ copied: label });
      setTimeout(() => this.setState({ copied: null }), 1200);
    }).catch(() => {});
  }

  exportJSON() {
    const { structureType, results } = this.props;
    const payload = { structureType, results };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `surface-area-${structureType}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  exportCSV() {
    const { structureType, results } = this.props;
    if (!results) return;

    let rows = [];
    if (structureType === 'pipeline') {
      const m2 = Number(results.area_m2 || 0);
      rows = [
        ["structure", "metric", "value", "unit"],
        [structureType, "area", m2, "m2"],
        [structureType, "area", m2ToFt2(m2), "ft2"],
      ];
    } else if (structureType === 'tank-internal') {
      const Ashell = Number(results.Ashell || 0);
      const Abottom = Number(results.Abottom || 0);
      const Atotal = Number(results.Atotal || 0);
      rows = [
        ["structure", "metric", "value", "unit"],
        [structureType, "Ashell", Ashell, "m2"],
        [structureType, "Abottom", Abottom, "m2"],
        [structureType, "Atotal", Atotal, "m2"],
        [structureType, "Atotal", m2ToFt2(Atotal), "ft2"],
      ];
    } else if (structureType === 'tank-external-bottom') {
      const m2 = Number(results.area_m2 || 0);
      rows = [
        ["structure", "metric", "value", "unit"],
        [structureType, "area", m2, "m2"],
        [structureType, "area", m2ToFt2(m2), "ft2"],
      ];
    }

    const csv = rows.map(r => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `surface-area-${structureType}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  Title = ({ label }) => (
    <div className="flex items-center justify-between mb-3">
      <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">{label}</h3>
      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => this.exportCSV()}
          className="text-xs rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 mx-2 hover:bg-gray-50 dark:hover:bg-gray-800"
          title="Export CSV"
        >CSV</button>
        {/* <button
          type="button"
          onClick={() => this.exportJSON()}
          className="text-xs rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
          title="Export JSON"
        >JSON</button> */}
      </div>
    </div>
  );

  BigNumber = ({ value, unit, copyLabel }) => {
    const text = `${this.fmt(value, 4)} ${unit}`;
    const { copied } = this.state;
    return (
      <div className="flex items-center gap-2">
        <div className="text-2xl font-semibold text-gray-900 dark:text-gray-100 tracking-tight">{text}</div>
        <button
          type="button"
          onClick={() => this.copy(text, copyLabel)}
          className="text-[11px] rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-2 py-0.5"
          title={`Copy ${unit}`}
        >{copied === copyLabel ? 'Copied' : 'Copy'}</button>
      </div>
    );
  };

  niceMax(val) {
    const n = Math.max(0, Number(val || 0));
    if (n === 0) return 10;
    const magnitude = Math.pow(10, Math.floor(Math.log10(n)));
    const step = magnitude / 2;
    return Math.ceil(n / step) * step;
  }

  Row = ({ label, value, unit }) => (
    <div className="flex items-center justify-between py-1">
      <span className="text-gray-600 dark:text-gray-300 text-sm">{label}</span>
      <span className="font-semibold text-sm text-gray-900 dark:text-gray-100">{this.fmt(value, 4)} {unit}</span>
    </div>
  );

  Divider = () => <div className="border-t border-gray-200 dark:border-gray-700 my-2" />;

  render() {
    const { structureType, results } = this.props;
    if (!results) return null;

    const Card = ({ children }) => (
      <div className="rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur p-4 md:p-6">
        {children}
      </div>
    );
    const UnitSelector = () => (
      <div className="ml-auto">
        <select
          value={this.state.unit}
          onChange={(e) => this.setState({ unit: e.target.value })}
          className="text-base rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 px-2 py-1"
        >
          <option value="m2">m²</option>
          <option value="ft2">ft²</option>
        </select>
      </div>
    );
    const toUnit = (v) => (this.state.unit === "m2" ? Number(v || 0) : m2ToFt2(Number(v || 0)));
    const unitLabel = this.state.unit === "m2" ? "m²" : "ft²";

    // PIPELINE
    if (structureType === 'pipeline') {
      const m2 = Number(results.area_m2 || 0);
      const data = [
        { name: 'Pipeline Surface Area', value: toUnit(m2) },
      ];
      const yMax = this.niceMax(data[0].value);
      return (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <this.Title label="Pipeline Surface Area" />
              <div className="flex items-center gap-2">
                <UnitSelector />
                <button
                  type="button"
                  onClick={() => this.props.onReset && this.props.onReset()}
                  className="text-base rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                  title="Reset equation"
                >Reset equation</button>
              </div>
            </div>

          <div className="mb-3 text-base text-gray-500 dark:text-gray-400">A = π × D × L</div>

          <div className="space-y-2 mb-3">
            <this.BigNumber value={toUnit(m2)} unit={unitLabel} copyLabel={`area-${unitLabel}-pipeline`} />
          </div>

          <this.Divider />

          <div className="text-[11px] text-gray-500 dark:text-gray-400">Values auto-converted to SI before computation.</div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Visual Representation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 16, left: 40, bottom: 0 }} barCategoryGap="20%" barGap={6}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 16 }} />
                  <YAxis domain={[0, yMax]} tick={{ fontSize: 16 }} tickFormatter={(v) => this.fmt(v, 0)} allowDecimals label={{ value: unitLabel, angle: -90, position: 'insideLeft', offset: 8 }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name={unitLabel} fill="#3b82f6" radius={[6,6,0,0]} isAnimationActive animationDuration={650} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      );
    }

    // TANK INTERNAL
    if (structureType === 'tank-internal') {
      const Ashell = Number(results.Ashell || 0);
      const Abottom = Number(results.Abottom || 0);
      const Atotal = Number(results.Atotal || 0);
      const data = [
        { name: 'Ashell', value: toUnit(Ashell) },
        { name: 'Abottom', value: toUnit(Abottom) },
        { name: 'Atotal', value: toUnit(Atotal) },
      ];
      const yMax = this.niceMax(Math.max(...data.map(d => d.value)));
      return (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <this.Title label="Tank Internal Surface Area" />
              <div className="flex items-center gap-2">
                <UnitSelector />
                <button
                  type="button"
                  onClick={() => this.props.onReset && this.props.onReset()}
                  className="text-base rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                  title="Reset equation"
                >Reset equation</button>
              </div>
            </div>

          <div className="mb-3 text-base text-gray-500 dark:text-gray-400">Ashell = π × D × h • Abottom = π × r² • Atotal = Ashell + Abottom</div>

          <div className="space-y-2 mb-3">
            <this.BigNumber value={toUnit(Atotal)} unit={unitLabel} copyLabel={`total-${unitLabel}-internal`} />
          </div>

          <this.Divider />

          <div className="space-y-1">
            <this.Row label="Ashell" value={toUnit(Ashell)} unit={unitLabel} />
            <this.Row label="Abottom" value={toUnit(Abottom)} unit={unitLabel} />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Visual Representation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                  <YAxis tick={{ fontSize: 14 }} label={{ value: unitLabel, angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name={unitLabel} fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      );
    }

    // TANK EXTERNAL BOTTOM
    if (structureType === 'tank-external-bottom') {
      const m2 = Number(results.area_m2 || 0);
      const data = [
        { name: 'Start', value: 0 },
        { name: 'Area', value: toUnit(m2) },
      ];
      return (
          <Card>
            <div className="flex items-center justify-between mb-3">
              <this.Title label="Tank External Bottom (Flat)" />
              <div className="flex items-center gap-2">
                <UnitSelector />
                <button
                  type="button"
                  onClick={() => this.props.onReset && this.props.onReset()}
                  className="text-base rounded-full border border-gray-200 dark:border-gray-700 px-2.5 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
                  title="Reset equation"
                >Reset equation</button>
              </div>
            </div>

          <div className="mb-3 text-base text-gray-500 dark:text-gray-400">A = π × r²</div>

          <div className="space-y-2 mb-3">
            <this.BigNumber value={toUnit(m2)} unit={unitLabel} copyLabel={`area-${unitLabel}-bottom`} />
          </div>
          <div className="mt-4">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-gray-100 mb-2">Visual Representation</h4>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="name" tick={{ fontSize: 14 }} />
                  <YAxis tick={{ fontSize: 14 }} label={{ value: unitLabel, angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="value" name={unitLabel} fill="#3b82f6" radius={[6,6,0,0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </Card>
      );
    }

    return null;
  }
}
