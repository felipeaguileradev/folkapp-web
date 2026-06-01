import type { Result } from "@/shared/types";
import { ValidationError, SequenceLimitError } from "@/shared/types";
import {
  createPrendaSchema,
  type CreatePrendaInput,
} from "@/shared/lib/validations/prenda.schema";
import type { Prenda, CreatePrendaDTO } from "../../domain/entities";
import type { PrendaRepository } from "../../domain/ports";
import { generateCodigo } from "../services";

/** Nombre del cuadro para mapeo a código */
type CuadroName = "Huaso" | "Norte" | "Rapa Nui";

export interface CrearPrendaDeps {
  prendaRepository: PrendaRepository;
}

export interface CrearPrendaParams {
  data: CreatePrendaInput;
  cuadroName: CuadroName;
}

/**
 * Caso de uso: Crear una prenda en el inventario.
 * Valida la entrada, genera el código identificador y persiste la prenda.
 */
export async function crearPrenda(
  deps: CrearPrendaDeps,
  input: CrearPrendaParams,
): Promise<Result<Prenda, string>> {
  const { prendaRepository } = deps;
  const { data, cuadroName } = input;

  // Validar input con Zod
  const parsed = createPrendaSchema.safeParse(data);
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
    // Generar código identificador
    const codigoIdentificador = await generateCodigo(
      prendaRepository,
      parsed.data.genero,
      cuadroName,
    );

    // Construir DTO para el repositorio
    const createDTO: CreatePrendaDTO = {
      codigoIdentificador,
      nombre: parsed.data.nombre,
      cuadroId: parsed.data.cuadroId,
      genero: parsed.data.genero,
      categoria: parsed.data.categoria,
      color: parsed.data.color ?? null,
      tallaONumero: parsed.data.tallaONumero ?? null,
      identificadorFisico: parsed.data.identificadorFisico ?? null,
      propietario: parsed.data.propietario,
      ubicacion: parsed.data.ubicacion ?? null,
      estado: parsed.data.estado,
      comentarios: parsed.data.comentarios ?? null,
      fechaIngreso: parsed.data.fechaIngreso,
    };

    const prenda = await prendaRepository.create(createDTO);

    return { success: true, data: prenda };
  } catch (error) {
    if (error instanceof SequenceLimitError) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error al crear la prenda" };
  }
}
