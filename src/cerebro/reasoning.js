// CEREBRO — Razonamiento + Planificador + Meta-razonamiento (sec. 9, 34).

export function analyzeIntent(text) {
  const t = text.toLowerCase();
  const intent = { raw: text, kind: 'general', target: null, confidence: 0.5 };
  if (/(investiga|busca|compara|analiza|qué es|cual es|resume)/.test(t)) { intent.kind = 'research'; intent.confidence = 0.8; }
  if (/(programa|código|code|función|bug|error en|script)/.test(t)) { intent.kind = 'coding'; intent.confidence = 0.8; }
  if (/(imagen|foto|dibuja|mira|vídeo|video)/.test(t)) { intent.kind = 'vision'; intent.confidence = 0.75; }
  if (/(voz|habla|audio|escucha|di en voz)/.test(t)) { intent.kind = 'voice'; intent.confidence = 0.75; }
  if (/(android|teléfono|telefono|móvil|movil|app|abre whatsapp|llama)/.test(t)) { intent.kind = 'android'; intent.confidence = 0.8; }
  if (/(web|navega|página|pagina|sitio|url)/.test(t)) { intent.kind = 'web'; intent.confidence = 0.7; }
  if (/(plan|pasos|organiza|estrategia)/.test(t)) { intent.kind = 'planning'; intent.confidence = 0.7; }
  if (/(recuerda|memoria|olvida|guardar preferencia)/.test(t)) { intent.kind = 'memory'; intent.confidence = 0.75; }
  if (/(crea|imagina|idea|historia|poema|diseña)/.test(t)) { intent.kind = 'creative'; intent.confidence = 0.7; }
  return intent;
}

// objetivo -> pasos (sec. 9 ejemplo)
export function buildPlan(objective) {
  const o = String(objective).slice(0, 300);
  return [
    { id: 'comprender', title: 'Comprender requisitos', detail: `Descomponer: ${o}` },
    { id: 'memoria', title: 'Consultar memoria', detail: 'Buscar experiencias y conocimiento previo' },
    { id: 'investigar', title: 'Investigar / comparar', detail: 'Reunir y contrastar información' },
    { id: 'verificar', title: 'Verificar', detail: 'Comprobar supuestos y riesgos' },
    { id: 'ejecutar', title: 'Crear propuesta / ejecutar', detail: 'Producir resultado accionable' },
    { id: 'guardar', title: 'Guardar conocimiento', detail: 'Registrar experiencia y aprendizaje' },
    { id: 'entregar', title: 'Entregar resultado', detail: 'Presentar de forma clara y trazable' }
  ];
}

export function metaReasoning(ctx) {
  // sec. 34 — preguntas de control
  return [
    { q: '¿Estoy utilizando la herramienta correcta?', ok: !!ctx.tool },
    { q: '¿Tengo suficiente información?', ok: (ctx.memoryHits ?? 0) > 0 || (ctx.intent?.confidence ?? 0) > 0.6 },
    { q: '¿La acción funcionó?', ok: ctx.lastResult?.ok !== false },
    { q: '¿Debo cambiar de estrategia?', ok: true, hint: ctx.errors > 1 ? 'sí: aplicar fallback' : 'no por ahora' },
    { q: '¿Debo consultar memoria?', ok: true },
    { q: '¿Debo guardar esta experiencia?', ok: !!ctx.important }
  ];
}
