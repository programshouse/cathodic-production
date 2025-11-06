// Utilities for Attenuation & Pipeline Potential Profile

export const LENGTH_UNITS = [
  { value: "m", label: "m", to_m: 1 },
  { value: "km", label: "km", to_m: 1000 },
  { value: "mm", label: "mm", to_m: 0.001 },
  { value: "in", label: "in", to_m: 0.0254 },
];

export const RES_PER_LENGTH_UNITS = [
  { value: "ohm_per_m", label: "Ω/m", to_per_m: 1 },
  { value: "ohm_per_km", label: "Ω/km", to_per_m: 1/1000 },
];

export const POTENTIAL_UNITS = [
  { value: "V", label: "V", to_V: 1 },
  { value: "mV", label: "mV", to_V: 0.001 },
];

export function toMeters(value, unit) {
  const u = LENGTH_UNITS.find((x) => x.value === unit) || LENGTH_UNITS[0];
  return Number(value || 0) * u.to_m;
}

export function toPerMeter(value, unit) {
  const u = RES_PER_LENGTH_UNITS.find((x) => x.value === unit) || RES_PER_LENGTH_UNITS[0];
  return Number(value || 0) * u.to_per_m;
}

export function toVolts(value, unit) {
  const u = POTENTIAL_UNITS.find((x) => x.value === unit) || POTENTIAL_UNITS[0];
  return Number(value || 0) * u.to_V;
}

// alpha = sqrt(Rs / RL)
export function computeAlpha({ Rs_per_m, RL_per_m }) {
  const Rs = Math.max(0, Number(Rs_per_m || 0));
  const RL = Math.max(1e-12, Number(RL_per_m || 0));
  return Math.sqrt(Rs / RL);
}

// V(x) = V0 * cosh(alpha*(L-x)) / cosh(alpha*L)
export function potentialAt({ x_m, L_m, V0_V, alpha }) {
  const denom = Math.cosh(alpha * L_m) || 1;
  return Number(V0_V || 0) * (Math.cosh(alpha * (L_m - x_m)) / denom);
}

export function profileSeries({ L_m, V0_V, alpha, points = 50 }) {
  const n = Math.max(2, Number(points || 50));
  const dx = L_m / (n - 1);
  const data = [];
  for (let i = 0; i < n; i++) {
    const x = dx * i;
    data.push({ x_m: x, V: potentialAt({ x_m: x, L_m, V0_V, alpha }) });
  }
  return data;
}

export function computeAttenuation(inputs) {
  const { L_m, V0_V, Rs_per_m, RL_per_m, points } = inputs;
  const alpha = computeAlpha({ Rs_per_m, RL_per_m });
  const data = profileSeries({ L_m, V0_V, alpha, points });
  return { alpha, data };
}

// Derived mode helpers
// Cross-sectional area of steel wall: Ax = (pi/4) * (Do^2 - Di^2)
export function steelArea_from_OD_t({ OD_m, t_m }) {
  const Do = Number(OD_m || 0);
  const Di = Math.max(0, Do - 2 * Number(t_m || 0));
  return (Math.PI / 4) * (Do * Do - Di * Di); // m^2
}

// Series resistance per meter: Rs = rho_steel / Ax  [Ω/m]
export function Rs_from_geometry({ rho_steel_ohm_m, OD_m, t_m }) {
  const Ax = steelArea_from_OD_t({ OD_m, t_m });
  const rho = Math.max(1e-12, Number(rho_steel_ohm_m || 0));
  return Ax > 0 ? rho / Ax : Infinity;
}

// Surface area per meter: S' = pi * Do [m^2/m]
export function surface_per_meter({ OD_m }) {
  return Math.PI * Number(OD_m || 0);
}

// Leakage resistance per meter (simplified): RL = Rc_per_area / S'  [Ω/m]
export function RL_from_coating({ Rc_per_area_ohm_m2, OD_m }) {
  const S_per_m = surface_per_meter({ OD_m });
  const Rc = Math.max(1e-12, Number(Rc_per_area_ohm_m2 || 0));
  return S_per_m > 0 ? Rc / S_per_m : Infinity;
}
