// Implementación del repositorio de bailarines con Supabase

import { SupabaseClient } from "@supabase/supabase-js";
import { PaginatedResult, Pagination } from "@/shared/types";
import {
  Bailarin,
  CreateBailarinDTO,
  UpdateBailarinDTO,
  BailarinRepository,
  BailarinFilters,
} from "../../domain";
import { BailarinMapper, BailarinRow } from "../mappers/bailarin.mapper";

const TABLE = "bailarines";

export class SupabaseBailarinRepository implements BailarinRepository {
  constructor(private readonly client: SupabaseClient) {}

  async findById(id: string): Promise<Bailarin | null> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") return null;
      throw new Error(`Error al obtener bailarín: ${error.message}`);
    }

    return BailarinMapper.toDomain(data as BailarinRow);
  }

  async findAll(
    filters: BailarinFilters,
    pagination: Pagination,
  ): Promise<PaginatedResult<Bailarin>> {
    let query = this.client.from(TABLE).select("*", { count: "exact" });

    if (filters.cuadroId) {
      query = query.contains("cuadros_activos", [filters.cuadroId]);
    }
    if (filters.genero) {
      query = query.eq("genero", filters.genero);
    }
    if (filters.activo !== undefined) {
      query = query.eq("activo", filters.activo);
    }

    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    const { data, error, count } = await query
      .order("nombre_completo", { ascending: true })
      .range(from, to);

    if (error) {
      throw new Error(`Error al listar bailarines: ${error.message}`);
    }

    const total = count ?? 0;
    const items = (data as BailarinRow[]).map(BailarinMapper.toDomain);

    return {
      data: items,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async findByCuadro(cuadroId: string): Promise<Bailarin[]> {
    const { data, error } = await this.client
      .from(TABLE)
      .select("*")
      .contains("cuadros_activos", [cuadroId])
      .eq("activo", true)
      .order("nombre_completo", { ascending: true });

    if (error) {
      throw new Error(
        `Error al buscar bailarines por cuadro: ${error.message}`,
      );
    }

    return (data as BailarinRow[]).map(BailarinMapper.toDomain);
  }

  async create(bailarin: CreateBailarinDTO): Promise<Bailarin> {
    const row = BailarinMapper.toInsertRow(bailarin);

    const { data, error } = await this.client
      .from(TABLE)
      .insert(row)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al crear bailarín: ${error.message}`);
    }

    return BailarinMapper.toDomain(data as BailarinRow);
  }

  async update(id: string, dto: UpdateBailarinDTO): Promise<Bailarin> {
    const row = BailarinMapper.toUpdateRow(dto);

    const { data, error } = await this.client
      .from(TABLE)
      .update(row)
      .eq("id", id)
      .select()
      .single();

    if (error) {
      throw new Error(`Error al actualizar bailarín: ${error.message}`);
    }

    return BailarinMapper.toDomain(data as BailarinRow);
  }

  async setActivo(id: string, activo: boolean): Promise<void> {
    const { error } = await this.client
      .from(TABLE)
      .update({ activo })
      .eq("id", id);

    if (error) {
      throw new Error(`Error al cambiar estado del bailarín: ${error.message}`);
    }
  }
}
