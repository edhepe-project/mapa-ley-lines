import {
  TIER_LABEL, FLAVOR, ROUTE_COLORS, LEAGUE_UNITS, LEAGUES_PER_DAY
} from './config.js';
import {
  discoveredNodes, discoveredContinents, continentOverrides, nodeOverrides, biomeOverrides,
  routes, activeRouteIndex, leyLinesVisible, routeMode,
  setRouteSeq, setRoutes, setActiveRouteIndex, setLeyLinesVisible, setRouteMode,
  routeSeq, saveState
} from './state.js';
import { chunkCache } from './state.js';
import { camera } from './renderer.js'; // We'll export camera from renderer

let panelTarget = null; // { kind: 'node'|'continent', obj }

export function makeRoute(name) {
  const color = ROUTE_COLORS[routes.length % ROUTE_COLORS.length];
  setRouteSeq(routeSeq + 1);
  return { id: "r" + routeSeq, name, color, points: [], step: 0 };
}

export function activeRoute() {
  if (routes.length === 0) {
    routes.push(makeRoute("Ruta 1"));
    saveState();
  }
  return routes[activeRouteIndex];
}

export function toggleLeyLines() {
  setLeyLinesVisible(!leyLinesVisible);
  const btn = document.getElementById("btnLey");
  btn.textContent = "🔗 Líneas Ley: " + (leyLinesVisible ? "ON" : "OFF");
  btn.classList.toggle("on", leyLinesVisible);
  saveState();
}

export function toggleRouteMode() {
  setRouteMode(!routeMode);
  const btn = document.getElementById("btnRoute");
  btn.textContent = "🧭 Modo Ruta: " + (routeMode ? "ON" : "OFF");
  btn.classList.toggle("route-on", routeMode);
  document.getElementById("routePanel").style.display = routeMode ? "block" : "none";
  if (routeMode) { closePanel(); renderRoutePanel(); }
  saveState();
}

export function addToRoute(node) {
  const r = activeRoute();
  if (r.points.length && r.points[r.points.length - 1].id === node.id) return;
  r.points.push(node);
  r.step = r.points.length - 1;
  discoveredNodes.add(node.id);
  renderRoutePanel();
  saveState();
}

export function stepRoute(delta) {
  const r = activeRoute();
  r.step = Math.max(0, Math.min(r.points.length - 1, r.step + delta));
  renderRoutePanel();
  saveState();
}

export function undoRoute() {
  const r = activeRoute();
  r.points.pop();
  r.step = Math.max(0, r.points.length - 1);
  renderRoutePanel();
  saveState();
}

export function resetRoute() {
  const r = activeRoute();
  r.points = [];
  r.step = 0;
  renderRoutePanel();
  saveState();
}

export function addNewRoute() {
  routes.push(makeRoute("Ruta " + (routes.length + 1)));
  setActiveRouteIndex(routes.length - 1);
  renderRoutePanel();
  saveState();
}

export function selectRoute(i) {
  setActiveRouteIndex(i);
  renderRoutePanel();
  saveState();
}

function routeDistance(points, upTo) {
  let d = 0;
  for (let i = 0; i < upTo && i < points.length - 1; i++) {
    d += Math.hypot(points[i + 1].x - points[i].x, points[i + 1].y - points[i].y);
  }
  return d;
}

// --- FIN sistema de Luz eliminado ---

