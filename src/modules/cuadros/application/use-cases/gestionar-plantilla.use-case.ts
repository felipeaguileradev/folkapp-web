import type { Result, GeneroBailarin } from "@/shared/types";
import { ValidationError, NotFoundError } from "@/shared/types";
import {
  createPlantillaSchema,
  type CreatePlantillaInput,
} from "@/shared/lib/validations/plantilla.schema";
import type { PlantillaItem } from "../../domain/entities";
import type { CuadroRepository, PlantillaRepository } from "../../domain/ports";

/** Máximo de ítems de plantilla por combinación cuadro-género */
const MAX_PLANTILLA_ITEMS = 30;

export interface GestionarPlantillaDeps {
  cuadroRepository: CuadroRepository;
  plantillaRepository: PlantillaRepository;
}

export interface GestionarPlantillaInput {
  cuadroId: string;
  genero: GeneroBailarin;
  items: CreatePlantillaInput[];
}

/**
 * Caso de uso: Gestionar la plantilla de vestuario de un cuadro-género.
 * Reemplaza todos los ítems de plantilla para la combinación cuadro-género.
 * Valida que no se excedan 30 ítems por cuadro-género.
 */
export async function gestionarPlantilla(
  deps: GestionarPlantillaDeps,
  input: GestionarPlantillaInput,
): Promise<Result<PlantillaItem[], string>> {
  const { cuadroRepository, plantillaRepository } = deps;
  const { cuadroId, genero, items } = input;

  // Validar que el cuadro existe
  try {
    const cuadro = await cuadroRepository.findById(cuadroId);
    if (!cuadro) {
      return {
        success: false,
        error: new NotFoundError("Cuadro", cuadroId).message,
      };
    }
  } catch {
    return { success: false, error: "Error al verificar el cuadro" };
  }

  // Validar límite de ítems
  if (items.length > MAX_PLANTILLA_ITEMS) {
    return {
      success: false,
      error: `La plantilla no puede tener más de ${MAX_PLANTILLA_ITEMS} ítems por cuadro-género`,
    };
  }

  // Validar cada ítem individualmente
  for (const item of items) {
    const parsed = createPlantillaSchema.safeParse({
      ...item,
      cuadroId,
      genero,
    });
    if (!parsed.success) {
      const fields: Record<string, string> = {};
      for (const issue of parsed.error.issues) {
        const path = issue.path.join(".");
        fields[path] = issue.message;
      }
      return {
        success: false,
        error: new ValidationError(fields).message,
      };
    }
  }

  try {
    // Construir los ítems de plantilla con IDs generados
    const plantillaItems: PlantillaItem[] = items.map((item, index) => ({
      id: crypto.randomUUID(),
      cuadroId,
      genero,
      categoria: item.categoria,
      nombrePrenda: item.nombrePrenda,
      orden: item.orden ?? index,
    }));

    // Reemplazar toda la plantilla para esta combinación cuadro-género
    await plantillaRepository.setByCuadroYGenero(
      cuadroId,
      genero,
      plantillaItems,
    );

    return { success: true, data: plantillaItems };
  } catch {
    return { success: false, error: "Error al gestionar la plantilla" };
  }
}
