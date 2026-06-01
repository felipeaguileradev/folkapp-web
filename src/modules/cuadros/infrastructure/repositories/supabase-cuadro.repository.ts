import { createClient } from "@/shared/lib/supabase/server";
import type {
  Cuadro,
  CreateCuadroDTO,
  UpdateCuadroDTO,
} from "../../domain/entities";
import type { CuadroRepository } from "../../domain/ports";
import { CuadroMapper } from "../mappers";
import type { CuadroRow } from "../mappers";

/** Implementación Supabase del repositorio de cuadros */
export class SupabaseCuadroRepository implements CuadroRepository {
  async findAll(): Promise<Cuadro[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cuadros")
      .select("*")
      .order("nombre");

    if (error) throw new Error(`Error fetching cuadros: ${error.message}`);

    return (data as CuadroRow[]).map(CuadroMapper.toDomain);
  }

  async findById(id: string): Promise<Cuadro | null> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("cuadros")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error fetching cuadro: ${error.message}`);
    }

    return CuadroMapper.toDomain(data as CuadroRow);
  }

  async create(dto: CreateCuadroDTO): Promise<Cuadro> {
    const supabase = createClient();
    const row = CuadroMapper.toCreateRow(dto);

    const { data, error } = await supabase
      .from("cuadros")
      .insert(row)
      .select()
      .single();

    if (error) throw new Error(`Error creating cuadro: ${error.message}`);

    return CuadroMapper.toDomain(data as CuadroRow);
  }

  async update(id: string, dto: UpdateCuadroDTO): Promise<Cuadro> {
    const supabase = createClient();
    const row = CuadroMapper.toUpdateRow(dto);

    const { data, error } = await supabase
      .from("cuadros")
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) throw new Error(`Error updating cuadro: ${error.message}`);

    return CuadroMapper.toDomain(data as CuadroRow);
  }

  async delete(id: string): Promise<void> {
    const supabase = createClient();
    const { error } = await supabase.from("cuadros").delete().eq("id", id);

    if (error) throw new Error(`Error deleting cuadro: ${error.message}`);
  }
}
