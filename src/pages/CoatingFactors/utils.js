// Constants and utilities for Coating Factors module

export const COATING_TYPES = [
  { value: "liquid_epoxy", label: "Liquid Epoxy", initial: 0.0010, annual: 0.0001 },
  { value: "fbe", label: "Fusion Bonded-epoxy", initial: 0.0005, annual: 0.0001 },
  { value: "3lpe", label: "3-Layer Polyethylene (3LPE)", initial: 0.0001, annual: 0.0000 },
  { value: "3lpp", label: "3-Layer Polypropylene (3LPP)", initial: 0.0001, annual: 0.0000 },
  { value: "coal_tar", label: "Coal Tar", initial: 0.0050, annual: 0.0005 },
  { value: "concrete", label: "Concrete", initial: 0.0100, annual: 0.0010 },
];

export const SOIL_TYPES = [
  { value: "sandy", label: "Sandy", factor: 1.00 },
  { value: "loam", label: "Loam", factor: 1.02 },
  { value: "clay", label: "Clay", factor: 1.05 },
];

// temperatureFactor/soilFactor removed in favor of linear model: f = f_i + Δf·t

// Final coating breakdown factor
export function breakdownFactor({ coatingType, designLifeYears }) {
  const c = COATING_TYPES.find((x) => x.value === coatingType);
  if (!c) throw new Error("Invalid coating type");
  const years = Number(designLifeYears || 0);
  const final = Number(c.initial) + Number(c.annual) * years;
  return { final, initial: c.initial, annual: c.annual };
}

export function seriesOverLife({ coatingType, designLifeYears }) {
  const c = COATING_TYPES.find((x) => x.value === coatingType);
  if (!c) return [];
  const years = Math.max(0, Number(designLifeYears || 0));
  const data = [];
  for (let t = 0; t <= years; t += Math.max(1, Math.floor(years / 10))) {
    const value = Number(c.initial) + Number(c.annual) * t;
    data.push({ year: t, value });
  }
  if (data[data.length - 1]?.year !== years) {
    data.push({ year: years, value: Number(c.initial) + Number(c.annual) * years });
  }
  return data;
}
