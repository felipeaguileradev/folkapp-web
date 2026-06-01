import type {
  Genero,
  Categoria,
  EstadoPrenda,
  Propietario,
  Pagination,
  PaginatedResult,
} from "@/shared/types";
import type {
  Prenda,
  CreatePrendaDTO,
  UpdatePrendaDTO,
} from "../entities/prenda.entity";

/** Filtros disponibles para consultar prendas */
export interface PrendaFilters {
  cuadroId?: string;
  genero?: Genero;
  categoria?: Categoria;
  estado?: EstadoPrenda;
  propietario?: Propietario;
}

/** Puerto del repositorio de prendas (contrato para la capa de infraestructura) */
export interface PrendaRepository {
  findById(id: string): Promise<Prenda | null>;
  findAll(
    filters: PrendaFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<Prenda>>;
  search(query: string, filters: PrendaFilters): Promise<Prenda[]>;
  create(prenda: CreatePrendaDTO): Promise<Prenda>;
  update(id: string, data: UpdatePrendaDTO): Promise<Prenda>;
  delete(id: string): Promise<void>;
  getNextSequentialNumber(genero: Genero, cuadro: string): Promise<number>;
}
