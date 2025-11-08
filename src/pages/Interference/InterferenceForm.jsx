import React from "react";
import ResetPill from "../../components/ui/ResetPill";
import ModuleCard from "../../components/ui/ModuleCard";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function InterferenceForm({ onSubmit, onReset, submitting, initialValues = {} }) {
  const defaults = {
    type: "dc",
    source: "foreign_cp",
    I: "",
    IUnit: "A",
    rho: "",
    rhoUnit: "ohm_m",
    d: "",
    dUnit: "m",
    Vpipe: "",
    VpipeUnit: "V",
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
           <ResetPill onClick={onReset}  className="text-end"/>
      <ModuleCard title="Interference Parameters" subtitle="Choose interference type and source">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Interference Type</label>
            <select name="type" defaultValue={defaults.type} className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="dc">DC Interference</option>
              <option value="ac">AC Interference</option>
              <option value="telluric">Telluric</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Interference Source</label>
            <select name="source" defaultValue={defaults.source} className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="foreign_cp">Foreign CP System</option>
              <option value="hvdc">HVDC Line</option>
              <option value="ac_traction">AC Traction</option>
              <option value="power_line">Power Line</option>
            </select>
          </div>
        </div>
      </ModuleCard>

      <ModuleCard title="Input Parameters" subtitle="Provide values and select their units">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Source Current</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="I" type="number" step="any" defaultValue={defaults.I} className="flex-1 rounded-md border px-3 py-2" />
              <select name="IUnit" defaultValue={defaults.IUnit} className="rounded-md border px-2 py-2">
                <option value="A">A</option>
                <option value="mA">mA</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Soil Resistivity</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="rho" type="number" step="any" defaultValue={defaults.rho} className="flex-1 rounded-md border px-3 py-2" />
              <select name="rhoUnit" defaultValue={defaults.rhoUnit} className="rounded-md border px-2 py-2">
                <option value="ohm_m">Ω·m</option>
                <option value="ohm_cm">Ω·cm</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Distance to Source</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="d" type="number" step="any" defaultValue={defaults.d} className="flex-1 rounded-md border px-3 py-2" />
              <select name="dUnit" defaultValue={defaults.dUnit} className="rounded-md border px-2 py-2">
                <option value="m">m</option>
                <option value="km">km</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Pipe Potential</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="Vpipe" type="number" step="any" defaultValue={defaults.Vpipe} className="flex-1 rounded-md border px-3 py-2" />
              <select name="VpipeUnit" defaultValue={defaults.VpipeUnit} className="rounded-md border px-2 py-2">
                <option value="V">V</option>
                <option value="mV">mV</option>
              </select>
            </div>
          </div>
        </div>
      </ModuleCard>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">

          <div className="mt-0">
            <PrimaryButton type="submit" disabled={!!submitting}>
              {submitting ? 'Calculating…' : 'Calculate Interference'}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </form>
  );
}
