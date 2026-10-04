// CEREBRO 3D — Regiones funcionales (sec. 22).
// Funcionales del cerebro artificial, no anatomía humana exacta.

export const REGIONS = [
  { id: 'razonamiento', label: 'Razonamiento', color: 0x3aa0ff },
  { id: 'memoria', label: 'Memoria', color: 0xb06bff },
  { id: 'estado', label: 'Estado interno', color: 0xff9a2a },
  { id: 'percepcion', label: 'Percepción', color: 0x35d07f },
  { id: 'seguridad', label: 'Seguridad', color: 0xff4d5e },
  { id: 'planificacion', label: 'Planificación', color: 0xffd23a },
  { id: 'comunicacion', label: 'Comunicación', color: 0x4de1ff },
  { id: 'aprendizaje', label: 'Aprendizaje', color: 0x8a6b4a },
  { id: 'conocimiento', label: 'Conocimiento', color: 0xe8e8e8 },
  { id: 'agentes', label: 'Agentes', color: 0x2a7bff },
  { id: 'herramientas', label: 'Herramientas', color: 0xff7a1a }
];

// Evento -> regiones que se iluminan (sec. 21).
export const EVENT_REGIONS = {
  'brain.thinking': ['percepcion', 'comunicacion'],
  'brain.reasoning': ['razonamiento'],
  'brain.memory.retrieve': ['memoria'],
  'brain.memory.store': ['memoria', 'conocimiento'],
  'brain.planning': ['planificacion'],
  'brain.tool.start': ['herramientas'],
  'brain.tool.complete': ['herramientas', 'aprendizaje'],
  'brain.agent.start': ['agentes'],
  'brain.agent.complete': ['agentes', 'aprendizaje'],
  'brain.vision.start': ['percepcion'],
  'brain.voice.start': ['comunicacion', 'percepcion'],
  'brain.android.action': ['agentes', 'seguridad'],
  'brain.error': ['seguridad', 'estado'],
  'brain.success': ['aprendizaje', 'estado'],
  'brain.learning': ['aprendizaje', 'memoria']
};
