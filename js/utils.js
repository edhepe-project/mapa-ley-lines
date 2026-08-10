import { NAME_A, NAME_B, NODE_SUFFIX } from './config.js';

export function hashChunk(cx, cy) {
  let h = (cx | 0) * 374761393 + (cy | 0) * 668265263;
  h = (h ^ (h >>> 13)) * 1274126177;
  h = h ^ (h >>> 16);
  return h >>> 0;
}

export function mulberry32(seed) {
  let a = seed >>> 0;
  return function () {
    a |= 0; a = (a + 0x6D2B79F5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

export function generateContinentName(rng) {
  const parts = 2 + (rng() < 0.4 ? 1 : 0);
  let s = NAME_A[Math.floor(rng() * NAME_A.length)];
  for (let i = 1; i < parts; i++) s += NAME_B[Math.floor(rng() * NAME_B.length)];
  return s;
}

export function generateNodeName(rng) {
  const base = NAME_A[Math.floor(rng() * NAME_A.length)] + NAME_B[Math.floor(rng() * NAME_B.length)];
  const suffix = NODE_SUFFIX[Math.floor(rng() * NODE_SUFFIX.length)];
  return base + " " + suffix;
}

export function pointInPolygon(x, y, points) {
  let inside = false;
  for (let i = 0, j = points.length - 1; i < points.length; j = i++) {
    const xi = points[i].x, yi = points[i].y;
    const xj = points[j].x, yj = points[j].y;
    const intersect = (yi > y) !== (yj > y) &&
      x < ((xj - xi) * (y - yi)) / (yj - yi) + xi;
    if (intersect) inside = !inside;
  }
  return inside;
}
