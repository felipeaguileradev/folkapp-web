import type { EstadoVerificacion } from "@/shared/types";
import type { ChecklistItem, CreateChecklistItemDTO } from "../entities";

/** Puerto del repositorio de checklist items */
export interface ChecklistRepository {
  findByFuncion(funcionId: string): Promise<ChecklistItem[]>;
  findByFuncionAndBailarin(
    funcionId: string,
    bailarinId: string,
  ): Promise<ChecklistItem[]>;
  createMany(items: CreateChecklistItemDTO[]): Promise<ChecklistItem[]>;
  updateEstado(
    id: string,
    estado: EstadoVerificacion,
    verificadoPor: string,
  ): Promise<void>;
}
