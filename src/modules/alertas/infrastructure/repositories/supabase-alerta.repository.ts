import { createClient } from "@/shared/lib/supabase/server";
import type { Pagination, PaginatedResult } from "@/shared/types";
import type {
  Alerta,
  CreateAlertaDTO,
  TipoCondicion,
} from "../../domain/entities";
import type { AlertaRepository } from "../../domain/ports";
import { AlertaMapper } from "../mappers";
import type { AlertaRow } from "../mappers";

/**
 * Implementación del repositorio de alertas usando Supabase.
 * Las alertas se ordenan por prioridad (Alta > Media > Baja) y fecha descendente.
 */
export class SupabaseAlertaRepository implements AlertaRepository {
  async findActivas(): Promise<Alerta[]> {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("alertas")
      .select("*")
      .eq("resuelta", false)
      .order("prioridad", { ascending: true }) // Alta=1, Media=2, Baja=3 si se usa enum order
      .order("fecha_generacion", { ascending: false });

    if (error) {
      throw new Error(`Error fetching alertas activas: ${error.message}`);
    }

    // Ordenar por prioridad manualmente (Alta > Media > Baja)
    const alertas = (data as AlertaRow[]).map(AlertaMapper.toDomain);
    return sortByPrioridad(alertas);
  }

  async findResueltas(
    pagination: Pagination,
  ): Promise<PaginatedResult<Alerta>> {
    const supabase = createClient();

    const from = (pagination.page - 1) * pagination.pageSize;
    const to = from + pagination.pageSize - 1;

    const { data, error, count } = await supabase
      .from("alertas")
      .select("*", { count: "exact" })
      .eq("resuelta", true)
      .order("fecha_resolucion", { ascending: false })
      .range(from, to);

    if (error) {
      throw new Error(`Error fetching alertas resueltas: ${error.message}`);
    }

    const total = count ?? 0;
    const alertas = (data as AlertaRow[]).map(AlertaMapper.toDomain);

    return {
      data: alertas,
      total,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: Math.ceil(total / pagination.pageSize),
    };
  }

  async create(dto: CreateAlertaDTO): Promise<Alerta> {
    const supabase = createClient();
    const insertRow = AlertaMapper.toInsertRow(dto);

    const { data, error } = await supabase
      .from("alertas")
      .insert(insertRow)
      .select()
      .single();

    if (error) {
      throw new Error(`Error creating alerta: ${error.message}`);
    }

    return AlertaMapper.toDomain(data as AlertaRow);
  }

  async resolver(id: string, usuario: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("alertas")
      .update({
        resuelta: true,
        fecha_resolucion: new Date().toISOString(),
        resuelta_por: usuario,
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Error resolviendo alerta: ${error.message}`);
    }
  }

  async resolverAutomatica(id: string): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("alertas")
      .update({
        resuelta: true,
        fecha_resolucion: new Date().toISOString(),
        resuelta_por: "sistema",
      })
      .eq("id", id);

    if (error) {
      throw new Error(`Error auto-resolviendo alerta: ${error.message}`);
    }
  }

  async deleteByEntidad(entidadId: string, tipo: TipoCondicion): Promise<void> {
    const supabase = createClient();

    const { error } = await supabase
      .from("alertas")
      .delete()
      .eq("entidad_id", entidadId)
      .eq("tipo_condicion", tipo)
      .eq("resuelta", false);

    if (error) {
      throw new Error(`Error eliminando alertas por entidad: ${error.message}`);
    }
  }
}

/** Ordena alertas por prioridad: Alta primero, luego Media, luego Baja */
function sortByPrioridad(alertas: Alerta[]): Alerta[] {
  const prioridadOrder: Record<string, number> = {
    Alta: 0,
    Media: 1,
    Baja: 2,
  };

  return alertas.sort((a, b) => {
    const prioA = prioridadOrder[a.prioridad] ?? 3;
    const prioB = prioridadOrder[b.prioridad] ?? 3;
    if (prioA !== prioB) return prioA - prioB;
    return b.fechaGeneracion.getTime() - a.fechaGeneracion.getTime();
  });
}
