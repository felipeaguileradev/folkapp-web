import type { Prioridad } from "@/shared/types";

/** Tipos de condición que generan alertas */
export type TipoCondicion =
  | "faltante_sin_movimiento"
  | "reparacion_prolongada"
  | "prestamo_vencido"
  | "completitud_baja"
  | "sin_ubicacion"
  | "comentario_revisar";

/** Tipo de entidad referenciada por la alerta */
export type EntidadTipo = "prenda" | "bailarin";

/** Entidad de dominio que representa una alerta del sistema */
export interface Alerta {
  id: string;
  tipoCondicion: TipoCondicion;
  prioridad: Prioridad;
  entidadId: string; // prenda_id o bailarin_id
  entidadTipo: EntidadTipo;
  descripcion: string;
  resuelta: boolean;
  fechaGeneracion: Date;
  fechaResolucion: Date | null;
  resueltaPor: string | null;
  createdAt: Date;
}

/** DTO para crear una alerta (sin id ni timestamps generados por el sistema) */
export interface CreateAlertaDTO {
  tipoCondicion: TipoCondicion;
  prioridad: Prioridad;
  entidadId: string;
  entidadTipo: EntidadTipo;
  descripcion: string;
}
