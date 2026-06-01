import type { Result, TipoMovimiento } from "@/shared/types";
import { MovementError } from "@/shared/types";
import type { Movimiento, CreateMovimientoDTO } from "../../domain/entities";
import type { MovimientoRepository } from "../../domain/ports";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";
import { canAssignPrenda } from "../../domain/rules";

/** Input para prestar una prenda a un bailarín */
export interface PrestarPrendaInput {
  prendaId: string;
  bailarinId: string;
  tipo: "Préstamo interno" | "Préstamo externo";
  registradoPor: string;
  fechaDevolucionEsperada?: Date | null;
  observacion?: string | null;
}

/** Dependencias del caso de uso */
export interface PrestarPrendaDeps {
  movimientoRepository: MovimientoRepository;
  prendaRepository: PrendaRepository;
}

/**
 * Caso de uso: Prestar una prenda a un bailarín (interno o externo).
 * Valida que la prenda esté disponible, crea el movimiento con estado "Prestada".
 * La actualización de estado de la prenda se delega al repositorio (RPC transaccional).
 */
export async function prestarPrenda(
  deps: PrestarPrendaDeps,
  input: PrestarPrendaInput,
): Promise<Result<Movimiento, MovementError>> {
  const { movimientoRepository, prendaRepository } = deps;

  const prenda = await prendaRepository.findById(input.prendaId);
  if (!prenda) {
    return {
      success: false,
      error: new MovementError("Prenda no encontrada"),
    };
  }

  if (!canAssignPrenda(prenda.estado)) {
    return {
      success: false,
      error: new MovementError(
        `La prenda no está disponible. Estado actual: "${prenda.estado}". Bailarín actual: ${prenda.bailarinActualId ?? "ninguno"}`,
      ),
    };
  }

  const movimientoDTO: CreateMovimientoDTO = {
    prendaId: input.prendaId,
    bailarinId: input.bailarinId,
    bailarinDestinoId: null,
    tipo: input.tipo as TipoMovimiento,
    fechaInicio: new Date(),
    fechaDevolucionEsperada: input.fechaDevolucionEsperada ?? null,
    devuelta: false,
    registradoPor: input.registradoPor,
    observacion: input.observacion ?? null,
    estadoResultante: "Prestada",
  };

  const movimiento = await movimientoRepository.create(movimientoDTO);

  return { success: true, data: movimiento };
}
