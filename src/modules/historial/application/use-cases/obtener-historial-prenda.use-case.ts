import type { Result, CursorPagination } from "@/shared/types";
import type { HistorialEntry } from "../../domain/entities";
import type { HistorialRepository } from "../../domain/ports";

const DEFAULT_LIMIT = 50;

export interface ObtenerHistorialPrendaDeps {
  historialRepository: HistorialRepository;
}

export interface ObtenerHistorialPrendaInput {
  prendaId: string;
  cursor?: string;
  limit?: number;
}

/**
 * Caso de uso: Obtener historial de una prenda con paginación por cursor.
 * Retorna las últimas 50 entradas por defecto, con opción de cargar más.
 */
export async function obtenerHistorialPrenda(
  deps: ObtenerHistorialPrendaDeps,
  input: ObtenerHistorialPrendaInput,
): Promise<Result<HistorialEntry[], string>> {
  const { historialRepository } = deps;
  const { prendaId, cursor, limit } = input;

  if (!prendaId) {
    return { success: false, error: "El ID de la prenda es requerido" };
  }

  const pagination: CursorPagination = {
    cursor,
    limit: limit ?? DEFAULT_LIMIT,
  };

  try {
    const entries = await historialRepository.findByPrenda(
      prendaId,
      pagination,
    );
    return { success: true, data: entries };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Error al obtener historial de la prenda",
    };
  }
}
