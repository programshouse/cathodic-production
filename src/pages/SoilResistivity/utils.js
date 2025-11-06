// Soil Resistivity calculations and unit helpers

export const METHODS = [
  { value: "wenner", label: "Wenner Array" },
  { value: "schlumberger", label: "Schlumberger Array" },
  { value: "four_point", label: "Four-Point Method" },
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

export function rhoFourPoint(params) {
  // Same as Wenner for equal spacing
  return rhoWenner(params);
}

export function rhoSchlumberger({ L_m, l_m, R_ohm }) {
  // Classical approximation: rho = (pi * R) * ( (L^2 / l) - l )
  // where L is half the current electrode spacing (C1-C2)/2, l is half the potential electrode spacing (P1-P2)/2
  const L2_over_l = (L_m * L_m) / Math.max(l_m, 1e-9);
  return Math.PI * R_ohm * (L2_over_l - l_m);
}

export function computeSoilResistivity(inputs) {
  const { method, R_ohm, a, aUnit, L, LUnit, l, lUnit } = inputs || {};
  const R = Number(R_ohm || 0);
  let rho_m = 0;
  if (method === "schlumberger") {
    const L_m = lengthToM(L, LUnit);
    const l_m = lengthToM(l, lUnit);
    rho_m = rhoSchlumberger({ L_m, l_m, R_ohm: R });
  } else if (method === "four_point") {
    const a_m = lengthToM(a, aUnit);
    rho_m = rhoFourPoint({ a_m, R_ohm: R });
  } else {
    const a_m = lengthToM(a, aUnit);
    rho_m = rhoWenner({ a_m, R_ohm: R });
  }

  // Build a small series for visualization
  const buildSeries = () => {
    const pts = [];
    const N = 60;
    if (method === "schlumberger") {
      const L0 = Math.max(lengthToM(L, LUnit), 0.01);
      const l_m = Math.max(lengthToM(l, lUnit), 0.01);
      const min = L0 * 0.2, max = L0 * 5;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const Lm = min + t * (max - min);
        const rho = rhoSchlumberger({ L_m: Lm, l_m, R_ohm: R });
        pts.push({ x: Lm, rho });
      }
      return { label: "L (m)", data: pts };
    } else {
      const a0 = Math.max(lengthToM(a, aUnit), 0.01);
      const min = a0 * 0.2, max = a0 * 5;
      for (let i = 0; i < N; i++) {
        const t = i / (N - 1);
        const am = min + t * (max - min);
        const rho = method === "four_point"
          ? rhoFourPoint({ a_m: am, R_ohm: R })
          : rhoWenner({ a_m: am, R_ohm: R });
        pts.push({ x: am, rho });
      }
      return { label: "a (m)", data: pts };
    }
  };

  const series = buildSeries();

  return {
    inputs,
    rho_ohm_m: rho_m,
    unitRho: "ohm-m",
    seriesLabel: series.label,
    data: series.data, // [{x, rho}]
  };
}
