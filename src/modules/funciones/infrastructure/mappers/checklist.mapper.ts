import type { EstadoVerificacion, Categoria } from "@/shared/types";
import type {
  ChecklistItem,
  CreateChecklistItemDTO,
} from "../../domain/entities";

/** Representación de una fila de la tabla `checklist_items` en Supabase */
export interface ChecklistRow {
  id: string;
  funcion_id: string;
  bailarin_id: string;
  prenda_nombre: string;
  prenda_categoria: string;
  estado: string;
  verificado_por: string | null;
  fecha_verificacion: string | null;
  created_at: string;
}

/** Datos para insertar en la tabla `checklist_items` */
export interface ChecklistInsertRow {
  funcion_id: string;
  bailarin_id: string;
  prenda_nombre: string;
  prenda_categoria: string;
}

export const ChecklistMapper = {
  toDomain(row: ChecklistRow): ChecklistItem {
    return {
      id: row.id,
      funcionId: row.funcion_id,
      bailarinId: row.bailarin_id,
      prendaNombre: row.prenda_nombre,
      prendaCategoria: row.prenda_categoria as Categoria,
      estado: row.estado as EstadoVerificacion,
      verificadoPor: row.verificado_por,
      fechaVerificacion: row.fecha_verificacion
        ? new Date(row.fecha_verificacion)
        : null,
      createdAt: new Date(row.created_at),
    };
  },

  toInsertRow(dto: CreateChecklistItemDTO): ChecklistInsertRow {
    return {
      funcion_id: dto.funcionId,
      bailarin_id: dto.bailarinId,
      prenda_nombre: dto.prendaNombre,
      prenda_categoria: dto.prendaCategoria,
    };
  },
};
