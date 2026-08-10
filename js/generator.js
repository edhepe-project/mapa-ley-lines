import {
  CHUNK_SIZE, MAX_CACHED_CHUNKS, BIOME_TYPES, FLAVOR,
  NODE_TYPES, NODE_CONNECT_RADIUS, NODE_MAX_LINKS, EARTH_TEMPLATES, CELESTIAL_CONFIGS
} from './config.js';
import { hashChunk, mulberry32, generateContinentName, generateNodeName } from './utils.js';
import { chunkCache, continentOverrides, nodeOverrides, biomeOverrides } from './state.js';

export function chunkOriginWorld(cx, cy) {
  return { x: cx * CHUNK_SIZE, y: cy * CHUNK_SIZE };
}

const SUPER = 8; // Bloque más grande (8000 unidades) para dar holgura

export function continentHostForBlock(scx, scy) {
  const rng = mulberry32(hashChunk(scx * 92821 + 17, scy * 92821 + 17));
  const spawnChance = 0.65;
  if (rng() >= spawnChance) return null;
  // Mantenemos la aleatoriedad pero restringimos el nacimiento a los chunks centrales del bloque (índices 2, 3, 4, 5).
  // Esto deja un margen vacío garantizado en los bordes del bloque de al menos 2 chunks.
  const slotX = 2 + Math.floor(rng() * 4); 
  const slotY = 2 + Math.floor(rng() * 4);
  return { cx: scx * SUPER + slotX, cy: scy * SUPER + slotY };
}

export function isChunkContinentHost(cx, cy) {
  const scx = Math.floor(cx / SUPER);
  const scy = Math.floor(cy / SUPER);
  const host = continentHostForBlock(scx, scy);
  return host && host.cx === cx && host.cy === cy;
}

function continentKey(c) { return Math.round(c.cx0) + "," + Math.round(c.cy0); }
function biomeKey(continent, i) { return continentKey(continent) + "|" + i; }

function applyContinentOverride(continent) {
  const o = continentOverrides.get(continentKey(continent));
  if (o) { continent.name = o.name; continent.notes = o.notes; }
  return continent;
}
function applyNodeOverride(node) {
  const o = nodeOverrides.get(node.id);
  if (o) { node.name = o.name; node.notes = o.notes; }
  return node;
}
function applyBiomeOverrides(continent) {
  continent.biomes.forEach((b, i) => {
    const o = biomeOverrides.get(biomeKey(continent, i));
    if (o) { b.name = o.name; b.resource = o.resource; b.tier = o.tier; }
  });
}

