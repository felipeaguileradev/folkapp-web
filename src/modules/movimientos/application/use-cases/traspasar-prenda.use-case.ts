import type { Result } from "@/shared/types";
import { MovementError } from "@/shared/types";
import type { Movimiento, CreateMovimientoDTO } from "../../domain/entities";
import type { MovimientoRepository } from "../../domain/ports";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";

/** Input para traspasar una prenda entre bailarines */
export interface TraspasarPrendaInput {
  prendaId: string;
  bailarinOrigenId: string;
  bailarinDestinoId: string;
  registradoPor: string;
  observacion?: string | null;
}

/** Dependencias del caso de uso */
export interface TraspasarPrendaDeps {
  movimientoRepository: MovimientoRepository;
  prendaRepository: PrendaRepository;
}

/**
 * Caso de uso: Traspasar una prenda de un bailarín a otro.
 * Valida que la prenda tenga como bailarin_actual al bailarín de origen,
 * crea el movimiento de traspaso y actualiza bailarin_actual al destino.
 * El estado de la prenda se preserva sin cambios.
 * La actualización transaccional se delega al repositorio (RPC).
 */
export async function traspasarPrenda(
  deps: TraspasarPrendaDeps,
  input: TraspasarPrendaInput,
): Promise<Result<Movimiento, MovementError>> {
  const { movimientoRepository, prendaRepository } = deps;

  const prenda = await prendaRepository.findById(input.prendaId);
  if (!prenda) {
    return {
      success: false,
      error: new MovementError("Prenda no encontrada"),
    };
  }

  if (prenda.bailarinActualId !== input.bailarinOrigenId) {
    return {
      success: false,
      error: new MovementError(
        "La prenda no está asignada al bailarín de origen indicado",
      ),
    };
  }

  const movimientoDTO: CreateMovimientoDTO = {
    prendaId: input.prendaId,
    bailarinId: input.bailarinOrigenId,
    bailarinDestinoId: input.bailarinDestinoId,
    tipo: "Traspaso",
    fechaInicio: new Date(),
    fechaDevolucionEsperada: null,
    devuelta: false,
    registradoPor: input.registradoPor,
    observacion: input.observacion ?? null,
    estadoResultante: prenda.estado, // preservar estado actual
  };

  const movimiento = await movimientoRepository.create(movimientoDTO);

  return { success: true, data: movimiento };
}
