// CEREBRO — Bus de eventos central.
// Arquitectura: CEREBRO -> ESTADO -> EVENTOS -> VISUALIZACION 3D.
// La visualización representa lo que ocurre, no contiene la lógica.

export const BRAIN_EVENTS = [
  'brain.thinking',
  'brain.reasoning',
  'brain.memory.retrieve',
  'brain.memory.store',
  'brain.planning',
  'brain.tool.start',
  'brain.tool.complete',
  'brain.agent.start',
  'brain.agent.complete',
  'brain.vision.start',
  'brain.voice.start',
  'brain.android.action',
  'brain.error',
  'brain.success',
  'brain.learning'
];

export class EventBus {
  constructor() {
    this.listeners = new Map();
    this.history = [];
    this.maxHistory = 200;
  }
  on(event, fn) {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event).add(fn);
    return () => this.off(event, fn);
  }
  off(event, fn) {
    this.listeners.get(event)?.delete(fn);
  }
  emit(event, payload = {}) {
    const entry = { event, payload, ts: Date.now() };
    this.history.push(entry);
    if (this.history.length > this.maxHistory) this.history.shift();
    const fns = this.listeners.get(event);
    if (fns) for (const fn of [...fns]) {
      try { fn(payload, entry); } catch (e) { console.error('[bus]', event, e); }
    }
    const wild = this.listeners.get('*');
    if (wild) for (const fn of [...wild]) {
      try { fn(event, payload, entry); } catch (e) { console.error('[bus *]', e); }
    }
    return entry;
  }
  recent(n = 30) {
    return this.history.slice(-n).reverse();
  }
}

export const bus = new EventBus();
