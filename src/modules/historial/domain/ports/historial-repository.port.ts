import type { CursorPagination } from "@/shared/types";
import type { HistorialEntry, CreateHistorialDTO } from "../entities";

/**
 * Puerto del repositorio de historial (contrato para la capa de infraestructura).
 * El historial es inmutable: solo se permite crear y consultar entradas.
 */
export interface HistorialRepository {
  findByPrenda(
    prendaId: string,
    pagination: CursorPagination,
  ): Promise<HistorialEntry[]>;
  findByBailarin(
    bailarinId: string,
    pagination: CursorPagination,
  ): Promise<HistorialEntry[]>;
  create(entry: CreateHistorialDTO): Promise<HistorialEntry>;
}
