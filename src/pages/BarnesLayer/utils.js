// Barnes Layer Resistivity utilities
// Apparent Resistivity (Wenner): rho_a = 2 * pi * a * R
// Barnes method layers: here we provide single-layer helper plus table/series builders.

export const UNIT = {
  OHM_M: "Ω·m",
  OHM_CM: "Ω·cm",
};

export function toOhmMeter(val, unit = UNIT.OHM_M) {
  const v = Number(val || 0);
  return unit === UNIT.OHM_CM ? v / 100 : v; // 1 Ω·cm = 0.01 Ω·m
}

export function fromOhmMeter(val, unit = UNIT.OHM_M) {
  const v = Number(val || 0);
  return unit === UNIT.OHM_CM ? v * 100 : v;
}

export function computeApparentResistivity({ spacing_m, measured_R_ohm }) {
  const a = Number(spacing_m || 0);
  const R = Number(measured_R_ohm || 0);
  const rho_a = 2 * Math.PI * a * R; // Ω·m
  return rho_a;
}

// Build table rows around a base spacing by increments
export function buildSpacingTable({ increments = [0.5, 1, 1.5, 3, 6, 9, 12, 15, 18, 21, 24, 27], measured_R_ohm = 1 }) {
  const rows = [];
  increments.forEach((inc) => {
    const a = Number(inc);
    const rho_a = computeApparentResistivity({ spacing_m: a, measured_R_ohm });
    // A simple placeholder for layer depth relation (often ~0.75a for Wenner)
    const depth_m = 0.75 * a;
    rows.push({ spacing_m: a, R_meas_ohm: Number(measured_R_ohm || 0), rho_app_ohm_m: rho_a, depth_m });
  });
  return rows;
}

export function computeBarnesSingleLayer(inputs) {
  // Inputs in SI (Ω·m, m)
  const rho_top = Number(inputs.rho_top_ohm_m || 0);
  const rho_bottom = Number(inputs.rho_bottom_ohm_m || 0);
  const t_top = Number(inputs.t_top_m || 0);
  const a = Number(inputs.spacing_m || 0);
  const R = Number(inputs.measured_R_ohm || 0);

  const rho_app = computeApparentResistivity({ spacing_m: a, measured_R_ohm: R });
  const table = buildSpacingTable({ measured_R_ohm: R });

  return {
    inputs,
    rho_top_ohm_m: rho_top,
    rho_bottom_ohm_m: rho_bottom,
    boundary_depth_m: t_top, // present as boundary for single-layer case
    rho_app_ohm_m: rho_app,
    table,
  };
}