export function renderRoutePanel() {
  const r = activeRoute();
  const tabsEl = document.getElementById("routeTabs");
  tabsEl.innerHTML = "";
  routes.forEach((rt, i) => {
    const tab = document.createElement("span");
    tab.className = "route-tab" + (i === activeRouteIndex ? " active" : "");
    tab.style.setProperty("--tabColor", rt.color.hex);
    tab.textContent = rt.name;
    tab.onclick = () => selectRoute(i);
    tabsEl.appendChild(tab);
  });
  const addTab = document.createElement("span");
  addTab.className = "route-tab add";
  addTab.textContent = "+";
  addTab.title = "Nueva ruta";
  addTab.onclick = addNewRoute;
  tabsEl.appendChild(addTab);

  const stepsEl = document.getElementById("routeSteps");
  stepsEl.innerHTML = "";
  r.points.forEach((n, i) => {
    const chip = document.createElement("span");
    chip.className = "step-chip" + (i < r.step ? " done" : "") + (i === r.step ? " current" : "");
    chip.textContent = (i + 1) + ". " + n.name;
    stepsEl.appendChild(chip);
  });
  document.getElementById("routeCounter").textContent =
    (r.points.length ? r.step + 1 : 0) + " / " + r.points.length;
  document.getElementById("btnPrev").disabled = r.step <= 0;
  document.getElementById("btnNext").disabled = r.step >= r.points.length - 1;
  document.getElementById("btnUndo").disabled = r.points.length === 0;

  const totalLeagues = routeDistance(r.points, r.points.length) / LEAGUE_UNITS;
  const doneLeagues = routeDistance(r.points, r.step) / LEAGUE_UNITS;
  document.getElementById("routeDistance").textContent = r.points.length < 2
    ? "—"
    : Math.round(doneLeagues) + " / " + Math.round(totalLeagues) + " leguas · ~" +
      Math.max(1, Math.round(totalLeagues / LEAGUES_PER_DAY)) + " días de viaje estimados";
}

function nearestContinent(node, maxDist) {
  let best = null, bestD = maxDist;
  for (const chunk of chunkCache.values()) {
    for (const c of chunk.continents) {
      const d = Math.hypot(c.cx0 - node.x, c.cy0 - node.y);
      if (d < bestD) { bestD = d; best = c; }
    }
  }
  return best ? { continent: best, dist: bestD } : null;
}

export function openNodePanel(node) {
  panelTarget = { kind: "node", obj: node };
  discoveredNodes.add(node.id);
  document.getElementById("panelTitle").textContent = node.name;
  document.getElementById("panelCoord").textContent =
    "X: " + Math.round(node.x) + "  ·  Y: " + Math.round(node.y) +
    (discoveredNodes.has(node.id) ? "  ·  ✓ descubierto" : "");
  const badge = document.getElementById("panelBadge");
  badge.textContent = node.type.name + (node.gateway ? " · Puerta a " + node.gateway : "");
  badge.style.color = "rgb(" + node.type.color + ")";
  badge.style.borderColor = "rgba(" + node.type.color + ",0.5)";

  let text = FLAVOR[node.seed] + " Es " + node.type.desc + ".";
  const near = nearestContinent(node, 2500);
  if (near) {
    text += " Se encuentra a ~" + Math.round(near.dist) + " unidades de " + near.continent.name + ".";
  }
  document.getElementById("panelText").textContent = text;
  document.getElementById("panelBiomes").innerHTML = "";
  // Mostrar el diario con un mensaje diferente si hay historia o no
  const notesEl = document.getElementById("panelNotes");
  if (node.notes && node.notes.trim().length > 0) {
    notesEl.innerHTML = '<span style="color:#ffcf5e; font-size:10px; letter-spacing:1px;">📖 DIARIO DEL VIAJE</span><br>' + node.notes;
  } else {
    notesEl.innerHTML = '<span style="color:#556; font-size:10px; font-style:italic;">Este lugar aún no ha sido visitado por la protagonista.</span>';
  }
  notesEl.style.display = "block";
  document.getElementById("panelEdit").style.display = "none";
  document.getElementById("panel").style.display = "block";
  saveState();
}

function continentKey(c) { return Math.round(c.cx0) + "," + Math.round(c.cy0); }
function biomeKey(continent, i) { return continentKey(continent) + "|" + i; }

