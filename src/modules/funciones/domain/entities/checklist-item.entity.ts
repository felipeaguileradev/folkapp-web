import type { EstadoVerificacion, Categoria } from "@/shared/types";

/** Entidad de dominio que representa un ítem del checklist de vestuario */
export interface ChecklistItem {
  id: string;
  funcionId: string;
  bailarinId: string;
  prendaNombre: string;
  prendaCategoria: Categoria;
  estado: EstadoVerificacion;
  verificadoPor: string | null;
  fechaVerificacion: Date | null;
  createdAt: Date;
}

/** DTO para crear un ítem del checklist (generado automáticamente) */
export interface CreateChecklistItemDTO {
  funcionId: string;
  bailarinId: string;
  prendaNombre: string;
  prendaCategoria: Categoria;
}
