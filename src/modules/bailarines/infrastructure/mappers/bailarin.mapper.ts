// Mapper para convertir entre filas de la DB (snake_case) y entidades del dominio (camelCase)

import {
  Bailarin,
  CreateBailarinDTO,
  UpdateBailarinDTO,
  Tallas,
} from "../../domain";
import { GeneroBailarin } from "@/shared/types";

/** Fila de la tabla bailarines en Supabase (snake_case) */
export interface BailarinRow {
  id: string;
  nombre_completo: string;
  genero: GeneroBailarin;
  cuadros_activos: string[];
  tallas: Tallas | null;
  activo: boolean;
  fecha_ingreso: string;
  notas: string | null;
  created_at: string;
  updated_at: string;
}

/** Fila para insertar en la tabla bailarines */
export interface BailarinInsertRow {
  nombre_completo: string;
  genero: GeneroBailarin;
  cuadros_activos: string[];
  tallas: Tallas;
  activo: boolean;
  fecha_ingreso: string;
  notas: string | null;
}

/** Fila parcial para actualizar en la tabla bailarines */
export type BailarinUpdateRow = Partial<BailarinInsertRow>;

const DEFAULT_TALLAS: Tallas = {
  camisa: null,
  pantalon: null,
  sombrero: null,
  calzado: null,
  personalizados: [],
};

export class BailarinMapper {
  /** Convierte una fila de la DB a una entidad del dominio */
  static toDomain(row: BailarinRow): Bailarin {
    return {
      id: row.id,
      nombreCompleto: row.nombre_completo,
      genero: row.genero,
      cuadrosActivos: row.cuadros_activos ?? [],
      tallas: row.tallas ?? DEFAULT_TALLAS,
      activo: row.activo,
      fechaIngreso: new Date(row.fecha_ingreso),
      notas: row.notas,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  }

  /** Convierte un DTO de creación a una fila para insertar en la DB */
  static toInsertRow(dto: CreateBailarinDTO): BailarinInsertRow {
    return {
      nombre_completo: dto.nombreCompleto,
      genero: dto.genero,
      cuadros_activos: dto.cuadrosActivos,
      tallas: dto.tallas,
      activo: dto.activo,
      fecha_ingreso: dto.fechaIngreso.toISOString().split("T")[0],
      notas: dto.notas,
    };
  }

  /** Convierte un DTO de actualización a una fila parcial para la DB */
  static toUpdateRow(dto: UpdateBailarinDTO): BailarinUpdateRow {
    const row: BailarinUpdateRow = {};

    if (dto.nombreCompleto !== undefined) {
      row.nombre_completo = dto.nombreCompleto;
    }
    if (dto.genero !== undefined) {
      row.genero = dto.genero;
    }
    if (dto.cuadrosActivos !== undefined) {
      row.cuadros_activos = dto.cuadrosActivos;
    }
    if (dto.tallas !== undefined) {
      row.tallas = dto.tallas;
    }
    if (dto.activo !== undefined) {
      row.activo = dto.activo;
    }
    if (dto.fechaIngreso !== undefined) {
      row.fecha_ingreso = dto.fechaIngreso.toISOString().split("T")[0];
    }
    if (dto.notas !== undefined) {
      row.notas = dto.notas;
    }

    return row;
  }
}
