// Surface area calculation utilities (no hooks)

const PI = Math.PI;

// Unit conversion to meters
export function toMeters(value, unit) {
  const v = Number(value);
  if (!isFinite(v)) return 0;
  switch ((unit || 'm').toLowerCase()) {
    case 'm':
      return v;
    case 'cm':
      return v / 100;
    case 'mm':
      return v / 1000;
    case 'in':
    case 'inch':
    case 'inches':
      return v * 0.0254;
    case 'ft':
    case 'feet':
      return v * 0.3048;
    default:
      return v;
  }
}

export function m2ToFt2(a) {
  const av = Number(a);
  if (!isFinite(av)) return 0;
  return av * 10.76391041671; // 1 m^2 = 10.7639 ft^2
}

// Calculations
export function pipelineSurfaceArea({ diameter_m, length_m }) {
  // A = PI * D * L
  return PI * diameter_m * length_m;
}

export function internalTankSurfaceArea({ diameter_m, height_m }) {
  // Ashell = PI * D * h
  // Abottom = PI * r^2 (r = D/2)
  const r = diameter_m / 2;
  const Ashell = PI * diameter_m * height_m;
  const Abottom = PI * r * r;
  return {
    Ashell,
    Abottom,
    Atotal: Ashell + Abottom,
  };
}

export function externalTankBottomAreaFlat({ diameter_m }) {
  // A = PI * r^2
  const r = diameter_m / 2;
  return PI * r * r;
}

export const STRUCTURE_TYPES = [
  { value: 'pipeline', label: 'Pipeline' },
  { value: 'tank-internal', label: 'Tank - Internal (Shell + Bottom)' },
  { value: 'tank-external-bottom', label: 'Tank - External Bottom (Flat)' },
];

export const LENGTH_UNITS = ['m', 'cm', 'mm', 'in', 'ft'];
