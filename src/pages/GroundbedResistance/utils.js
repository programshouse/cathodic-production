// Utilities for Groundbed Resistance module
// Units: soil resistivity rho in ohm-cm, L and d, spacing in meters
// Output resistance in ohms

const PI = Math.PI;

export const CONFIGS = [
  { value: "vertical_single", label: "Vertical Single Anode" },
  { value: "horizontal_single", label: "Horizontal Single Anode" },
  { value: "vertical_multiple", label: "Vertical Multiple Anodes (Parallel)" },
  { value: "horizontal_multiple", label: "Horizontal Multiple Anodes (Parallel)" },
  { value: "deepwell", label: "Deepwell (treated as vertical)" },
];

// Convert ohm-cm to ohm-m
export function ohmCmToOhmM(rho_cm) {
  return Number(rho_cm) / 100.0; // 1 ohm-m = 100 ohm-cm
}

// Vertical single anode resistance
// R = rho / (2πL) * [ln(8L/d) - 1]
export function verticalSingle({ rho_cm, L_m, d_m }) {
  const rho_m = ohmCmToOhmM(rho_cm);
  const term = Math.log((8 * L_m) / d_m) - 1.0;
  return (rho_m / (2 * PI * L_m)) * term;
}

// Horizontal single anode resistance (approximation)
// R = rho / (2πL) * [ln(2L/d) - 1]
// A more elaborate form can be substituted if required by spec.
export function horizontalSingle({ rho_cm, L_m, d_m }) {
  const rho_m = ohmCmToOhmM(rho_cm);
  const term = Math.log((2 * L_m) / d_m) - 1.0;
  return (rho_m / (2 * PI * L_m)) * term;
}

// Empirical interaction factor estimate as a function of spacing and length
// Returns 0.6..1.0 increasing with spacing/L
export function interactionFactorEstimate({ spacing_m, L_m }) {
  const ratio = Math.max(0, Math.min(2, (spacing_m || 0) / (L_m || 1)));
  return Math.max(0.6, Math.min(1.0, 0.6 + 0.4 * (ratio / 2)));
}

// Multiple anodes in parallel: R_total = R_single / (N * F)
export function parallelResistance({ R_single, N, F }) {
  const n = Math.max(1, Math.round(Number(N) || 1));
  const f = Number(F) || 1.0;
  return R_single / (n * f);
}

export function computeAll({ config, rho_cm, L_m, d_m, N, spacing_m, F }) {
  let R_single;
  if (config === "vertical_single" || config === "deepwell" || config === "vertical_multiple") {
    R_single = verticalSingle({ rho_cm, L_m, d_m });
  } else {
    R_single = horizontalSingle({ rho_cm, L_m, d_m });
  }
  const F_eff = (config === "vertical_multiple" || config === "horizontal_multiple")
    ? (F || interactionFactorEstimate({ spacing_m, L_m }))
    : 1.0;
  const R_total = (config === "vertical_multiple" || config === "horizontal_multiple")
    ? parallelResistance({ R_single, N, F: F_eff })
    : R_single;

  return { R_single, R_total, F_eff };
}

export function seriesForN({ maxN = 20, R_single, spacing_m, L_m }) {
  const data = [];
  for (let n = 1; n <= maxN; n++) {
    const F = interactionFactorEstimate({ spacing_m, L_m });
    const Rtot = parallelResistance({ R_single, N: n, F });
    data.push({ n, value: Rtot });
  }
  return data;
}

// Sweep electrode spacing to produce R vs spacing series for current config
export function seriesForSpacing({ config, rho_cm, L_m, d_m, spacingMin = 1, spacingMax = 30, step = 1, N = 1 }) {
  const data = [];
  for (let a = Number(spacingMin || 1); a <= Number(spacingMax || 30); a += Number(step || 1)) {
    const isVertical = (config === "vertical_single" || config === "deepwell" || config === "vertical_multiple");
    const R_single = isVertical ? verticalSingle({ rho_cm, L_m, d_m }) : horizontalSingle({ rho_cm, L_m, d_m });
    const multiple = (config === "vertical_multiple" || config === "horizontal_multiple");
    const F = multiple ? interactionFactorEstimate({ spacing_m: a, L_m }) : 1.0;
    const Rtot = multiple ? parallelResistance({ R_single, N, F }) : R_single;
    data.push({ a, value: Rtot });
  }
  return data;
}
