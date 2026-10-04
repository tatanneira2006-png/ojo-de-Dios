"use strict";
/* Ojo de Dios — tejedor interactivo. Sin dependencias. */

const canvas = document.getElementById("ojo");
const ctx = canvas.getContext("2d");
const status = document.getElementById("status");

const PALETTES = [
  { name: "Huichol clásico", colors: ["#e63946", "#f4a261", "#e9c46a", "#2a9d8f", "#1d3557", "#9d4edd"] },
  { name: "Atardecer", colors: ["#ff5400", "#ff8500", "#ffbf69", "#c1121f", "#780000"] },
  { name: "Océano", colors: ["#03045e", "#0077b6", "#00b4d8", "#90e0ef", "#caf0f8"] },
  { name: "Selva", colors: ["#004b23", "#006400", "#38b000", "#70e000", "#ccff33"] },
  { name: "Fiesta", colors: ["#ff006e", "#fb5607", "#ffbe0b", "#8338ec", "#3a86ff"] },
  { name: "Desierto", colors: ["#774936", "#9c6644", "#b08968", "#ddb892", "#e6ccb2"] },
];

const PRESETS = [
  { name: "☀️ Sol huichol", sticks: 4, turns: 48, width: 7, hole: 14, palette: 0 },
  { name: "🌊 Ojo marino", sticks: 4, turns: 64, width: 6, hole: 10, palette: 2 },
  { name: "⭐ Estrella 8", sticks: 8, turns: 56, width: 5, hole: 18, palette: 4 },
  { name: "🌵 Cruz simple", sticks: 2, turns: 40, width: 9, hole: 12, palette: 5 },
];

const BGS = {
  night: ["#0b1120", "#1e1b4b"],
  clay: ["#431407", "#7c2d12"],
  sand: ["#fef3c7", "#fde68a"],
  forest: ["#052e16", "#14532d"],
};

const state = { sticks: 4, turns: 48, width: 7, hole: 14, palette: 0, spin: false, glow: true, dark: true, bg: "night" };

const $ = (id) => document.getElementById(id);
const inputs = { sticks: $("in-sticks"), turns: $("in-turns"), width: $("in-width"), hole: $("in-hole"), spin: $("in-spin"), glow: $("in-glow"), dark: $("in-dark"), bg: $("in-bg") };

function stickAngles(n) {
  const a = [];
  for (let i = 0; i < n; i++) a.push((Math.PI * i) / n);
  return a;
}

function drawOjo(progress = 1, rotation = 0, target = ctx, size = canvas.width) {
  const pal = PALETTES[state.palette].colors;
  const [bg1, bg2] = BGS[state.bg];
  const s = size / canvas.width; // escala para exportación
  target.save();
  target.clearRect(0, 0, size, size);
  const g = target.createRadialGradient(size/2, size/2, 10, size/2, size/2, size/2);
  if (state.dark) { g.addColorStop(0, bg1); g.addColorStop(1, bg2); }
  else { g.addColorStop(0, "#ffffff"); g.addColorStop(1, "#e2e8f0"); }
  target.fillStyle = g;
  target.fillRect(0, 0, size, size);

  const cx = size / 2, cy = size / 2;
  const maxR = size * 0.44;
  const minR = state.hole * s * 2;
  const angles = stickAngles(state.sticks);

  // Palos de madera
  target.save();
  target.translate(cx, cy);
  target.rotate(rotation);
  target.lineCap = "round";
  for (const a of angles) {
    target.save();
    target.rotate(a);
    const grad = target.createLinearGradient(-maxR, 0, maxR, 0);
    grad.addColorStop(0, "#8b5a2b"); grad.addColorStop(0.5, "#d2a679"); grad.addColorStop(1, "#8b5a2b");
    target.strokeStyle = grad;
    target.lineWidth = Math.max(6 * s, state.width * s * 1.1);
    target.beginPath(); target.moveTo(-maxR, 0); target.lineTo(maxR, 0); target.stroke();
    target.restore();
  }
  // Hilos: rombos concéntricos vuelta por vuelta
  const total = Math.max(1, Math.round(state.turns * progress));
  if (state.glow) { target.shadowColor = "rgba(0,0,0,.35)"; target.shadowBlur = 6 * s; target.shadowOffsetY = 3 * s; }
  for (let t = 0; t < total; t++) {
    const r = minR + ((maxR - minR) * t) / Math.max(1, state.turns - 1);
    const color = pal[t % pal.length];
    target.strokeStyle = color;
    target.lineWidth = state.width * s;
    target.beginPath();
    const pts = [];
    for (let k = 0; k < state.sticks * 2; k++) {
      const ang = (Math.PI * k) / state.sticks + Math.PI / 2;
      pts.push([Math.cos(ang) * r, Math.sin(ang) * r]);
    }
    pts.forEach(([x, y], i) => (i === 0 ? target.moveTo(x, y) : target.lineTo(x, y)));
    target.closePath();
    target.stroke();
  }
  target.shadowBlur = 0; target.shadowOffsetY = 0;
  // Remate central
  target.fillStyle = pal[0];
  target.beginPath(); target.arc(0, 0, state.width * s * 1.2, 0, Math.PI * 2); target.fill();
  target.fillStyle = "rgba(255,255,255,.85)";
  target.beginPath(); target.arc(-state.width * s * 0.3, -state.width * s * 0.3, state.width * s * 0.4, 0, Math.PI * 2); target.fill();
  target.restore();

  // Pompón decorativo inferior
  target.fillStyle = pal[total % pal.length] || pal[0];
  target.beginPath(); target.arc(cx, cy + maxR + 14 * s, 10 * s, 0, Math.PI * 2); target.fill();
  target.restore();
}

