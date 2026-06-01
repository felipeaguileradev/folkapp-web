// Tipo Result para manejo de errores en la capa de aplicación

/**
 * Tipo discriminado para representar el resultado de una operación.
 * Usado en casos de uso para evitar excepciones en la capa de presentación.
 */
export type Result<T, E = string> =
  | { success: true; data: T }
  | { success: false; error: E };
