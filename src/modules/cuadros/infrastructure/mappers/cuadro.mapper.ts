import type {
  Cuadro,
  CreateCuadroDTO,
  UpdateCuadroDTO,
} from "../../domain/entities";

/** Fila de la tabla `cuadros` en Supabase */
export interface CuadroRow {
  id: string;
  nombre: string;
  zona_geografica: string;
  descripcion: string | null;
  color_ui: string;
  created_at: string;
}

/** Mapper entre la fila de Supabase y la entidad de dominio */
export const CuadroMapper = {
  toDomain(row: CuadroRow): Cuadro {
    return {
      id: row.id,
      nombre: row.nombre,
      zonaGeografica: row.zona_geografica,
      descripcion: row.descripcion,
      colorUi: row.color_ui,
      createdAt: new Date(row.created_at),
    };
  },

  toCreateRow(dto: CreateCuadroDTO): Omit<CuadroRow, "id" | "created_at"> {
    return {
      nombre: dto.nombre,
      zona_geografica: dto.zonaGeografica,
      descripcion: dto.descripcion ?? null,
      color_ui: dto.colorUi,
    };
  },

  toUpdateRow(
    dto: UpdateCuadroDTO,
  ): Partial<Omit<CuadroRow, "id" | "created_at">> {
    const row: Partial<Omit<CuadroRow, "id" | "created_at">> = {};

    if (dto.nombre !== undefined) row.nombre = dto.nombre;
    if (dto.zonaGeografica !== undefined)
      row.zona_geografica = dto.zonaGeografica;
    if (dto.descripcion !== undefined)
      row.descripcion = dto.descripcion ?? null;
    if (dto.colorUi !== undefined) row.color_ui = dto.colorUi;

    return row;
  },
};