export function generateChunk(cx, cy) {
  const key = cx + "," + cy;
  if (chunkCache.has(key)) {
    const v = chunkCache.get(key);
    chunkCache.delete(key);
    chunkCache.set(key, v);
    return v;
  }

  const rng = mulberry32(hashChunk(cx, cy));
  const origin = chunkOriginWorld(cx, cy);
  const chunk = { cx, cy, continents: [], nodes: [] };
  let hostContinent = null;

  if (isChunkContinentHost(cx, cy)) {
    // Restaurar jitter aleatorio para la posición exacta
    const cx0 = origin.x + rng() * CHUNK_SIZE;
    const cy0 = origin.y + rng() * CHUNK_SIZE;
    const baseR = 3400 + rng() * 3800; // Radio multiplicado x4 para escala masiva
    const variant = rng() < 0.5 ? "land" : "highland";

    // --- Seleccionar Plantilla Tipo-Tierra ---
    const tIndex = Math.floor(rng() * EARTH_TEMPLATES.length);
    let template = [...EARTH_TEMPLATES[tIndex]];
    // Rotar e invertir aleatoriamente para ocultar que son clones exactos de la Tierra
    if (rng() < 0.5) template.reverse();
    const rot = Math.floor(rng() * 8);
    template = template.slice(rot).concat(template.slice(0, rot));
    
    // MUTACIÓN ESTRUCTURAL: Alterar los puntos base de la plantilla elegida.
    // Esto evita que todos los continentes basados en "África" o "Sudamérica" se vean
    // como copias exactas, rompiendo cinturas o ensanchando penínsulas al azar.
    template = template.map(val => Math.max(0.2, val + (rng() - 0.5) * 0.7));

    // Restaurar la fórmula armónica original que daba formas de continentes fantásticos
    const harmonics = [1, 2, 3, 5, 8, 13].map((k) => ({
      k,
      amp: (0.5 / Math.sqrt(k)) * (0.5 + rng() * 0.9),
      phase: rng() * Math.PI * 2
    }));

    const N = 40; 
    const points = [];
    for (let i = 0; i < N; i++) {
      const ang = (i / N) * Math.PI * 2;
      
      // Calcular multiplicador base según la plantilla (interpolación suave)
      const idx = (ang / (Math.PI * 2)) * 8;
      const i0 = Math.floor(idx) % 8;
      const i1 = (i0 + 1) % 8;
      const t = idx - Math.floor(idx);
      const smoothT = t * t * (3 - 2 * t);
      const shapeMult = template[i0] * (1 - smoothT) + template[i1] * smoothT;

      let mod = 1;
      for (const h of harmonics) mod += h.amp * Math.sin(h.k * ang + h.phase);
      
      mod = Math.max(0.28, mod); 
      // El radio final combina la plantilla estructural con el ruido costero.
      // Se multiplica por 1.45 porque las plantillas estructurales (con sus bahías naturales) 
      // tienden a reducir el tamaño promedio general del continente.
      const r = baseR * shapeMult * mod * 1.45;
      points.push({ x: cx0 + Math.cos(ang) * r, y: cy0 + Math.sin(ang) * r });
    }

    // Generar muchos más biomas para que funcionen como "regiones" y llenen el continente
    const biomeCount = 12 + Math.floor(rng() * 12); // Entre 12 y 24 biomas
    const biomes = [];
    for (let i = 0; i < biomeCount; i++) {
      const type = BIOME_TYPES[Math.floor(rng() * BIOME_TYPES.length)];
      const ang = rng() * Math.PI * 2;
      // Permitir que los biomas nazcan más cerca de las costas (hasta 0.75 del radio)
      const dist = rng() * baseR * 0.75; 
      biomes.push({
        type,
        name: type.name,
        resource: type.resource,
        tier: type.tier,
        x: cx0 + Math.cos(ang) * dist,
        y: cy0 + Math.sin(ang) * dist,
        // Radio gigante para que se solapen y pinten toda la tierra (0.6 a 1.2 del radio base)
        r: baseR * (0.6 + rng() * 0.6)
      });
    }

    const name = generateContinentName(rng);

    // --- Asignar Configuración Celeste ---
    // Cada continente tiene su propio cielo, elegido de forma determinista con su semilla.
    const sky = pickCelestialConfig(rng);

    hostContinent = { points, variant, biomes, sky, name, cx0, cy0, notes: "" };
    applyContinentOverride(hostContinent);
    applyBiomeOverrides(hostContinent);
    chunk.continents.push(hostContinent);
  }

  let nodeCount = Math.floor(rng() * 2.4);
  if (hostContinent && nodeCount === 0) nodeCount = 1;
  for (let i = 0; i < nodeCount; i++) {
    let x, y;
    if (hostContinent && i === 0) {
      const ang = rng() * Math.PI * 2;
      const dist = rng() * 1200; // Multiplicado x4
      x = hostContinent.cx0 + Math.cos(ang) * dist;
      y = hostContinent.cy0 + Math.sin(ang) * dist;
    } else {
      x = origin.x + rng() * CHUNK_SIZE;
      y = origin.y + rng() * CHUNK_SIZE;
    }
    const newNode = {
      id: key + "_" + i,
      x, y,
      seed: Math.floor(rng() * FLAVOR.length),
      name: generateNodeName(rng),
      type: NODE_TYPES[Math.floor(rng() * NODE_TYPES.length)],
      gateway: hostContinent && i === 0 ? hostContinent.name : null,
      notes: ""
    };
    applyNodeOverride(newNode);
    chunk.nodes.push(newNode);
  }

  chunkCache.set(key, chunk);
  if (chunkCache.size > MAX_CACHED_CHUNKS) {
    const oldestKey = chunkCache.keys().next().value;
    chunkCache.delete(oldestKey);
  }

  return chunk;
}

export function buildLeyConnections(visibleChunks) {
  const allNodes = [];
  const neighborIndex = new Map();

  for (const chunk of visibleChunks) {
    const neighbors = [];
    for (let dx = -1; dx <= 1; dx++) {
      for (let dy = -1; dy <= 1; dy++) {
        const nKey = (chunk.cx + dx) + "," + (chunk.cy + dy);
        const nChunk = chunkCache.get(nKey);
        if (nChunk) neighbors.push(...nChunk.nodes);
      }
    }
    neighborIndex.set(chunk.cx + "," + chunk.cy, neighbors);
    allNodes.push(...chunk.nodes);
  }

  const edges = [];
  const seen = new Set();
  const degree = new Map();

  const candidates = [];
  for (const chunk of visibleChunks) {
    const pool = neighborIndex.get(chunk.cx + "," + chunk.cy);
    for (const node of chunk.nodes) {
      for (const n of pool) {
        if (n.id === node.id) continue;
        const d = Math.hypot(n.x - node.x, n.y - node.y);
        if (d >= NODE_CONNECT_RADIUS) continue;
        const edgeKey = node.id < n.id ? node.id + "|" + n.id : n.id + "|" + node.id;
        if (seen.has(edgeKey)) continue;
        seen.add(edgeKey);
        candidates.push({ a: node, b: n, d });
      }
    }
  }
  candidates.sort((x, y) => x.d - y.d);

  for (const { a, b } of candidates) {
    const da = degree.get(a.id) || 0;
    const db = degree.get(b.id) || 0;
    if (da >= NODE_MAX_LINKS || db >= NODE_MAX_LINKS) continue;
    degree.set(a.id, da + 1);
    degree.set(b.id, db + 1);
    edges.push([a, b]);
  }

  return { nodes: allNodes, edges };
}

// Selecciona una configuración celeste usando probabilidades ponderadas (rarity).
function pickCelestialConfig(rng) {
  const r = rng();
  let cumulative = 0;
  for (const cfg of CELESTIAL_CONFIGS) {
    cumulative += cfg.rarity;
    if (r < cumulative) return cfg;
  }
  return CELESTIAL_CONFIGS[0]; // fallback
}
