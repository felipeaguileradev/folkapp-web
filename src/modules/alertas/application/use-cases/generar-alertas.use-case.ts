import type { Result, Prioridad } from "@/shared/types";
import type {
  Alerta,
  CreateAlertaDTO,
  TipoCondicion,
} from "../../domain/entities";
import type { AlertaRepository } from "../../domain/ports";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";
import type { MovimientoRepository } from "@/modules/movimientos/domain/ports";
import type { BailarinRepository } from "@/modules/bailarines/domain/ports";
import type { PlantillaRepository } from "@/modules/cuadros/domain/ports";

/** Dependencias del caso de uso GenerarAlertas */
export interface GenerarAlertasDeps {
  prendaRepository: PrendaRepository;
  movimientoRepository: MovimientoRepository;
  bailarinRepository: BailarinRepository;
  plantillaRepository: PlantillaRepository;
  alertaRepository: AlertaRepository;
}

/** Resultado de la generación de alertas */
export interface GenerarAlertasResult {
  alertasGeneradas: number;
  alertas: Alerta[];
}

/** Mapeo de tipo de condición a prioridad */
const PRIORIDAD_POR_CONDICION: Record<TipoCondicion, Prioridad> = {
  prestamo_vencido: "Alta",
  faltante_sin_movimiento: "Alta",
  reparacion_prolongada: "Media",
  completitud_baja: "Media",
  sin_ubicacion: "Baja",
  comentario_revisar: "Baja",
};

/** Días máximos en reparación antes de generar alerta */
const DIAS_REPARACION_LIMITE = 30;

/** Porcentaje mínimo de completitud antes de generar alerta */
const COMPLETITUD_MINIMA = 80;

/**
 * Caso de uso: Generar alertas automáticas.
 * Revisa las 6 condiciones de alerta y crea alertas para las que se cumplen.
 *
 * Condiciones:
 * 1. faltante_sin_movimiento — prenda "Faltante" sin movimiento activo de Asignación/Préstamo
 * 2. reparacion_prolongada — prenda "En reparación" por más de 30 días
 * 3. prestamo_vencido — préstamo activo con fecha de devolución vencida
 * 4. completitud_baja — bailarín con completitud < 80% en algún cuadro activo
 * 5. sin_ubicacion — prenda sin ubicación definida
 * 6. comentario_revisar — prenda con "Revisar" (case-insensitive) en comentarios
 */
