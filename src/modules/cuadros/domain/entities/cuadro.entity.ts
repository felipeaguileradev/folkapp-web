/** Entidad de dominio que representa un cuadro de baile */
export interface Cuadro {
  id: string;
  nombre: string; // max 50
  zonaGeografica: string; // max 100
  descripcion: string | null; // max 500
  colorUi: string; // required, hex color
  createdAt: Date;
}

/** DTO para crear un cuadro (sin id ni timestamps) */
export interface CreateCuadroDTO {
  nombre: string;
  zonaGeografica: string;
  descripcion?: string | null;
  colorUi: string;
}

/** DTO para actualizar un cuadro (todos los campos opcionales) */
export interface UpdateCuadroDTO {
  nombre?: string;
  zonaGeografica?: string;
  descripcion?: string | null;
  colorUi?: string;
}
