import type { Result } from "@/shared/types";
import type { ReporteEstadoCuadro } from "../../domain/entities";
import type { CuadroRepository } from "@/modules/cuadros/domain/ports";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";
import type { BailarinRepository } from "@/modules/bailarines/domain/ports";
import type { AlertaRepository } from "@/modules/alertas/domain/ports";

export interface GenerarReporteEstadoCuadroDeps {
  cuadroRepository: CuadroRepository;
  prendaRepository: PrendaRepository;
  bailarinRepository: BailarinRepository;
  alertaRepository: AlertaRepository;
}

/**
 * Caso de uso: Generar reporte de estado de un cuadro.
 * Incluye completitud general, alertas activas, prendas en reparación.
 */
export async function generarReporteEstadoCuadro(
  deps: GenerarReporteEstadoCuadroDeps,
  cuadroId: string,
): Promise<Result<ReporteEstadoCuadro, string>> {
  try {
    const cuadro = await deps.cuadroRepository.findById(cuadroId);
    if (!cuadro) {
      return { success: false, error: "Cuadro no encontrado" };
    }

    // Prendas del cuadro
    const prendasResult = await deps.prendaRepository.findAll(
      { cuadroId },
      { page: 1, pageSize: 10000 },
    );
    const prendas = prendasResult.data;

    // Bailarines del cuadro
    const bailarines = await deps.bailarinRepository.findByCuadro(cuadroId);

    // Alertas activas (filtrar por entidades del cuadro)
    const alertasActivas = await deps.alertaRepository.findActivas();
    const prendaIds = new Set(prendas.map((p) => p.id));
    const bailarinIds = new Set(bailarines.map((b) => b.id));
    const alertasDelCuadro = alertasActivas.filter(
      (a) => prendaIds.has(a.entidadId) || bailarinIds.has(a.entidadId),
    );

    // Prendas en reparación
    const enReparacion = prendas.filter(
      (p) => p.estado === "En reparación",
    ).length;

    // Completitud general (promedio simplificado)
    const prendasAsignadas = prendas.filter(
      (p) => p.estado === "En uso",
    ).length;
    const completitudGeneral =
      prendas.length > 0
        ? Math.round((prendasAsignadas / prendas.length) * 100)
        : 0;

    const reporte: ReporteEstadoCuadro = {
      cuadroNombre: cuadro.nombre,
      completitudGeneral,
      alertasActivas: alertasDelCuadro.length,
      prendasEnReparacion: enReparacion,
      totalPrendas: prendas.length,
      totalBailarines: bailarines.length,
    };

    return { success: true, data: reporte };
  } catch {
    return {
      success: false,
      error: "Error al generar reporte de estado del cuadro",
    };
  }
}
