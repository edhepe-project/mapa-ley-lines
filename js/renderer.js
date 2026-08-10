import { CHUNK_SIZE, CHUNK_BUFFER } from './config.js';
import { chunkCache, discoveredNodes, discoveredContinents, routes, activeRouteIndex, leyLinesVisible, routeMode, loadState } from './state.js';
import { generateChunk, buildLeyConnections } from './generator.js';
import { pointInPolygon } from './utils.js';
import { addToRoute, openNodePanel, openContinentPanel, renderRoutePanel } from './ui.js';

const canvas = document.getElementById("map");
const ctx = canvas.getContext("2d");
// Empezar mucho más "cerca" para sentir la inmensidad de los continentes
export let camera = { x: 0, y: 0, zoom: 0.12 };

function resize() {
  canvas.width = window.innerWidth;
  canvas.height = window.innerHeight;
}
window.addEventListener("resize", resize);
resize();

function worldToScreen(x, y) {
  return {
    x: (x - camera.x) * camera.zoom + canvas.width / 2,
    y: (y - camera.y) * camera.zoom + canvas.height / 2
  };
}
function screenToWorld(x, y) {
  return {
    x: (x - canvas.width / 2) / camera.zoom + camera.x,
    y: (y - canvas.height / 2) / camera.zoom + camera.y
  };
}

let dragging = false, lastMouse = { x: 0, y: 0 }, dragged = false;
canvas.addEventListener("mousedown", (e) => {
  dragging = true; dragged = false;
  lastMouse = { x: e.clientX, y: e.clientY };
  canvas.classList.add("dragging");
});
window.addEventListener("mouseup", () => { dragging = false; canvas.classList.remove("dragging"); });
window.addEventListener("mousemove", (e) => {
  if (!dragging) return;
  const dx = e.clientX - lastMouse.x, dy = e.clientY - lastMouse.y;
  if (Math.abs(dx) + Math.abs(dy) > 3) dragged = true;
  camera.x -= dx / camera.zoom;
  camera.y -= dy / camera.zoom;
  lastMouse = { x: e.clientX, y: e.clientY };
});

canvas.addEventListener("wheel", (e) => {
  e.preventDefault();
  const before = screenToWorld(e.clientX, e.clientY);
  const factor = e.deltaY < 0 ? 1.1 : 0.9;
  camera.zoom = Math.min(2.5, Math.max(0.002, camera.zoom * factor));
  const after = screenToWorld(e.clientX, e.clientY);
  camera.x += before.x - after.x;
  camera.y += before.y - after.y;
}, { passive: false });

export function zoomBy(f) {
  camera.zoom = Math.min(2.5, Math.max(0.002, camera.zoom * f));
}
window.zoomBy = zoomBy;

let pinchStartDist = null, pinchStartZoom = 1, touchMoved = false;
function touchDist(t0, t1) {
  return Math.hypot(t1.clientX - t0.clientX, t1.clientY - t0.clientY);
}
function touchMid(t0, t1) {
  return { x: (t0.clientX + t1.clientX) / 2, y: (t0.clientY + t1.clientY) / 2 };
}
canvas.addEventListener("touchstart", (e) => {
  touchMoved = false;
  if (e.touches.length === 1) {
    dragging = true;
    lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2) {
    dragging = false;
    pinchStartDist = touchDist(e.touches[0], e.touches[1]);
    pinchStartZoom = camera.zoom;
  }
}, { passive: true });

canvas.addEventListener("touchmove", (e) => {
  e.preventDefault();
  if (e.touches.length === 1 && dragging) {
    const dx = e.touches[0].clientX - lastMouse.x, dy = e.touches[0].clientY - lastMouse.y;
    if (Math.abs(dx) + Math.abs(dy) > 3) touchMoved = true;
    camera.x -= dx / camera.zoom;
    camera.y -= dy / camera.zoom;
    lastMouse = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  } else if (e.touches.length === 2 && pinchStartDist) {
    touchMoved = true;
    const mid = touchMid(e.touches[0], e.touches[1]);
    const before = screenToWorld(mid.x, mid.y);
    const dist = touchDist(e.touches[0], e.touches[1]);
    camera.zoom = Math.min(2.5, Math.max(0.002, pinchStartZoom * (dist / pinchStartDist)));
    const after = screenToWorld(mid.x, mid.y);
    camera.x += before.x - after.x;
    camera.y += before.y - after.y;
  }
}, { passive: false });

