import type { Result, GeneroBailarin } from "@/shared/types";
import type {
  Funcion,
  CreateFuncionDTO,
  CreateChecklistItemDTO,
  ChecklistItem,
} from "../../domain/entities";
import type {
  FuncionRepository,
  ChecklistRepository,
} from "../../domain/ports";

/** Puerto para obtener plantilla de vestuario */
export interface PlantillaPort {
  findByCuadroYGenero(
    cuadroId: string,
    genero: GeneroBailarin,
  ): Promise<{ categoria: string; nombrePrenda: string }[]>;
}

/** Puerto para obtener datos del bailarín */
export interface BailarinPort {
  findById(id: string): Promise<{
    id: string;
    genero: GeneroBailarin;
    cuadrosActivos: string[];
  } | null>;
}

export interface CrearFuncionDeps {
  funcionRepository: FuncionRepository;
  checklistRepository: ChecklistRepository;
  plantillaRepository: PlantillaPort;
  bailarinRepository: BailarinPort;
}

export interface CrearFuncionInput {
  nombre: string;
  fecha: Date;
  lugar: string | null;
  cuadrosQueSePresenten: string[];
  bailarinesConvocados: string[];
}

export interface CrearFuncionResult {
  funcion: Funcion;
  checklistItems: ChecklistItem[];
}

/**
 * Caso de uso: Crear una función con generación automática de checklist.
 *
 * Para cada bailarín convocado, genera ítems de checklist basados en la
 * plantilla de vestuario de los cuadros que se presentan y el género del bailarín.
 */
export async function crearFuncion(
  deps: CrearFuncionDeps,
  input: CrearFuncionInput,
): Promise<Result<CrearFuncionResult, string>> {
  const {
    funcionRepository,
    checklistRepository,
    plantillaRepository,
    bailarinRepository,
  } = deps;

  try {
    // Validaciones básicas
    if (!input.nombre.trim()) {
      return { success: false, error: "El nombre es obligatorio" };
    }
    if (input.cuadrosQueSePresenten.length === 0) {
      return {
        success: false,
        error: "Debe seleccionar al menos un cuadro",
      };
    }
    if (input.bailarinesConvocados.length === 0) {
      return {
        success: false,
        error: "Debe convocar al menos un bailarín",
      };
    }

    // Crear la función
    const funcionDTO: CreateFuncionDTO = {
      nombre: input.nombre.trim(),
      fecha: input.fecha,
      lugar: input.lugar,
      cuadrosQueSePresenten: input.cuadrosQueSePresenten,
      bailarinesConvocados: input.bailarinesConvocados,
    };

    const funcion = await funcionRepository.create(funcionDTO);

    // Generar checklist automáticamente: bailarín x plantilla items
    const checklistDTOs: CreateChecklistItemDTO[] = [];

    for (const bailarinId of input.bailarinesConvocados) {
      const bailarin = await bailarinRepository.findById(bailarinId);
      if (!bailarin) continue;

      // Para cada cuadro que se presenta y en el que participa el bailarín
      for (const cuadroId of input.cuadrosQueSePresenten) {
        if (!bailarin.cuadrosActivos.includes(cuadroId)) continue;

        const plantillaItems = await plantillaRepository.findByCuadroYGenero(
          cuadroId,
          bailarin.genero,
        );

        for (const item of plantillaItems) {
          checklistDTOs.push({
            funcionId: funcion.id,
            bailarinId,
            prendaNombre: item.nombrePrenda,
            prendaCategoria:
              item.categoria as CreateChecklistItemDTO["prendaCategoria"],
          });
        }
      }
    }

    const checklistItems =
      checklistDTOs.length > 0
        ? await checklistRepository.createMany(checklistDTOs)
        : [];

    return {
      success: true,
      data: { funcion, checklistItems },
    };
  } catch {
    return { success: false, error: "Error al crear la función" };
  }
}
