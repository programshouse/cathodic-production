import React from "react";
import SurfaceAreaForm from "./SurfaceAreaForm";
import SurfaceAreaResults from "./SurfaceAreaResults";
import {
  STRUCTURE_TYPES,
  toMeters,
  pipelineSurfaceArea,
  internalTankSurfaceArea,
  externalTankBottomAreaFlat,
} from "./utils";
import CalculatorPanel from "../../components/ui/CalculatorPanel";
export default class SurfaceAreaPage extends React.Component {
  constructor(props) {
    super(props);
    const saved = (typeof window !== 'undefined') ? window.localStorage.getItem('surface_area_calc') : null;
    const parsed = saved ? JSON.parse(saved) : null;

    this.state = parsed || {
      structureType: STRUCTURE_TYPES[0].value,
      inputs: { diameter: "", length: "", height: "" },
      units: { diameter: "m", length: "m", height: "m" },
      submitting: false,
      results: null,
      error: null,
      errors: {},
    };
  }

  componentDidUpdate(_, prevState) {
    if (prevState !== this.state && typeof window !== 'undefined') {
      const { structureType, inputs, units, results } = this.state;
      window.localStorage.setItem(
        'surface_area_calc',
        JSON.stringify({ structureType, inputs, units, results })
      );
    }
  }

  setError = (msg) => this.setState({ error: msg });

  clearError = () => this.setState({ error: null });

  onChangeType = (structureType) => {
    this.setState((s) => ({
      structureType,
      results: null,
      errors: this.computeErrorsForStructure(structureType, s.inputs),
    }));
  };

  onChangeInput = (k, v) => {
    this.setState((s) => ({
      inputs: { ...s.inputs, [k]: v },
      results: null,
      errors: { ...s.errors, [k]: this.validateField(s.structureType, k, v) },
    }));
  };

  onChangeUnit = (k, v) => {
    this.setState((s) => ({ units: { ...s.units, [k]: v }, results: null }));
  };

  isFieldRequired(structureType, field) {
    if (structureType === 'pipeline') return field === 'diameter' || field === 'length';
    if (structureType === 'tank-internal') return field === 'diameter' || field === 'height';
    if (structureType === 'tank-external-bottom') return field === 'diameter';
    return false;
  }

  validateField(structureType, field, value) {
    if (!this.isFieldRequired(structureType, field)) return null;
    if (value === '' || value === null || value === undefined) return 'Enter this field';
    const n = Number(value);
    if (isNaN(n) || n <= 0) return 'Enter a positive number';
    return null;
  }

  computeErrorsForStructure(structureType, inputs) {
    return {
      diameter: this.validateField(structureType, 'diameter', inputs.diameter),
      length: this.validateField(structureType, 'length', inputs.length),
      height: this.validateField(structureType, 'height', inputs.height),
    };
  }

  validate = () => {
    const { structureType, inputs } = this.state;
    const mustBeNumber = (val) => val !== '' && !isNaN(Number(val));

    if (!mustBeNumber(inputs.diameter) || Number(inputs.diameter) <= 0) {
      return "Please enter a positive numeric diameter.";
    }

    if (structureType === 'pipeline') {
      if (!mustBeNumber(inputs.length) || Number(inputs.length) <= 0) {
        return "Please enter a positive numeric length.";
      }
    }

    if (structureType === 'tank-internal') {
      if (!mustBeNumber(inputs.height) || Number(inputs.height) <= 0) {
        return "Please enter a positive numeric wetted height.";
      }
    }

    return null;
  };

  onSubmit = (e) => {
    e.preventDefault();
    const validationError = this.validate();
    if (validationError) {
      this.setError(validationError);
      return;
    }
    this.clearError();

    this.setState({ submitting: true }, () => {
      try {
        const { structureType, inputs, units } = this.state;
        const diameter_m = toMeters(Number(inputs.diameter), units.diameter);

        if (structureType === 'pipeline') {
          const length_m = toMeters(Number(inputs.length), units.length);
          const area_m2 = pipelineSurfaceArea({ diameter_m, length_m });
          this.setState({ results: { area_m2 } });
        } else if (structureType === 'tank-internal') {
          const height_m = toMeters(Number(inputs.height), units.height);
          const r = internalTankSurfaceArea({ diameter_m, height_m });
          this.setState({ results: r });
        } else if (structureType === 'tank-external-bottom') {
          const area_m2 = externalTankBottomAreaFlat({ diameter_m });
          this.setState({ results: { area_m2 } });
        } else {
          throw new Error('Unsupported structure type.');
        }
      } catch (err) {
        const msg =
          err && err.message
            ? `Something went wrong. Please check your values/units. (${err.message})`
            : 'Something went wrong. Please check your values and try again.';
        this.setError(msg);
      } finally {
        this.setState({ submitting: false });
      }
    });
  };

  applyPreset = (key) => {
    const presets = {
      pipeline: {
        inputs: { diameter: 0.5, length: 100, height: '' },
        units: { diameter: 'm', length: 'm', height: 'm' },
      },
      'tank-internal': {
        inputs: { diameter: 10, length: '', height: 8 },
        units: { diameter: 'm', length: 'm', height: 'm' },
      },
      'tank-external-bottom': {
        inputs: { diameter: 12, length: '', height: '' },
        units: { diameter: 'm', length: 'm', height: 'm' },
      },
    };

    const preset = presets[key];
    if (!preset) return;
    this.setState((s) => ({
      structureType: key,
      inputs: { ...s.inputs, ...preset.inputs },
      units: { ...s.units, ...preset.units },
      results: null,
      error: null,
    }));
  };

