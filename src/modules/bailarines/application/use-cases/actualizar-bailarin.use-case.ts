// Caso de uso: Actualizar un bailarín existente (incluye toggle activo/inactivo)

import { Result, NotFoundError, ValidationError } from "@/shared/types";
import { updateBailarinSchema } from "@/shared/lib/validations";
import { Bailarin, UpdateBailarinDTO, BailarinRepository } from "../../domain";

export interface ActualizarBailarinDeps {
  bailarinRepository: BailarinRepository;
}

export interface ToggleActivoInput {
  id: string;
  activo: boolean;
}

export async function actualizarBailarin(
  id: string,
  input: unknown,
  deps: ActualizarBailarinDeps,
): Promise<Result<Bailarin, string>> {
  const parsed = updateBailarinSchema.safeParse(input);

  if (!parsed.success) {
    const fields: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join(".");
      fields[path] = issue.message;
    }
    const error = new ValidationError(fields);
    return { success: false, error: error.message };
  }

  try {
    const existing = await deps.bailarinRepository.findById(id);
    if (!existing) {
      const error = new NotFoundError("Bailarín", id);
      return { success: false, error: error.message };
    }

    const data = parsed.data;
    const updateData: Record<string, unknown> = { ...data };

    // Normalizar tallas si se proporcionan
    if (data.tallas) {
      updateData.tallas = {
        camisa: data.tallas.camisa ?? null,
        pantalon: data.tallas.pantalon ?? null,
        sombrero: data.tallas.sombrero ?? null,
        calzado: data.tallas.calzado ?? null,
        personalizados: data.tallas.personalizados ?? [],
      };
    }

    const bailarin = await deps.bailarinRepository.update(
      id,
      updateData as UpdateBailarinDTO,
    );
    return { success: true, data: bailarin };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error inesperado al actualizar bailarín" };
  }
}

export async function toggleActivoBailarin(
  input: ToggleActivoInput,
  deps: ActualizarBailarinDeps,
): Promise<Result<void, string>> {
  try {
    const existing = await deps.bailarinRepository.findById(input.id);
    if (!existing) {
      const error = new NotFoundError("Bailarín", input.id);
      return { success: false, error: error.message };
    }

    await deps.bailarinRepository.setActivo(input.id, input.activo);
    return { success: true, data: undefined };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return {
      success: false,
      error: "Error inesperado al cambiar estado del bailarín",
    };
  }
}
