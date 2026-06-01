import type { Result } from "@/shared/types";
import type { Movimiento } from "../../domain/entities";
import type {
  MovimientoRepository,
  MovimientoFilters,
} from "../../domain/ports";
import { isOverdue } from "../../domain/rules";

/** Movimiento con indicador de vencimiento */
export interface MovimientoConEstado extends Movimiento {
  isVencido: boolean;
}

/** Input para obtener movimientos activos */
export interface ObtenerMovimientosActivosInput {
  filters?: MovimientoFilters;
}

/** Dependencias del caso de uso */
export interface ObtenerMovimientosActivosDeps {
  movimientoRepository: MovimientoRepository;
}

/**
 * Caso de uso: Obtener movimientos activos con detección de vencimiento.
 * Recupera movimientos no devueltos y marca aquellos cuya fecha de devolución
 * esperada ya pasó con isVencido=true.
 */
export async function obtenerMovimientosActivos(
  deps: ObtenerMovimientosActivosDeps,
  input: ObtenerMovimientosActivosInput,
): Promise<Result<MovimientoConEstado[], never>> {
  const { movimientoRepository } = deps;

  const filters: MovimientoFilters = {
    ...input.filters,
    devuelta: false,
  };

  const movimientos = await movimientoRepository.findActivos(filters);

  const movimientosConEstado: MovimientoConEstado[] = movimientos.map(
    (movimiento) => ({
      ...movimiento,
      isVencido: isOverdue(movimiento),
    }),
  );

  return { success: true, data: movimientosConEstado };
}
