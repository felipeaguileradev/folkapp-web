import type { AlertaRepository } from "../../domain/ports";
import type { TipoCondicion } from "../../domain/entities";

/**
 * Servicio para auto-resolver alertas cuando las condiciones ya no se cumplen.
 * Se invoca después de cambios de estado en prendas, movimientos o bailarines.
 */

export interface RecalcularAlertasDeps {
  alertaRepository: AlertaRepository;
}

/**
 * Auto-resuelve alertas de una entidad cuando la condición ya no aplica.
 * Por ejemplo: si una prenda pasa de "Faltante" a "Disponible",
 * se resuelve la alerta "faltante_sin_movimiento" asociada.
 */
export async function autoResolverAlertasPorEntidad(
  deps: RecalcularAlertasDeps,
  entidadId: string,
  condicionesResueltas: TipoCondicion[],
): Promise<void> {
  for (const condicion of condicionesResueltas) {
    await deps.alertaRepository.deleteByEntidad(entidadId, condicion);
  }
}

/**
 * Determina qué alertas deben auto-resolverse después de un cambio de estado de prenda.
 */
export function getCondicionesResueltasPorEstadoPrenda(
  estadoAnterior: string,
  estadoNuevo: string,
): TipoCondicion[] {
  const resueltas: TipoCondicion[] = [];

  // Si la prenda deja de ser "Faltante"
  if (estadoAnterior === "Faltante" && estadoNuevo !== "Faltante") {
    resueltas.push("faltante_sin_movimiento");
  }

  // Si la prenda deja de estar "En reparación"
  if (estadoAnterior === "En reparación" && estadoNuevo !== "En reparación") {
    resueltas.push("reparacion_prolongada");
  }

  return resueltas;
}

/**
 * Determina qué alertas deben auto-resolverse después de una devolución.
 */
export function getCondicionesResueltasPorDevolucion(): TipoCondicion[] {
  return ["prestamo_vencido"];
}

/**
 * Determina qué alertas deben auto-resolverse cuando se asigna ubicación.
 */
export function getCondicionesResueltasPorUbicacion(
  ubicacionAnterior: string | null,
  ubicacionNueva: string | null,
): TipoCondicion[] {
  if (!ubicacionAnterior && ubicacionNueva) {
    return ["sin_ubicacion"];
  }
  return [];
}

/**
 * Determina qué alertas deben auto-resolverse cuando se quita "Revisar" de comentarios.
 */
export function getCondicionesResueltasPorComentarios(
  comentariosAnteriores: string | null,
  comentariosNuevos: string | null,
): TipoCondicion[] {
  const teniaRevisar =
    comentariosAnteriores?.toLowerCase().includes("revisar") ?? false;
  const tieneRevisar =
    comentariosNuevos?.toLowerCase().includes("revisar") ?? false;

  if (teniaRevisar && !tieneRevisar) {
    return ["comentario_revisar"];
  }
  return [];
}
