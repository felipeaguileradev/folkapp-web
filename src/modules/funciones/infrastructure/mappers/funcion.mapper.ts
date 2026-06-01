import type { EstadoFuncion } from "@/shared/types";
import type {
  Funcion,
  CreateFuncionDTO,
  ResultadoChecklist,
} from "../../domain/entities";

/** Representación de una fila de la tabla `funciones` en Supabase */
export interface FuncionRow {
  id: string;
  nombre: string;
  fecha: string;
  lugar: string | null;
  estado: string;
  cuadros_que_se_presenten: string[];
  bailarines_convocados: string[];
  resultado_checklist: ResultadoChecklist | null;
  created_at: string;
  updated_at: string;
}

/** Datos para insertar en la tabla `funciones` */
export interface FuncionInsertRow {
  nombre: string;
  fecha: string;
  lugar: string | null;
  cuadros_que_se_presenten: string[];
  bailarines_convocados: string[];
}

export const FuncionMapper = {
  toDomain(row: FuncionRow): Funcion {
    return {
      id: row.id,
      nombre: row.nombre,
      fecha: new Date(row.fecha),
      lugar: row.lugar,
      estado: row.estado as EstadoFuncion,
      cuadrosQueSePresenten: row.cuadros_que_se_presenten ?? [],
      bailarinesConvocados: row.bailarines_convocados ?? [],
      resultadoChecklist: row.resultado_checklist,
      createdAt: new Date(row.created_at),
      updatedAt: new Date(row.updated_at),
    };
  },

  toInsertRow(dto: CreateFuncionDTO): FuncionInsertRow {
    return {
      nombre: dto.nombre,
      fecha: dto.fecha.toISOString().split("T")[0],
      lugar: dto.lugar,
      cuadros_que_se_presenten: dto.cuadrosQueSePresenten,
      bailarines_convocados: dto.bailarinesConvocados,
    };
  },
};
