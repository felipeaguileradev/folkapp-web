import type { Result, GeneroBailarin } from "@/shared/types";
import type { PlantillaRepository } from "../../domain/ports";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";

/** Resultado de completitud para un bailarín en un cuadro */
export interface CompletitudResult {
  bailarinId: string;
  cuadroId: string;
  genero: GeneroBailarin;
  totalPlantilla: number;
  prendasAsignadas: number;
  porcentaje: number | "Sin plantilla definida";
}

export interface CalcularCompletitudDeps {
  plantillaRepository: PlantillaRepository;
  prendaRepository: PrendaRepository;
}

export interface CalcularCompletitudInput {
  bailarinId: string;
  cuadroId: string;
  genero: GeneroBailarin;
}

/**
 * Caso de uso: Calcular la completitud de vestuario de un bailarín en un cuadro.
 * Compara las prendas asignadas al bailarín vs los ítems de la plantilla.
 * Matching: categoría + nombre de prenda.
 * Si la plantilla tiene 0 ítems → retorna "Sin plantilla definida".
 */
export async function calcularCompletitud(
  deps: CalcularCompletitudDeps,
  input: CalcularCompletitudInput,
): Promise<Result<CompletitudResult, string>> {
  const { plantillaRepository, prendaRepository } = deps;
  const { bailarinId, cuadroId, genero } = input;

  try {
    // Obtener ítems de la plantilla para este cuadro-género
    const plantillaItems = await plantillaRepository.findByCuadroYGenero(
      cuadroId,
      genero,
    );

    // Si no hay plantilla definida, retornar valor especial
    if (plantillaItems.length === 0) {
      return {
        success: true,
        data: {
          bailarinId,
          cuadroId,
          genero,
          totalPlantilla: 0,
          prendasAsignadas: 0,
          porcentaje: "Sin plantilla definida",
        },
      };
    }

    // Obtener prendas asignadas al bailarín en este cuadro
    const prendasBailarin = await prendaRepository.findAll(
      { cuadroId },
      { page: 1, pageSize: 1000 },
    );

    // Filtrar solo las prendas asignadas a este bailarín
    const prendasAsignadas = prendasBailarin.data.filter(
      (prenda) => prenda.bailarinActualId === bailarinId,
    );

    // Contar cuántas prendas asignadas coinciden con ítems de la plantilla
    // Matching por categoría + nombre de prenda
    let matchCount = 0;
    const plantillaUsada = new Set<string>();

    for (const prenda of prendasAsignadas) {
      for (const item of plantillaItems) {
        const itemKey = `${item.categoria}:${item.nombrePrenda}`;
        if (
          prenda.categoria === item.categoria &&
          prenda.nombre === item.nombrePrenda &&
          !plantillaUsada.has(itemKey)
        ) {
          matchCount++;
          plantillaUsada.add(itemKey);
          break;
        }
      }
    }

    const porcentaje = Math.floor((matchCount / plantillaItems.length) * 100);

    return {
      success: true,
      data: {
        bailarinId,
        cuadroId,
        genero,
        totalPlantilla: plantillaItems.length,
        prendasAsignadas: matchCount,
        porcentaje,
      },
    };
  } catch {
    return { success: false, error: "Error al calcular la completitud" };
  }
}
