import type {
  Cuadro,
  CreateCuadroDTO,
  UpdateCuadroDTO,
} from "../entities/cuadro.entity";

/** Puerto del repositorio de cuadros (contrato para la capa de infraestructura) */
export interface CuadroRepository {
  findAll(): Promise<Cuadro[]>;
  findById(id: string): Promise<Cuadro | null>;
  create(cuadro: CreateCuadroDTO): Promise<Cuadro>;
  update(id: string, data: UpdateCuadroDTO): Promise<Cuadro>;
  delete(id: string): Promise<void>;
}
