// Rectifier Output (Resistor Sizing) calculations

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

// V_required = I_required * R_circuit + V_driving + V_anode
// I_rectifier = I_required * SF
// V_rectifier = V_required * SF
// Power = V_required * I_required
export function computeVariableResistor({ I_req_A, R_circuit_ohm, V_drive_V, V_anode_V, safety_factor }) {
  const I = Number(I_req_A || 0);
  const Rc = Number(R_circuit_ohm || 0);
  const Vd = Number(V_drive_V || 0);
  const Va = Number(V_anode_V || 0);
  const SF = Number(safety_factor || 1);

  const V_required = I * Rc + Vd + Va;
  const I_rectifier = I * SF;
  const V_rectifier = V_required * SF;
  const P_required = V_required * I;

  return {
    inputs: { I_req_A: I, R_circuit_ohm: Rc, V_drive_V: Vd, V_anode_V: Va, safety_factor: SF },
    V_required,
    I_rectifier,
    V_rectifier,
    P_required,
    units: { V: "V", I: "A", P: "W" },
  };
}
