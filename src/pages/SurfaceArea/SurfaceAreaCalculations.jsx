import React from "react";
import { toMeters } from "./utils";

export default class SurfaceAreaCalculations extends React.Component {
  line(label, value) {
    return (
      <div className="flex items-center justify-between py-1">
        <span className="text-gray-600 dark:text-gray-300">{label}</span>
        <span className="font-semibold">{value}</span>
      </div>
    );
  }

  renderPipeline(inputs, units) {
    const Dm = toMeters(inputs.diameter, units.diameter);
    const Lm = toMeters(inputs.length, units.length);
    const expr = `A = π × ${Dm.toFixed(4)} × ${Lm.toFixed(4)}`;
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <h3 className="text-sm font-semibold mb-2">Calculations</h3>
        <pre className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">{expr}</pre>
      </div>
    );
  }

  renderTankInternal(inputs, units) {
    const Dm = toMeters(inputs.diameter, units.diameter);
    const hm = toMeters(inputs.height, units.height);
    const r = Dm / 2;
    const s1 = `Ashell = π × ${Dm.toFixed(4)} × ${hm.toFixed(4)}`;
    const s2 = `Abottom = π × ${r.toFixed(4)}²`;
    const s3 = `Atotal = Ashell + Abottom`;
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <h3 className="text-sm font-semibold mb-2">Calculations</h3>
        <pre className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">{`${s1}\n${s2}\n${s3}`}</pre>
      </div>
    );
  }

  renderBottomFlat(inputs, units) {
    const Dm = toMeters(inputs.diameter, units.diameter);
    const r = Dm / 2;
    const s = `A = π × ${r.toFixed(4)}²`;
    return (
      <div className="rounded-lg border border-gray-200 dark:border-gray-700 p-4 bg-white dark:bg-gray-800">
        <h3 className="text-sm font-semibold mb-2">Calculations</h3>
        <pre className="text-xs whitespace-pre-wrap text-gray-700 dark:text-gray-300">{s}</pre>
      </div>
    );
  }

  render() {
    const { structureType, inputs, units } = this.props;
    if (structureType === 'pipeline') return this.renderPipeline(inputs, units);
    if (structureType === 'tank-internal') return this.renderTankInternal(inputs, units);
    return this.renderBottomFlat(inputs, units);
  }
}
