import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function TankMMOForm({ onSubmit, onReset, submitting, initialValues = {} }) {
  const defaults = {
    diameter_value: "",
    diameter_unit: "m",
    tank_length_value: "",
    tank_length_unit: "m",
    install_type: "rings", // rings | longitudinal
    spacing_value: "1",
    spacing_unit: "m",
    nrings_manual: "",
    num_bars: "1",
    connection_length_value: "",
    connection_length_unit: "m",
    Itotal_value: "",
    Itotal_unit: "A",
    Iconnector_max_value: "10",
    Iconnector_max_unit: "A",
    ...initialValues,
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const fd = new FormData(e.target);
    const payload = Object.fromEntries(fd.entries());
    onSubmit && onSubmit(payload);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <ModuleCard title="Tank Parameters" subtitle="Enter tank geometry and layout preferences">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Diameter</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="diameter_value" type="number" step="any" defaultValue={defaults.diameter_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="diameter_unit" defaultValue={defaults.diameter_unit} className="rounded-md border px-2 py-2">
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Tank Length/Height</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="tank_length_value" type="number" step="any" defaultValue={defaults.tank_length_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="tank_length_unit" defaultValue={defaults.tank_length_unit} className="rounded-md border px-2 py-2">
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Installation Type</label>
            <select name="install_type" defaultValue={defaults.install_type} className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="rings">Rings (around circumference)</option>
              <option value="longitudinal">Longitudinal (straight ribbons)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium">Desired Spacing</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="spacing_value" type="number" step="any" defaultValue={defaults.spacing_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="spacing_unit" defaultValue={defaults.spacing_unit} className="rounded-md border px-2 py-2">
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
            <div className="text-xs text-gray-500 mt-1">If left blank for rings, rings are computed as ceil(Length/Spacing).</div>
          </div>

          <div>
            <label className="block text-sm font-medium">Manual Rings (optional)</label>
            <input name="nrings_manual" type="number" step="1" min="0" defaultValue={defaults.nrings_manual} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
        </div>
      </ModuleCard>

      <ModuleCard title="Electrical & Connectors" subtitle="Ti bars and power feeders">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Number of Ti Bars</label>
            <input name="num_bars" type="number" step="1" min="0" defaultValue={defaults.num_bars} className="mt-1 w-full rounded-md border px-3 py-2" />
          </div>
          <div>
            <label className="block text-sm font-medium">Connection Length per Bar</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="connection_length_value" type="number" step="any" defaultValue={defaults.connection_length_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="connection_length_unit" defaultValue={defaults.connection_length_unit} className="rounded-md border px-2 py-2">
                <option value="m">m</option>
                <option value="ft">ft</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Total System Current</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="Itotal_value" type="number" step="any" defaultValue={defaults.Itotal_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="Itotal_unit" defaultValue={defaults.Itotal_unit} className="rounded-md border px-2 py-2">
                <option value="A">A</option>
                <option value="mA">mA</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Max Current per Connector</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="Iconnector_max_value" type="number" step="any" defaultValue={defaults.Iconnector_max_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="Iconnector_max_unit" defaultValue={defaults.Iconnector_max_unit} className="rounded-md border px-2 py-2">
                <option value="A">A</option>
              </select>
            </div>
          </div>
        </div>
      </ModuleCard>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <ResetPill onClick={onReset} />
          <div className="mt-0">
            <PrimaryButton type="submit" disabled={!!submitting}>
              {submitting ? "Calculating…" : "Calculate Tank MMO Sizing"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </form>
  );
}
