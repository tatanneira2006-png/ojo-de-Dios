// CEREBRO — Conocimiento (sec. 8): documentos, web, estructurado, grafo, experiencias.

export class Knowledge {
  constructor(memory) {
    this.memory = memory;
    this.graph = new Map(); // nodo -> Set(vecinos)
  }
  addDoc(title, text, tags = []) {
    const e = this.memory.save('semantica', { kind: 'documento', title, text: String(text).slice(0, 2000), tags });
    this.link(title, ...(tags ?? []));
    return e;
  }
  addWeb(url, summary) {
    return this.memory.save('semantica', { kind: 'web', url, text: String(summary).slice(0, 2000) });
  }
  link(a, ...rest) {
    if (!this.graph.has(a)) this.graph.set(a, new Set());
    for (const b of rest) {
      if (!b) continue;
      this.graph.get(a).add(b);
      if (!this.graph.has(b)) this.graph.set(b, new Set());
      this.graph.get(b).add(a);
    }
  }
  neighbors(node) { return [...(this.graph.get(node) ?? [])]; }
  search(q) { return this.memory.retrieve(q, ['semantica', 'experiencias'], 10); }
}
