// CEREBRO 3D — Estado interno visual (sec. 23).
// Representación de estados computacionales, no sentimientos humanos.

export const VISUAL_STATES = {
  CALMA: { pulseSpeed: 0.6, glow: 0.55, jitter: 0.05, wave: 0 },
  CURIOSIDAD: { pulseSpeed: 1.1, glow: 0.7, jitter: 0.25, wave: 0 },
  'MOTIVACIÓN': { pulseSpeed: 1.7, glow: 0.95, jitter: 0.15, wave: 0 },
  MOTIVACION: { pulseSpeed: 1.7, glow: 0.95, jitter: 0.15, wave: 0 },
  'FRUSTRACIÓN': { pulseSpeed: 2.4, glow: 0.8, jitter: 0.6, wave: 0 },
  CONFIANZA: { pulseSpeed: 0.9, glow: 0.85, jitter: 0.06, wave: 0 },
  'PREOCUPACIÓN': { pulseSpeed: 1.4, glow: 0.7, jitter: 0.2, wave: 0 },
  'ÉXITO': { pulseSpeed: 2.0, glow: 1.2, jitter: 0.1, wave: 1 },
  ÉXITO: { pulseSpeed: 2.0, glow: 1.2, jitter: 0.1, wave: 1 },
  ERROR: { pulseSpeed: 2.6, glow: 1.0, jitter: 0.5, wave: 1 }
};

export function visualFor(mode) {
  return VISUAL_STATES[mode] ?? VISUAL_STATES.CALMA;
}