canvas.addEventListener("touchend", (e) => {
  if (e.touches.length === 0) {
    dragging = false;
    pinchStartDist = null;
    if (!touchMoved && e.changedTouches.length === 1) {
      const touch = e.changedTouches[0];
      canvas.dispatchEvent(new MouseEvent("click", {
        clientX: touch.clientX, clientY: touch.clientY
      }));
    }
  }
});

canvas.addEventListener("click", (e) => {
  if (dragged) return;
  const world = screenToWorld(e.clientX, e.clientY);

  // Prioridad 1: toque DENTRO del polígono de un continente
  if (!routeMode) {
    for (const chunk of chunkCache.values()) {
      for (const continent of chunk.continents) {
        if (pointInPolygon(world.x, world.y, continent.points)) {
          openContinentPanel(continent);
          return;
        }
      }
    }
  }

  // Prioridad 2: toque MUY cerca de un nodo (radio pequeño: 40px en pantalla)
  const hitRadiusWorld = 40 / camera.zoom;
  let closest = null, closestDist = Infinity;
  for (const chunk of chunkCache.values()) {
    for (const node of chunk.nodes) {
      const d = Math.hypot(node.x - world.x, node.y - world.y);
      if (d < closestDist) { closestDist = d; closest = node; }
    }
  }
  if (closest && closestDist < hitRadiusWorld && (leyLinesVisible || routeMode)) {
    if (routeMode) addToRoute(closest);
    else openNodePanel(closest);
    return;
  }

  // Prioridad 3: fallback por proximidad al centro del continente
  if (!routeMode) {
    let nearestC = null, nearestD = Infinity;
    const maxCenterDist = 12000;
    for (const chunk of chunkCache.values()) {
      for (const continent of chunk.continents) {
        const d = Math.hypot(continent.cx0 - world.x, continent.cy0 - world.y);
        if (d < nearestD) { nearestD = d; nearestC = continent; }
      }
    }
    if (nearestC && nearestD < maxCenterDist) {
      openContinentPanel(nearestC);
    }
  }
});



function getVisibleChunkRange() {
  const topLeft = screenToWorld(0, 0);
  const bottomRight = screenToWorld(canvas.width, canvas.height);
  const minCx = Math.floor(topLeft.x / CHUNK_SIZE) - CHUNK_BUFFER;
  const maxCx = Math.floor(bottomRight.x / CHUNK_SIZE) + CHUNK_BUFFER;
  const minCy = Math.floor(topLeft.y / CHUNK_SIZE) - CHUNK_BUFFER;
  const maxCy = Math.floor(bottomRight.y / CHUNK_SIZE) + CHUNK_BUFFER;
  return { minCx, maxCx, minCy, maxCy };
}

function continentScreenPath(continent) {
  const pts = continent.points.map((p) => worldToScreen(p.x, p.y));
  ctx.beginPath();
  ctx.moveTo((pts[0].x + pts[pts.length - 1].x) / 2, (pts[0].y + pts[pts.length - 1].y) / 2);
  for (let i = 0; i < pts.length; i++) {
    const next = pts[(i + 1) % pts.length];
    const midX = (pts[i].x + next.x) / 2, midY = (pts[i].y + next.y) / 2;
    ctx.quadraticCurveTo(pts[i].x, pts[i].y, midX, midY);
  }
  ctx.closePath();
}

function continentKey(c) { return Math.round(c.cx0) + "," + Math.round(c.cy0); }

