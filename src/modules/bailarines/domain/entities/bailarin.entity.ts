// Entidades del dominio para el módulo de bailarines

import { GeneroBailarin } from "@/shared/types";

/** Talla personalizada definida por el usuario */
export interface TallaPersonalizada {
  nombre: string; // max 30
  valor: string; // max 30
}

/** Tallas registradas para un bailarín */
export interface Tallas {
  camisa: string | null;
  pantalon: string | null;
  sombrero: string | null;
  calzado: string | null;
  personalizados: TallaPersonalizada[]; // max 5
}

/** Entidad principal del módulo bailarines */
export interface Bailarin {
  id: string;
  nombreCompleto: string; // max 100
  genero: GeneroBailarin;
  cuadrosActivos: string[]; // 0-3 cuadro IDs
  tallas: Tallas;
  activo: boolean;
  fechaIngreso: Date;
  notas: string | null; // max 500
  createdAt: Date;
  updatedAt: Date;
}

/** DTO para crear un bailarín (sin campos auto-generados) */
export type CreateBailarinDTO = Omit<
  Bailarin,
  "id" | "createdAt" | "updatedAt"
>;

/** DTO para actualizar un bailarín (todos los campos opcionales) */
export type UpdateBailarinDTO = Partial<CreateBailarinDTO>;
