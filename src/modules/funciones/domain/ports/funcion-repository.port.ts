import type {
  Funcion,
  CreateFuncionDTO,
  ResultadoChecklist,
} from "../entities";

/** Puerto del repositorio de funciones */
export interface FuncionRepository {
  findAll(): Promise<Funcion[]>;
  findById(id: string): Promise<Funcion | null>;
  create(funcion: CreateFuncionDTO): Promise<Funcion>;
  updateEstado(id: string, estado: string): Promise<void>;
  saveResultado(id: string, resultado: ResultadoChecklist): Promise<void>;
}
