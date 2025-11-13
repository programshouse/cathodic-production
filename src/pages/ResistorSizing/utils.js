// Utilities for Rectifier Sizing

export function toVolts(val, unit = "V") {
  const v = Number(val || 0);
  if (unit === "mV") return v / 1000;
  return v;
}

export function toAmps(val, unit = "A") {
  const v = Number(val || 0);
  if (unit === "mA") return v / 1000;
  return v;
}

// Equations:
// V_required = (I_required × R_circuit) + V_driving
// V_driving  = |E_protect − E_native|
// I_rectifier = I_required × Safety Factor
// V_rectifier = V_required × Safety Factor
// P_rectifier = V_required × I_required
export function computeRectifierSizing({
  I_required_A,
  R_circuit_ohm,
  E_native_input,
  E_native_unit = "V",
  E_protect_input,
  E_protect_unit = "V",
  safety_factor = 1,
}) {
  const I = Number(I_required_A || 0);
  const Rc = Number(R_circuit_ohm || 0);
  const En = toVolts(E_native_input, E_native_unit);
  const Ep = toVolts(E_protect_input, E_protect_unit);
  const SF = Number(safety_factor || 1);

  const V_driving = Math.abs(Ep - En);
  const V_required = I * Rc + V_driving;
  const I_rectifier = I * SF;
  const V_rectifier = V_required * SF;
  const P_rectifier = V_required * I;

  return {
    inputs: { I_required_A: I, R_circuit_ohm: Rc, E_native_V: En, E_protect_V: Ep, safety_factor: SF },
    V_required,
    V_driving,
    I_rectifier,
    V_rectifier,
    P_rectifier,
    units: { V: "V", I: "A", P: "W" },
  };
}
