import type { Prioridad } from "@/shared/types";
import type {
  Alerta,
  CreateAlertaDTO,
  TipoCondicion,
  EntidadTipo,
} from "../../domain/entities";

/** Representación de una fila de la tabla `alertas` en Supabase (snake_case) */
export interface AlertaRow {
  id: string;
  tipo_condicion: string;
  prioridad: string;
  entidad_id: string;
  entidad_tipo: string;
  descripcion: string;
  resuelta: boolean;
  fecha_generacion: string;
  fecha_resolucion: string | null;
  resuelta_por: string | null;
  created_at: string;
}

/** Datos para insertar en la tabla `alertas` */
export interface AlertaInsertRow {
  tipo_condicion: string;
  prioridad: string;
  entidad_id: string;
  entidad_tipo: string;
  descripcion: string;
}

/**
 * Mapper que convierte entre la representación de base de datos (snake_case)
 * y la entidad de dominio (camelCase) para alertas.
 */
export const AlertaMapper = {
  /** Convierte una fila de la DB a la entidad de dominio */
  toDomain(row: AlertaRow): Alerta {
    return {
      id: row.id,
      tipoCondicion: row.tipo_condicion as TipoCondicion,
      prioridad: row.prioridad as Prioridad,
      entidadId: row.entidad_id,
      entidadTipo: row.entidad_tipo as EntidadTipo,
      descripcion: row.descripcion,
      resuelta: row.resuelta,
      fechaGeneracion: new Date(row.fecha_generacion),
      fechaResolucion: row.fecha_resolucion
        ? new Date(row.fecha_resolucion)
        : null,
      resueltaPor: row.resuelta_por,
      createdAt: new Date(row.created_at),
    };
  },

  /** Convierte un CreateAlertaDTO a la fila de inserción para la DB */
  toInsertRow(dto: CreateAlertaDTO): AlertaInsertRow {
    return {
      tipo_condicion: dto.tipoCondicion,
      prioridad: dto.prioridad,
      entidad_id: dto.entidadId,
      entidad_tipo: dto.entidadTipo,
      descripcion: dto.descripcion,
    };
  },
};
