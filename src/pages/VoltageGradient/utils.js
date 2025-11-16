// Utilities for Voltage Gradient calculations

export const SOURCE_TYPES = [
  { value: "distributed", label: "Distributed Anodes (Linear)" },
  { value: "remote", label: "Remote Anode (Point)" },
  { value: "shallow", label: "Shallow Groundbed (Line)" },
  { value: "rod", label: "Vertical Rod Anode" },
];

const TWO_PI = 2 * Math.PI;

// ---------- Unit helpers ----------

// current: A / mA -> A
export const currentToA = (val, unit = "A") => {
  const v = Number(val || 0);
  return unit === "mA" ? v / 1000 : v;
};

// resistivity: Ω·m / Ω·cm -> Ω·m
export const resistivityToOhmM = (val, unit = "ohm_m") => {
  const v = Number(val || 0);
  return unit === "ohm_cm" ? v / 100 : v; // 1 Ω·cm = 0.01 Ω·m
};

// length: m / ft -> m
export const lengthToM = (val, unit = "m") => {
  const v = Number(val || 0);
  return unit === "ft" ? v * 0.3048 : v;
};

// gradient conversion (V/m <-> V/cm)
export const gradientConvert = (val, toUnit = "V/m") => {
  const v = Number(val || 0);
  if (toUnit === "V/cm") return v / 100;
  return v; // V/m
};

// ---------- Core physics ----------

// Voltage gradient magnitude (V/m)
export function gradientVm({ sourceType, I, rho, d, s, L }) {
  if (d <= 0) return 0;

  switch (sourceType) {
    case "distributed":
      // Vm = ρI / (2π d)
      return (I * rho) / (TWO_PI * d);

    case "remote":
      // Vm = ρI / (2π d²)
      return (I * rho) / (TWO_PI * d * d);

    case "shallow":
      if (!s || s <= 0) return 0;
      // Vm = ρI / (2π d s)
      return (I * rho) / (TWO_PI * d * s);

    case "rod": {
      // For rod: derivative of Vr = (ρI / (2πL)) ln[(L + √(L² + x²))/x]
      const x = d;
      const Lm = Math.max(Number(L || 0), 1e-9);
      const R = Math.sqrt(Lm * Lm + x * x);
      const term = (1 / x) - x / ((Lm + R) * R);
      const Vm = ((rho * I) / (TWO_PI * Lm)) * term;
      return isFinite(Vm) ? Math.max(0, Vm) : 0;
    }

    default:
      return 0;
  }
}

// Potential V(x) in Volts
export function potentialAt({ sourceType, I, rho, x, s, L }) {
  if (x <= 0) x = 1e-6; // avoid singularities

  switch (sourceType) {
    case "distributed": {
      if (!s || s <= 0) return 0;
      const val = (I * rho) / TWO_PI * Math.log(s / x);
      return isFinite(val) ? val : 0;
    }

    case "remote": {
      // V = ρI / (2π x)
      return (I * rho) / (TWO_PI * x);
    }

    case "shallow": {
      if (!s || s <= 0) return 0;
      const val = (I * rho) / (TWO_PI * s) * Math.log(s / x);
      return isFinite(val) ? val : 0;
    }

    case "rod": {
      // Vr = (ρI / (2πL)) ln[(L + √(L² + x²))/x]
      const Lm = Math.max(Number(L || 0), 1e-9);
      const R = Math.sqrt(Lm * Lm + x * x);
      const val = (rho * I) / (TWO_PI * Lm) * Math.log((Lm + R) / x);
      return isFinite(val) ? val : 0;
    }

    default:
      return 0;
  }
}

// Build series V(x), Vm(x) vs distance x (m)
export function buildSeries({ sourceType, I, rho, s, L }) {
  // Generate x from 0.1 m to 100 m (log-spaced)
  const xs = [];
  const min = 0.1,
    max = 100,
    n = 120;
  const logMin = Math.log(min),
    logMax = Math.log(max);

  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = Math.exp(logMin + t * (logMax - logMin));
    xs.push(x);
  }

  return xs.map((x) => ({
    x,
    Vm: gradientVm({ sourceType, I, rho, d: x, s, L }),
    V: potentialAt({ sourceType, I, rho, x, s, L }),
  }));
}

// Main entry: expects same shape as VoltageGradientForm submit payload
export function computeVoltageGradient(inputs) {
  const {
    sourceType,
    I,
    IUnit,
    rho,
    rhoUnit,
    spacing,
    spacingUnit,
    pipelineDepth,
    pipelineDepthUnit,
    anodeDepth,
    anodeDepthUnit,
    anodeLength,
    anodeLengthUnit,
  } = inputs;

  // ---- Convert all to SI units ----
  const I_A = currentToA(I, IUnit); // A
  const rho_ohm_m = resistivityToOhmM(rho, rhoUnit); // Ω·m
  const s_m = lengthToM(spacing, spacingUnit); // m
  const pipeDepth_m = lengthToM(pipelineDepth, pipelineDepthUnit); // m
  const anodeDepth_m = lengthToM(anodeDepth, anodeDepthUnit); // m
  const anodeLength_m = lengthToM(anodeLength, anodeLengthUnit); // m

  const series = buildSeries({
    sourceType,
    I: I_A,
    rho: rho_ohm_m,
    s: s_m,
    L: anodeLength_m,
  });

  const Vm_max = series.reduce((m, p) => Math.max(m, p.Vm), 0);

  const d_pipe = Math.abs(anodeDepth_m - pipeDepth_m) || 1e-6;

  const Vm_pipe = gradientVm({
    sourceType,
    I: I_A,
    rho: rho_ohm_m,
    d: d_pipe,
    s: s_m,
    L: anodeLength_m,
  });

  const V_pipe = potentialAt({
    sourceType,
    I: I_A,
    rho: rho_ohm_m,
    x: d_pipe,
    s: s_m,
    L: anodeLength_m,
  });

  return {
    inputs: {
      ...inputs,
      I_SI: I_A,
      rho_SI: rho_ohm_m,
      spacing_SI: s_m,
      pipelineDepth_SI: pipeDepth_m,
      anodeDepth_SI: anodeDepth_m,
      anodeLength_SI: anodeLength_m,
    },
    Vm_max,
    Vm_pipe,
    V_pipe,
    d_pipe, // separation anode–pipeline in metres
    data: series.map((p) => ({ x_m: p.x, Vm: p.Vm, V: p.V })),
    unitVm: "V/m",
    unitV: "V",
  };
}