export function openContinentPanel(continent) {
  panelTarget = { kind: "continent", obj: continent };
  discoveredContinents.add(continentKey(continent));
  document.getElementById("panelTitle").textContent = continent.name;
  document.getElementById("panelCoord").textContent =
    "X: " + Math.round(continent.cx0) + "  ·  Y: " + Math.round(continent.cy0) + "  ·  ✓ descubierto";
  const badge = document.getElementById("panelBadge");
  badge.textContent = continent.variant === "highland" ? "Tierras altas" : "Continente";
  badge.style.color = "#ffe9b8";
  badge.style.borderColor = "rgba(255,233,184,0.4)";
  document.getElementById("panelText").textContent =
    "Mundo autosuficiente con " + continent.biomes.length + " biomas registrados.";

  // --- Mostrar el Cielo del Continente ---
  const oldSky = document.getElementById("skyBlock");
  if (oldSky) oldSky.remove();
  if (continent.sky) {
    const s = continent.sky;
    const skyDiv = document.createElement("div");
    skyDiv.id = "skyBlock";
    skyDiv.style.cssText = "margin:10px 0 8px; padding:8px 10px; border-radius:6px; border:1px solid " + s.color + "44; background:" + s.color + "18;";
    skyDiv.innerHTML =
      '<div style="font-size:18px; letter-spacing:3px; margin-bottom:4px;">' + s.icon + '</div>'
      + '<div style="color:' + s.color + '; font-size:11px; font-weight:bold; letter-spacing:1px; margin-bottom:3px;">' + s.name.toUpperCase() + '</div>'
      + '<div style="font-size:11px; color:#c8dde8; font-style:italic; margin-bottom:4px;">' + s.skyDesc + '</div>'
      + '<div style="font-size:10.5px; color:#aac; border-top:1px solid ' + s.color + '33; padding-top:4px;">' + s.biomeEffect + '</div>';
    document.getElementById("panelBiomes").before(skyDiv);
  }

  renderBiomeList(continent);
  document.getElementById("panelNotes").textContent = continent.notes ? "📝 " + continent.notes : "";
  document.getElementById("panelEdit").style.display = "none";
  document.getElementById("panel").style.display = "block";
  saveState();
}

export function renderBiomeList(continent) {
  const list = document.getElementById("panelBiomes");
  list.innerHTML = "";
  continent.biomes.forEach((b, i) => {
    const li = document.createElement("li");
    li.className = "biome-row";
    const info = document.createElement("div");
    info.className = "biome-info";
    info.innerHTML =
      '<span class="biome-name">' + b.name +
      (b.name !== b.type.name ? ' <span class="custom-tag">(personalizado)</span>' : '') + '</span>' +
      '<span class="biome-res">' + b.resource + '<br><span class="tier">' + TIER_LABEL[b.tier] + '</span></span>';
    const editIcon = document.createElement("span");
    editIcon.className = "biome-edit-icon";
    editIcon.textContent = "✎";
    editIcon.title = "Editar este bioma";
    editIcon.onclick = () => toggleBiomeEdit(continent, i);
    li.appendChild(info);
    li.appendChild(editIcon);

    const form = document.createElement("div");
    form.className = "biome-edit-form";
    form.id = "biomeEdit_" + i;
    form.style.display = "none";
    form.innerHTML =
      '<input type="text" id="bName_' + i + '" placeholder="Nombre del bioma" value="' + b.name + '">' +
      '<input type="text" id="bRes_' + i + '" placeholder="Recurso" value="' + b.resource + '">' +
      '<select id="bTier_' + i + '">' +
        [1, 2, 3].map((t) => '<option value="' + t + '"' + (t === b.tier ? " selected" : "") + '>' + TIER_LABEL[t] + '</option>').join("") +
      '</select>' +
      '<div class="biome-edit-actions">' +
        '<button type="button" id="bSave_' + i + '">Guardar</button>' +
        '<button type="button" id="bReset_' + i + '" class="ghost">Restaurar</button>' +
      '</div>';
    li.appendChild(form);
    list.appendChild(li);
    
    // Bind events
    setTimeout(() => {
      document.getElementById("bSave_" + i).onclick = () => saveBiomeEdit(i);
      document.getElementById("bReset_" + i).onclick = () => resetBiomeEdit(i);
    }, 0);
  });
}

export function toggleBiomeEdit(continent, i) {
  panelTarget = { kind: "continent", obj: continent };
  const form = document.getElementById("biomeEdit_" + i);
  form.style.display = form.style.display === "none" ? "flex" : "none";
}

export function saveBiomeEdit(i) {
  if (!panelTarget || panelTarget.kind !== "continent") return;
  const continent = panelTarget.obj;
  const name = document.getElementById("bName_" + i).value.trim() || continent.biomes[i].type.name;
  const resource = document.getElementById("bRes_" + i).value.trim() || continent.biomes[i].type.resource;
  const tier = parseInt(document.getElementById("bTier_" + i).value, 10);
  continent.biomes[i].name = name;
  continent.biomes[i].resource = resource;
  continent.biomes[i].tier = tier;
  biomeOverrides.set(biomeKey(continent, i), { name, resource, tier });
  renderBiomeList(continent);
  saveState();
}

