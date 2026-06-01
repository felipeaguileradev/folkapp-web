import { TipoMovimiento } from "@/shared/types";
import { Movimiento, CreateMovimientoDTO } from "../entities";

/** Filtros para buscar movimientos activos */
export interface MovimientoFilters {
  tipo?: TipoMovimiento;
  devuelta?: boolean;
  cuadroId?: string;
}

/** Puerto de repositorio para movimientos */
export interface MovimientoRepository {
  findById(id: string): Promise<Movimiento | null>;
  findActivos(filters: MovimientoFilters): Promise<Movimiento[]>;
  findByPrenda(prendaId: string): Promise<Movimiento[]>;
  findByBailarin(bailarinId: string): Promise<Movimiento[]>;
  create(movimiento: CreateMovimientoDTO): Promise<Movimiento>;
  marcarDevuelto(id: string): Promise<void>;
}
