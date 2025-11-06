// Utilities for Voltage Gradient calculations

export const SOURCE_TYPES = [
  { value: "distributed", label: "Distributed Anodes (Linear)" },
  { value: "remote", label: "Remote Anode (Point)" },
  { value: "shallow", label: "Shallow Groundbed (Line)" },
];

const TWO_PI = 2 * Math.PI;

// Unit helpers
export const currentToA = (val, unit = "A") => {
  const v = Number(val || 0);
  return unit === "mA" ? v / 1000 : v;
};

export const resistivityToOhmM = (val, unit = "ohm-m") => {
  const v = Number(val || 0);
  return unit === "ohm-cm" ? v / 100 : v; // 1 Ω·cm = 0.01 Ω·m
};

export const lengthToM = (val, unit = "m") => {
  const v = Number(val || 0);
  return unit === "ft" ? v * 0.3048 : v;
};

export const gradientConvert = (val, toUnit = "V/m") => {
  const v = Number(val || 0);
  if (toUnit === "V/cm") return v / 100;
  return v; // V/m
};

export function gradientVm({ sourceType, I, rho, d, s }) {
  // Returns Vm in V/m
  if (d <= 0) return 0;
  switch (sourceType) {
    case "distributed":
      return (I * rho) / (TWO_PI * d);
    case "remote":
      return (I * rho) / (TWO_PI * d * d);
    case "shallow":
      if (!s || s <= 0) return 0;
      return (I * rho) / (TWO_PI * d * s);
    default:
      return 0;
  }
}

export function potentialAt({ sourceType, I, rho, x, s }) {
  // Returns V(x) in Volts
  if (x <= 0) x = 1e-6; // avoid singularities
  switch (sourceType) {
    case "distributed": {
      if (!s || s <= 0) return 0;
      const val = (I * rho) / TWO_PI * Math.log(s / x);
      return isFinite(val) ? val : 0;
    }
    case "remote": {
      return (I * rho) / (TWO_PI * x);
    }
    case "shallow": {
      if (!s || s <= 0) return 0;
      const val = (I * rho) / (TWO_PI * s) * Math.log(s / x);
      return isFinite(val) ? val : 0;
    }
    default:
      return 0;
  }
}

export function buildSeries({ sourceType, I, rho, s }) {
  // Generate series for x from 0.1 m to 150 m (log-spaced for smoothness)
  const xs = [];
  const min = 0.1, max = 150, n = 120;
  const logMin = Math.log(min), logMax = Math.log(max);
  for (let i = 0; i < n; i++) {
    const t = i / (n - 1);
    const x = Math.exp(logMin + t * (logMax - logMin));
    xs.push(x);
  }
  return xs.map((x) => ({
    x,
    Vm: gradientVm({ sourceType, I, rho, d: x, s }),
    V: potentialAt({ sourceType, I, rho, x, s }),
  }));
}

export function computeVoltageGradient(inputs) {
  const { sourceType, I, rho, spacing, pipelineDepth, anodeDepth } = inputs;
  const s = spacing || 0;
  const series = buildSeries({ sourceType, I, rho, s });

  const Vm_max = series.reduce((m, p) => Math.max(m, p.Vm), 0);
  const d_pipe = Math.abs((anodeDepth || 0) - (pipelineDepth || 0));
  const Vm_pipe = gradientVm({ sourceType, I, rho, d: Math.max(d_pipe, 1e-6), s });
  const V_pipe = potentialAt({ sourceType, I, rho, x: Math.max(d_pipe, 1e-6), s });

  return {
    inputs: { ...inputs },
    Vm_max,
    Vm_pipe,
    V_pipe,
    d_pipe,
    data: series.map((p) => ({ x_m: p.x, Vm: p.Vm, V: p.V })),
    unitVm: "V/m",
    unitV: "V",
  };
}
