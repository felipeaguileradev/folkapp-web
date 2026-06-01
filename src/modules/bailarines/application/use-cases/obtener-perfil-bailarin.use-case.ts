// Caso de uso: Obtener perfil completo de un bailarín con completitud por cuadro

import {
  Result,
  NotFoundError,
  Categoria,
  GeneroBailarin,
} from "@/shared/types";
import { Bailarin, BailarinRepository } from "../../domain";

/** Ítem de plantilla de vestuario requerido */
export interface PlantillaItem {
  id: string;
  cuadroId: string;
  genero: GeneroBailarin;
  categoria: Categoria;
  nombrePrenda: string;
  orden: number;
}

/** Prenda asignada al bailarín (vista simplificada) */
export interface PrendaAsignada {
  id: string;
  nombre: string;
  codigoIdentificador: string;
  categoria: Categoria;
  estado: string;
  cuadroId: string;
}

/** Resultado de completitud por cuadro */
export type CompletitudCuadro =
  | { tipo: "porcentaje"; valor: number; asignadas: number; total: number }
  | { tipo: "sin_plantilla" };

/** Perfil completo del bailarín con vestuario y completitud */
export interface PerfilBailarin {
  bailarin: Bailarin;
  vestuarioPorCuadro: Record<string, PrendaAsignada[]>;
  completitudPorCuadro: Record<string, CompletitudCuadro>;
}

/** Puerto para obtener plantilla de vestuario por cuadro y género */
export interface PlantillaRepositoryPort {
  findByCuadroYGenero(
    cuadroId: string,
    genero: GeneroBailarin,
  ): Promise<PlantillaItem[]>;
}

/** Puerto para obtener prendas asignadas a un bailarín */
export interface PrendaRepositoryPort {
  findByBailarinId(bailarinId: string): Promise<PrendaAsignada[]>;
}

export interface ObtenerPerfilBailarinDeps {
  bailarinRepository: BailarinRepository;
  plantillaRepository: PlantillaRepositoryPort;
  prendaRepository: PrendaRepositoryPort;
}

export async function obtenerPerfilBailarin(
  bailarinId: string,
  deps: ObtenerPerfilBailarinDeps,
): Promise<Result<PerfilBailarin, string>> {
  try {
    const bailarin = await deps.bailarinRepository.findById(bailarinId);
    if (!bailarin) {
      const error = new NotFoundError("Bailarín", bailarinId);
      return { success: false, error: error.message };
    }

    const prendas = await deps.prendaRepository.findByBailarinId(bailarinId);

    // Agrupar prendas por cuadro
    const vestuarioPorCuadro: Record<string, PrendaAsignada[]> = {};
    for (const cuadroId of bailarin.cuadrosActivos) {
      vestuarioPorCuadro[cuadroId] = prendas.filter(
        (p) => p.cuadroId === cuadroId,
      );
    }

    // Calcular completitud por cuadro
    const completitudPorCuadro: Record<string, CompletitudCuadro> = {};
    for (const cuadroId of bailarin.cuadrosActivos) {
      const plantillaItems = await deps.plantillaRepository.findByCuadroYGenero(
        cuadroId,
        bailarin.genero,
      );

      if (plantillaItems.length === 0) {
        completitudPorCuadro[cuadroId] = { tipo: "sin_plantilla" };
        continue;
      }

      const prendasDelCuadro = vestuarioPorCuadro[cuadroId] ?? [];

      // Contar prendas que coinciden con ítems de la plantilla (por categoría + nombre)
      let matchingCount = 0;
      for (const item of plantillaItems) {
        const hasMatch = prendasDelCuadro.some(
          (prenda) =>
            prenda.categoria === item.categoria &&
            prenda.nombre.toLowerCase() === item.nombrePrenda.toLowerCase(),
        );
        if (hasMatch) {
          matchingCount++;
        }
      }

      const porcentaje = Math.floor(
        (matchingCount / plantillaItems.length) * 100,
      );

      completitudPorCuadro[cuadroId] = {
        tipo: "porcentaje",
        valor: porcentaje,
        asignadas: matchingCount,
        total: plantillaItems.length,
      };
    }

    return {
      success: true,
      data: {
        bailarin,
        vestuarioPorCuadro,
        completitudPorCuadro,
      },
    };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Error inesperado al obtener perfil del bailarín",
    };
  }
}
