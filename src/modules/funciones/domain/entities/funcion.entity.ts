import type { EstadoFuncion } from "@/shared/types";

/** Resumen del resultado del checklist de una función */
export interface ResultadoChecklist {
  totalItems: number;
  verificados: number;
  faltantes: number;
  pendientes: number;
}

/** Entidad de dominio que representa una función/evento del ballet */
export interface Funcion {
  id: string;
  nombre: string; // max 100
  fecha: Date;
  lugar: string | null; // max 200
  estado: EstadoFuncion;
  cuadrosQueSePresenten: string[]; // cuadro IDs
  bailarinesConvocados: string[]; // bailarin IDs
  resultadoChecklist: ResultadoChecklist | null;
  createdAt: Date;
  updatedAt: Date;
}

/** DTO para crear una función (sin id ni timestamps) */
export interface CreateFuncionDTO {
  nombre: string;
  fecha: Date;
  lugar: string | null;
  cuadrosQueSePresenten: string[];
  bailarinesConvocados: string[];
}
