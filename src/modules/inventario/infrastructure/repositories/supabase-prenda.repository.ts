import type { SupabaseClient } from "@supabase/supabase-js";
import type { Genero, Pagination, PaginatedResult } from "@/shared/types";
import type {
  Prenda,
  CreatePrendaDTO,
  UpdatePrendaDTO,
} from "../../domain/entities";
import type { PrendaRepository, PrendaFilters } from "../../domain/ports";
import { PrendaMapper } from "../mappers";
import type { PrendaRow } from "../mappers";

/**
 * Implementación del repositorio de prendas usando Supabase.
 * Convierte entre la representación de DB (snake_case) y el dominio (camelCase).
 */
export class SupabasePrendaRepository implements PrendaRepository {
  constructor(private readonly supabase: SupabaseClient) {}

  async findById(id: string): Promise<Prenda | null> {
    const { data, error } = await this.supabase
      .from("prendas")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null; // No rows found
      throw new Error(`Error fetching prenda: ${error.message}`);
    }

    return PrendaMapper.toDomain(data as PrendaRow);
  }

  async findAll(
    filters: PrendaFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<Prenda>> {
    let query = this.supabase.from("prendas").select("*", { count: "exact" });

    query = this.applyFilters(query, filters);

    // Paginación offset-based
    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;
    query = query.range(from, to).order("created_at", { ascending: false });

    const { data, error, count } = await query;

    if (error) {
      throw new Error(`Error fetching prendas: ${error.message}`);
    }

    const total = count ?? 0;
    const prendas = (data as PrendaRow[]).map(PrendaMapper.toDomain);

    return {
      data: prendas,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async search(query: string, filters: PrendaFilters): Promise<Prenda[]> {
    const likePattern = `%${query}%`;

    // Búsqueda en nombre y codigo_identificador directamente
    let dbQuery = this.supabase
      .from("prendas")
      .select("*")
      .or(
        `nombre.ilike.${likePattern},codigo_identificador.ilike.${likePattern}`,
      );

    dbQuery = this.applyFilters(dbQuery, filters);
    dbQuery = dbQuery.limit(50);

    const { data, error } = await dbQuery;

    if (error) {
      throw new Error(`Error searching prendas: ${error.message}`);
    }

    const directResults = (data as PrendaRow[]).map(PrendaMapper.toDomain);

    // Búsqueda por nombre de bailarín asignado (join con bailarines)
    const { data: bailarinMatches, error: bailarinError } = await this.supabase
      .from("bailarines")
      .select("id")
      .ilike("nombre_completo", likePattern);

    if (bailarinError || !bailarinMatches?.length) {
      return directResults;
    }

    const bailarinIds = bailarinMatches.map((b: { id: string }) => b.id);

    let bailarinQuery = this.supabase
      .from("prendas")
      .select("*")
      .in("bailarin_actual", bailarinIds);

    bailarinQuery = this.applyFilters(bailarinQuery, filters);
    bailarinQuery = bailarinQuery.limit(50);

    const { data: bailarinPrendas, error: bailarinPrendasError } =
      await bailarinQuery;

    if (bailarinPrendasError) {
      return directResults;
    }

    // Combinar resultados sin duplicados
    const existingIds = new Set(directResults.map((p) => p.id));
    const additionalPrendas = (bailarinPrendas as PrendaRow[])
      .filter((row) => !existingIds.has(row.id))
      .map(PrendaMapper.toDomain);

    return [...directResults, ...additionalPrendas];
  }

  async create(prenda: CreatePrendaDTO): Promise<Prenda> {
    const insertRow = PrendaMapper.toInsertRow(prenda);

    const { data, error } = await this.supabase
      .from("prendas")
      .insert(insertRow)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Error creating prenda: ${error.message}`);
    }

    return PrendaMapper.toDomain(data as PrendaRow);
  }

  async update(id: string, updateData: UpdatePrendaDTO): Promise<Prenda> {
    const updateRow = PrendaMapper.toUpdateRow(updateData);

    const { data, error } = await this.supabase
      .from("prendas")
      .update(updateRow)
      .eq("id", id)
      .select("*")
      .single();

    if (error) {
      throw new Error(`Error updating prenda: ${error.message}`);
    }

    return PrendaMapper.toDomain(data as PrendaRow);
  }

  async delete(id: string): Promise<void> {
    const { error } = await this.supabase.from("prendas").delete().eq("id", id);

    if (error) {
      throw new Error(`Error deleting prenda: ${error.message}`);
    }
  }

  async getNextSequentialNumber(
    genero: Genero,
    cuadro: string,
  ): Promise<number> {
    // Mapear género y cuadro a sus códigos de una letra
    const generoCode = this.mapGeneroToCode(genero);
    const cuadroCode = this.mapCuadroToCode(cuadro);
    const prefix = `${generoCode}${cuadroCode}-`;

    // Buscar todas las prendas con ese prefijo
    const { data, error } = await this.supabase
      .from("prendas")
      .select("codigo_identificador")
      .like("codigo_identificador", `${prefix}%`);

    if (error) {
      throw new Error(`Error fetching sequential number: ${error.message}`);
    }

    if (!data || data.length === 0) {
      return 1;
    }

    // Extraer la parte numérica y encontrar el máximo
    const numbers = data.map((row: { codigo_identificador: string }) => {
      const numericPart = row.codigo_identificador.slice(prefix.length);
      return parseInt(numericPart, 10);
    });

    const maxNumber = Math.max(...numbers);
    return maxNumber + 1;
  }

  // --- Helpers privados ---

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private applyFilters<T extends { eq: (...args: any[]) => any }>(
    query: T,
    filters: PrendaFilters,
  ): T {
    let result = query;
    if (filters.cuadroId) {
      result = result.eq("cuadro_id", filters.cuadroId);
    }
    if (filters.genero) {
      result = result.eq("genero", filters.genero);
    }
    if (filters.categoria) {
      result = result.eq("categoria", filters.categoria);
    }
    if (filters.estado) {
      result = result.eq("estado", filters.estado);
    }
    if (filters.propietario) {
      result = result.eq("propietario", filters.propietario);
    }
    return result;
  }

  private mapGeneroToCode(genero: Genero): string {
    const map: Record<Genero, string> = {
      Masculino: "M",
      Femenino: "F",
      Unisex: "U",
    };
    return map[genero];
  }

  private mapCuadroToCode(cuadro: string): string {
    const map: Record<string, string> = {
      Huaso: "H",
      Norte: "N",
      "Rapa Nui": "R",
    };
    return map[cuadro] ?? cuadro[0];
  }
}