function drawContinent(continent) {
  const baseColor = continent.variant === "highland" ? "46,68,84" : "120,98,66";
  const edgeColor = continent.variant === "highland" ? "rgba(160,205,222,0.6)" : "rgba(224,192,132,0.55)";

  ctx.save();
  continentScreenPath(continent);
  ctx.fillStyle = `rgba(${baseColor},0.95)`;
  ctx.fill();
  ctx.clip();

  for (const b of continent.biomes) {
    const s = worldToScreen(b.x, b.y);
    const r = Math.max(4, b.r * camera.zoom);
    const grad = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r);
    // Usar alfa un poco más fuerte para que saturen el color base de la tierra
    grad.addColorStop(0, `rgba(${b.type.color}, 0.95)`);
    grad.addColorStop(0.7, `rgba(${b.type.color}, 0.6)`);
    grad.addColorStop(1, `rgba(${b.type.color}, 0)`);
    
    ctx.globalCompositeOperation = "source-atop";
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
  }
  ctx.globalCompositeOperation = "source-over";
  ctx.restore();

  continentScreenPath(continent);
  ctx.strokeStyle = edgeColor;
  ctx.lineWidth = 1.6;
  ctx.stroke();

  const discovered = discoveredContinents.has(continentKey(continent));
  if (discovered) {
    continentScreenPath(continent);
    ctx.strokeStyle = "rgba(255,207,94,0.5)";
    ctx.lineWidth = 3;
    ctx.shadowColor = "#ffcf5e";
    ctx.shadowBlur = 8;
    ctx.stroke();
  }

  if (camera.zoom > 0.18) {
    const s = worldToScreen(continent.cx0, continent.cy0);
    ctx.save();
    ctx.font = "13px Georgia, serif";
    ctx.fillStyle = "rgba(255,240,210,0.85)";
    ctx.textAlign = "center";
    ctx.shadowColor = "rgba(0,0,0,0.9)";
    ctx.shadowBlur = 4;
    ctx.fillText(continent.name + (discovered ? " ✓" : ""), s.x, s.y);
    ctx.restore();
  }
}

