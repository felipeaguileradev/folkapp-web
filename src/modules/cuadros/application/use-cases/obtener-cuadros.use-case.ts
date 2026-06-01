import type { Result } from "@/shared/types";
import { NotFoundError } from "@/shared/types";
import type { Cuadro } from "../../domain/entities";
import type { CuadroRepository } from "../../domain/ports";

export interface ObtenerCuadrosDeps {
  cuadroRepository: CuadroRepository;
}

/**
 * Caso de uso: Obtener todos los cuadros.
 */
export async function obtenerCuadros(
  deps: ObtenerCuadrosDeps,
): Promise<Result<Cuadro[], string>> {
  const { cuadroRepository } = deps;

  try {
    const cuadros = await cuadroRepository.findAll();
    return { success: true, data: cuadros };
  } catch {
    return { success: false, error: "Error al obtener los cuadros" };
  }
}

/**
 * Caso de uso: Obtener un cuadro por su ID.
 */
export async function obtenerCuadroPorId(
  deps: ObtenerCuadrosDeps,
  id: string,
): Promise<Result<Cuadro, string>> {
  const { cuadroRepository } = deps;

  try {
    const cuadro = await cuadroRepository.findById(id);
    if (!cuadro) {
      return { success: false, error: new NotFoundError("Cuadro", id).message };
    }
    return { success: true, data: cuadro };
  } catch {
    return { success: false, error: "Error al obtener el cuadro" };
  }
}
