import { createClient } from "@/shared/lib/supabase/server";
import type { EstadoVerificacion } from "@/shared/types";
import type {
  ChecklistItem,
  CreateChecklistItemDTO,
} from "../../domain/entities";
import type { ChecklistRepository } from "../../domain/ports";
import { ChecklistMapper } from "../mappers";
import type { ChecklistRow } from "../mappers";

export class SupabaseChecklistRepository implements ChecklistRepository {
  async findByFuncion(funcionId: string): Promise<ChecklistItem[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("funcion_id", funcionId)
      .order("bailarin_id")
      .order("prenda_categoria");

    if (error) {
      throw new Error(`Error fetching checklist items: ${error.message}`);
    }

    return (data as ChecklistRow[]).map(ChecklistMapper.toDomain);
  }

  async findByFuncionAndBailarin(
    funcionId: string,
    bailarinId: string,
  ): Promise<ChecklistItem[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("funcion_id", funcionId)
      .eq("bailarin_id", bailarinId)
      .order("prenda_categoria");

    if (error) {
      throw new Error(
        `Error fetching checklist items by bailarin: ${error.message}`,
      );
    }

    return (data as ChecklistRow[]).map(ChecklistMapper.toDomain);
  }

  async createMany(items: CreateChecklistItemDTO[]): Promise<ChecklistItem[]> {
    const supabase = createClient();
    const rows = items.map(ChecklistMapper.toInsertRow);

    const { data, error } = await supabase
      .from("checklist_items")
      .insert(rows)
      .select();

    if (error) {
      throw new Error(`Error creating checklist items: ${error.message}`);
    }

    return (data as ChecklistRow[]).map(ChecklistMapper.toDomain);
  }

  async updateEstado(
    id: string,
    estado: EstadoVerificacion,
    verificadoPor: string,
  ): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("checklist_items")
      .update({
        estado,
        verificado_por: verificadoPor,
        fecha_verificacion: new Date().toISOString(),
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Error updating checklist item: ${error.message}`);
    }
  }
}