export function resetBiomeEdit(i) {
  if (!panelTarget || panelTarget.kind !== "continent") return;
  const continent = panelTarget.obj;
  const type = continent.biomes[i].type;
  continent.biomes[i].name = type.name;
  continent.biomes[i].resource = type.resource;
  continent.biomes[i].tier = type.tier;
  biomeOverrides.delete(biomeKey(continent, i));
  renderBiomeList(continent);
  saveState();
}

export function toggleEditPanel() {
  if (!panelTarget) return;
  const form = document.getElementById("panelEdit");
  const showing = form.style.display !== "none";
  if (showing) { form.style.display = "none"; return; }
  document.getElementById("editName").value = panelTarget.obj.name;
  document.getElementById("editNotes").value = panelTarget.obj.notes || "";
  // Cambiar el placeholder según si es nodo o continente
  const notesField = document.getElementById("editNotes");
  if (panelTarget.kind === "node") {
    notesField.placeholder = "¿Qué le reveló este lugar a la protagonista? ¿Qué cambió en ella al llegar aquí?";
  } else {
    notesField.placeholder = "Notas sobre este continente, sus gentes o sus secretos...";
  }
  form.style.display = "flex";
}

export function saveEditPanel() {
  if (!panelTarget) return;
  const name = document.getElementById("editName").value.trim() || panelTarget.obj.name;
  const notes = document.getElementById("editNotes").value;
  panelTarget.obj.name = name;
  panelTarget.obj.notes = notes;
  if (panelTarget.kind === "node") {
    nodeOverrides.set(panelTarget.obj.id, { name, notes });
    openNodePanel(panelTarget.obj);
  } else {
    continentOverrides.set(continentKey(panelTarget.obj), { name, notes });
    openContinentPanel(panelTarget.obj);
  }
  saveState();
}

export function closePanel() { 
  document.getElementById("panel").style.display = "none"; 
  panelTarget = null; 
}

export function goToCoords() {
  const x = parseFloat(document.getElementById("goX").value);
  const y = parseFloat(document.getElementById("goY").value);
  if (!isNaN(x)) camera.x = x;
  if (!isNaN(y)) camera.y = y;
}

function downloadBlob(filename, content, type) {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url; a.download = filename;
  document.body.appendChild(a); a.click(); a.remove();
  URL.revokeObjectURL(url);
}

export function exportRouteJSON() {
  const r = activeRoute();
  const data = {
    ruta: r.name,
    pasos: r.points.map((n, i) => ({
      orden: i + 1, nombre: n.name, tipo: n.type.name,
      x: Math.round(n.x), y: Math.round(n.y), notas: n.notes || ""
    }))
  };
  downloadBlob(r.name.replace(/\s+/g, "_") + ".json", JSON.stringify(data, null, 2), "application/json");
}

export function exportRouteStory() {
  const r = activeRoute();
  let text = "RUTA: " + r.name + "\n" + "=".repeat(r.name.length + 6) + "\n\n";
  r.points.forEach((n, i) => {
    text += (i + 1) + ". " + n.name + " (" + n.type.name + ", " + n.type.desc + ")\n";
    text += "   Coordenadas: " + Math.round(n.x) + ", " + Math.round(n.y) + "\n";
    text += "   " + FLAVOR[n.seed] + "\n";
    if (n.gateway) text += "   Puerta de entrada al continente: " + n.gateway + "\n";
    if (n.notes) text += "   Notas del escritor: " + n.notes + "\n";
    text += "\n";
  });
  downloadBlob(r.name.replace(/\s+/g, "_") + "_relato.txt", text, "text/plain");
}

// Attach these to window so HTML onClick works, or we will attach them in renderer
window.toggleLeyLines = toggleLeyLines;
window.toggleRouteMode = toggleRouteMode;
window.stepRoute = stepRoute;
window.undoRoute = undoRoute;
window.resetRoute = resetRoute;
window.exportRouteJSON = exportRouteJSON;
window.exportRouteStory = exportRouteStory;
window.closePanel = closePanel;
window.toggleEditPanel = toggleEditPanel;
window.saveEditPanel = saveEditPanel;
window.goToCoords = goToCoords;
