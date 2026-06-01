import type { Result } from "@/shared/types";
import type { HistorialEntry, CreateHistorialDTO } from "../../domain/entities";
import type { HistorialRepository } from "../../domain/ports";

export interface CrearHistorialDeps {
  historialRepository: HistorialRepository;
}

/**
 * Caso de uso: Crear una entrada en el historial.
 * Solo debe invocarse después de una acción exitosa (el llamador garantiza esto).
 * No se crean entradas para acciones fallidas.
 */
export async function crearHistorial(
  deps: CrearHistorialDeps,
  input: CreateHistorialDTO,
): Promise<Result<HistorialEntry, string>> {
  const { historialRepository } = deps;

  if (!input.tipoEvento) {
    return { success: false, error: "El tipo de evento es requerido" };
  }

  if (!input.usuarioQueRegistro) {
    return { success: false, error: "El usuario que registra es requerido" };
  }

  if (input.descripcion && input.descripcion.length > 500) {
    return {
      success: false,
      error: "La descripción no puede superar los 500 caracteres",
    };
  }

  try {
    const entry = await historialRepository.create(input);
    return { success: true, data: entry };
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message };
    }
    return { success: false, error: "Error al crear entrada de historial" };
  }
}
