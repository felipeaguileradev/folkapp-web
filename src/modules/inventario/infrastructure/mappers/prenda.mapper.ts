import type {
  Genero,
  Categoria,
  EstadoPrenda,
  Propietario,
} from "@/shared/types";
import type {
  Prenda,
  CreatePrendaDTO,
  UpdatePrendaDTO,
} from "../../domain/entities";

/** Representación de una fila de la tabla `prendas` en Supabase (snake_case) */
export interface PrendaRow {
  id: string;
  codigo_identificador: string;
  nombre: string;
  cuadro_id: string;
  genero: string;
  categoria: string;
  color: string | null;
  talla_o_numero: string | null;
  identificador_fisico: string | null;
  bailarin_actual: string | null;
  propietario: string;
  propietario_nombre: string | null;
  ubicacion: string | null;
  estado: string;
  foto_url: string | null;
  comentarios: string | null;
  fecha_ingreso: string;
  created_at: string;
  updated_at: string;
}

/** Datos para insertar en la tabla `prendas` (sin id ni timestamps) */
export interface PrendaInsertRow {
  codigo_identificador: string;
  nombre: string;
  cuadro_id: string;
  genero: string;
  categoria: string;
  color: string | null;
  talla_o_numero: string | null;
  identificador_fisico: string | null;
  bailarin_actual: string | null;
  propietario: string;
  propietario_nombre: string | null;
  ubicacion: string | null;
  estado: string;
  comentarios: string | null;
  fecha_ingreso: string;
}

/** Datos para actualizar en la tabla `prendas` (todos opcionales) */
export interface PrendaUpdateRow {
  nombre?: string;
  cuadro_id?: string;
  genero?: string;
  categoria?: string;
  color?: string | null;
  talla_o_numero?: string | null;
  identificador_fisico?: string | null;
  bailarin_actual?: string | null;
  propietario?: string;
  propietario_nombre?: string | null;
  ubicacion?: string | null;
  estado?: string;
  foto_url?: string | null;
  comentarios?: string | null;
  fecha_ingreso?: string;
}

/**
 * Mapper que convierte entre la representación de base de datos (snake_case)
 * y la entidad de dominio (camelCase).
 */
export class PrendaMapper {
  /** Convierte una fila de la DB a la entidad de dominio */
  static toDomain(row: PrendaRow): Prenda {
    return {
      id: row.id,
      codigoIdentificador: row.codigo_identificador,
      nombre: row.nombre,
      cuadroId: row.cuadro_id,
      genero: row.genero as Genero,
      categoria: row.categoria as Categoria,
      color: row.color,
      tallaONumero: row.talla_o_numero,
      identificadorFisico: row.identificador_fisico,
      bailarinActualId: row.bailarin_actual,
      propietario: row.propietario as Propietario,
      propietarioNombre: row.propietario_nombre ?? null,
      ubicacion: row.ubicacion,
      estado: row.estado as EstadoPrenda,
      fotoUrl: row.foto_url,
      comentarios: row.comentarios,
      fechaIngreso: new Date(row.fecha_ingreso),
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /** Convierte un CreatePrendaDTO a la fila de inserción para la DB */
  static toInsertRow(dto: CreatePrendaDTO): PrendaInsertRow {
    return {
      codigo_identificador: dto.codigoIdentificador,
      nombre: dto.nombre,
      cuadro_id: dto.cuadroId,
      genero: dto.genero,
      categoria: dto.categoria,
      color: dto.color ?? null,
      talla_o_numero: dto.tallaONumero ?? null,
      identificador_fisico: dto.identificadorFisico ?? null,
      bailarin_actual: dto.bailarinActualId ?? null,
      propietario: dto.propietario,
      propietario_nombre: dto.propietarioNombre ?? null,
      ubicacion: dto.ubicacion ?? null,
      estado: dto.estado,
      comentarios: dto.comentarios ?? null,
      fecha_ingreso: dto.fechaIngreso.toISOString().split("T")[0],
    };
  }

  /** Convierte un UpdatePrendaDTO a la fila de actualización para la DB */
  static toUpdateRow(dto: UpdatePrendaDTO): PrendaUpdateRow {
    const row: PrendaUpdateRow = {};

    if (dto.nombre !== undefined) row.nombre = dto.nombre;
    if (dto.cuadroId !== undefined) row.cuadro_id = dto.cuadroId;
    if (dto.genero !== undefined) row.genero = dto.genero;
    if (dto.categoria !== undefined) row.categoria = dto.categoria;
    if (dto.color !== undefined) row.color = dto.color;
    if (dto.tallaONumero !== undefined) row.talla_o_numero = dto.tallaONumero;
    if (dto.identificadorFisico !== undefined)
      row.identificador_fisico = dto.identificadorFisico;
    if (dto.bailarinActualId !== undefined)
      row.bailarin_actual = dto.bailarinActualId;
    if (dto.propietario !== undefined) row.propietario = dto.propietario;
    if (dto.propietarioNombre !== undefined)
      row.propietario_nombre = dto.propietarioNombre;
    if (dto.ubicacion !== undefined) row.ubicacion = dto.ubicacion;
    if (dto.estado !== undefined) row.estado = dto.estado;
    if (dto.fotoUrl !== undefined) row.foto_url = dto.fotoUrl;
    if (dto.comentarios !== undefined) row.comentarios = dto.comentarios;
    if (dto.fechaIngreso !== undefined)
      row.fecha_ingreso = dto.fechaIngreso.toISOString().split("T")[0];

    return row;
  }
}
