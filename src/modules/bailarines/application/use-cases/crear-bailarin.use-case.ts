// Caso de uso: Crear un nuevo bailarín

import { Result, ValidationError } from "@/shared/types";
import { createBailarinSchema } from "@/shared/lib/validations";
import { Bailarin, BailarinRepository } from "../../domain";

export interface CrearBailarinDeps {
  bailarinRepository: BailarinRepository;
}

export async function crearBailarin(
  input: unknown,
  deps: CrearBailarinDeps,
): Promise<Result<Bailarin, string>> {
  const parsed = createBailarinSchema.safeParse(input);

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
    const data = parsed.data;
    const bailarin = await deps.bailarinRepository.create({
      nombreCompleto: data.nombreCompleto,
      genero: data.genero,
      cuadrosActivos: data.cuadrosActivos,
      tallas: {
        camisa: data.tallas.camisa ?? null,
        pantalon: data.tallas.pantalon ?? null,
        sombrero: data.tallas.sombrero ?? null,
        calzado: data.tallas.calzado ?? null,
        personalizados: data.tallas.personalizados ?? [],
      },
      activo: true,
      fechaIngreso: data.fechaIngreso,
      notas: data.notas ?? null,
    });

    return { success: true, data: bailarin };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error inesperado al crear bailarín" };
  }
}
