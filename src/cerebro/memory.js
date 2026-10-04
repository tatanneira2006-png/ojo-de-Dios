// CEREBRO — Memoria multicapa (sec. 7 especificación).
// Tipos: inmediata, sesion, conversacional, episodica, semantica,
// procedural, experiencias, preferencias, objetivos.

const TYPES = [
  'inmediata', 'sesion', 'conversacional', 'episodica', 'semantica',
  'procedural', 'experiencias', 'preferencias', 'objetivos'
];

export class Memory {
  constructor(bus = null) {
    this.bus = bus;
    this.store = new Map(TYPES.map(t => [t, []]));
    this.maxPerType = 200;
  }
  save(type, item) {
    if (!this.store.has(type)) throw new Error(`Tipo de memoria desconocido: ${type}`);
    const entry = {
      id: `${type}-${Date.now()}-${Math.floor(Math.random() * 1e6)}`,
      ts: Date.now(),
      ...(typeof item === 'string' ? { text: item } : item)
    };
    const arr = this.store.get(type);
    arr.push(entry);
    if (arr.length > this.maxPerType) arr.shift();
    this.bus?.emit('brain.memory.store', { type, id: entry.id });
    return entry;
  }
  retrieve(query = '', types = null, limit = 8) {
    this.bus?.emit('brain.memory.retrieve', { query, types });
    const wanted = types ?? [...this.store.keys()];
    const q = String(query).toLowerCase();
    const out = [];
    for (const t of wanted) {
      for (const e of this.store.get(t) ?? []) {
        const hay = JSON.stringify(e).toLowerCase();
        const score = q ? (hay.includes(q) ? 2 : 0) + (e.text && q.split(/\s+/).some(w => w && e.text.toLowerCase().includes(w)) ? 1 : 0) : 1;
        if (!q || score > 0) out.push({ ...e, _type: t, _score: score });
      }
    }
    return out.sort((a, b) => b._score - a._score || b.ts - a.ts).slice(0, limit);
  }
  update(type, id, patch) {
    const arr = this.store.get(type) ?? [];
    const i = arr.findIndex(e => e.id === id);
    if (i < 0) return null;
    arr[i] = { ...arr[i], ...patch, updated: Date.now() };
    return arr[i];
  }
  forget(type, id) {
    const arr = this.store.get(type) ?? [];
    const i = arr.findIndex(e => e.id === id);
    if (i < 0) return false;
    arr.splice(i, 1);
    return true;
  }
  snapshot() {
    const s = {};
    for (const [k, v] of this.store) s[k] = v.length;
    return s;
  }
  relate(a, b, label = 'relacionado') {
    return this.save('experiencias', { kind: 'relacion', label, a, b });
  }
}
