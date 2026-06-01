import type { GeneroBailarin, Categoria } from "@/shared/types";

/** Entidad de dominio que representa un ítem de la plantilla de vestuario */
export interface PlantillaItem {
  id: string;
  cuadroId: string;
  genero: GeneroBailarin;
  categoria: Categoria;
  nombrePrenda: string;
  orden: number;
}

/** DTO para crear/actualizar ítems de plantilla */
export interface CreatePlantillaItemDTO {
  cuadroId: string;
  genero: GeneroBailarin;
  categoria: Categoria;
  nombrePrenda: string;
  orden: number;
}
