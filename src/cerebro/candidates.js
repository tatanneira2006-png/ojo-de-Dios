// CEREBRO — 100 candidatos tecnológicos (sec. 32).
// Referencia para evaluación uno por uno. NO instalar automáticamente.
// Campos sec. 31: id, nombre, categoría, función, estado, etc.

const C = (id, name, category, fn) => ({
  id: `c${id}`, name, category, funcion: fn,
  entradaSalida: 'por-definir en adaptador', dependencias: [],
  licencia: 'verificar', coste: 'verificar', requisitos: 'verificar',
  localRemoto: 'verificar', necesitaInternet: false, recursos: 'verificar',
  compatibilidad: 'pendiente', prioridad: 'media', status: 'pendiente'
});

export const CANDIDATES = [
  // A. Cognición 1-10
  C(1, 'OpenCog', 'cognicion', 'Arquitectura cognitiva y razonamiento'),
  C(2, 'AtomSpace', 'cognicion', 'Representación de conocimiento'),
  C(3, 'Hyperon', 'cognicion', 'Arquitectura cognitiva experimental'),
  C(4, 'NARS', 'cognicion', 'Razonamiento y decisiones'),
  C(5, 'Soar', 'cognicion', 'Arquitectura cognitiva para agentes'),
  C(6, 'ACT-R', 'cognicion', 'Modelado cognitivo y memoria'),
  C(7, 'MicroPsi', 'cognicion', 'Necesidades y motivaciones'),
  C(8, 'AnimatLab', 'cognicion', 'Agentes inspirados en organismos'),
  C(9, 'OpenNARS', 'cognicion', 'Razonamiento no axiomático'),
  C(10, 'OpenPsi', 'cognicion', 'Necesidades y motivaciones'),
  // B. Agentes 11-20
  C(11, 'AutoGPT', 'agentes', 'Agentes orientados a objetivos'),
  C(12, 'BabyAGI', 'agentes', 'Generación y ejecución de tareas'),
  C(13, 'MetaGPT', 'agentes', 'Agentes especializados por roles'),
  C(14, 'SuperAGI', 'agentes', 'Plataforma de agentes'),
  C(15, 'AgentVerse', 'agentes', 'Entornos multiagente'),
  C(16, 'CAMEL-AI', 'agentes', 'Colaboración entre agentes'),
  C(17, 'AI Legion', 'agentes', 'Coordinación multiagente'),
  C(18, 'Agno', 'agentes', 'Agentes con herramientas y conocimiento'),
  C(19, 'LlamaGym', 'agentes', 'Aprendizaje de agentes'),
  C(20, 'Voyager', 'agentes', 'Adquisición progresiva de habilidades'),
  // C. Entornos 21-26
  C(21, 'MineDojo', 'entornos', 'Aprendizaje en mundos abiertos'),
  C(22, 'Habitat-Sim', 'entornos', 'Simulación 3D'),
  C(23, 'Habitat-Lab', 'entornos', 'Entrenamiento de agentes'),
  C(24, 'iGibson', 'entornos', 'Ambientes físicos simulados'),
  C(25, 'AI2-THOR', 'entornos', 'Interacción con ambientes 3D'),
  C(26, 'PyBullet', 'entornos', 'Simulación física'),
  // D. Robótica 27-33
  C(27, 'ROS 2', 'robotica', 'Infraestructura robótica'),
  C(28, 'Navigation2', 'robotica', 'Navegación autónoma'),
  C(29, 'OpenVLA', 'robotica', 'Visión + lenguaje + acción'),
  C(30, 'Octo', 'robotica', 'Aprendizaje robótico generalista'),
  C(31, 'LeRobot', 'robotica', 'Aprendizaje para robots'),
  C(32, 'Open X-Embodiment', 'robotica', 'Aprendizaje de habilidades robóticas'),
  C(33, 'RT-2', 'robotica', 'Visión-lenguaje-acción'),
  // E. Visión 34-40
  C(34, 'MediaPipe', 'vision', 'Manos, rostro, cuerpo y seguimiento'),
  C(35, 'OpenPose', 'vision', 'Postura y movimiento'),
  C(36, 'DeepFace', 'vision', 'Análisis facial'),
  C(37, 'InsightFace', 'vision', 'Análisis facial'),
  C(38, 'Ultralytics YOLO', 'vision', 'Detección de objetos'),
  C(39, 'Segment Anything', 'vision', 'Segmentación'),
  C(40, 'Florence-2', 'vision', 'Comprensión visual'),
  // F. Multimodalidad 41-46
  C(41, 'Qwen-VL', 'multimodal', 'Visión + lenguaje'),
  C(42, 'Kimi-VL', 'multimodal', 'Comprensión multimodal'),
  C(43, 'LLaVA', 'multimodal', 'Visión + lenguaje'),
  C(44, 'MiniCPM-V', 'multimodal', 'Multimodalidad ligera'),
  C(45, 'Qwen', 'multimodal', 'Lenguaje y multimodalidad'),
  C(46, 'Transformers', 'multimodal', 'Acceso a numerosos modelos'),
  // G. Voz y audio 47-54
  C(47, 'Whisper', 'voz', 'Reconocimiento de voz'),
  C(48, 'Speech-to-Speech', 'voz', 'Conversación voz-a-voz'),
  C(49, 'Piper', 'voz', 'Síntesis de voz local'),
  C(50, 'Coqui TTS', 'voz', 'Síntesis de voz'),
  C(51, 'OpenVoice', 'voz', 'Generación y personalización de voz'),
  C(52, 'Silero', 'voz', 'Voz y audio'),
  C(53, 'MusicGen', 'voz', 'Generación musical'),
  C(54, 'Stable Audio Open', 'voz', 'Generación de audio'),
  // H. Memoria y conocimiento 55-62
  C(55, 'Mem0', 'memoria', 'Memoria persistente'),
  C(56, 'Cognee', 'memoria', 'Memoria y conocimiento estructurado'),
  C(57, 'Letta', 'memoria', 'Agentes con memoria'),
  C(58, 'Memvid', 'memoria', 'Almacenamiento/recuperación de memoria'),
  C(59, 'Zep', 'memoria', 'Memoria y contexto'),
  C(60, 'LlamaIndex', 'memoria', 'Documentos y conocimiento'),
  C(61, 'Haystack', 'memoria', 'RAG, búsqueda y agentes'),
  C(62, 'GraphRAG', 'memoria', 'Conocimiento mediante grafos'),
  // I. Web y computador 63-70
  C(63, 'Browser Use', 'web-pc', 'Interacción con sitios web'),
  C(64, 'Open Interpreter', 'web-pc', 'Utilización de herramientas mediante código'),
  C(65, 'OpenHands', 'web-pc', 'Programación y tareas informáticas'),
  C(66, 'Aider', 'web-pc', 'Programación asistida'),
  C(67, 'Agent Zero', 'web-pc', 'Agente generalista'),
  C(68, 'HyperAgent', 'web-pc', 'Agentes web'),
  C(69, 'OpenBrowser', 'web-pc', 'Automatización web'),
  C(70, 'Open Computer Use', 'web-pc', 'Interacción con computador'),
  // J. Android 71-77
  C(71, 'Agent Device', 'android', 'Interacción con dispositivos'),
  C(72, 'Android Agent', 'android', 'Automatización Android'),
  C(73, 'MobileClaw', 'android', 'Agentes móviles'),
  C(74, 'Operator on Android', 'android', 'Automatización Android'),
  C(75, 'OpenGUI', 'android', 'Automatización de interfaces'),
  C(76, 'OpenDroid', 'android', 'Automatización Android'),
  C(77, 'GUI-R1', 'android', 'Comprensión de interfaces gráficas'),
  // K. Modelos locales 78-82
  C(78, 'llama.cpp', 'modelos', 'Ejecución local de modelos'),
  C(79, 'Ollama', 'modelos', 'Administración de modelos locales'),
  C(80, 'vLLM', 'modelos', 'Servidor de modelos'),
  C(81, 'DeepSeek', 'modelos', 'Razonamiento y lenguaje'),
  C(82, 'Qwen', 'modelos', 'Lenguaje y multimodalidad'),
  // L. Routing 83-84
  C(83, 'Semantic Router', 'routing', 'Selección de modelos por intención'),
  C(84, 'LLM Router', 'routing', 'Enrutamiento entre modelos'),
  // M. Creación 85-88
  C(85, 'ComfyUI', 'creacion', 'Generación visual modular'),
  C(86, 'Stable Diffusion', 'creacion', 'Generación de imágenes'),
  C(87, 'Kandinsky', 'creacion', 'Generación de imágenes'),
  C(88, 'AnimateDiff', 'creacion', 'Movimiento y vídeo'),
  // N. Multiagente 89-93
  C(89, 'Swarms', 'multiagente', 'Coordinación de agentes'),
  C(90, 'PraisonAI', 'multiagente', 'Sistemas multiagente'),
  C(91, 'AutoGen', 'multiagente', 'Comunicación entre agentes'),
  C(92, 'CrewAI', 'multiagente', 'Equipos de agentes'),
  C(93, 'LangGraph', 'multiagente', 'Agentes con estado y flujos'),
  // O. Infraestructura 94-100
  C(94, 'Milvus', 'infra', 'Base de datos vectorial'),
  C(95, 'Qdrant', 'infra', 'Búsqueda vectorial'),
  C(96, 'Chroma', 'infra', 'Almacenamiento vectorial'),
  C(97, 'Neo4j', 'infra', 'Grafos de conocimiento'),
  C(98, 'PostgreSQL', 'infra', 'Almacenamiento estructurado'),
  C(99, 'Redis', 'infra', 'Estado y memoria rápida'),
  C(100, 'Apache Kafka', 'infra', 'Eventos y comunicación entre componentes')
];

export function seedRegistry(registry) {
  for (const c of CANDIDATES) {
    try { registry.register(c); } catch { /* ya existe */ }
  }
  return registry;
}
