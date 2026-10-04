// 🌌 CEREBRO 3D — diseño original inspirado en la referencia (sec. 19-26).
// Azul/cian + naranja/dorado, fondo oscuro, partículas, conexiones, energía.
// Dos hemisferios procedurales, nodos por región, fibras, pulsos, ondas.
// La visualización representa eventos reales, no contiene la lógica.

import * as THREE from 'three';
import { REGIONS, EVENT_REGIONS } from './regions.js';
import { visualFor } from './states.js';

function deform(geo, amp, freq, seed) {
  const pos = geo.attributes.position;
  const v = new THREE.Vector3();
  for (let i = 0; i < pos.count; i++) {
    v.fromBufferAttribute(pos, i);
    const n = Math.sin(v.x * freq + seed) * Math.cos(v.y * freq * 1.3 + seed * 2) * Math.sin(v.z * freq * 0.9 + seed);
    const n2 = Math.sin(v.y * freq * 2.2 + v.x * 3 + seed * 3) * 0.35;
    const k = 1 + (n + n2) * amp;
    v.multiplyScalar(k);
    pos.setXYZ(i, v.x, v.y, v.z);
  }
  geo.computeVertexNormals();
  return geo;
}

export function createBrainScene(canvas, bus, opts = {}) {
  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x04060d);
  scene.fog = new THREE.FogExp2(0x04060d, 0.055);

  const camera = new THREE.PerspectiveCamera(50, 1, 0.1, 100);
  const cam = { theta: 0.6, phi: 1.15, r: 6.1, tx: 0, ty: 0.2, tz: 0, auto: true, push: 0 };

  function applyCam() {
    const p = Math.max(0.15, Math.min(Math.PI - 0.15, cam.phi));
    const r = cam.r - cam.push;
    camera.position.set(
      cam.tx + r * Math.sin(p) * Math.sin(cam.theta),
      cam.ty + r * Math.cos(p),
      cam.tz + r * Math.sin(p) * Math.cos(cam.theta)
    );
    camera.lookAt(cam.tx, cam.ty, cam.tz);
  }

  scene.add(new THREE.AmbientLight(0x334455, 1.2));
  const key = new THREE.DirectionalLight(0x66ccff, 1.6); key.position.set(4, 6, 5); scene.add(key);
  const warm = new THREE.PointLight(0xff9a2a, 60, 30); warm.position.set(-2, -1, 3); scene.add(warm);
  const rim = new THREE.PointLight(0x2a7bff, 80, 40); rim.position.set(3, 2, -4); scene.add(rim);

  const brain = new THREE.Group(); scene.add(brain);

  // — Dos hemisferios procedurales con pliegues —
  const hemiMat = new THREE.MeshStandardMaterial({
    color: 0x0e2a4a, emissive: 0x2a86ff, emissiveIntensity: 0.55,
    wireframe: true, transparent: true, opacity: 0.32, roughness: 0.4, metalness: 0.1
  });
  const shellMat = new THREE.MeshStandardMaterial({
    color: 0x0a1a33, emissive: 0x0a3a66, emissiveIntensity: 0.25,
    transparent: true, opacity: 0.28, roughness: 0.7, metalness: 0.2,
    side: THREE.DoubleSide, depthWrite: false
  });
  const hemis = [];
  for (const side of [-1, 1]) {
    const g = new THREE.Group();
    let s = new THREE.SphereGeometry(1.55, 48, 36, 0, Math.PI * 2, 0, Math.PI);
    s.scale(1.15, 0.95, 1.25);
    deform(s, 0.09, 3.1, side * 1.7);
    // separar hemisferios ligeramente
    s.translate(side * 0.2, 0.15, 0);
    const wire = new THREE.Mesh(s, hemiMat.clone());
    const shell = new THREE.Mesh(s.clone(), shellMat.clone());
    shell.scale.multiplyScalar(0.985);
    g.add(shell, wire);
    brain.add(g);
    hemis.push({ wire, shell, side });
  }

  // — Nodos luminosos por región funcional —
  const nodeCount = opts.nodeCount ?? 130;
  const nodes = [];
  const nodeGeo = new THREE.SphereGeometry(0.05, 10, 10);
  const regionOf = i => REGIONS[i % REGIONS.length];
  const dummy = new THREE.Object3D();
  const nodeMeshes = [];
  for (let i = 0; i < nodeCount; i++) {
    const reg = regionOf(i);
    // distribuir en elipsoide cerebral
    const u = Math.random() * Math.PI * 2, v = Math.acos(2 * Math.random() - 1);
    const rr = 1.5 * (0.72 + Math.random() * 0.3);
    const p = new THREE.Vector3(
      rr * Math.sin(v) * Math.cos(u) * 1.1,
      rr * Math.cos(v) * 0.9 + 0.15,
      rr * Math.sin(v) * Math.sin(u) * 1.2
    );
    const mat = new THREE.MeshBasicMaterial({ color: reg.color, transparent: true, opacity: 0.95 });
    const m = new THREE.Mesh(nodeGeo, mat);
    m.position.copy(p);
    m.userData = { region: reg.id, base: 0.7 + Math.random() * 0.8, phase: Math.random() * 10, energy: 0 };
    brain.add(m);
    nodes.push(m); nodeMeshes.push(m);
  }

  // — Fibras / conexiones entre nodos cercanos —
  const fiberPos = [];
  const fiberPairs = [];
  for (let i = 0; i < nodes.length; i++) {
    let best = -1, bd = 1e9, best2 = -1, bd2 = 1e9;
    for (let j = 0; j < nodes.length; j++) {
      if (i === j) continue;
      const d = nodes[i].position.distanceToSquared(nodes[j].position);
      if (d < bd) { bd2 = bd; best2 = best; bd = d; best = j; }
      else if (d < bd2) { bd2 = d; best2 = j; }
    }
    for (const j of [best, best2]) {
      if (j < 0 || j < i) continue;
      fiberPos.push(nodes[i].position.x, nodes[i].position.y, nodes[i].position.z, nodes[j].position.x, nodes[j].position.y, nodes[j].position.z);
      fiberPairs.push([i, j]);
    }
  }
  const fiberGeo = new THREE.BufferGeometry();
  fiberGeo.setAttribute('position', new THREE.Float32BufferAttribute(fiberPos, 3));
  const fiberMat = new THREE.LineBasicMaterial({ color: 0xff9a3a, transparent: true, opacity: 0.42 });
  brain.add(new THREE.LineSegments(fiberGeo, fiberMat));
  const cyanGeo = new THREE.BufferGeometry();
  cyanGeo.setAttribute('position', new THREE.Float32BufferAttribute(fiberPos.map((v, k) => k % 3 === 0 ? v * 1.001 : v), 3));
  const cyanMat = new THREE.LineBasicMaterial({ color: 0x3ad6ff, transparent: true, opacity: 0.14 });
  brain.add(new THREE.LineSegments(cyanGeo, cyanMat));

  // — Pulsos de energía viajando por fibras —
  const pulseCount = opts.pulseCount ?? 90;
  const pulseGeo = new THREE.BufferGeometry();
  const pArr = new Float32Array(pulseCount * 3);
  pulseGeo.setAttribute('position', new THREE.BufferAttribute(pArr, 3));
  const pulseMat = new THREE.PointsMaterial({ color: 0xffc46b, size: 0.13, transparent: true, opacity: 0.95, depthWrite: false, blending: THREE.AdditiveBlending });
  const pulses = new THREE.Points(pulseGeo, pulseMat);
  brain.add(pulses);
  const pulseState = Array.from({ length: pulseCount }, () => ({ pair: Math.floor(Math.random() * fiberPairs.length), t: Math.random(), speed: 0.4 + Math.random() * 0.8 }));

  // — Partículas flotantes + destellos —
  function makeParticles(n, color, size, spread) {
    const g = new THREE.BufferGeometry();
    const a = new Float32Array(n * 3);
    for (let i = 0; i < n; i++) {
      a[i * 3] = (Math.random() - 0.5) * spread;
      a[i * 3 + 1] = (Math.random() - 0.5) * spread * 0.8;
      a[i * 3 + 2] = (Math.random() - 0.5) * spread;
    }
    g.setAttribute('position', new THREE.BufferAttribute(a, 3));
    const m = new THREE.PointsMaterial({ color, size, transparent: true, opacity: 0.6, depthWrite: false, blending: THREE.AdditiveBlending });
    const p = new THREE.Points(g, m);
    scene.add(p);
    return p;
  }
  const dust1 = makeParticles(opts.particleCount ?? 700, 0x3ad6ff, 0.035, 16);
  const dust2 = makeParticles(220, 0xff9a2a, 0.05, 11);

  // — Ondas de actividad (éxito / error) —
  const waves = [];
  function spawnWave(color = 0xffc46b) {
    const geo = new THREE.RingGeometry(0.1, 0.16, 48);
    const mat = new THREE.MeshBasicMaterial({ color, transparent: true, opacity: 0.9, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending });
    const mesh = new THREE.Mesh(geo, mat);
    mesh.position.set(0, 0.2, 0);
    mesh.userData.t = 0;
    scene.add(mesh); waves.push(mesh);
  }

  // — Estado visual + actividad por eventos reales —
  let visual = visualFor('CALMA');
  let regionEnergy = {}; // regionId -> 0..1.5
  let selectedRegion = null;
  const ray = new THREE.Raycaster();
  const mouse = new THREE.Vector2();

  function energize(regions, amount = 1) {
    for (const r of regions) regionEnergy[r] = Math.min(1.6, (regionEnergy[r] ?? 0) + amount);
    // acelerar algunos pulsos
    for (let k = 0; k < 12; k++) {
      const p = pulseState[Math.floor(Math.random() * pulseState.length)];
      p.speed = Math.min(2.6, p.speed + 0.5);
    }
  }

  const offs = [];
  if (bus?.on) {
    offs.push(bus.on('*', (event) => {
      const regs = EVENT_REGIONS[event] ?? ['razonamiento'];
      energize(regs, event === 'brain.error' ? 1.2 : 0.9);
      if (event === 'brain.success' || event === 'brain.error') {
        spawnWave(event === 'brain.success' ? 0xffd23a : 0xff4d5e);
        cam.push = 0.7; // acercamiento en actividad importante (sec. 25)
        setTimeout(() => { cam.push = 0; }, 900);
      }
      if (event === 'brain.thinking') { /* ondas leves */ }
    }));
  }

  function setVisualMode(mode) { visual = visualFor(mode); }

  // — Interacción cámara (sec. 25): rotación, zoom, pan, vistas, auto —
  let dragging = false, panning = false, lx = 0, ly = 0;
  canvas.style.touchAction = 'none';
  canvas.addEventListener('pointerdown', e => { dragging = true; panning = e.button === 2 || e.shiftKey; lx = e.clientX; ly = e.clientY; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', e => {
    if (!dragging) {
      const r = canvas.getBoundingClientRect();
      mouse.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      return;
    }
    const dx = e.clientX - lx, dy = e.clientY - ly; lx = e.clientX; ly = e.clientY;
    if (panning) { cam.tx -= dx * 0.005; cam.ty += dy * 0.005; }
    else { cam.theta -= dx * 0.006; cam.phi -= dy * 0.006; cam.auto = false; }
  });
  canvas.addEventListener('pointerup', () => {
    if (dragging && Math.abs(cam.theta % 1) < 5) { /* click? seleccionar región */ pickRegion(); }
    dragging = false; panning = false;
  });
  canvas.addEventListener('wheel', e => { e.preventDefault(); cam.r = Math.min(14, Math.max(3.4, cam.r + e.deltaY * 0.005)); }, { passive: false });
  canvas.addEventListener('contextmenu', e => e.preventDefault());

  function pickRegion() {
    ray.setFromCamera(mouse, camera);
    const hit = ray.intersectObjects(nodeMeshes, false)[0];
    if (hit) {
      selectedRegion = hit.object.userData.region;
      energize([selectedRegion], 1.3);
      opts.onSelectRegion?.(selectedRegion);
    }
  }
  canvas.addEventListener('dblclick', pickRegion);

  function resize() {
    const w = canvas.clientWidth || 600, h = canvas.clientHeight || 480;
    renderer.setSize(w, h, false);
    camera.aspect = w / h; camera.updateProjectionMatrix();
  }
  new ResizeObserver(resize).observe(canvas);
  resize();

  const clock = new THREE.Clock();
  let running = true, t = 0;
  function frame() {
    if (!running) return;
    requestAnimationFrame(frame);
    const dt = Math.min(clock.getDelta(), 0.05); t += dt;
    if (cam.auto) cam.theta += dt * 0.12 * visual.pulseSpeed;
    applyCam();

    // decaer energía regional
    for (const k of Object.keys(regionEnergy)) regionEnergy[k] = Math.max(0, regionEnergy[k] - dt * 0.7);

    // nodos: latido + energía por región
    for (const n of nodes) {
      const e = regionEnergy[n.userData.region] ?? 0;
      const sel = selectedRegion === n.userData.region ? 0.6 : 0;
      const jitter = visual.jitter * Math.sin(t * 21 + n.userData.phase) * 0.02;
      const s = n.userData.base * (0.8 + 0.35 * Math.sin(t * (1.5 + e * 3) * visual.pulseSpeed + n.userData.phase)) + e * 0.9 + sel;
      n.scale.setScalar(Math.max(0.3, s + jitter * 10));
      n.material.opacity = Math.min(1, 0.55 + e * 0.4 + visual.glow * 0.25);
    }
    // hemisferios respiran con el estado
    const br = 1 + Math.sin(t * 1.4 * visual.pulseSpeed) * 0.008;
    brain.scale.setScalar(br);
    for (const h of hemis) {
      h.wire.material.emissiveIntensity = 0.3 + visual.glow * 0.35 + (regionEnergy.razonamiento ?? 0) * 0.25;
      h.wire.rotation.y = Math.sin(t * 0.2) * 0.02;
    }
    fiberMat.opacity = 0.2 + visual.glow * 0.18 + Math.sin(t * 3) * 0.04;

    // pulsos
    const pos = pulseGeo.attributes.position;
    for (let i = 0; i < pulseState.length; i++) {
      const p = pulseState[i];
      p.t += dt * p.speed * visual.pulseSpeed;
      p.speed += (0.6 - p.speed) * dt * 0.2;
      if (p.t >= 1) { p.t = 0; p.pair = Math.floor(Math.random() * fiberPairs.length); }
      const [a, b] = fiberPairs[p.pair] ?? [0, 1];
      const A = nodes[a % nodes.length].position, B = nodes[b % nodes.length].position;
      pos.setXYZ(i, A.x + (B.x - A.x) * p.t, A.y + (B.y - A.y) * p.t + Math.sin(p.t * Math.PI) * 0.06, A.z + (B.z - A.z) * p.t);
    }
    pos.needsUpdate = true;
    dust1.rotation.y += dt * 0.02; dust2.rotation.y -= dt * 0.015;
    dust1.position.y = Math.sin(t * 0.4) * 0.15;

    for (let i = waves.length - 1; i >= 0; i--) {
      const w = waves[i]; w.userData.t += dt;
      const k = w.userData.t / 1.4;
      if (k >= 1) { scene.remove(w); w.geometry.dispose(); w.material.dispose(); waves.splice(i, 1); continue; }
      w.scale.setScalar(1 + k * 22);
      w.material.opacity = 0.85 * (1 - k);
      w.lookAt(camera.position);
    }
    renderer.render(scene, camera);
  }
  frame();

  return {
    setVisualMode, energize, spawnWave,
    setView(name) {
      if (name === 'frontal') { cam.theta = 0; cam.phi = 1.35; }
      if (name === 'lateral') { cam.theta = Math.PI / 2; cam.phi = 1.35; }
      if (name === 'superior') { cam.phi = 0.25; }
      if (name === 'libre') { cam.auto = false; }
      cam.auto = name === 'auto' ? true : name === 'libre' ? false : cam.auto;
    },
    toggleAuto() { cam.auto = !cam.auto; return cam.auto; },
    focusRegion(id) { selectedRegion = id; energize([id], 1.2); },
    dispose() { running = false; offs.forEach(o => o?.()); renderer.dispose(); }
  };
}
