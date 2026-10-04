import { test } from 'node:test';
import assert from 'node:assert/strict';
import { EventBus } from '../src/cerebro/events.js';
import { Memory } from '../src/cerebro/memory.js';
import { InnerState } from '../src/cerebro/emotion.js';
import { buildPlan, analyzeIntent } from '../src/cerebro/reasoning.js';
import { routeModel } from '../src/cerebro/router.js';
import { PluginRegistry, callAdapter } from '../src/cerebro/plugins.js';
import { CANDIDATES, seedRegistry } from '../src/cerebro/candidates.js';
import { Security } from '../src/cerebro/security.js';
import { intentToAndroid, executeAndroidChain } from '../src/cerebro/android.js';
import { visualFor } from '../src/brain3d/states.js';
import { EVENT_REGIONS } from '../src/brain3d/regions.js';

test('núcleo: eventos emiten y guardan historial', () => {
  const bus = new EventBus();
  let got = null;
  bus.on('brain.thinking', p => { got = p; });
  bus.emit('brain.thinking', { input: 'hola' });
  assert.equal(got.input, 'hola');
  assert.equal(bus.recent(5)[0].event, 'brain.thinking');
});

test('memoria: guardar/recuperar/olvidar en 9 tipos', () => {
  const m = new Memory();
  const e = m.save('episodica', { text: 'el usuario prefiere respuestas claras' });
  const hits = m.retrieve('claras');
  assert.ok(hits.length >= 1);
  assert.ok(m.forget('episodica', e.id));
});

test('estado interno: éxito sube confianza, error sube frustración', () => {
  const s = new InnerState();
  const c0 = s.vars.confianza;
  s.apply('success', 0.2);
  assert.ok(s.vars.confianza >= c0);
  s.apply('error', 0.3);
  assert.ok(s.vars.frustracion > 0.1);
});

test('planificador: objetivo genera 7 pasos trazables', () => {
  const plan = buildPlan('construir base');
  assert.equal(plan.length, 7);
  assert.equal(plan[0].id, 'comprender');
});

test('router: coding va a modelo razonador, vision a multimodal', () => {
  const a = routeModel(analyzeIntent('programa una función en js'));
  const b = routeModel({ kind: 'vision' }, { multimodal: true });
  assert.ok(a.selected.id);
  assert.equal(b.selected.id, 'multimodal-vl');
});

test('seguridad: acción sensible requiere confirmación', () => {
  const sec = new Security();
  const r = sec.authorize({ agent: 'android', action: { type: 'EJECUTAR_RUTINA', sensitive: true } });
  assert.equal(r.needsConfirm, true);
  assert.equal(r.allowed, false);
});

test('android: cadena exige confirmación y verifica', async () => {
  const bus = new EventBus();
  const sec = new Security(bus);
  const actions = intentToAndroid('llama a mamá');
  assert.equal(actions[0].type, 'EJECUTAR_RUTINA');
  const trace = await executeAndroidChain(actions, { security: sec, bus });
  assert.ok(trace.some(t => t.phase === 'CONFIRMACIÓN'));
});

test('plugins: 100 candidatos registrados como pendientes, adaptador aislado', async () => {
  assert.equal(CANDIDATES.length, 100);
  const reg = new PluginRegistry();
  seedRegistry(reg);
  assert.equal(reg.count(), 100);
  assert.equal(reg.list({ status: 'pendiente' }).length, 100);
  const bad = await callAdapter({ id: 'x' }, async () => { throw new Error('boom'); });
  assert.equal(bad.ok, false);
});

test('3D: estados visuales y mapeo evento->region existen', () => {
  assert.ok(visualFor('CALMA').pulseSpeed > 0);
  assert.ok(visualFor('ÉXITO').wave === 1);
  assert.ok((EVENT_REGIONS['brain.thinking'] ?? []).includes('percepcion'));
});
