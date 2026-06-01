import type { Result } from "@/shared/types";
import type { ResultadoChecklist } from "../../domain/entities";
import type {
  FuncionRepository,
  ChecklistRepository,
} from "../../domain/ports";

export interface FinalizarFuncionDeps {
  funcionRepository: FuncionRepository;
  checklistRepository: ChecklistRepository;
}

export interface FinalizarFuncionInput {
  funcionId: string;
}

/**
 * Caso de uso: Finalizar una función.
 * Calcula el resumen del checklist y guarda el resultado.
 * Cambia el estado de la función a "Finalizada".
 */
export async function finalizarFuncion(
  deps: FinalizarFuncionDeps,
  input: FinalizarFuncionInput,
): Promise<Result<ResultadoChecklist, string>> {
  const { funcionRepository, checklistRepository } = deps;

  try {
    const funcion = await funcionRepository.findById(input.funcionId);
    if (!funcion) {
      return { success: false, error: "Función no encontrada" };
    }

    if (funcion.estado === "Finalizada") {
      return { success: false, error: "La función ya está finalizada" };
    }

    // Obtener todos los ítems del checklist
    const items = await checklistRepository.findByFuncion(input.funcionId);

    // Calcular resumen
    const resultado: ResultadoChecklist = {
      totalItems: items.length,
      verificados: items.filter((i) => i.estado === "verificado").length,
      faltantes: items.filter((i) => i.estado === "faltante").length,
      pendientes: items.filter((i) => i.estado === "pendiente").length,
    };

    // Guardar resultado y cambiar estado
    await funcionRepository.saveResultado(input.funcionId, resultado);
    await funcionRepository.updateEstado(input.funcionId, "Finalizada");

    return { success: true, data: resultado };
  } catch {
    return { success: false, error: "Error al finalizar la función" };
  }
}
