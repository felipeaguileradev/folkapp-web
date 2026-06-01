import type { Pagination, PaginatedResult } from "@/shared/types";
import type { Alerta, CreateAlertaDTO, TipoCondicion } from "../entities";

/** Puerto del repositorio de alertas (contrato para la capa de infraestructura) */
export interface AlertaRepository {
  findActivas(): Promise<Alerta[]>;
  findResueltas(pagination: Pagination): Promise<PaginatedResult<Alerta>>;
  create(alerta: CreateAlertaDTO): Promise<Alerta>;
  resolver(id: string, usuario: string): Promise<void>;
  resolverAutomatica(id: string): Promise<void>;
  deleteByEntidad(entidadId: string, tipo: TipoCondicion): Promise<void>;
}
