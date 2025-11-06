// Utilities for Variable Resistor & Shunt Resistor Sizing (Module 10)

export function toVolts(val, unit = "V") {
  const v = Number(val || 0);
  if (unit === "mV") return v / 1000;
  return v;
}

export function fromVolts(val, unit = "V") {
  const v = Number(val || 0);
  if (unit === "mV") return v * 1000;
  return v;
}

export function toAmps(val, unit = "A") {
  const v = Number(val || 0);
  if (unit === "mA") return v / 1000;
  return v;
}

export function computeVariableResistor({ V_rect_V, I_target_A, R_circuit_ohm }) {
  const I = Number(I_target_A || 0);
  const V = Number(V_rect_V || 0);
  const Rc = Number(R_circuit_ohm || 0);
  const Rv = V > 0 && I > 0 ? V / I - Rc : 0;
  const P_var_W = I * I * Math.max(Rv, 0);
  return { Rv_ohm: Rv, P_var_W };
}

export function computeShunt({ V_shunt_input, V_shunt_unit = "mV", I_shunt_A }) {
  const Vsh_V = toVolts(V_shunt_input, V_shunt_unit);
  const Ish_A = Number(I_shunt_A || 0);
  const R_shunt = Ish_A > 0 ? Vsh_V / Ish_A : 0;
  const P_shunt_W = Ish_A * Ish_A * R_shunt;
  return { R_shunt_ohm: R_shunt, P_shunt_W };
}

export function computeResistorSizing(inputs) {
  // Expect SI base inside (volts in V, current in A, resistance in ohm)
  const varPart = computeVariableResistor({
    V_rect_V: inputs.V_rect_V,
    I_target_A: inputs.I_target_A,
    R_circuit_ohm: inputs.R_circuit_ohm,
  });
  const shPart = computeShunt({
    V_shunt_input: inputs.V_shunt_value,
    V_shunt_unit: inputs.V_shunt_unit || "mV",
    I_shunt_A: inputs.I_shunt_A,
  });

  return {
    inputs,
    ...varPart,
    ...shPart,
    units: { R: "Ω", P: "W" },
  };
}
