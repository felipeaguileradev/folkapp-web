/**
 * Feature Flags
 *
 * Controla qué funcionalidades están visibles en la aplicación.
 * En desarrollo: todas activas (.env.local)
 * En producción: solo las que se habiliten en las variables de entorno del hosting.
 */

export const FEATURES = {
  dashboard: process.env.NEXT_PUBLIC_FEATURE_DASHBOARD !== "false",
  inventario: process.env.NEXT_PUBLIC_FEATURE_INVENTARIO !== "false",
  bailarines: process.env.NEXT_PUBLIC_FEATURE_BAILARINES !== "false",
  movimientos: process.env.NEXT_PUBLIC_FEATURE_MOVIMIENTOS !== "false",
  cuadros: process.env.NEXT_PUBLIC_FEATURE_CUADROS !== "false",
  alertas: process.env.NEXT_PUBLIC_FEATURE_ALERTAS !== "false",
  funciones: process.env.NEXT_PUBLIC_FEATURE_FUNCIONES !== "false",
  reportes: process.env.NEXT_PUBLIC_FEATURE_REPORTES !== "false",
} as const;

export type FeatureKey = keyof typeof FEATURES;

/**
 * Verifica si una feature está habilitada.
 */
export function isFeatureEnabled(feature: FeatureKey): boolean {
  return FEATURES[feature];
}
