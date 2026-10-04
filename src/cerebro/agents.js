// CEREBRO — Sistema multiagente (sec. 11) + fallback (sec. 33).
// El cerebro decide cuándo y por qué usar cada agente.

export const AGENTS = [
  { id: 'research', name: 'Research Agent', desc: 'investigación', kinds: ['research', 'web', 'analysis'] },
  { id: 'coding', name: 'Coding Agent', desc: 'programación', kinds: ['coding'] },
  { id: 'vision', name: 'Vision Agent', desc: 'visión', kinds: ['vision', 'creative'] },
  { id: 'voice', name: 'Voice Agent', desc: 'voz', kinds: ['voice'] },
  { id: 'android', name: 'Android Agent', desc: 'dispositivo', kinds: ['android'] },
  { id: 'web', name: 'Web Agent', desc: 'navegación', kinds: ['web', 'research'] },
  { id: 'security', name: 'Security Agent', desc: 'seguridad', kinds: ['security'] },
  { id: 'planning', name: 'Planning Agent', desc: 'planificación', kinds: ['planning', 'general'] },
  { id: 'memory', name: 'Memory Agent', desc: 'memoria', kinds: ['memory'] },
  { id: 'analysis', name: 'Analysis Agent', desc: 'análisis', kinds: ['analysis', 'research'] },
  { id: 'creative', name: 'Creative Agent', desc: 'creatividad', kinds: ['creative', 'vision'] }
];

export function selectAgent(intent) {
  const kind = intent?.kind ?? 'general';
  return AGENTS.find(a => a.kinds.includes(kind)) ?? AGENTS.find(a => a.id === 'planning');
}

// Ejecución simulada con fallback: si falla, probar alternativa (sec. 33).
export async function runAgent(agentId, task, bus = null, { failRate = 0.08 } = {}) {
  const agent = AGENTS.find(a => a.id === agentId) ?? selectAgent({ kind: 'general' });
  bus?.emit('brain.agent.start', { agent: agent.id, task: String(task).slice(0, 140) });
  await new Promise(r => setTimeout(r, 280 + Math.random() * 420));
  if (Math.random() < failRate) {
    const err = `agente ${agent.id} no disponible (simulado)`;
    bus?.emit('brain.error', { where: 'agent', agent: agent.id, error: err });
    // fallback: probar planning como alternativa segura
    if (agent.id !== 'planning') return runAgent('planning', task, bus, { failRate: 0 });
    return { ok: false, agent: agent.id, error: err };
  }
  const result = { ok: true, agent: agent.id, output: `(${agent.name}) plan parcial para: ${String(task).slice(0, 160)}` };
  bus?.emit('brain.agent.complete', { agent: agent.id, ok: true });
  return result;
}
