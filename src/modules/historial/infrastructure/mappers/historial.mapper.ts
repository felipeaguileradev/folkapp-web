import type { TipoEvento } from "@/shared/types";
import type { HistorialEntry, CreateHistorialDTO } from "../../domain/entities";

/** Representación de una fila de la tabla `historial` en Supabase (snake_case) */
export interface HistorialRow {
  id: string;
  fecha: string;
  tipo_evento: string;
  prenda_id: string | null;
  persona_involucrada: string | null;
  descripcion: string | null;
  usuario_que_registro: string;
  created_at: string;
}

/** Datos para insertar en la tabla `historial` (sin id ni created_at) */
export interface HistorialInsertRow {
  fecha: string;
  tipo_evento: string;
  prenda_id: string | null;
  persona_involucrada: string | null;
  descripcion: string | null;
  usuario_que_registro: string;
}

/**
 * Mapper que convierte entre la representación de base de datos (snake_case)
 * y la entidad de dominio (camelCase) para el historial.
 */
export const HistorialMapper = {
  /** Convierte una fila de la DB a la entidad de dominio */
  toDomain(row: HistorialRow): HistorialEntry {
    return {
      id: row.id,
      fecha: new Date(row.fecha),
      tipoEvento: row.tipo_evento as TipoEvento,
      prendaId: row.prenda_id,
      personaInvolucrada: row.persona_involucrada,
      descripcion: row.descripcion,
      usuarioQueRegistro: row.usuario_que_registro,
      createdAt: new Date(row.created_at),
    };
  },

  /** Convierte un CreateHistorialDTO a la fila de inserción para la DB */
  toInsertRow(dto: CreateHistorialDTO): HistorialInsertRow {
    return {
      fecha: dto.fecha.toISOString(),
      tipo_evento: dto.tipoEvento,
      prenda_id: dto.prendaId ?? null,
      persona_involucrada: dto.personaInvolucrada ?? null,
      descripcion: dto.descripcion ?? null,
      usuario_que_registro: dto.usuarioQueRegistro,
    };
  },
};
