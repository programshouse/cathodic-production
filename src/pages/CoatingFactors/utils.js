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

// Temperature factor approximations (from sample reference)
export function temperatureFactor(tempC) {
  // piecewise approximation
  if (tempC <= 25) return 1.00;
  if (tempC <= 40) return 1.01;
  if (tempC <= 60) return 1.02;
  if (tempC <= 80) return 1.03;
  return 1.05;
}

export function soilFactor(soilValue) {
  const s = SOIL_TYPES.find((x) => x.value === soilValue);
  return s ? s.factor : 1.0;
}

// Final coating breakdown factor
export function breakdownFactor({ coatingType, designLifeYears, temperatureC, soilType }) {
  const c = COATING_TYPES.find((x) => x.value === coatingType);
  if (!c) throw new Error("Invalid coating type");
  const tf = temperatureFactor(Number(temperatureC));
  const sf = soilFactor(soilType);
  const years = Number(designLifeYears || 0);
  const final = c.initial * (1 + c.annual * years) * tf * sf;
  return { final, initial: c.initial, annual: c.annual, tf, sf };
}

export function seriesOverLife({ coatingType, designLifeYears, temperatureC, soilType }) {
  const c = COATING_TYPES.find((x) => x.value === coatingType);
  if (!c) return [];
  const tf = temperatureFactor(Number(temperatureC));
  const sf = soilFactor(soilType);
  const years = Math.max(0, Number(designLifeYears || 0));
  const data = [];
  for (let t = 0; t <= years; t += Math.max(1, Math.floor(years / 10))) {
    const value = c.initial * (1 + c.annual * t) * tf * sf;
    data.push({ year: t, value });
  }
  if (data[data.length - 1]?.year !== years) {
    data.push({ year: years, value: c.initial * (1 + c.annual * years) * tf * sf });
  }
  return data;
}
