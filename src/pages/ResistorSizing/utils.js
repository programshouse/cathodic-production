// Utilities for Variable Resistor Sizing (CP)

// Equations:
// R_nominal = V_drop / I_design
// P_required = I_design² × R_nominal
// Adjustable range: 0 → 2 × R_nominal
// P_recommended = P_required × Safety Factor
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

  return {
    inputs: { I_design_A: I, V_drop_V: V, safety_factor: SF },
    R_nominal,
    R_min,
    R_max,
    P_required,
    P_recommended,
    units: {
      R: "Ω",
      P: "W",
    },
  };
}
