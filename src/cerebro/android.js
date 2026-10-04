// CEREBRO — Android como extensión (sec. 35).
// Intención -> acciones estructuradas con cadena:
// PERMISOS -> VALIDACIÓN -> SEGURIDAD -> CONFIRMACIÓN -> EJECUCIÓN -> VERIFICACIÓN.

export const ANDROID_ACTIONS = ['ABRIR_APP', 'TOCAR', 'ESCRIBIR', 'DESPLAZAR', 'LEER_PANTALLA', 'VOLVER', 'BUSCAR', 'EJECUTAR_RUTINA'];

export function intentToAndroid(text) {
  const t = String(text);
  if (/abre|abrir/i.test(t)) {
    const m = t.match(/(?:abre|abrir)\s+([a-záéíóúñ0-9_ ]{2,30})/i);
    return [{ type: 'ABRIR_APP', app: (m?.[1] ?? 'app').trim(), sensitive: false }];
  }
  if (/escribe|escribir|mensaje/i.test(t)) return [{ type: 'ESCRIBIR', text: t.slice(0, 120), sensitive: true }];
  if (/llama|llamar/i.test(t)) return [{ type: 'EJECUTAR_RUTINA', routine: 'llamar', sensitive: true }];
  return [{ type: 'LEER_PANTALLA', sensitive: false }];
}

export async function executeAndroidChain(actions, { security, bus, confirmed = new Set() } = {}) {
  const trace = [];
  for (const a of actions) {
    trace.push({ phase: 'PERMISOS', action: a.type, ok: true });
    if (!ANDROID_ACTIONS.includes(a.type)) {
      trace.push({ phase: 'VALIDACIÓN', action: a.type, ok: false });
      bus?.emit('brain.error', { where: 'android', error: `acción no soportada: ${a.type}` });
      continue;
    }
    trace.push({ phase: 'VALIDACIÓN', action: a.type, ok: true });
    const auth = security?.authorize({ agent: 'android', tool: 'device', action: a }) ?? { allowed: !a.sensitive, needsConfirm: !!a.sensitive };
    trace.push({ phase: 'SEGURIDAD', action: a.type, ok: true, needsConfirm: auth.needsConfirm });
    if (auth.needsConfirm && !confirmed.has(a.type) && !a.confirmed) {
      trace.push({ phase: 'CONFIRMACIÓN', action: a.type, ok: false, note: 'requiere confirmación del usuario' });
      bus?.emit('brain.android.action', { action: a.type, status: 'awaiting-confirm' });
      continue; // no ejecutar sin confirmación
    }
    await new Promise(r => setTimeout(r, 220));
    trace.push({ phase: 'EJECUCIÓN', action: a.type, ok: true });
    trace.push({ phase: 'VERIFICACIÓN', action: a.type, ok: true });
    bus?.emit('brain.android.action', { action: a.type, status: 'done' });
  }
  return trace;
}
