// Utilities for Voltage Gradient Module (vertical rod anode)

// Equation:
// V_r(x) = (ρ · I / 2πL) · ln[(L + √(L² + x²)) / x]
// where:
//   I          : current delivered by the anode (A)
//   ρ (rho)    : soil resistivity (Ω·m)
//   L          : length of anode below grade (m)
//   x = X_r    : distance from anode to point of interest (m)
//   V_r(x)     : voltage rise at x with respect to remote earth (V)

const TWO_PI = 2 * Math.PI;

// Single point voltage rise
export function voltageRiseAt({ I_A, rho_ohm_m, L_m, x_m }) {
  const I = Number(I_A || 0);
  const rho = Number(rho_ohm_m || 0);
  const L = Math.max(Number(L_m || 0), 1e-9);
  const x = Math.max(Number(x_m || 0), 1e-6);

  const R = Math.sqrt(L * L + x * x);
  const term = Math.log((L + R) / x);
  const Vr = (rho * I / (TWO_PI * L)) * term;

  if (!isFinite(Vr) || Vr < 0) return 0;
  return Vr;
}

// Build series of Vr(x) and Vr(x)/I from 0.1 m to 100 m (log spaced)
export function buildSeries({ I_A, rho_ohm_m, L_m }) {
  const I = Number(I_A || 0);
  const rho = Number(rho_ohm_m || 0);
  const L = Number(L_m || 0);

  const xs = [];
  const min = 0.1;
  const max = 100;
  const n = 120;
  const logMin = Math.log(min);
  const logMax = Math.log(max);

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = Math.exp(logMin + t * (logMax - logMin));
    xs.push(x);
  }

  return xs.map((x) => {
    const Vr = voltageRiseAt({ I_A: I, rho_ohm_m: rho, L_m: L, x_m: x });
    const Vr_perA = I > 0 ? Vr / I : 0;
    return {
      x_m: x,
      Vr,        // volts
      Vr_perA,   // volts per ampere
    };
  });
}

// Main entry used by VoltageGradientPage
export function computeVoltageGradient({ I_A, L_m, rho_ohm_m, X_r_m }) {
  const I = Number(I_A || 0);
  const L = Number(L_m || 0);
  const rho = Number(rho_ohm_m || 0);
  const Xr = X_r_m == null || X_r_m === "" ? null : Number(X_r_m);

  const data = buildSeries({ I_A: I, rho_ohm_m: rho, L_m: L });

  const Vr_max = data.reduce((m, p) => (p.Vr > m ? p.Vr : m), 0);

  let Vr_at_Xr = null;
  let Vr_perA_at_Xr = null;

  if (Xr && Xr > 0) {
    Vr_at_Xr = voltageRiseAt({ I_A: I, rho_ohm_m: rho, L_m: L, x_m: Xr });
    Vr_perA_at_Xr = I > 0 ? Vr_at_Xr / I : null;
  }

  return {
    inputs: { I_A: I, L_m: L, rho_ohm_m: rho, X_r_m: Xr },
    Vr_max,
    Vr_at_Xr,
    Vr_perA_at_Xr,
    X_r_m: Xr,
    data,
    unitVr: "V",
    unitVrPerA: "V/A",
  };
}
