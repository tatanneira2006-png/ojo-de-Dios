// CEREBRO — Registro de integraciones (sec. 31) + Plugins/Adaptadores (sec. 30).
// Las 100 tecnologías son CANDIDATAS: no se instalan automáticamente.

export const PLUGIN_STATUS = ['pendiente', 'evaluando', 'aprobado', 'integrado', 'rechazado'];

export class PluginRegistry {
  constructor() {
    this.plugins = new Map();
  }
  register(meta) {
    const p = {
      status: 'pendiente',
      localRemoto: 'por-verificar', necesitaInternet: false,
      ...meta
    };
    if (!p.id || !p.name) throw new Error('plugin requiere id y name');
    this.plugins.set(p.id, p);
    return p;
  }
  setStatus(id, status) {
    if (!PLUGIN_STATUS.includes(status)) throw new Error(`estado inválido: ${status}`);
    const p = this.plugins.get(id);
    if (!p) throw new Error(`plugin desconocido: ${id}`);
    p.status = status;
    return p;
  }
  list(filter = {}) {
    return [...this.plugins.values()].filter(p =>
      (!filter.status || p.status === filter.status) &&
      (!filter.category || p.category === filter.category));
  }
  get(id) { return this.plugins.get(id); }
  count() { return this.plugins.size; }
}

// Adaptador aislado: si falla, el núcleo sigue vivo (sec. 30).
export async function callAdapter(plugin, fn, bus = null) {
  const name = plugin?.id ?? 'desconocido';
  try {
    bus?.emit('brain.tool.start', { tool: `adapter:${name}` });
    const out = await fn();
    bus?.emit('brain.tool.complete', { tool: `adapter:${name}`, ok: true });
    return { ok: true, plugin: name, out };
  } catch (e) {
    bus?.emit('brain.error', { where: 'adapter', plugin: name, error: String(e?.message ?? e) });
    return { ok: false, plugin: name, error: String(e?.message ?? e) };
  }
}
