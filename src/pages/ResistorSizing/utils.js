// /src/pages/resistor-sizing/utils.js

// Utilities for Variable Resistor Sizing (CP)
//
// Equations:
//   R_nominal   = V_drop / I_design
//   P_required  = I_design² × R_nominal
//   Adjustable range: 0 → 2 × R_nominal
//   P_recommended = P_required × Safety Factor
//
// We also build a power profile P(R) = I² R for 0..2R_nominal
// to drive the Recharts line chart.

export function computeVariableResistorSizing({
  I_design_A,
  V_drop_V,
  safety_factor = 1,
}) {
  const I = Number(I_design_A || 0);
  const V = Number(V_drop_V || 0);
  const SF = Number(safety_factor || 1);

  const R_nominal = I > 0 ? V / I : 0;
  const R_min = 0;
  const R_max = 2 * R_nominal;

  const P_required = I * I * R_nominal;
  const P_recommended = P_required * SF;

  // Build chart data: R from 0 → 2R in ~40 steps
  const data = [];
  const steps = 40;

  if (R_max > 0 && I > 0) {
    for (let i = 0; i <= steps; i++) {
      const R = (R_max * i) / steps;
      const P = I * I * R;
      data.push({
        R_ohm: R,
        P_W: P,
      });
    }
  }

  return {
    inputs: { I_design_A: I, V_drop_V: V, safety_factor: SF },
    R_nominal,
    R_min,
    R_max,
    P_required,
    P_recommended,
    data,
    units: {
      R: "Ω",
      P: "W",
    },
  };
}