  resetAll = () => {
    this.setState({
      structureType: STRUCTURE_TYPES[0].value,
      inputs: { diameter: "", length: "", height: "" },
      units: { diameter: "m", length: "m", height: "m" },
      submitting: false,
      results: null,
      error: null,
    });
  };

  saveToHistory = () => {
    const payload = {
      structureType: this.state.structureType,
      inputs: this.state.inputs,
      units: this.state.units,
      results: this.state.results,
      ts: Date.now(),
    };
    try {
      console.log("save-history", payload);
      alert("Saved to history (placeholder). Wire this to your store/API when ready.");
    } catch {
      alert("Failed to save to history.");
    }
  };

  InfoCard = () => {
    const { structureType } = this.state;
    const baseClass = "rounded-2xl border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-900/40 backdrop-blur p-4 md:p-6 sticky top-4";

    if (structureType === 'pipeline') {
      return (
        <div className={baseClass}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Pipeline Area</h3>
            <span className="text-base px-2 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-100 dark:border-brand-800">Formula</span>
          </div>
          <pre className="text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`A = π × D × L`}</pre>
          <p className="text-base mt-2 text-gray-600 dark:text-gray-400">Inputs are converted to SI (meters). Area is returned in m².</p>
        </div>
      );
    }

    if (structureType === 'tank-internal') {
      return (
        <div className={baseClass}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Tank Internal Area</h3>
            <span className="text-base px-2 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-100 dark:border-brand-800">Formula</span>
          </div>
          <pre className="text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`Ashell = π × D × h
Abottom = π × r² (r = D/2)
Atotal = Ashell + Abottom`}</pre>
          <p className="text-base mt-2 text-gray-600 dark:text-gray-400">Wetted shell + bottom plate (if included by your method).</p>
        </div>
      );
    }

    return (
      <div className={baseClass}>
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-gray-100">Tank External Bottom (Flat)</h3>
          <span className="text-base px-2 py-1 rounded-full bg-brand-50 text-brand-700 dark:bg-brand-900/30 dark:text-brand-300 border border-brand-100 dark:border-brand-800">Formula</span>
        </div>
        <pre className="text-base whitespace-pre-wrap text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-gray-800/60 rounded-lg p-3 border border-gray-100 dark:border-gray-800">{`A = π × r² (r = D/2)`}</pre>
      </div>
    );
  };

  Alert = ({ children }) => (
    <div className="rounded-xl border border-red-200 dark:border-red-900 bg-red-50 dark:bg-red-950/40 text-red-800 dark:text-red-200 px-4 py-3 text-sm">{children}</div>
  );

  Presets = () => (
    <div className="flex flex-wrap gap-2 mb-4">
      <button
        type="button"
        className="text-base rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 hover:opacity-90"
        onClick={() => this.applyPreset('pipeline')}
      >Pipeline example</button>
      <button
        type="button"
        className="text-base rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 hover:opacity-90"
        onClick={() => this.applyPreset('tank-internal')}
      >Tank internal example</button>
      <button
        type="button"
        className="text-base rounded-full border border-brand-200 dark:border-brand-800 bg-brand-50 dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 hover:opacity-90"
        onClick={() => this.applyPreset('tank-external-bottom')}
      >Bottom plate example</button>
      <button
        type="button"
        className="ml-auto text-xl rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 hover:bg-gray-50 dark:hover:bg-gray-800"
        onClick={this.resetAll}
      >Reset</button>
    </div>
  );

  render() {
    const { structureType, inputs, units, submitting, results, errors } = this.state;

    const headerActions = (
      <>
        <button
          type="button"
          className="text-lg rounded-full border border-gray-200 dark:border-gray-700 px-3 py-1 mt-3 hover:bg-gray-50 dark:hover:bg-gray-800"
          onClick={this.resetAll}
        >Reset</button>
        {/* <button
          type="button"
          className="text-lg rounded-full border border-brand-200 dark:border-brand-800 mt-3 bg-brand-50  dark:bg-brand-900/30 text-brand-700 dark:text-brand-300 px-3 py-1 hover:opacity-90"
          onClick={this.saveToHistory}
        >Save to History</button> */}
      </>
    );

    return (
      <CalculatorPanel
        // title="Surface Area Calculator"
        // subtitle="Convert inputs to SI units automatically. Results in m² and ft²."
        headerActions={headerActions}
        left={(
          <SurfaceAreaForm
            structureType={structureType}
            onChangeType={(v) => this.setState({ structureType: v, results: null })}
            inputs={inputs}
            units={units}
            onChangeInput={this.onChangeInput}
            onChangeUnit={this.onChangeUnit}
            onSubmit={this.onSubmit}
            submitting={submitting}
            errors={errors}
            headerActions={headerActions}
          />
        )}
        right={(
          <>
            <this.InfoCard />
            <SurfaceAreaResults structureType={structureType} results={results} onReset={this.resetAll} />
          </>
        )}
      />
    );
  }
}