function drawOneRoute(r, isActive) {
  const pts = r.points;
  if (pts.length < 1) return;
  const rgb = r.color.rgb;
  const dim = isActive ? 1 : 0.4;

  ctx.save();
  if (pts.length > 1) {
    ctx.setLineDash([6, 8]);
    ctx.strokeStyle = "rgba(" + rgb + "," + (0.35 * dim) + ")";
    ctx.lineWidth = 1.4;
    ctx.beginPath();
    for (let i = r.step; i < pts.length - 1; i++) {
      const a = worldToScreen(pts[i].x, pts[i].y);
      const b = worldToScreen(pts[i + 1].x, pts[i + 1].y);
      ctx.moveTo(a.x, a.y);
      ctx.lineTo(b.x, b.y);
    }
    ctx.stroke();
    ctx.setLineDash([]);
  }

  ctx.shadowColor = r.color.hex;
  ctx.shadowBlur = isActive ? 16 : 6;
  ctx.strokeStyle = "rgba(" + rgb + "," + (0.95 * dim) + ")";
  ctx.lineWidth = isActive ? 3 : 2;
  if (isActive) ctx.lineDashOffset = -t * 40;
  ctx.setLineDash([2, 10]);
  ctx.beginPath();
  for (let i = 0; i < r.step; i++) {
    const a = worldToScreen(pts[i].x, pts[i].y);
    const b = worldToScreen(pts[i + 1].x, pts[i + 1].y);
    ctx.moveTo(a.x, a.y);
    ctx.lineTo(b.x, b.y);
  }
  ctx.stroke();
  ctx.setLineDash([]);
  ctx.restore();

  ctx.save();
  pts.forEach((n, i) => {
    if (i > r.step) return;
    const s = worldToScreen(n.x, n.y);
    ctx.beginPath();
    ctx.arc(s.x, s.y, isActive ? 5 : 3.5, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(" + rgb + "," + (i === r.step ? 0.95 : 0.5 * dim) + ")";
    ctx.shadowColor = r.color.hex;
    ctx.shadowBlur = i === r.step && isActive ? 20 : 6;
    ctx.fill();
  });
  ctx.restore();

  const cur = pts[r.step];
  if (cur && isActive) {
    const s = worldToScreen(cur.x, cur.y);
    const pulse = 6 + Math.sin(t * 3) * 2;
    ctx.save();
    ctx.translate(s.x, s.y);
    ctx.rotate(Math.PI / 4);
    ctx.shadowColor = "#ffffff";
    ctx.shadowBlur = 18;
    ctx.fillStyle = "#ffffff";
    ctx.fillRect(-pulse / 2, -pulse / 2, pulse, pulse);
    ctx.restore();
  }
}

function drawRoute() {
  routes.forEach((r, i) => drawOneRoute(r, i === activeRouteIndex));
}

let t = 0;
const minimapCanvas = document.getElementById("minimap");
const mmCtx = minimapCanvas.getContext("2d");
const MM_RANGE = 18;
function drawMinimap() {
  const w = minimapCanvas.width, h = minimapCanvas.height;
  mmCtx.clearRect(0, 0, w, h);
  const ccx = Math.floor(camera.x / CHUNK_SIZE);
  const ccy = Math.floor(camera.y / CHUNK_SIZE);
  const sx = w / (MM_RANGE * 2), sy = h / (MM_RANGE * 2);

  for (const chunk of chunkCache.values()) {
    const dx = chunk.cx - ccx, dy = chunk.cy - ccy;
    if (Math.abs(dx) > MM_RANGE || Math.abs(dy) > MM_RANGE) continue;
    const px = w / 2 + dx * sx, py = h / 2 + dy * sy;
    if (chunk.continents.length) {
      mmCtx.fillStyle = "rgba(255,207,94,0.85)";
      mmCtx.fillRect(px - 1.5, py - 1.5, 3, 3);
    } else if (chunk.nodes.length) {
      mmCtx.fillStyle = "rgba(94,241,255,0.55)";
      mmCtx.fillRect(px - 1, py - 1, 2, 2);
    } else {
      mmCtx.fillStyle = "rgba(255,255,255,0.08)";
      mmCtx.fillRect(px - 0.5, py - 0.5, 1, 1);
    }
  }

  const viewChunksX = (canvas.width / camera.zoom / CHUNK_SIZE) / 2;
  const viewChunksY = (canvas.height / camera.zoom / CHUNK_SIZE) / 2;
  mmCtx.strokeStyle = "rgba(94,241,255,0.8)";
  mmCtx.lineWidth = 1;
  mmCtx.strokeRect(
    w / 2 - viewChunksX * sx, h / 2 - viewChunksY * sy,
    viewChunksX * 2 * sx, viewChunksY * 2 * sy
  );
}

function draw() {
  t += 0.016;
  ctx.fillStyle = "#05080a";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  const { minCx, maxCx, minCy, maxCy } = getVisibleChunkRange();
  const visibleChunks = [];
  for (let cx = minCx; cx <= maxCx; cx++) {
    for (let cy = minCy; cy <= maxCy; cy++) {
      visibleChunks.push(generateChunk(cx, cy));
    }
  }

  for (const chunk of visibleChunks) {
    for (const c of chunk.continents) drawContinent(c);
  }

  const { nodes, edges } = buildLeyConnections(visibleChunks);

  if (leyLinesVisible) {
    ctx.save();
    ctx.shadowBlur = 10;
    for (const [a, b] of edges) {
      const sa = worldToScreen(a.x, a.y), sb = worldToScreen(b.x, b.y);
      const grad = ctx.createLinearGradient(sa.x, sa.y, sb.x, sb.y);
      grad.addColorStop(0, "rgba(94,241,255,0.9)");
      grad.addColorStop(1, "rgba(255,207,94,0.9)");
      ctx.shadowColor = "#5ef1ff";
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.6;
      ctx.beginPath();
      ctx.moveTo(sa.x, sa.y);
      ctx.lineTo(sb.x, sb.y);
      ctx.stroke();
    }
    ctx.restore();

    ctx.save();
    for (const node of nodes) {
      const s = worldToScreen(node.x, node.y);
      const pulse = 3 + Math.sin(t * 2 + node.x * 0.01) * 1.4;
      const rgb = node.type.color;
      const hasStory = !!(node.notes && node.notes.trim().length > 0);

      if (hasStory) {
        // Nodo visitado con historia escrita: corona dorada pulsante
        const outerR = 14 + pulse * 0.6;
        const grad = ctx.createRadialGradient(s.x, s.y, 2, s.x, s.y, outerR);
        grad.addColorStop(0, "rgba(255,230,140,0.9)");
        grad.addColorStop(0.5, "rgba(255,180,60,0.35)");
        grad.addColorStop(1, "rgba(255,160,30,0)");
        ctx.beginPath();
        ctx.arc(s.x, s.y, outerR, 0, Math.PI * 2);
        ctx.shadowColor = "#ffcf5e";
        ctx.shadowBlur = 22;
        ctx.fillStyle = grad;
        ctx.fill();
        // Núcleo brillante
        ctx.beginPath();
        ctx.arc(s.x, s.y, 5, 0, Math.PI * 2);
        ctx.shadowBlur = 18;
        ctx.fillStyle = "#fff0a0";
        ctx.fill();
        // Anillo externo dorado
        ctx.beginPath();
        ctx.arc(s.x, s.y, 9 + pulse * 0.3, 0, Math.PI * 2);
        ctx.strokeStyle = "rgba(255,207,94,0.95)";
        ctx.lineWidth = 1.8;
        ctx.shadowColor = "#ffcf5e";
        ctx.shadowBlur = 12;
        ctx.stroke();
      } else {
        // Nodo sin historia: aspecto normal
        ctx.beginPath();
        ctx.arc(s.x, s.y, 4 + pulse * 0.4, 0, Math.PI * 2);
        ctx.shadowColor = "rgb(" + rgb + ")";
        ctx.shadowBlur = 14;
        ctx.fillStyle = "#fff4d6";
        ctx.fill();
        if (discoveredNodes.has(node.id)) {
          // Descubierto pero sin historia aún: aro del color de su tipo
          ctx.beginPath();
          ctx.arc(s.x, s.y, 8 + pulse * 0.4, 0, Math.PI * 2);
          ctx.strokeStyle = "rgba(" + rgb + ",0.8)";
          ctx.lineWidth = 1.2;
          ctx.stroke();
        }
      }
    }
    ctx.restore();
  } else if (routeMode) {
    ctx.save();
    for (const node of nodes) {
      const s = worldToScreen(node.x, node.y);
      ctx.beginPath();
      ctx.arc(s.x, s.y, 3, 0, Math.PI * 2);
      ctx.fillStyle = "rgba(255,244,214,0.35)";
      ctx.fill();
    }
    ctx.restore();
  }

  drawRoute();

  document.getElementById("chunkCount").textContent = chunkCache.size;
  document.getElementById("nodeCount").textContent = nodes.length;
  document.getElementById("camCoords").textContent =
    Math.round(camera.x) + ", " + Math.round(camera.y);

  drawMinimap();

  requestAnimationFrame(draw);
}

window.exportMapPNG = function() {
  const url = canvas.toDataURL("image/png");
  const a = document.createElement("a");
  a.href = url; a.download = "mapa-mundo-conocido.png";
  document.body.appendChild(a); a.click(); a.remove();
}

// Initialization
loadState();
if (routeMode) {
  document.getElementById("btnRoute").textContent = "🧭 Modo Ruta: ON";
  document.getElementById("btnRoute").classList.add("route-on");
  document.getElementById("routePanel").style.display = "block";
}
if (!leyLinesVisible) {
  document.getElementById("btnLey").textContent = "🔗 Líneas Ley: OFF";
  document.getElementById("btnLey").classList.remove("on");
}
renderRoutePanel();
draw();
