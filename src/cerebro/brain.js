// 🧠 CEREBRO — Núcleo central (sec. 4).
// Recibir -> intención -> memoria -> razonar -> plan -> router -> agentes/herramientas
// -> verificar -> aprender -> memoria. Todo emite eventos reales hacia el 3D.

import { bus } from './events.js';
import { Memory } from './memory.js';
import { InnerState } from './emotion.js';
import { Personality } from './personality.js';
import { analyzeIntent, buildPlan, metaReasoning } from './reasoning.js';
import { routeModel } from './router.js';
import { selectAgent, runAgent } from './agents.js';
import { runTool } from './tools.js';
import { Security } from './security.js';
import { learnFromExperience } from './learning.js';
import { Knowledge } from './knowledge.js';
import { PluginRegistry } from './plugins.js';
import { seedRegistry } from './candidates.js';
import { intentToAndroid, executeAndroidChain } from './android.js';

export class Cerebro {
  constructor() {
    this.bus = bus;
    this.memory = new Memory(bus);
    this.state = new InnerState(bus);
    this.personality = new Personality();
    this.security = new Security(bus);
    this.knowledge = new Knowledge(this.memory);
    this.plugins = new PluginRegistry();
    seedRegistry(this.plugins);
    this.status = { model: 'local-rapido', agent: 'planning', tool: '-', task: 'idle', goal: '—', process: 'en espera' };
    this.errors = 0;
    this.seedKnowledge();
  }
  seedKnowledge() {
    this.knowledge.addDoc('CEREBRO base', 'Núcleo modular: eventos, memoria, estado, planner, router, agentes, seguridad y 3D. Las 100 tecnologías son candidatas pendientes de evaluación.', ['cerebro', 'arquitectura']);
    this.memory.save('preferencias', { text: 'prioridad: estabilidad, arquitectura, seguridad' });
    this.memory.save('objetivos', { text: 'crecer desde un núcleo estable hacia plataforma de inteligencia personal' });
  }
  async think(input, opts = {}) {
    const text = String(input ?? '').slice(0, 500);
    if (!text.trim()) return { ok: false, error: 'entrada vacía' };
    this.status.task = text.slice(0, 80);
    this.bus.emit('brain.thinking', { input: text });
    this.state.apply('thinking');

    const intent = analyzeIntent(text);
    this.memory.save('conversacional', { role: 'usuario', text });
    this.memory.save('inmediata', { text, intent: intent.kind });

    const memHits = this.memory.retrieve(text, null, 6);
    this.bus.emit('brain.reasoning', { intent });
    this.state.apply('thinking', 0.06);

    const plan = buildPlan(text);
    this.status.goal = text.slice(0, 100);
    this.bus.emit('brain.planning', { steps: plan.length, intent: intent.kind });
    this.state.apply('planning');
    this.status.process = `planificando (${plan.length} pasos)`;

    const routed = routeModel(intent, { complex: text.length > 120 });
    this.status.model = routed.selected.id;

    const agent = selectAgent(intent);
    this.status.agent = agent.id;

    const meta = metaReasoning({ intent, memoryHits: memHits.length, errors: this.errors, tool: this.status.tool, important: true });

    let agentResult = { ok: true, agent: agent.id, output: '' };
    let toolResult = null;
    let androidTrace = null;

    if (intent.kind === 'android') {
      const actions = intentToAndroid(text);
      androidTrace = await executeAndroidChain(actions, { security: this.security, bus: this.bus });
      const blocked = androidTrace.some(t => t.phase === 'CONFIRMACIÓN' && !t.ok);
      agentResult = { ok: !blocked, agent: 'android', output: blocked ? 'acción sensible: requiere confirmación en panel Android' : 'acción Android simulada con permisos verificados', trace: androidTrace };
    } else {
      agentResult = await runAgent(agent.id, text, this.bus);
      if (!agentResult.ok) { this.errors++; this.state.apply('error'); }
      // herramienta de apoyo según intención
      if (/cu[aá]nto|calcula|suma|\d+\s*[+\-*/]\s*\d+/.test(text.toLowerCase())) {
        const m = text.match(/([\d\s+\-*/().%]+)/);
        this.status.tool = 'calculadora';
        toolResult = await runTool('calculadora', m?.[1] ?? '2+2', this.bus);
      } else if (/recuerda|guarda/i.test(text)) {
        this.status.tool = 'notas';
        toolResult = await runTool('notas', text, this.bus);
        this.memory.save('preferencias', { text });
      }
    }

    const ok = agentResult.ok !== false;
    if (ok) {
      this.bus.emit('brain.success', { intent: intent.kind, agent: agent.id, model: routed.selected.id });
      this.state.apply('success', 0.12);
      this.errors = 0;
    } else {
      this.bus.emit('brain.error', { where: 'think', error: agentResult.error ?? 'fallo' });
      this.state.apply('error', 0.15);
      this.errors++;
    }

    const learned = learnFromExperience(this.memory, { input: text, intent, plan, result: agentResult, agent, model: routed.selected });
    this.bus.emit('brain.learning', { score: learned.score, label: learned.label });
    this.memory.save('conversacional', { role: 'cerebro', text: this.answer(text, intent, agentResult, toolResult, memHits) });

    this.status.process = ok ? 'respuesta lista' : 'recuperación / fallback';
    this.status.task = text.slice(0, 80);
    return { ok, intent, plan, agent, model: routed.selected, alternatives: routed.alternatives, agentResult, toolResult, androidTrace, memHits, meta, learned, estado: this.state.get() };
  }
  answer(text, intent, agentResult, toolResult, memHits) {
    let base = `He procesado “${text.slice(0, 120)}” como intención *${intent.kind}* (confianza ${intent.confidence}).`;
    base += `\nAgente: ${agentResult.agent} · Modelo: ${this.status.model}.`;
    if (agentResult.output) base += `\n${agentResult.output}`;
    if (agentResult.trace) base += `\nCadena Android: ` + agentResult.trace.map(t => `${t.phase}=${t.ok ? 'ok' : 'pendiente'}`).join(' → ');
    if (toolResult?.output) base += `\nHerramienta ${toolResult.tool}: ${toolResult.output}`;
    if (memHits?.length) base += `\nMemoria: ${memHits.length} recuerdo(s) relacionado(s).`;
    base += `\nEstado: ${this.state.describe()} · Confianza ${this.state.vars.confianza.toFixed(2)} · Energía ${this.state.vars.energia.toFixed(2)}.`;
    return base;
  }
}

export const cerebro = new Cerebro();
