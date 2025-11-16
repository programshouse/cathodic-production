// /src/pages/attenuation/utils.js

// =========================
// Helpers
// =========================

const TWO_PI = 2 * Math.PI;

const num = (v) => {
  const n = Number(v);
  return Number.isFinite(n) ? n : 0;
};

/**
 * Main calculator – mirrors the Excel attenuation sheet and Word spec.
 *
 * Inputs (as sent from AttenuationForm in "spec" mode):
 *  - D, t, Lx, cd, rhoSteel, g, rhoSoil, PotNAT, PotDP, PotMIN, dx (all SI)
 *  - plus hidden aliases:
 *      OD_value, t_value, L_value,
 *      cd_A_per_m2, rho_steel_ohm_m, g_S_per_m,
 *      p_ohm_m, PotNAT_V, PotDP_V, PotMIN_V, points
 */
export function computeAttenuation(inputsRaw) {
  const inputs = { ...inputsRaw };

  // -------------------------
  // 1. Read inputs (SI units)
  // -------------------------
  const D =
    num(inputs.OD_value ?? inputs.D); // pipe diameter (m)
  const t =
    num(inputs.t_value ?? inputs.t); // wall thickness (m)
  const Lx =
    num(inputs.L_value ?? inputs.Lx); // protection length (m)
  const cd =
    num(inputs.cd_A_per_m2 ?? inputs.cd); // A/m²
  const rhoSteel =
    num(inputs.rho_steel_ohm_m ?? inputs.rhoSteel ?? 1.6e-7); // Ω·m
  const g =
    num(inputs.g_S_per_m ?? inputs.g); // S/m
  const rhoSoil =
    num(inputs.p_ohm_m ?? inputs.rhoSoil); // Ω·m
  const PotNAT =
    num(inputs.PotNAT_V ?? inputs.PotNAT); // V
  const PotDP =
    num(inputs.PotDP_V ?? inputs.PotDP); // V
  const PotMIN =
    inputs.PotMIN_V !== undefined
      ? num(inputs.PotMIN_V)
      : inputs.PotMIN !== undefined
      ? num(inputs.PotMIN)
      : NaN;

  const points = Math.max(2, num(inputs.points ?? 50));

  // basic guard – if geometry/materials missing, return zeros
  if (D <= 0 || t < 0 || Lx <= 0 || cd < 0 || rhoSteel <= 0 || g <= 0 || rhoSoil <= 0) {
    return {
      inputs: {
        ...inputs,
        D,
        t,
        Lx,
        cd,
        rhoSteel,
        g,
        rhoSoil,
        PotNAT,
        PotDP,
        PotMIN,
        points,
      },
      AX_m2: 0,
      A1_m2_per_m: 0,
      ATOT_m2: 0,
      IREQ_A: 0,
      RS_ohm_per_m: 0,
      RL_ohm: 0,
      alpha_1_per_m: 0,
      alpha: 0,
      deltaE_DP_V: PotDP - PotNAT,
      deltaE_req_V: 0,
      deltaE_calc_V: 0,
      Lx_m: Lx,
      PotMIN_V: PotMIN,
      data: [],
    };
  }

  // -----------------------------------------
  // 2. Excel-style equations (Calculations)
  // -----------------------------------------

  // 1) AX – X-sectional area of pipe steel
  // AX = π (D/2)² − π (D/2 − t)²
  const rOuter = D / 2;
  const rInner = Math.max(rOuter - t, 0);
  const AX = Math.PI * (rOuter * rOuter - rInner * rInner); // m²

  // 2) A1 – Unit surface area of pipe
  // A1 = π D  [m² per m]
  const A1 = Math.PI * D; // m²/m

  // 3) ATOT – Total pipe surface area (from DP to X)
  // ATOT = A1 × Lx
  const ATOT = A1 * Lx; // m²

  // 4) IREQ – Current required (one way from DP to X)
  // IREQ = ATOT × cd
  const IREQ = ATOT * cd; // A

  // 5) RS – Unit pipe linear resistance
  // RS = ρ_steel / AX
  const RS = rhoSteel / AX; // Ω/m

  // 6) RL – Coating leakage resistance (Excel/Word)
  // RL = ρ / (A1 × g)
  const RL = rhoSoil / (A1 * g); // Ω  (total leakage resistance)

  // 7) α – Attenuation constant
  // α = sqrt(RS / RL)
  const alpha = Math.sqrt(RS / RL); // 1/m (as used in spec)

  // 8) Voltage drop along pipe (potential attenuation)
  // E(x) = PotNAT + (PotDP − PotNAT) · e^(−α x)
  const deltaPot = PotDP - PotNAT;
  const potentialAt = (x) => PotNAT + deltaPot * Math.exp(-alpha * x);

  // 9) Values at intervals 0, 2, 4, …, Lx
  const dx = Lx / (points - 1);
  const data = [];
  for (let i = 0; i < points; i++) {
    const x = i * dx;
    const Vx = potentialAt(x);
    data.push({
      x_m: x,
      V: Vx,
      ATOT_m2: ATOT,
      IREQ_A: IREQ,
      RS_ohm_per_m: RS,
      RL_ohm: RL,
      alpha_1_per_m: alpha,
      belowPotMIN:
        Number.isFinite(PotMIN) && !Number.isNaN(PotMIN)
          ? Vx <= PotMIN
          : null,
    });
  }

  const V_L = potentialAt(Lx);
  const deltaE_DP = PotDP - PotNAT;
  const deltaE_calc = V_L - PotNAT;
  const deltaE_req = deltaE_calc; // placeholder (you can change later)

  return {
    inputs: {
      ...inputs,
      D,
      t,
      Lx,
      cd,
      rhoSteel,
      g,
      rhoSoil,
      PotNAT,
      PotDP,
      PotMIN,
      points,
    },
    AX_m2: AX,
    A1_m2_per_m: A1,
    ATOT_m2: ATOT,
    IREQ_A: IREQ,
    RS_ohm_per_m: RS,
    RL_ohm: RL,
    alpha_1_per_m: alpha,
    alpha, // convenience for AttenuationResults
    deltaE_DP_V: deltaE_DP,
    deltaE_req_V: deltaE_req,
    deltaE_calc_V: deltaE_calc,
    Lx_m: Lx,
    PotMIN_V: PotMIN,
    data,
  };
}
