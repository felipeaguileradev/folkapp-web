import type { TipoEvento } from "@/shared/types";

/** Entidad de dominio que representa una entrada inmutable en el historial */
export interface HistorialEntry {
  id: string;
  fecha: Date; // timestamp del evento
  tipoEvento: TipoEvento;
  prendaId: string | null;
  personaInvolucrada: string | null; // bailarín ID
  descripcion: string | null; // max 500
  usuarioQueRegistro: string;
  createdAt: Date;
}

/** DTO para crear una entrada de historial (sin id ni createdAt) */
export type CreateHistorialDTO = Omit<HistorialEntry, "id" | "createdAt">;
