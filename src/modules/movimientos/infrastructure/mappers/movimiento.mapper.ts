import type { Movimiento } from "../../domain/entities";
import type { EstadoPrenda, TipoMovimiento } from "@/shared/types";

/** Tipo que representa la fila de la tabla movimientos en Supabase */
export interface MovimientoRow {
  id: string;
  prenda_id: string;
  bailarin_id: string;
  bailarin_destino_id: string | null;
  tipo: string;
  fecha_inicio: string;
  fecha_devolucion_esperada: string | null;
  devuelta: boolean;
  registrado_por: string;
  observacion: string | null;
  estado_resultante: string;
  created_at: string;
}

/** Mapper para convertir entre DTO de Supabase y entidad de dominio */
export const MovimientoMapper = {
  toDomain(row: MovimientoRow): Movimiento {
    return {
      id: row.id,
      prendaId: row.prenda_id,
      bailarinId: row.bailarin_id,
      bailarinDestinoId: row.bailarin_destino_id,
      tipo: row.tipo as TipoMovimiento,
      fechaInicio: new Date(row.fecha_inicio),
      fechaDevolucionEsperada: row.fecha_devolucion_esperada
        ? new Date(row.fecha_devolucion_esperada)
        : null,
      devuelta: row.devuelta,
      registradoPor: row.registrado_por,
      observacion: row.observacion,
      estadoResultante: row.estado_resultante as EstadoPrenda,
      createdAt: new Date(row.created_at),
    };
  },
};
