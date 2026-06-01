import type { Result } from "@/shared/types";
import { NotFoundError } from "@/shared/types";
import type { PrendaRepository } from "../../domain/ports";

export interface EliminarPrendaDeps {
  prendaRepository: PrendaRepository;
}

export interface EliminarPrendaParams {
  id: string;
}

/**
 * Caso de uso: Eliminar una prenda del inventario.
 * Verifica existencia antes de eliminar.
 */
export async function eliminarPrenda(
  deps: EliminarPrendaDeps,
  input: EliminarPrendaParams,
): Promise<Result<void, string>> {
  const { prendaRepository } = deps;
  const { id } = input;

  try {
    // Verificar que la prenda existe
    const existing = await prendaRepository.findById(id);
    if (!existing) {
      return {
        success: false,
        error: new NotFoundError("Prenda", id).message,
      };
    }

    await prendaRepository.delete(id);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al eliminar la prenda" };
  }
}
