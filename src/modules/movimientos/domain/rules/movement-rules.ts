import { EstadoPrenda } from "@/shared/types";

/**
 * Verifica si una prenda puede ser asignada o prestada.
 * Solo las prendas con estado "Disponible" pueden ser asignadas o prestadas.
 */
export function canAssignPrenda(estadoPrenda: EstadoPrenda): boolean {
  return estadoPrenda === "Disponible";
}

/**
 * Verifica si un movimiento puede ser devuelto.
 * Solo los movimientos que no han sido devueltos pueden marcarse como devueltos.
 * Previene la doble devolución.
 */
export function canReturnMovimiento(movimiento: {
  devuelta: boolean;
}): boolean {
  return !movimiento.devuelta;
}

/**
 * Verifica si un movimiento está vencido.
 * Un movimiento está vencido si no ha sido devuelto y la fecha de devolución esperada
 * ya pasó respecto a la fecha actual.
 */
export function isOverdue(movimiento: {
  fechaDevolucionEsperada: Date | null;
  devuelta: boolean;
}): boolean {
  if (movimiento.devuelta) return false;
  if (!movimiento.fechaDevolucionEsperada) return false;
  return movimiento.fechaDevolucionEsperada < new Date();
}
