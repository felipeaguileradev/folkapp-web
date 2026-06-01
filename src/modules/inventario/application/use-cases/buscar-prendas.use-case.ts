import type { Result } from "@/shared/types";
import type { Prenda } from "../../domain/entities";
import type { PrendaRepository, PrendaFilters } from "../../domain/ports";

const MIN_QUERY_LENGTH = 2;

export interface BuscarPrendasDeps {
  prendaRepository: PrendaRepository;
}

export interface BuscarPrendasParams {
  query: string;
  filters?: PrendaFilters;
}

/**
 * Caso de uso: Buscar prendas por nombre, código o nombre de bailarín.
 * Requiere un mínimo de 2 caracteres en la consulta.
 */
export async function buscarPrendas(
  deps: BuscarPrendasDeps,
  input: BuscarPrendasParams,
): Promise<Result<Prenda[], string>> {
  const { prendaRepository } = deps;
  const { query, filters = {} } = input;

  if (query.length < MIN_QUERY_LENGTH) {
    return {
      success: false,
      error: `La búsqueda requiere al menos ${MIN_QUERY_LENGTH} caracteres`,
    };
  }

  try {
    const results = await prendaRepository.search(query, filters);
    return { success: true, data: results };
  } catch {
    return { success: false, error: "Error al buscar prendas" };
  }
}
