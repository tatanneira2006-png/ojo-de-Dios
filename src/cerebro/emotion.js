// CEREBRO — Estado interno computacional (sec. 5).
// Simulación de estados que influyen en planificación. NO afirma sentimientos humanos.

export const DEFAULT_STATE = {
  energia: 0.8, confianza: 0.6, curiosidad: 0.7, motivacion: 0.7,
  satisfaccion: 0.5, frustracion: 0.1, preocupacion: 0.2, empatia: 0.6,
  atencion: 0.7, interes: 0.6, calma: 0.7, urgencia: 0.3
};

const clamp = v => Math.min(1, Math.max(0, v));

export class InnerState {
  constructor(bus = null, initial = {}) {
    this.bus = bus;
    this.vars = { ...DEFAULT_STATE, ...initial };
    this.mode = 'CALMA';
  }
  get() { return { ...this.vars, modo: this.mode }; }
  // Eventos del sistema -> ajustes de estado (sec. 5 y 23).
  apply(event, intensity = 0.1) {
    const v = this.vars;
    switch (event) {
      case 'success':
        v.satisfaccion = clamp(v.satisfaccion + intensity);
        v.confianza = clamp(v.confianza + intensity * 0.8);
        v.motivacion = clamp(v.motivacion + intensity * 0.6);
        v.frustracion = clamp(v.frustracion - intensity);
        v.preocupacion = clamp(v.preocupacion - intensity * 0.5);
        this.mode = 'ÉXITO';
        break;
      case 'error':
        v.frustracion = clamp(v.frustracion + intensity);
        v.confianza = clamp(v.confianza - intensity * 0.7);
        v.preocupacion = clamp(v.preocupacion + intensity * 0.5);
        v.calma = clamp(v.calma - intensity * 0.4);
        this.mode = 'ERROR';
        break;
      case 'thinking':
        v.atencion = clamp(v.atencion + intensity * 0.4);
        v.curiosidad = clamp(v.curiosidad + intensity * 0.3);
        if (this.mode !== 'ÉXITO' && this.mode !== 'ERROR') this.mode = 'CURIOSIDAD';
        break;
      case 'planning':
        v.motivacion = clamp(v.motivacion + intensity * 0.3);
        if (!['ÉXITO', 'ERROR'].includes(this.mode)) this.mode = 'MOTIVACIÓN';
        break;
      case 'risk':
        v.preocupacion = clamp(v.preocupacion + intensity);
        v.urgencia = clamp(v.urgencia + intensity * 0.6);
        this.mode = 'PREOCUPACIÓN';
        break;
      case 'recover':
        v.calma = clamp(v.calma + intensity);
        v.frustracion = clamp(v.frustracion - intensity * 0.6);
        this.mode = 'CALMA';
        break;
      case 'confidence':
        v.confianza = clamp(v.confianza + intensity);
        this.mode = 'CONFIANZA';
        break;
      default:
        break;
    }
    // Decaimiento suave hacia equilibrio
    for (const k of Object.keys(v)) {
      const base = DEFAULT_STATE[k] ?? 0.5;
      v[k] = clamp(v[k] + (base - v[k]) * 0.02);
    }
  }
  describe() {
    const v = this.vars;
    if (v.frustracion > 0.6) return 'FRUSTRACIÓN';
    if (v.preocupacion > 0.6) return 'PREOCUPACIÓN';
    if (v.motivacion > 0.75 && v.energia > 0.6) return 'MOTIVACIÓN';
    if (v.confianza > 0.7) return 'CONFIANZA';
    if (v.curiosidad > 0.7) return 'CURIOSIDAD';
    return this.mode;
  }
}
