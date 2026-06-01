import type { Result } from "@/shared/types";
import type { ListaComprasItem } from "../../domain/entities";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";

export interface GenerarListaComprasDeps {
  prendaRepository: PrendaRepository;
}

/**
 * Caso de uso: Generar lista de compras.
 * Filtra prendas con estado "Faltante" y las agrupa por cuadro.
 */
export async function generarListaCompras(
  deps: GenerarListaComprasDeps,
): Promise<Result<ListaComprasItem[], string>> {
  try {
    const result = await deps.prendaRepository.findAll(
      { estado: "Faltante" },
      { page: 1, pageSize: 10000 },
    );

    // Agrupar por cuadro + categoría + nombre + género
    const grouped = new Map<string, ListaComprasItem>();

    for (const prenda of result.data) {
      const key = `${prenda.cuadroId}|${prenda.categoria}|${prenda.nombre}|${prenda.genero}`;

      if (grouped.has(key)) {
        const existing = grouped.get(key)!;
        existing.cantidad++;
      } else {
        grouped.set(key, {
          cuadroNombre: prenda.cuadroId, // En producción se resolvería el nombre
          categoria: prenda.categoria,
          nombre: prenda.nombre,
          genero: prenda.genero,
          cantidad: 1,
        });
      }
    }

    const items = Array.from(grouped.values()).sort((a, b) =>
      a.cuadroNombre.localeCompare(b.cuadroNombre),
    );

    return { success: true, data: items };
  } catch {
    return { success: false, error: "Error al generar lista de compras" };
  }
}
