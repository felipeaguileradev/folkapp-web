import { EstadoPrenda, TipoMovimiento } from "@/shared/types";

/** Entidad de dominio que representa un movimiento de prenda */
export interface Movimiento {
  id: string;
  prendaId: string;
  bailarinId: string;
  bailarinDestinoId: string | null; // solo traspasos
  tipo: TipoMovimiento;
  fechaInicio: Date;
  fechaDevolucionEsperada: Date | null;
  devuelta: boolean;
  registradoPor: string;
  observacion: string | null; // max 500
  estadoResultante: EstadoPrenda;
  createdAt: Date;
}

/** DTO para crear un movimiento (sin id ni createdAt generados por el sistema) */
export type CreateMovimientoDTO = Omit<Movimiento, "id" | "createdAt">;
