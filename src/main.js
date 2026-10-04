import { cerebro } from './cerebro/brain.js';
import { bus } from './cerebro/events.js';
import { createBrainScene } from './brain3d/scene.js';
import { REGIONS } from './brain3d/regions.js';
import { config } from './cerebro/config.js';

const $ = id => document.getElementById(id);
const canvas = $('brain-canvas');
const scene = createBrainScene(canvas, bus, {
  nodeCount: config.three.nodeCount,
  pulseCount: config.demo.pulseCount,
  particleCount: config.three.particleCount,
  onSelectRegion: id => {
    const r = REGIONS.find(x => x.id === id);
    log(`Región seleccionada: ${r?.label ?? id}`, 'sys');
    $('region-info').textContent = `${r?.label ?? id} — consulta de módulo (sec. 25)`;
  }
});

// — Regiones funcionales —
const regionList = $('regions');
for (const r of REGIONS) {
  const b = document.createElement('button');
  b.className = 'chip';
  b.innerHTML = `<i style="background:#${r.color.toString(16).padStart(6, '0')}"></i>${r.label}`;
  b.onclick = () => { scene.focusRegion(r.id); $('region-info').textContent = `${r.label}: módulo funcional del cerebro artificial.`; };
  regionList.appendChild(b);
}

// — Log / historial (sec. 36 📜) —
function log(msg, cls = '') {
  const el = document.createElement('div');
  el.className = 'log-line ' + cls;
  el.textContent = `[${new Date().toLocaleTimeString()}] ${msg}`;
  const box = $('event-log');
  box.prepend(el);
  while (box.children.length > 60) box.lastChild.remove();
}

// — Panel observación (sec. 27) + estado interno (sec. 23) —
function refreshPanels() {
  const s = cerebro.status, e = cerebro.state.get();
  $('o-model').textContent = s.model;
  $('o-agent').textContent = s.agent;
  $('o-tool').textContent = s.tool;
  $('o-goal').textContent = s.goal;
  $('o-task').textContent = s.task;
  $('o-process').textContent = s.process;
  $('o-conf').textContent = e.confianza.toFixed(2);
  $('o-energy').textContent = e.energia.toFixed(2);
  $('o-mode').textContent = e.modo + ' · ' + cerebro.state.describe();
  scene.setVisualMode(cerebro.state.describe());
  // barras
  const bars = $('state-bars');
  bars.innerHTML = '';
  for (const [k, v] of Object.entries(cerebro.state.vars)) {
    const row = document.createElement('div');
    row.className = 'bar-row';
    row.innerHTML = `<span>${k}</span><div class="bar"><div class="fill" style="width:${Math.round(v * 100)}%"></div></div><b>${v.toFixed(2)}</b>`;
    bars.appendChild(row);
  }
  const mem = cerebro.memory.snapshot();
  $('mem-snap').textContent = Object.entries(mem).map(([k, v]) => `${k}:${v}`).join(' · ');
  $('audit').textContent = cerebro.security.trail(8).map(a => `${new Date(a.ts).toLocaleTimeString()} ${a.agent}/${a.tool} ${a.action}${a.needsConfirm ? ' (confirm)' : ''}`).join('\n') || 'sin acciones aún';
}

bus.on('*', (event, payload) => {
  const label = { 'brain.thinking': '👁️ pensando', 'brain.reasoning': '🔵 razonando', 'brain.memory.retrieve': '🟣 memoria→', 'brain.memory.store': '🟣 memoria←', 'brain.planning': '🟡 planificando', 'brain.agent.start': '🤖 agente…', 'brain.agent.complete': '🤖 agente ✓', 'brain.tool.start': '🟠 herramienta…', 'brain.tool.complete': '🟠 herramienta ✓', 'brain.android.action': '📱 android', 'brain.error': '🔴 error', 'brain.success': '✨ éxito', 'brain.learning': '🟤 aprendiendo' }[event] ?? event;
  log(`${label} ${payload?.intent ?? payload?.agent ?? payload?.tool ?? payload?.action ?? ''}`.trim(), event.includes('error') ? 'err' : event.includes('success') ? 'ok' : '');
  refreshPanels();
});

// — Enviar pensamiento al núcleo —
async function send(text) {
  text = (text ?? $('prompt').value).trim();
  if (!text) return;
  $('prompt').value = '';
  addMsg('tú', text);
  addMsg('cerebro', '…procesando (entrada → memoria → razonamiento → plan → agente → verificación → aprendizaje)', 'dim');
  log(`ENTRADA: ${text.slice(0, 90)}`, 'sys');
  const r = await cerebro.think(text);
  document.querySelector('.msg.dim')?.remove();
  addMsg('cerebro', cerebro.memory.retrieve(text, ['conversacional'], 1).find(m => m.role === 'cerebro')?.text ?? 'listo.');
  if (r.androidTrace?.some(t => t.phase === 'CONFIRMACIÓN' && !t.ok)) {
    showAndroidConfirm(r);
  }
  refreshPanels();
}
function addMsg(who, text, cls = '') {
  const d = document.createElement('div');
  d.className = 'msg ' + cls;
  d.innerHTML = `<b>${who}</b><p></p>`;
  d.querySelector('p').textContent = text;
  $('chat').appendChild(d);
  d.scrollIntoView({ behavior: 'smooth', block: 'end' });
}
$('send').onclick = () => send();
$('prompt').addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } });
document.querySelectorAll('[data-demo]').forEach(b => b.onclick = () => send(b.getAttribute('data-demo')));

