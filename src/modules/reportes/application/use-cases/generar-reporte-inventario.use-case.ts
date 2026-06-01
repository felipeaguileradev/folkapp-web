import type { Result } from "@/shared/types";
import type {
  ReporteInventarioFilters,
  ReporteInventarioItem,
} from "../../domain/entities";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";

export interface GenerarReporteInventarioDeps {
  prendaRepository: PrendaRepository;
}

/**
 * Caso de uso: Generar reporte de inventario con filtros.
 * Retorna una lista de prendas con sus datos principales para exportar.
 */
export async function generarReporteInventario(
  deps: GenerarReporteInventarioDeps,
  filters: ReporteInventarioFilters,
): Promise<Result<ReporteInventarioItem[], string>> {
  try {
    const result = await deps.prendaRepository.findAll(
      {
        cuadroId: filters.cuadroId,
        genero: filters.genero,
        estado: filters.estado,
      },
      { page: 1, pageSize: 10000 },
    );

    const items: ReporteInventarioItem[] = result.data.map((prenda) => ({
      codigoIdentificador: prenda.codigoIdentificador,
      nombre: prenda.nombre,
      cuadroNombre: prenda.cuadroId, // En producción se resolvería el nombre
      genero: prenda.genero,
      categoria: prenda.categoria,
      estado: prenda.estado,
      propietario: prenda.propietario,
      bailarinNombre: prenda.bailarinActualId, // En producción se resolvería el nombre
      ubicacion: prenda.ubicacion,
    }));

    // Filtrar por bailarín si se especifica
    const filtered = filters.bailarinId
      ? items.filter((i) => i.bailarinNombre === filters.bailarinId)
      : items;

    return { success: true, data: filtered };
  } catch {
    return { success: false, error: "Error al generar reporte de inventario" };
  }
}
