// CEREBRO — Router de modelos (sec. 10) + Modelos locales (sec. 78-82).
// No instala modelos: selecciona según tarea, dificultad, coste, privacidad, etc.

export const MODELS = [
  { id: 'local-rapido', kind: 'local', for: ['general', 'memory', 'planning'], speed: 5, cost: 1, privacy: 5, reasoning: 2, multimodal: 1 },
  { id: 'local-razonador', kind: 'local', for: ['coding', 'research', 'planning', 'analysis'], speed: 3, cost: 1, privacy: 5, reasoning: 5, multimodal: 2 },
  { id: 'multimodal-vl', kind: 'local-remoto', for: ['vision', 'voice', 'creative'], speed: 3, cost: 2, privacy: 3, reasoning: 3, multimodal: 5 },
  { id: 'agente-dispositivo', kind: 'agente', for: ['android'], speed: 2, cost: 1, privacy: 4, reasoning: 3, multimodal: 3 },
  { id: 'agente-web', kind: 'agente', for: ['web', 'research'], speed: 2, cost: 2, privacy: 2, reasoning: 3, multimodal: 2 }
];

export function routeModel(intent, opts = {}) {
  const kind = intent?.kind ?? 'general';
  const needReasoning = opts.complex ? 5 : 3;
  const scored = MODELS.map(m => {
    let s = m.for.includes(kind) ? 10 : 0;
    s += (opts.private ? m.privacy : 0) - (opts.cheap ? m.cost * 2 : m.cost * 0.5);
    s += m.speed * (opts.fast ? 1.2 : 0.3);
    s += m.reasoning >= needReasoning ? 3 : -2;
    if (opts.multimodal && m.multimodal >= 4) s += 4;
    return { ...m, score: s };
  }).sort((a, b) => b.score - a.score);
  return { selected: scored[0], alternatives: scored.slice(1, 3) };
}
