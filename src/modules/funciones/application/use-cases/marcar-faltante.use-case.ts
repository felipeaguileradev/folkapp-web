import type { Result } from "@/shared/types";
import type { ChecklistRepository } from "../../domain/ports";

export interface MarcarFaltanteDeps {
  checklistRepository: ChecklistRepository;
}

export interface MarcarFaltanteInput {
  itemId: string;
  verificadoPor: string;
}

/**
 * Caso de uso: Marcar un ítem del checklist como faltante.
 * Indica que la prenda no está disponible para la función.
 */
export async function marcarFaltante(
  deps: MarcarFaltanteDeps,
  input: MarcarFaltanteInput,
): Promise<Result<void, string>> {
  try {
    await deps.checklistRepository.updateEstado(
      input.itemId,
      "faltante",
      input.verificadoPor,
    );
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al marcar como faltante" };
  }
}