export async function generarAlertas(
  deps: GenerarAlertasDeps,
): Promise<Result<GenerarAlertasResult, string>> {
  const {
    prendaRepository,
    movimientoRepository,
    bailarinRepository,
    plantillaRepository,
    alertaRepository,
  } = deps;

  try {
    const alertasDTO: CreateAlertaDTO[] = [];

    // Obtener todas las prendas (paginación amplia para procesamiento batch)
    const prendasResult = await prendaRepository.findAll(
      {},
      { page: 1, pageSize: 10000 },
    );
    const prendas = prendasResult.data;

    // 1. Faltante sin movimiento
    const faltantes = prendas.filter((p) => p.estado === "Faltante");
    for (const prenda of faltantes) {
      const movimientos = await movimientoRepository.findByPrenda(prenda.id);
      const hasActiveMovimiento = movimientos.some(
        (m) =>
          !m.devuelta &&
          (m.tipo === "Asignación" ||
            m.tipo === "Préstamo interno" ||
            m.tipo === "Préstamo externo"),
      );
      if (!hasActiveMovimiento) {
        alertasDTO.push(
          buildAlertaDTO(
            "faltante_sin_movimiento",
            prenda.id,
            "prenda",
            `Prenda "${prenda.nombre}" (${prenda.codigoIdentificador}) está marcada como Faltante sin movimiento activo`,
          ),
        );
      }
    }

    // 2. Reparación prolongada (>30 días)
    const enReparacion = prendas.filter((p) => p.estado === "En reparación");
    const now = new Date();
    for (const prenda of enReparacion) {
      const diasEnReparacion = getDaysDifference(prenda.updatedAt, now);
      if (diasEnReparacion > DIAS_REPARACION_LIMITE) {
        alertasDTO.push(
          buildAlertaDTO(
            "reparacion_prolongada",
            prenda.id,
            "prenda",
            `Prenda "${prenda.nombre}" (${prenda.codigoIdentificador}) lleva ${diasEnReparacion} días en reparación`,
          ),
        );
      }
    }

    // 3. Préstamo vencido
    const movimientosActivos = await movimientoRepository.findActivos({
      devuelta: false,
    });
    const prestamosActivos = movimientosActivos.filter(
      (m) => m.tipo === "Préstamo interno" || m.tipo === "Préstamo externo",
    );
    for (const prestamo of prestamosActivos) {
      if (
        prestamo.fechaDevolucionEsperada &&
        prestamo.fechaDevolucionEsperada < now
      ) {
        const prenda = prendas.find((p) => p.id === prestamo.prendaId);
        const nombrePrenda = prenda
          ? `"${prenda.nombre}" (${prenda.codigoIdentificador})`
          : prestamo.prendaId;
        alertasDTO.push(
          buildAlertaDTO(
            "prestamo_vencido",
            prestamo.prendaId,
            "prenda",
            `Préstamo de prenda ${nombrePrenda} vencido desde ${formatDate(prestamo.fechaDevolucionEsperada)}`,
          ),
        );
      }
    }

    // 4. Completitud baja (<80%)
    const bailarinesResult = await bailarinRepository.findAll(
      { activo: true },
      { page: 1, pageSize: 10000 },
    );
    const bailarines = bailarinesResult.data;

    for (const bailarin of bailarines) {
      for (const cuadroId of bailarin.cuadrosActivos) {
        const completitud = await calcularCompletitudBailarin(
          plantillaRepository,
          prendaRepository,
          bailarin.id,
          cuadroId,
          bailarin.genero,
        );
        if (
          typeof completitud === "number" &&
          completitud < COMPLETITUD_MINIMA
        ) {
          alertasDTO.push(
            buildAlertaDTO(
              "completitud_baja",
              bailarin.id,
              "bailarin",
              `Bailarín "${bailarin.nombreCompleto}" tiene ${completitud}% de completitud en un cuadro activo`,
            ),
          );
          break; // Una alerta por bailarín es suficiente
        }
      }
    }

    // 5. Sin ubicación
    const sinUbicacion = prendas.filter(
      (p) => !p.ubicacion || p.ubicacion.trim() === "",
    );
    for (const prenda of sinUbicacion) {
      alertasDTO.push(
        buildAlertaDTO(
          "sin_ubicacion",
          prenda.id,
          "prenda",
          `Prenda "${prenda.nombre}" (${prenda.codigoIdentificador}) no tiene ubicación definida`,
        ),
      );
    }

    // 6. Comentario "Revisar"
    const conRevisar = prendas.filter(
      (p) => p.comentarios && p.comentarios.toLowerCase().includes("revisar"),
    );
    for (const prenda of conRevisar) {
      alertasDTO.push(
        buildAlertaDTO(
          "comentario_revisar",
          prenda.id,
          "prenda",
          `Prenda "${prenda.nombre}" (${prenda.codigoIdentificador}) tiene "Revisar" en sus comentarios`,
        ),
      );
    }

    // Crear todas las alertas
    const alertasCreadas: Alerta[] = [];
    for (const dto of alertasDTO) {
      const alerta = await alertaRepository.create(dto);
      alertasCreadas.push(alerta);
    }

    return {
      success: true,
      data: {
        alertasGeneradas: alertasCreadas.length,
        alertas: alertasCreadas,
      },
    };
  } catch {
    return { success: false, error: "Error al generar alertas" };
  }
}

/** Construye un DTO de alerta con la prioridad correcta según el tipo de condición */
function buildAlertaDTO(
  tipoCondicion: TipoCondicion,
  entidadId: string,
  entidadTipo: "prenda" | "bailarin",
  descripcion: string,
): CreateAlertaDTO {
  return {
    tipoCondicion,
    prioridad: PRIORIDAD_POR_CONDICION[tipoCondicion],
    entidadId,
    entidadTipo,
    descripcion,
  };
}

/** Calcula la completitud de un bailarín en un cuadro específico */
async function calcularCompletitudBailarin(
  plantillaRepository: PlantillaRepository,
  prendaRepository: PrendaRepository,
  bailarinId: string,
  cuadroId: string,
  genero: "Masculino" | "Femenino",
): Promise<number | "Sin plantilla definida"> {
  const plantillaItems = await plantillaRepository.findByCuadroYGenero(
    cuadroId,
    genero,
  );

  if (plantillaItems.length === 0) {
    return "Sin plantilla definida";
  }

  const prendasResult = await prendaRepository.findAll(
    { cuadroId },
    { page: 1, pageSize: 10000 },
  );
  const prendasAsignadas = prendasResult.data.filter(
    (p) => p.bailarinActualId === bailarinId,
  );

  let matchCount = 0;
  const plantillaUsada = new Set<string>();

  for (const prenda of prendasAsignadas) {
    for (const item of plantillaItems) {
      const itemKey = `${item.categoria}:${item.nombrePrenda}`;
      if (
        prenda.categoria === item.categoria &&
        prenda.nombre === item.nombrePrenda &&
        !plantillaUsada.has(itemKey)
      ) {
        matchCount++;
        plantillaUsada.add(itemKey);
        break;
      }
    }
  }

  return Math.floor((matchCount / plantillaItems.length) * 100);
}

/** Calcula la diferencia en días entre dos fechas */
function getDaysDifference(from: Date, to: Date): number {
  const diffMs = to.getTime() - from.getTime();
  return Math.floor(diffMs / (1000 * 60 * 60 * 24));
}

/** Formatea una fecha a string legible */
function formatDate(date: Date): string {
  return date.toLocaleDateString("es-CL");
}
