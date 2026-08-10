import { ROUTE_COLORS } from './config.js';

export const chunkCache = new Map();
export const discoveredNodes = new Set();
export const discoveredContinents = new Set();
export const continentOverrides = new Map();
export const nodeOverrides = new Map();
export const biomeOverrides = new Map();

export let routeSeq = 0;
export let routes = [];
export let activeRouteIndex = 0;

export let leyLinesVisible = true;
export let routeMode = false;

// Helpers to update variables that might be reassigned
export function setRouteSeq(val) { routeSeq = val; }
export function setRoutes(val) { routes = val; }
export function setActiveRouteIndex(val) { activeRouteIndex = val; }
export function setLeyLinesVisible(val) { leyLinesVisible = val; }
export function setRouteMode(val) { routeMode = val; }

function mapToObject(map) {
  const obj = {};
  for (const [k, v] of map) obj[k] = v;
  return obj;
}
function objectToMap(obj, map) {
  map.clear();
  for (const k in obj) map.set(k, obj[k]);
}

export function saveState() {
  const state = {
    discoveredNodes: Array.from(discoveredNodes),
    discoveredContinents: Array.from(discoveredContinents),
    continentOverrides: mapToObject(continentOverrides),
    nodeOverrides: mapToObject(nodeOverrides),
    biomeOverrides: mapToObject(biomeOverrides),
    routeSeq,
    routes,
    activeRouteIndex,
    leyLinesVisible,
    routeMode
  };
  localStorage.setItem('mapaLeyLinesState', JSON.stringify(state));
}

export function loadState() {
  const data = localStorage.getItem('mapaLeyLinesState');
  if (!data) return;
  try {
    const state = JSON.parse(data);
    
    discoveredNodes.clear();
    if (state.discoveredNodes) state.discoveredNodes.forEach(id => discoveredNodes.add(id));
    
    discoveredContinents.clear();
    if (state.discoveredContinents) state.discoveredContinents.forEach(id => discoveredContinents.add(id));
    
    if (state.continentOverrides) objectToMap(state.continentOverrides, continentOverrides);
    if (state.nodeOverrides) objectToMap(state.nodeOverrides, nodeOverrides);
    if (state.biomeOverrides) objectToMap(state.biomeOverrides, biomeOverrides);
    
    if (state.routeSeq !== undefined) routeSeq = state.routeSeq;
    if (state.routes) routes = state.routes;
    if (state.activeRouteIndex !== undefined) activeRouteIndex = state.activeRouteIndex;
    if (state.leyLinesVisible !== undefined) leyLinesVisible = state.leyLinesVisible;
    if (state.routeMode !== undefined) routeMode = state.routeMode;
    
  } catch (e) {
    console.error("Error loading state from localStorage", e);
  }
}
