import type { Result } from "@/shared/types";
import { NotFoundError } from "@/shared/types";
import type { CuadroRepository } from "../../domain/ports";

export interface EliminarCuadroDeps {
  cuadroRepository: CuadroRepository;
}

/**
 * Caso de uso: Eliminar un cuadro por su ID.
 * Verifica que el cuadro exista antes de eliminarlo.
 */
export async function eliminarCuadro(
  deps: EliminarCuadroDeps,
  id: string,
): Promise<Result<void, string>> {
  const { cuadroRepository } = deps;

  try {
    const existing = await cuadroRepository.findById(id);
    if (!existing) {
      return { success: false, error: new NotFoundError("Cuadro", id).message };
    }

    await cuadroRepository.delete(id);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al eliminar el cuadro" };
  }
}
