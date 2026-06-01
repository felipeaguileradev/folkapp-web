import type { Result } from "@/shared/types";
import { NotFoundError } from "@/shared/types";
import type { Prenda } from "../../domain/entities";
import type { PrendaRepository } from "../../domain/ports";

export interface ObtenerPrendaDeps {
  prendaRepository: PrendaRepository;
}

export interface ObtenerPrendaParams {
  id: string;
}

/**
 * Caso de uso: Obtener una prenda por su ID.
 * Retorna NotFoundError si la prenda no existe.
 */
export async function obtenerPrenda(
  deps: ObtenerPrendaDeps,
  input: ObtenerPrendaParams,
): Promise<Result<Prenda, string>> {
  const { prendaRepository } = deps;
  const { id } = input;

  try {
    const prenda = await prendaRepository.findById(id);
    if (!prenda) {
      return {
        success: false,
        error: new NotFoundError("Prenda", id).message,
      };
    }

    return { success: true, data: prenda };
  } catch {
    return { success: false, error: "Error al obtener la prenda" };
  }
}
