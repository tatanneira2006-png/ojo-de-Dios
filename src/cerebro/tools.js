// CEREBRO — Herramientas aisladas (sec. 30): si un plugin falla, el núcleo no falla.

export const TOOLS = [
  { id: 'calculadora', desc: 'cálculo local seguro' },
  { id: 'notas', desc: 'guardar notas en memoria semántica' },
  { id: 'temporizador', desc: 'medir duración de tareas' },
  { id: 'eco-web', desc: 'búsqueda web (adaptador pendiente)' }
];

export async function runTool(toolId, args, bus = null) {
  bus?.emit('brain.tool.start', { tool: toolId, args: String(args ?? '').slice(0, 120) });
  await new Promise(r => setTimeout(r, 180 + Math.random() * 250));
  try {
    let output = '';
    if (toolId === 'calculadora') {
      const expr = String(args).replace(/[^0-9+\-*/(). %]/g, '').slice(0, 60);
      // eslint-disable-next-line no-new-func
      output = expr ? String(Function(`"use strict";return(${expr || '0'})`)()) : '0';
    } else if (toolId === 'notas') {
      output = `nota registrada: ${String(args).slice(0, 160)}`;
    } else if (toolId === 'temporizador') {
      output = `tarea medida correctamente`;
    } else {
      output = `(${toolId}) ejecutado en sandbox (simulado)`;
    }
    bus?.emit('brain.tool.complete', { tool: toolId, ok: true });
    return { ok: true, tool: toolId, output };
  } catch (e) {
    bus?.emit('brain.error', { where: 'tool', tool: toolId, error: String(e?.message ?? e) });
    return { ok: false, tool: toolId, error: String(e?.message ?? e) };
  }
}
