// Clases de error de dominio para BFV Wardrobe Management

/**
 * Clase base abstracta para errores de dominio.
 * Todos los errores de negocio extienden de esta clase.
 */
export abstract class DomainError extends Error {
  abstract readonly code: string;

  constructor(message: string) {
    super(message);
    this.name = this.constructor.name;
  }
}

/**
 * Error de validación de campos.
 * Contiene un mapa de campo → mensaje de error.
 */
export class ValidationError extends DomainError {
  readonly code = "VALIDATION_ERROR";

  constructor(public readonly fields: Record<string, string>) {
    super("Validation failed");
  }
}

/**
 * Error cuando una entidad no se encuentra.
 */
export class NotFoundError extends DomainError {
  readonly code = "NOT_FOUND";

  constructor(entity: string, id: string) {
    super(`${entity} ${id} not found`);
  }
}

/**
 * Error de conflicto (ej: recurso ya existe, estado inconsistente).
 */
export class ConflictError extends DomainError {
  readonly code = "CONFLICT";

  constructor(message: string) {
    super(message);
  }
}

/**
 * Error de autenticación (usuario no autenticado).
 */
export class UnauthorizedError extends DomainError {
  readonly code = "UNAUTHORIZED";

  constructor() {
    super("Authentication required");
  }
}

/**
 * Error de autorización (permisos insuficientes).
 */
export class ForbiddenError extends DomainError {
  readonly code = "FORBIDDEN";

  constructor(operation: string) {
    super(`Insufficient permissions for: ${operation}`);
  }
}

/**
 * Error cuando se alcanza el límite de secuencia (999) para una combinación género-cuadro.
 */
export class SequenceLimitError extends DomainError {
  readonly code = "SEQUENCE_LIMIT";

  constructor(genero: string, cuadro: string) {
    super(`Código limit reached for ${genero}-${cuadro}`);
  }
}

/**
 * Error al subir una imagen (formato no soportado o tamaño excedido).
 */
export class ImageUploadError extends DomainError {
  readonly code = "IMAGE_UPLOAD_ERROR";

  constructor(public readonly reason: "format" | "size") {
    super(`Image rejected: ${reason}`);
  }
}

/**
 * Error en operaciones de movimiento (asignación, préstamo, devolución, traspaso).
 */
export class MovementError extends DomainError {
  readonly code = "MOVEMENT_ERROR";

  constructor(message: string) {
    super(message);
  }
}
