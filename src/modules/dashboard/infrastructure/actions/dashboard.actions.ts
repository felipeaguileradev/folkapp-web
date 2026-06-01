"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type { Result } from "@/shared/types";
import type { DashboardStats } from "../../domain/entities";
import type { Alerta } from "@/modules/alertas/domain/entities";
import type { Funcion } from "@/modules/funciones/domain/entities";
import { AlertaMapper } from "@/modules/alertas/infrastructure/mappers";
import type { AlertaRow } from "@/modules/alertas/infrastructure/mappers";

/** Obtiene las estadísticas generales del dashboard */
export async function getDashboardStatsAction(): Promise<
  Result<DashboardStats, string>
> {
  try {
    const supabase = createClient();

    // Ejecutar todas las consultas en paralelo
    const [
      prendasResult,
      prendasDisponiblesResult,
      prendasEnUsoResult,
      prendasFaltantesResult,
      bailarinesResult,
      bailarinesActivosResult,
      cuadrosResult,
      alertasActivasResult,
      alertasAltaResult,
      movimientosActivosResult,
      funcionesProximasResult,
    ] = await Promise.all([
      supabase.from("prendas").select("*", { count: "exact", head: true }),
      supabase
        .from("prendas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Disponible"),
      supabase
        .from("prendas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "En uso"),
      supabase
        .from("prendas")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Faltante"),
      supabase.from("bailarines").select("*", { count: "exact", head: true }),
      supabase
        .from("bailarines")
        .select("*", { count: "exact", head: true })
        .eq("activo", true),
      supabase.from("cuadros").select("*", { count: "exact", head: true }),
      supabase
        .from("alertas")
        .select("*", { count: "exact", head: true })
        .eq("resuelta", false),
      supabase
        .from("alertas")
        .select("*", { count: "exact", head: true })
        .eq("resuelta", false)
        .eq("prioridad", "Alta"),
      supabase
        .from("movimientos")
        .select("*", { count: "exact", head: true })
        .eq("devuelta", false),
      supabase
        .from("funciones")
        .select("*", { count: "exact", head: true })
        .eq("estado", "Pendiente"),
    ]);

    const stats: DashboardStats = {
      totalPrendas: prendasResult.count ?? 0,
      prendasDisponibles: prendasDisponiblesResult.count ?? 0,
      prendasEnUso: prendasEnUsoResult.count ?? 0,
      prendasFaltantes: prendasFaltantesResult.count ?? 0,
      totalBailarines: bailarinesResult.count ?? 0,
      bailarinesActivos: bailarinesActivosResult.count ?? 0,
      totalCuadros: cuadrosResult.count ?? 0,
      alertasActivas: alertasActivasResult.count ?? 0,
      alertasAlta: alertasAltaResult.count ?? 0,
      movimientosActivos: movimientosActivosResult.count ?? 0,
      funcionesProximas: funcionesProximasResult.count ?? 0,
    };

    return { success: true, data: stats };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener estadísticas";
    return { success: false, error: message };
  }
}

/** Obtiene las alertas activas más recientes (máximo 5) */
export async function getAlertasRecientesAction(): Promise<
  Result<Alerta[], string>
> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("alertas")
      .select("*")
      .eq("resuelta", false)
      .order("fecha_generacion", { ascending: false })
      .limit(5);

    if (error) {
      return { success: false, error: error.message };
    }

    const alertas = (data as AlertaRow[]).map(AlertaMapper.toDomain);
    return { success: true, data: alertas };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener alertas";
    return { success: false, error: message };
  }
}

/** Obtiene las próximas funciones pendientes (máximo 5) */
export async function getFuncionesProximasAction(): Promise<
  Result<Funcion[], string>
> {
  try {
    const supabase = createClient();

    const { data, error } = await supabase
      .from("funciones")
      .select("*")
      .eq("estado", "Pendiente")
      .order("fecha", { ascending: true })
      .limit(5);

    if (error) {
      return { success: false, error: error.message };
    }

    const funciones = (data as FuncionRow[]).map(mapFuncionRow);
    return { success: true, data: funciones };
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Error al obtener funciones";
    return { success: false, error: message };
  }
}

// --- Helpers internos ---

interface FuncionRow {
  id: string;
  nombre: string;
  fecha: string;
  lugar: string | null;
  estado: string;
  cuadros_que_se_presenten: string[];
  bailarines_convocados: string[];
  resultado_checklist: {
    totalItems: number;
    verificados: number;
    faltantes: number;
    pendientes: number;
  } | null;
  created_at: string;
  updated_at: string;
}

function mapFuncionRow(row: FuncionRow): Funcion {
  return {
    id: row.id,
    nombre: row.nombre,
    fecha: new Date(row.fecha),
    lugar: row.lugar,
    estado: row.estado as Funcion["estado"],
    cuadrosQueSePresenten: row.cuadros_que_se_presenten ?? [],
    bailarinesConvocados: row.bailarines_convocados ?? [],
    resultadoChecklist: row.resultado_checklist,
    createdAt: new Date(row.created_at),
    updatedAt: new Date(row.updated_at),
  };
}
