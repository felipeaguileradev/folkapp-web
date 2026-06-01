import type { Result } from "@/shared/types";
import { NotFoundError, ValidationError } from "@/shared/types";
import {
  updateCuadroSchema,
  type UpdateCuadroInput,
} from "@/shared/lib/validations/cuadro.schema";
import type { Cuadro } from "../../domain/entities";
import type { CuadroRepository } from "../../domain/ports";

export interface ActualizarCuadroDeps {
  cuadroRepository: CuadroRepository;
}

export interface ActualizarCuadroInput {
  id: string;
  data: UpdateCuadroInput;
}

/**
 * Caso de uso: Actualizar un cuadro existente.
 * Valida la entrada parcial y actualiza en el repositorio.
 */
export async function actualizarCuadro(
  deps: ActualizarCuadroDeps,
  input: ActualizarCuadroInput,
): Promise<Result<Cuadro, string>> {
  const { cuadroRepository } = deps;
  const { id, data } = input;

  const parsed = updateCuadroSchema.safeParse(data);
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
    const existing = await cuadroRepository.findById(id);
    if (!existing) {
      return { success: false, error: new NotFoundError("Cuadro", id).message };
    }

    const cuadro = await cuadroRepository.update(id, parsed.data);
    return { success: true, data: cuadro };
  } catch {
    return { success: false, error: "Error al actualizar el cuadro" };
  }
}