// — Cámara (sec. 25) —
document.querySelectorAll('[data-view]').forEach(b => b.onclick = () => { scene.setView(b.getAttribute('data-view')); log('Cámara: ' + b.textContent, 'sys'); });
$('auto-cam').onclick = e => { const on = scene.toggleAuto(); e.target.textContent = '🎥 auto: ' + (on ? 'on' : 'off'); };

// — Modo Cerebro Vivo (sec. 26) —
let vivoTimer = null;
$('vivo').onclick = e => {
  const on = vivoTimer == null;
  e.target.textContent = on ? '💓 Cerebro Vivo: ON' : '💓 Cerebro Vivo: OFF';
  e.target.classList.toggle('on', on);
  if (on) {
    const demos = ['investiga qué es memoria episódica', 'planifica una rutina de aprendizaje', 'recuerda que prefiero respuestas claras', 'calcula 24 * 7 + 10', 'muestra tu estado interno'];
    vivoTimer = setInterval(() => send(demos[Math.floor(Math.random() * demos.length)]), config.demo.vivoIntervalMs * 1.6);
    log('Modo Cerebro Vivo activado: actividad autónoma', 'ok');
  } else { clearInterval(vivoTimer); vivoTimer = null; }
};

// — Voz: STT/TTS si el navegador lo permite (sec. 13) —
$('speak').onclick = () => {
  const last = [...document.querySelectorAll('#chat .msg')].pop()?.querySelector('p')?.textContent ?? 'Cerebro en línea';
  try { speechSynthesis.cancel(); speechSynthesis.speak(new SpeechSynthesisUtterance(last.slice(0, 300))); bus.emit('brain.voice.start', { dir: 'tts' }); }
  catch { log('TTS no disponible en este navegador', 'err'); }
};
$('listen').onclick = () => {
  const SR = window.SpeechRecognition || window.webkitSpeechRecognition;
  if (!SR) return log('STT no disponible en este navegador', 'err');
  const r = new SR(); r.lang = 'es-ES';
  r.onresult = e => send(e.results[0][0].transcript);
  r.start(); bus.emit('brain.voice.start', { dir: 'stt' });
  log('🎙️ escuchando…', 'sys');
};

// — Android confirm (sec. 35) —
function showAndroidConfirm(r) {
  const box = $('android-confirm');
  box.hidden = false;
  box.querySelector('p').textContent = 'Acción sensible de Android requiere confirmación: ' + (r.intent ? JSON.stringify(r.agentResult.trace?.filter(t => !t.ok)) : '');
  box.querySelector('.ok').onclick = async () => {
    box.hidden = true;
    log('Android: usuario confirmó. Re-ejecutando con confirmación.', 'ok');
    addMsg('cerebro', 'Confirmado. La rutina Android se ejecutaría en dispositivo con permisos (simulado en esta base). Cadena: PERMISOS → VALIDACIÓN → SEGURIDAD → CONFIRMACIÓN → EJECUCIÓN → VERIFICACIÓN ✓');
  };
  box.querySelector('.no').onclick = () => { box.hidden = true; log('Android: acción rechazada por el usuario.', 'err'); };
}

// — Candidatos (sec. 32): panel de evaluación, no instalación —
function renderCandidates(filter = '') {
  const box = $('candidates');
  box.innerHTML = '';
  const list = cerebro.plugins.list().filter(p => !filter || p.category === filter || p.name.toLowerCase().includes(filter.toLowerCase())).slice(0, 40);
  for (const p of list) {
    const d = document.createElement('div');
    d.className = 'cand';
    d.innerHTML = `<b>${p.name}</b><span>${p.category} · ${p.funcion.slice(0, 60)}</span><em>${p.status}</em>`;
    d.title = 'Candidato pendiente de verificación (repo, licencia, seguridad). No instalar automáticamente.';
    d.onclick = () => { cerebro.plugins.setStatus(p.id, p.status === 'pendiente' ? 'evaluando' : 'pendiente'); renderCandidates(filter); };
    box.appendChild(d);
  }
  $('cand-count').textContent = `${cerebro.plugins.count()} candidatos · ${cerebro.plugins.list({ status: 'pendiente' }).length} pendientes (clic para marcar evaluando)`;
}
$('cand-filter').oninput = e => renderCandidates(e.target.value);
renderCandidates();
refreshPanels();
log('🧠 CEREBRO base iniciado. Núcleo + eventos + 3D conectados.', 'ok');
addMsg('cerebro', 'Soy CEREBRO v0.1 — núcleo modular en línea. Escribe un objetivo, pulsa un ejemplo, activa el Cerebro Vivo o explora las regiones del cerebro 3D. Todo lo que ves se ilumina con eventos reales del sistema.');
