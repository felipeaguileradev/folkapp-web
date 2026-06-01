import { createClient } from "@/shared/lib/supabase/server";
import type {
  Funcion,
  CreateFuncionDTO,
  ResultadoChecklist,
} from "../../domain/entities";
import type { FuncionRepository } from "../../domain/ports";
import { FuncionMapper } from "../mappers";
import type { FuncionRow } from "../mappers";

export class SupabaseFuncionRepository implements FuncionRepository {
  async findAll(): Promise<Funcion[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("funciones")
      .select("*")
      .order("fecha", { ascending: false });

    if (error) {
      throw new Error(`Error fetching funciones: ${error.message}`);
    }

    return (data as FuncionRow[]).map(FuncionMapper.toDomain);
  }

  async findById(id: string): Promise<Funcion | null> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("funciones")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching funcion: ${error.message}`);
    }

    return FuncionMapper.toDomain(data as FuncionRow);
  }

  async create(dto: CreateFuncionDTO): Promise<Funcion> {
    const supabase = createClient();
    const row = FuncionMapper.toInsertRow(dto);

    const { data, error } = await supabase
      .from("funciones")
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating funcion: ${error.message}`);
    }

    return FuncionMapper.toDomain(data as FuncionRow);
  }

  async updateEstado(id: string, estado: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("funciones")
      .update({ estado })
      .eq("id", id);

    if (error) {
      throw new Error(`Error updating funcion estado: ${error.message}`);
    }
  }

  async saveResultado(
    id: string,
    resultado: ResultadoChecklist,
  ): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("funciones")
      .update({ resultado_checklist: resultado })
      .eq("id", id);

    if (error) {
      throw new Error(`Error saving resultado checklist: ${error.message}`);
    }
  }
}
