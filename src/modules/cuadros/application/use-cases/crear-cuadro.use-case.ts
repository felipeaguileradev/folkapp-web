import type { Result } from "@/shared/types";
import { ValidationError } from "@/shared/types";
import {
  createCuadroSchema,
  type CreateCuadroInput,
} from "@/shared/lib/validations/cuadro.schema";
import type { Cuadro } from "../../domain/entities";
import type { CuadroRepository } from "../../domain/ports";

export interface CrearCuadroDeps {
  cuadroRepository: CuadroRepository;
}

/**
 * Caso de uso: Crear un cuadro de baile.
 * Valida la entrada (nombre max 50, zona max 100, colorUi required) y persiste.
 */
export async function crearCuadro(
  deps: CrearCuadroDeps,
  input: CreateCuadroInput,
): Promise<Result<Cuadro, string>> {
  const { cuadroRepository } = deps;

  const parsed = createCuadroSchema.safeParse(input);
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
    const cuadro = await cuadroRepository.create({
      nombre: parsed.data.nombre,
      zonaGeografica: parsed.data.zonaGeografica,
      descripcion: parsed.data.descripcion ?? null,
      colorUi: parsed.data.colorUi,
    });

    return { success: true, data: cuadro };
  } catch {
    return { success: false, error: "Error al crear el cuadro" };
  }
}
