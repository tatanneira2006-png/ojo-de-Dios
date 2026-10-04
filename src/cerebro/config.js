// CEREBRO — Configuración global.

export const config = {
  app: 'CEREBRO',
  version: '0.1.0',
  lang: 'es',
  safety: { requireConfirmForSensitive: true, maxPlanSteps: 7 },
  demo: { vivoIntervalMs: 2600, pulseCount: 90 },
  three: { particleCount: 700, nodeCount: 130 }
};
