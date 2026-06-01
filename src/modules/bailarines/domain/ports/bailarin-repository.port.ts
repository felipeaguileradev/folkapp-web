// Puerto del repositorio de bailarines

import { GeneroBailarin, Pagination, PaginatedResult } from "@/shared/types";
import {
  Bailarin,
  CreateBailarinDTO,
  UpdateBailarinDTO,
} from "../entities/bailarin.entity";

/** Filtros disponibles para buscar bailarines */
export interface BailarinFilters {
  cuadroId?: string;
  genero?: GeneroBailarin;
  activo?: boolean;
}

/** Contrato del repositorio de bailarines */
export interface BailarinRepository {
  findById(id: string): Promise<Bailarin | null>;
  findAll(
    filters: BailarinFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<Bailarin>>;
  findByCuadro(cuadroId: string): Promise<Bailarin[]>;
  create(bailarin: CreateBailarinDTO): Promise<Bailarin>;
  update(id: string, data: UpdateBailarinDTO): Promise<Bailarin>;
  setActivo(id: string, activo: boolean): Promise<void>;
}
