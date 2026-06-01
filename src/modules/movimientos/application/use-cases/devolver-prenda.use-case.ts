import type { Result } from "@/shared/types";
import { MovementError } from "@/shared/types";
import type { MovimientoRepository } from "../../domain/ports";
import { canReturnMovimiento } from "../../domain/rules";

/** Input para devolver una prenda */
export interface DevolverPrendaInput {
  movimientoId: string;
}

/** Dependencias del caso de uso */
export interface DevolverPrendaDeps {
  movimientoRepository: MovimientoRepository;
}

/**
 * Caso de uso: Devolver una prenda (registrar devolución).
 * Valida que el movimiento no haya sido devuelto previamente,
 * marca devuelta=true, resetea la prenda a "Disponible" y limpia bailarin_actual.
 * La actualización transaccional se delega al repositorio (RPC).
 */
export async function devolverPrenda(
  deps: DevolverPrendaDeps,
  input: DevolverPrendaInput,
): Promise<Result<void, MovementError>> {
  const { movimientoRepository } = deps;

  const movimiento = await movimientoRepository.findById(input.movimientoId);
  if (!movimiento) {
    return {
      success: false,
      error: new MovementError("Movimiento no encontrado"),
    };
  }

  if (!canReturnMovimiento(movimiento)) {
    return {
      success: false,
      error: new MovementError("El movimiento ya fue devuelto previamente"),
    };
  }

  await movimientoRepository.marcarDevuelto(input.movimientoId);

  return { success: true, data: undefined };
}
