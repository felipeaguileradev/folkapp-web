import type { Result } from "@/shared/types";
import { ValidationError, NotFoundError } from "@/shared/types";
import {
  updatePrendaSchema,
  type UpdatePrendaInput,
} from "@/shared/lib/validations/prenda.schema";
import type { Prenda } from "../../domain/entities";
import type { PrendaRepository } from "../../domain/ports";

export interface ActualizarPrendaDeps {
  prendaRepository: PrendaRepository;
}

export interface ActualizarPrendaParams {
  id: string;
  data: UpdatePrendaInput;
}

/**
 * Caso de uso: Actualizar una prenda existente.
 * Valida la entrada parcial y persiste los cambios.
 */
export async function actualizarPrenda(
  deps: ActualizarPrendaDeps,
  input: ActualizarPrendaParams,
): Promise<Result<Prenda, string>> {
  const { prendaRepository } = deps;
  const { id, data } = input;

  // Validar input con Zod (esquema parcial)
  const parsed = updatePrendaSchema.safeParse(data);
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

  try {
    // Verificar que la prenda existe
    const existing = await prendaRepository.findById(id);
    if (!existing) {
      return {
        success: false,
        error: new NotFoundError("Prenda", id).message,
      };
    }

    const prenda = await prendaRepository.update(id, parsed.data);
    return { success: true, data: prenda };
  } catch {
    return { success: false, error: "Error al actualizar la prenda" };
  }
}
