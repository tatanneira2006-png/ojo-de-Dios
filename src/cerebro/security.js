// CEREBRO — Seguridad (sec. 17): permisos, trazabilidad, confirmación, aislamiento.

export const SENSITIVE = [/android/i, /borrar/i, /eliminar/i, /formatear/i, /ejecutar/i, /comprar/i, /enviar/i, /llamar/i];

export class Security {
  constructor(bus = null) {
    this.bus = bus;
    this.audit = [];
    this.pendingConfirm = new Map();
  }
  isSensitive(action) {
    return SENSITIVE.some(rx => rx.test(String(action?.type ?? action ?? '')));
  }
  authorize({ agent = '?', model = '?', tool = '?', action = '?' } = {}) {
    const label = typeof action === 'string' ? action : action?.type ?? '?';
    const needsConfirm = this.isSensitive(label) || action?.sensitive;
    const record = { ts: Date.now(), agent, model, tool, action: label, needsConfirm };
    this.audit.push(record);
    if (this.audit.length > 300) this.audit.shift();
    return { allowed: !needsConfirm || action?.confirmed === true, needsConfirm, record };
  }
  requestConfirm(id, action) {
    this.pendingConfirm.set(id, { action, ts: Date.now() });
    return id;
  }
  confirm(id) {
    const p = this.pendingConfirm.get(id);
    if (!p) return null;
    this.pendingConfirm.delete(id);
    return { ...p.action, confirmed: true };
  }
  logResult(action, ok, detail = '') {
    this.audit.push({ ts: Date.now(), action: String(action?.type ?? action), ok, detail });
  }
  trail(n = 40) { return this.audit.slice(-n).reverse(); }
}