let rotation = 0, raf = 0, weaving = null;
function frame() {
  if (state.spin) rotation += 0.003;
  drawOjo(1, rotation);
  raf = requestAnimationFrame(frame);
}

function weaveAnimated() {
  if (weaving) cancelAnimationFrame(weaving);
  const t0 = performance.now(), dur = Math.min(4000, 600 + state.turns * 35);
  status.textContent = "Tejiendo… 🧵";
  cancelAnimationFrame(raf);
  const step = (now) => {
    const p = Math.min(1, (now - t0) / dur);
    drawOjo(p, rotation);
    status.textContent = `Tejiendo… ${Math.round(p * 100)}% 🧵`;
    if (p < 1) weaving = requestAnimationFrame(step);
    else { status.textContent = `¡Listo! ${state.turns} vueltas con ${state.sticks} palos ✨`; weaving = null; raf = requestAnimationFrame(frame); }
  };
  weaving = requestAnimationFrame(step);
}

function syncLabels() {
  $("v-sticks").textContent = inputs.sticks.value;
  $("v-turns").textContent = inputs.turns.value;
  $("v-width").textContent = inputs.width.value;
  $("v-hole").textContent = inputs.hole.value;
}
function readInputs() {
  state.sticks = +inputs.sticks.value; state.turns = +inputs.turns.value;
  state.width = +inputs.width.value; state.hole = +inputs.hole.value;
  state.spin = inputs.spin.checked; state.glow = inputs.glow.checked;
  state.dark = inputs.dark.checked; state.bg = inputs.bg.value;
  syncLabels();
  if (!weaving) drawOjo(1, rotation);
}
Object.values(inputs).forEach((el) => el.addEventListener("input", readInputs));

// Paletas
const palWrap = $("palettes");
PALETTES.forEach((p, i) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "palette-btn" + (i === 0 ? " active" : "");
  b.innerHTML = `<span class="swatches">${p.colors.map((c) => `<i style="background:${c}"></i>`).join("")}</span>${p.name}`;
  b.addEventListener("click", () => {
    state.palette = i;
    palWrap.querySelectorAll(".palette-btn").forEach((x) => x.classList.remove("active"));
    b.classList.add("active");
    drawOjo(1, rotation);
  });
  palWrap.appendChild(b);
});

// Presets
const preWrap = $("presets");
PRESETS.forEach((p) => {
  const b = document.createElement("button");
  b.type = "button"; b.className = "preset-btn"; b.textContent = p.name;
  b.addEventListener("click", () => {
    Object.assign(state, { sticks: p.sticks, turns: p.turns, width: p.width, hole: p.hole, palette: p.palette });
    inputs.sticks.value = p.sticks; inputs.turns.value = p.turns;
    inputs.width.value = p.width; inputs.hole.value = p.hole;
    palWrap.querySelectorAll(".palette-btn").forEach((x, xi) => x.classList.toggle("active", xi === p.palette));
    syncLabels(); weaveAnimated();
  });
  preWrap.appendChild(b);
});

$("btn-random").addEventListener("click", () => {
  state.sticks = 2 + Math.floor(Math.random() * 7);
  state.turns = 24 + Math.floor(Math.random() * 80);
  state.width = 4 + Math.floor(Math.random() * 9);
  state.hole = 6 + Math.floor(Math.random() * 30);
  state.palette = Math.floor(Math.random() * PALETTES.length);
  inputs.sticks.value = state.sticks; inputs.turns.value = state.turns;
  inputs.width.value = state.width; inputs.hole.value = state.hole;
  palWrap.querySelectorAll(".palette-btn").forEach((x, xi) => x.classList.toggle("active", xi === state.palette));
  syncLabels(); weaveAnimated();
});

$("btn-weave").addEventListener("click", weaveAnimated);

$("btn-download").addEventListener("click", () => {
  const out = document.createElement("canvas");
  out.width = 1800; out.height = 1800;
  drawOjo(1, rotation, out.getContext("2d"), 1800);
  const a = document.createElement("a");
  a.download = "ojo-de-dios.png";
  a.href = out.toDataURL("image/png");
  a.click();
  status.textContent = "PNG descargado 📸";
});

// Inicio
syncLabels();
drawOjo(1, 0);
status.textContent = `Listo para tejer ✨ (${state.turns} vueltas)`;
raf = requestAnimationFrame(frame);
