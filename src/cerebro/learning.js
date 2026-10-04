// CEREBRO — Aprendizaje desde experiencias (sec. 18).
// Flujo: ENTRADA -> DECISIÓN -> PLAN -> ACCIÓN -> RESULTADO -> EVALUACIÓN -> APRENDIZAJE -> MEMORIA.
// Nunca modifica código automáticamente: solo registra lecciones.

export function evaluate(result) {
  if (!result) return { score: 0, label: 'sin resultado' };
  if (result.ok) return { score: 0.8 + Math.random() * 0.2, label: 'éxito' };
  return { score: Math.random() * 0.3, label: 'fallo: aplicar fallback y registrar' };
}

export function learnFromExperience(memory, { input, intent, plan, result, agent, model }) {
  const ev = evaluate(result);
  const lesson = {
    kind: 'experiencia',
    input: String(input).slice(0, 200),
    intent: intent?.kind,
    agent: agent?.id ?? agent,
    model: model?.id ?? model,
    planLength: plan?.length ?? 0,
    score: Number(ev.score.toFixed(2)),
    label: ev.label,
    ts: Date.now()
  };
  memory.save('experiencias', lesson);
  if (ev.score > 0.6) memory.save('procedural', { kind: 'receta', hint: `repetir estrategia ${intent?.kind} con ${agent?.id ?? agent}` });
  return { ...ev, lesson };
}
