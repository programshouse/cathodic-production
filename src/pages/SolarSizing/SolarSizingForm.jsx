import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";
import ResetPill from "../../components/ui/ResetPill";
import PrimaryButton from "../../components/ui/PrimaryButton";

export default function SolarSizingForm({ onSubmit, onReset, submitting, initialValues = {} }) {
  const defaults = {
    I_req_value: "",
    I_req_unit: "A",
    V_req_value: "",
    V_req_unit: "V",
    location: "tropical",
    peak_sun_hours: "",
    efficiency: "",
    autonomy_days: "",
    panel_watt: "100",
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
      <ModuleCard title="Solar Sizing Parameters" subtitle="Enter required load and site parameters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium">Required Current</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="I_req_value" type="number" step="any" defaultValue={defaults.I_req_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="I_req_unit" defaultValue={defaults.I_req_unit} className="rounded-md border px-2 py-2">
                <option value="A">A</option>
                <option value="mA">mA</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Required Voltage</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="V_req_value" type="number" step="any" defaultValue={defaults.V_req_value} className="flex-1 rounded-md border px-3 py-2" />
              <select name="V_req_unit" defaultValue={defaults.V_req_unit} className="rounded-md border px-2 py-2">
                <option value="V">V</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Location</label>
            <select name="location" defaultValue={defaults.location} className="mt-1 w-full rounded-md border px-3 py-2">
              <option value="tropical">Tropical</option>
              <option value="temperate">Temperate</option>
              <option value="arid">Arid/Desert</option>
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium">Peak Sun Hours</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="peak_sun_hours" type="number" step="any" defaultValue={defaults.peak_sun_hours} className="flex-1 rounded-md border px-3 py-2" />
              <span className="text-xs text-gray-500">hours/day</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">System Efficiency</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="efficiency" type="number" step="any" placeholder="e.g., 0.75 or 75" defaultValue={defaults.efficiency} className="flex-1 rounded-md border px-3 py-2" />
              <span className="text-xs text-gray-500">fraction or %</span>
            </div>
          </div>
          <div>
            <label className="block text-sm font-medium">Autonomy Days</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="autonomy_days" type="number" step="any" defaultValue={defaults.autonomy_days} className="flex-1 rounded-md border px-3 py-2" />
              <span className="text-xs text-gray-500">days</span>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium">Panel Nameplate Watt</label>
            <div className="mt-1 flex items-center gap-2">
              <input name="panel_watt" type="number" step="any" defaultValue={defaults.panel_watt} className="flex-1 rounded-md border px-3 py-2" />
              <span className="text-xs text-gray-500">W</span>
            </div>
          </div>
        </div>
      </ModuleCard>

      <div className="flex items-center justify-between pt-1">
        <div className="flex items-center gap-2">
          <ResetPill onClick={onReset} />
          <div className="mt-0">
            <PrimaryButton type="submit" disabled={!!submitting}>
              {submitting ? "Calculating…" : "Calculate Solar Sizing"}
            </PrimaryButton>
          </div>
        </div>
      </div>
    </form>
  );
}
