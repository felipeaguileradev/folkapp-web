import type { Result, CursorPagination } from "@/shared/types";
import type { HistorialEntry } from "../../domain/entities";
import type { HistorialRepository } from "../../domain/ports";

const DEFAULT_LIMIT = 50;

export interface ObtenerHistorialBailarinDeps {
  historialRepository: HistorialRepository;
}

export interface ObtenerHistorialBailarinInput {
  bailarinId: string;
  cursor?: string;
  limit?: number;
}

/**
 * Caso de uso: Obtener historial de un bailarín con paginación por cursor.
 * Retorna las últimas 50 entradas por defecto, con opción de cargar más.
 */
export async function obtenerHistorialBailarin(
  deps: ObtenerHistorialBailarinDeps,
  input: ObtenerHistorialBailarinInput,
): Promise<Result<HistorialEntry[], string>> {
  const { historialRepository } = deps;
  const { bailarinId, cursor, limit } = input;

  if (!bailarinId) {
    return { success: false, error: "El ID del bailarín es requerido" };
  }

  const pagination: CursorPagination = {
    cursor,
    limit: limit ?? DEFAULT_LIMIT,
  };

  try {
    const entries = await historialRepository.findByBailarin(
      bailarinId,
      pagination,
    );
    return { success: true, data: entries };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Error al obtener historial del bailarín",
    };
  }
}
