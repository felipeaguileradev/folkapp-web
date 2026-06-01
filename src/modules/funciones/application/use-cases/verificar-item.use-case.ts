import type { Result } from "@/shared/types";
import type { ChecklistRepository } from "../../domain/ports";

export interface VerificarItemDeps {
  checklistRepository: ChecklistRepository;
}

export interface VerificarItemInput {
  itemId: string;
  verificadoPor: string;
}

/**
 * Caso de uso: Verificar un ítem del checklist.
 * Marca el ítem como "verificado" con el usuario y timestamp actual.
 */
export async function verificarItem(
  deps: VerificarItemDeps,
  input: VerificarItemInput,
): Promise<Result<void, string>> {
  try {
    await deps.checklistRepository.updateEstado(
      input.itemId,
      "verificado",
      input.verificadoPor,
    );
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al verificar el ítem" };
  }
}
