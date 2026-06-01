import type { Result } from "@/shared/types";
import type { FichaBailarin } from "../../domain/entities";
import type { BailarinRepository } from "@/modules/bailarines/domain/ports";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";

export interface GenerarFichaBailarinDeps {
  bailarinRepository: BailarinRepository;
  prendaRepository: PrendaRepository;
}

/**
 * Caso de uso: Generar ficha de un bailarín.
 * Incluye nombre, tallas y vestuario asignado por cuadro.
 */
export async function generarFichaBailarin(
  deps: GenerarFichaBailarinDeps,
  bailarinId: string,
): Promise<Result<FichaBailarin, string>> {
  try {
    const bailarin = await deps.bailarinRepository.findById(bailarinId);
    if (!bailarin) {
      return { success: false, error: "Bailarín no encontrado" };
    }

    // Obtener prendas asignadas al bailarín
    const prendasResult = await deps.prendaRepository.findAll(
      {},
      { page: 1, pageSize: 10000 },
    );
    const prendasAsignadas = prendasResult.data.filter(
      (p) => p.bailarinActualId === bailarinId,
    );

    // Agrupar por cuadro
    const vestuarioPorCuadro: Record<
      string,
      { nombre: string; categoria: string }[]
    > = {};

    for (const cuadroId of bailarin.cuadrosActivos) {
      vestuarioPorCuadro[cuadroId] = prendasAsignadas
        .filter((p) => p.cuadroId === cuadroId)
        .map((p) => ({ nombre: p.nombre, categoria: p.categoria }));
    }

    const ficha: FichaBailarin = {
      nombreCompleto: bailarin.nombreCompleto,
      genero: bailarin.genero,
      tallas: {
        camisa: bailarin.tallas.camisa,
        pantalon: bailarin.tallas.pantalon,
        sombrero: bailarin.tallas.sombrero,
        calzado: bailarin.tallas.calzado,
      },
      vestuarioPorCuadro,
    };

    return { success: true, data: ficha };
  } catch {
    return { success: false, error: "Error al generar ficha del bailarín" };
  }
}
