import React from "react";
import ModuleCard from "../../components/ui/ModuleCard";

export default function VoltageGradientResults({ results }) {
  if (!results) {
    return (
      <ModuleCard title="Results" subtitle="Run a calculation to see outputs.">
        <div className="text-sm text-gray-500">No results yet.</div>
      </ModuleCard>
    );
  }

  const {
    Vr_max = 0,
    Vr_at_Xr = null,
    Vr_perA_at_Xr = null,
    X_r_m = null,
    data = [],
    inputs,
  } = results || {};

  const I_A = inputs?.I_A ?? null;
  const L_m = inputs?.L_m ?? null;
  const rho_ohm_m = inputs?.rho_ohm_m ?? null;

  return (
    <div className="space-y-4">
      <ModuleCard
        title="Key Results"
        subtitle="Voltage rise in earth around the vertical anode"
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          <div>
            <div className="text-gray-500">Input parameters</div>
            <div className="mt-1 space-y-0.5">
              <div>
                I = <span className="font-semibold">{I_A ?? "—"}</span> A
              </div>
              <div>
                L = <span className="font-semibold">{L_m ?? "—"}</span> m
              </div>
              <div>
                ρ ={" "}
                <span className="font-semibold">
                  {rho_ohm_m ?? "—"} Ω·m
                </span>
              </div>
              {X_r_m != null && X_r_m !== "" && (
                <div>
                  Xᵣ ={" "}
                  <span className="font-semibold">{X_r_m}</span> m (point of
                  interest)
                </div>
              )}
            </div>
          </div>

          <div>
            <div className="text-gray-500">Voltage rise results</div>
            <div className="mt-1 space-y-0.5">
              <div>
                Maximum voltage rise near anode (within 0.1–100 m):{" "}
                <span className="font-semibold">
                  {Vr_max.toFixed(3)} V
                </span>
              </div>
              {X_r_m != null &&
                X_r_m !== "" &&
                Vr_at_Xr != null &&
                Vr_perA_at_Xr != null && (
                  <>
                    <div>
                      Vᵣ at Xᵣ = {X_r_m} m:{" "}
                      <span className="font-semibold">
                        {Vr_at_Xr.toFixed(3)} V
                      </span>
                    </div>
                    <div>
                      Vᵣ / I at Xᵣ = {X_r_m} m:{" "}
                      <span className="font-semibold">
                        {Vr_perA_at_Xr.toFixed(4)} V/A
                      </span>
                    </div>
                  </>
                )}
            </div>
          </div>
        </div>
      </ModuleCard>
    </div>
  );
}
