// Soil Resistivity calculations and unit helpers

export const METHODS = [
  { value: "wenner", label: "Wenner Array" },
];

export const ENVIRONMENTS = [
  { value: "soil", label: "Soil" },
  { value: "freshwater", label: "Freshwater" },
  { value: "seawater", label: "Seawater" },
];

// Unit helpers
export const lengthToM = (val, unit = "m") => {
  const v = Number(val || 0);
  if (unit === "cm") return v / 100;
  if (unit === "ft") return v * 0.3048;
  return v;
};

export const resistivityToUnit = (rho_ohm_m, unit = "ohm-m") => {
  const v = Number(rho_ohm_m || 0);
  if (unit === "ohm-cm") return v * 100; // 1 ohm-m = 100 ohm-cm
  return v;
};

// Formulas (assuming SI inputs: a, L, l in meters; R in ohms). Return rho in ohm-m.
export function rhoWenner({ a_m, R_ohm }) {
  return 2 * Math.PI * a_m * R_ohm;
}


export function computeSoilResistivity(inputs) {
  const { R_ohm, a, aUnit } = inputs || {};
  const R = Number(R_ohm || 0);
  const a_m = lengthToM(a, aUnit);
  const rho_m = rhoWenner({ a_m, R_ohm: R });

  // Build a small series for visualization (vary a)
  const pts = [];
  const N = 60;
  const a0 = Math.max(a_m, 0.01);
  const min = a0 * 0.2, max = a0 * 5;
  for (let i = 0; i < N; i++) {
    const t = i / (N - 1);
    const am = min + t * (max - min);
    const rho = rhoWenner({ a_m: am, R_ohm: R });
    pts.push({ x: am, rho });
  }

  return {
    inputs,
    rho_ohm_m: rho_m,
    unitRho: "ohm-m",
    seriesLabel: "a (m)",
    data: pts,
  };
}
