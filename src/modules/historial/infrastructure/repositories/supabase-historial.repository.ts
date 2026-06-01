import { createClient } from "@/shared/lib/supabase/server";
import type { CursorPagination } from "@/shared/types";
import type { HistorialEntry, CreateHistorialDTO } from "../../domain/entities";
import type { HistorialRepository } from "../../domain/ports";
import { HistorialMapper } from "../mappers";
import type { HistorialRow } from "../mappers";

/**
 * Implementación del repositorio de historial usando Supabase.
 *
 * El historial es inmutable: la tabla solo permite INSERT (no UPDATE/DELETE via RLS).
 * La mayoría de entradas se crean atómicamente dentro de RPCs (asignar_prenda,
 * devolver_prenda, traspasar_prenda). El método `create` se usa para eventos
 * no transaccionales como "Cambio de estado" o "Comentario agregado".
 *
 * Paginación basada en cursor usando `created_at` del último elemento.
 */
export class SupabaseHistorialRepository implements HistorialRepository {
  async findByPrenda(
    prendaId: string,
    pagination: CursorPagination,
  ): Promise<HistorialEntry[]> {
    const supabase = createClient();

    let query = supabase
      .from("historial")
      .select("*")
      .eq("prenda_id", prendaId)
      .order("fecha", { ascending: false })
      .limit(pagination.limit);

    if (pagination.cursor) {
      query = query.lt("created_at", pagination.cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching historial by prenda: ${error.message}`);
    }

    return (data as HistorialRow[]).map(HistorialMapper.toDomain);
  }

  async findByBailarin(
    bailarinId: string,
    pagination: CursorPagination,
  ): Promise<HistorialEntry[]> {
    const supabase = createClient();

    let query = supabase
      .from("historial")
      .select("*")
      .eq("persona_involucrada", bailarinId)
      .order("fecha", { ascending: false })
      .limit(pagination.limit);

    if (pagination.cursor) {
      query = query.lt("created_at", pagination.cursor);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error(`Error fetching historial by bailarin: ${error.message}`);
    }

    return (data as HistorialRow[]).map(HistorialMapper.toDomain);
  }

  async create(entry: CreateHistorialDTO): Promise<HistorialEntry> {
    const supabase = createClient();
    const insertRow = HistorialMapper.toInsertRow(entry);

    const { data, error } = await supabase
      .from("historial")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating historial entry: ${error.message}`);
    }

    return HistorialMapper.toDomain(data as HistorialRow);
  }
}
