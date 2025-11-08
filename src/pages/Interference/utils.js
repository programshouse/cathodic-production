// Interference Calculation utilities

export const TYPE_COEFF = {
  dc: 1.0,
  ac: 0.3,
  telluric: 0.6,
};

export const SOURCE_MULTIPLIER = {
  foreign_cp: 1.0,
  hvdc: 0.8,
  ac_traction: 0.5,
  power_line: 0.3,
};

export function currentToA(value, unit) {
  const v = Number(value || 0);
  if (unit === 'mA') return v / 1000;
  return v;
}

export function resistivityToOhmM(value, unit) {
  const v = Number(value || 0);
  if (unit === 'ohm_cm') return v / 100; // 1 ohm·m = 100 ohm·cm
  return v;
}

export function potentialToV(value, unit) {
  const v = Number(value || 0);
  if (unit === 'mV') return v / 1000;
  return v;
}

export function lengthToM(value, unit) {
  const v = Number(value || 0);
  if (unit === 'cm') return v / 100;
  if (unit === 'km') return v * 1000;
  return v;
}

export function computeInterference({
  type = 'dc',
  source = 'foreign_cp',
  I_A = 0,
  rho_ohm_m = 0,
  d_m = 1,
  V_pipe_V = 0,
}) {
  const k_type = TYPE_COEFF[type] ?? 1.0;
  const k_src = SOURCE_MULTIPLIER[source] ?? 1.0;
  const denom = 2 * Math.PI * Math.max(1e-9, d_m) * Math.max(1e-6, k_type);
  const Vint = (Number(I_A) * Number(rho_ohm_m) * Number(k_src)) / denom; // V
  const Vshift = Vint;
  const Vnew = Number(V_pipe_V || 0) + Vshift;

  const severity = Math.abs(Vint) >= 1.0 ? 'High' : Math.abs(Vint) >= 0.5 ? 'Medium' : 'Low';
  const status = severity === 'High' ? 'Warning' : 'OK';

  const mitigations = [
    { Method: 'Install Gradient Control Wire', Effectiveness: 'High', Cost: 'Medium', Recommended: severity !== 'Low' ? 'Yes' : 'No' },
    { Method: 'Add Groundbed/Anodes', Effectiveness: 'High', Cost: 'Medium', Recommended: severity === 'High' ? 'Yes' : 'No' },
    { Method: 'Decoupling Device', Effectiveness: 'Medium', Cost: 'High', Recommended: severity !== 'Low' ? 'Yes' : 'No' },
    { Method: 'Bonding with Source System', Effectiveness: 'High', Cost: 'High', Recommended: severity === 'High' ? 'Yes' : 'No' },
  ];

  return {
    V_int: Vint,
    V_shift: Vshift,
    V_new: Vnew,
    k_type,
    k_src,
    status,
    severity,
    mitigations,
  };
}

// Build a simple Vint vs distance series for visualization
export function seriesForDistance({ type = 'dc', source = 'foreign_cp', I_A = 0, rho_ohm_m = 0, d_from = 1, d_to = 100, step = 1 }) {
  const k_type = TYPE_COEFF[type] ?? 1.0;
  const k_src = SOURCE_MULTIPLIER[source] ?? 1.0;
  const data = [];
  const start = Math.max(0.1, Number(d_from || 1));
  const end = Math.max(start, Number(d_to || (start * 10)));
  const s = Math.max(0.1, Number(step || 1));
  for (let d = start; d <= end + 1e-9; d += s) {
    const denom = 2 * Math.PI * Math.max(1e-9, d) * Math.max(1e-6, k_type);
    const Vint = (Number(I_A) * Number(rho_ohm_m) * Number(k_src)) / denom;
    data.push({ d_m: Number(d), V_int: Number(Vint) });
  }
  return data;
}
