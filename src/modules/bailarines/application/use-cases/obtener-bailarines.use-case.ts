// Caso de uso: Obtener listado de bailarines con filtros y búsqueda

import { Result, Pagination, PaginatedResult } from "@/shared/types";
import { Bailarin, BailarinFilters, BailarinRepository } from "../../domain";

export interface ObtenerBailarinesDeps {
  bailarinRepository: BailarinRepository;
}

export interface ObtenerBailarinesInput {
  filters: BailarinFilters;
  pagination: Pagination;
  searchNombre?: string;
}

export async function obtenerBailarines(
  input: ObtenerBailarinesInput,
  deps: ObtenerBailarinesDeps,
): Promise<Result<PaginatedResult<Bailarin>, string>> {
  try {
    const result = await deps.bailarinRepository.findAll(
      input.filters,
      input.pagination,
    );

    // Filtrar por nombre si se proporciona búsqueda
    if (input.searchNombre && input.searchNombre.trim().length >= 2) {
      const query = input.searchNombre.trim().toLowerCase();
      const filteredData = result.data.filter((bailarin) =>
        bailarin.nombreCompleto.toLowerCase().includes(query),
      );

      return {
        success: true,
        data: {
          ...result,
          data: filteredData,
          total: filteredData.length,
          totalPages: Math.ceil(
            filteredData.length / input.pagination.pageSize,
          ),
        },
      };
    }

    return { success: true, data: result };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error inesperado al obtener bailarines" };
  }
}
