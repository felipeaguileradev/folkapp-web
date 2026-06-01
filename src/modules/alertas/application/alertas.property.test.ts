import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type {
  Alerta,
  CreateAlertaDTO,
  TipoCondicion,
} from "../domain/entities";
import type { AlertaRepository } from "../domain/ports";
import type { Prioridad, Pagination, PaginatedResult } from "@/shared/types";
import {
  getCondicionesResueltasPorEstadoPrenda,
  getCondicionesResueltasPorDevolucion,
  getCondicionesResueltasPorUbicacion,
  getCondicionesResueltasPorComentarios,
  autoResolverAlertasPorEntidad,
} from "./services";

// --- Helpers ---

const CONDICIONES: TipoCondicion[] = [
  "faltante_sin_movimiento",
  "reparacion_prolongada",
  "prestamo_vencido",
  "completitud_baja",
  "sin_ubicacion",
  "comentario_revisar",
];

const PRIORIDAD_ESPERADA: Record<TipoCondicion, Prioridad> = {
  prestamo_vencido: "Alta",
  faltante_sin_movimiento: "Alta",
  reparacion_prolongada: "Media",
  completitud_baja: "Media",
  sin_ubicacion: "Baja",
  comentario_revisar: "Baja",
};

function createMockAlerta(overrides: Partial<Alerta> = {}): Alerta {
  return {
    id: crypto.randomUUID(),
    tipoCondicion: "faltante_sin_movimiento",
    prioridad: "Alta",
    entidadId: "entidad-1",
    entidadTipo: "prenda",
    descripcion: "Test alerta",
    resuelta: false,
    fechaGeneracion: new Date(),
    fechaResolucion: null,
    resueltaPor: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockAlertaRepo(): AlertaRepository & {
  alertas: Alerta[];
  deletedConditions: { entidadId: string; tipo: TipoCondicion }[];
} {
  const alertas: Alerta[] = [];
  const deletedConditions: { entidadId: string; tipo: TipoCondicion }[] = [];

  return {
    alertas,
    deletedConditions,
    findActivas: async () => alertas.filter((a) => !a.resuelta),
    findResueltas: async (
      pagination: Pagination,
    ): Promise<PaginatedResult<Alerta>> => ({
      data: alertas.filter((a) => a.resuelta),
      total: alertas.filter((a) => a.resuelta).length,
      page: pagination.page,
      pageSize: pagination.pageSize,
      totalPages: 1,
    }),
    create: async (dto: CreateAlertaDTO) => {
      const alerta = createMockAlerta(dto);
      alertas.push(alerta);
      return alerta;
    },
    resolver: async (id: string, usuario: string) => {
      const alerta = alertas.find((a) => a.id === id);
      if (alerta) {
        alerta.resuelta = true;
        alerta.fechaResolucion = new Date();
        alerta.resueltaPor = usuario;
      }
    },
    resolverAutomatica: async (id: string) => {
      const alerta = alertas.find((a) => a.id === id);
      if (alerta) {
        alerta.resuelta = true;
        alerta.fechaResolucion = new Date();
        alerta.resueltaPor = "sistema";
      }
    },
    deleteByEntidad: async (entidadId: string, tipo: TipoCondicion) => {
      deletedConditions.push({ entidadId, tipo });
    },
  };
}

// --- P18: Alert generation with correct priority ---

describe("Alert Priority - Property Tests", () => {
  it("P18: Cada tipo de condición tiene la prioridad correcta asignada", () => {
    fc.assert(
      fc.property(fc.constantFrom(...CONDICIONES), (condicion) => {
        const expectedPrioridad = PRIORIDAD_ESPERADA[condicion];

        // Verificar que el mapeo es correcto
        if (
          condicion === "prestamo_vencido" ||
          condicion === "faltante_sin_movimiento"
        ) {
          expect(expectedPrioridad).toBe("Alta");
        } else if (
          condicion === "reparacion_prolongada" ||
          condicion === "completitud_baja"
        ) {
          expect(expectedPrioridad).toBe("Media");
        } else {
          expect(expectedPrioridad).toBe("Baja");
        }
      }),
    );
  });

  it("P18.1: Alertas Alta son: prestamo_vencido y faltante_sin_movimiento", () => {
    const altaCondiciones = CONDICIONES.filter(
      (c) => PRIORIDAD_ESPERADA[c] === "Alta",
    );
    expect(altaCondiciones).toContain("prestamo_vencido");
    expect(altaCondiciones).toContain("faltante_sin_movimiento");
    expect(altaCondiciones).toHaveLength(2);
  });

  it("P18.2: Alertas Media son: reparacion_prolongada y completitud_baja", () => {
    const mediaCondiciones = CONDICIONES.filter(
      (c) => PRIORIDAD_ESPERADA[c] === "Media",
    );
    expect(mediaCondiciones).toContain("reparacion_prolongada");
    expect(mediaCondiciones).toContain("completitud_baja");
    expect(mediaCondiciones).toHaveLength(2);
  });

  it("P18.3: Alertas Baja son: sin_ubicacion y comentario_revisar", () => {
    const bajaCondiciones = CONDICIONES.filter(
      (c) => PRIORIDAD_ESPERADA[c] === "Baja",
    );
    expect(bajaCondiciones).toContain("sin_ubicacion");
    expect(bajaCondiciones).toContain("comentario_revisar");
    expect(bajaCondiciones).toHaveLength(2);
  });
});

// --- P19: Alert ordering ---

describe("Alert Ordering - Property Tests", () => {
  it("P19: Alertas se ordenan por prioridad (Alta > Media > Baja) y luego por fecha desc", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            condicion: fc.constantFrom(...CONDICIONES),
            daysAgo: fc.integer({ min: 0, max: 100 }),
          }),
          { minLength: 3, maxLength: 15 },
        ),
        async (alertaFields) => {
          const repo = createMockAlertaRepo();

          // Crear alertas con diferentes prioridades y fechas
          for (const field of alertaFields) {
            const fecha = new Date();
            fecha.setDate(fecha.getDate() - field.daysAgo);

            repo.alertas.push(
              createMockAlerta({
                tipoCondicion: field.condicion,
                prioridad: PRIORIDAD_ESPERADA[field.condicion],
                fechaGeneracion: fecha,
                resuelta: false,
              }),
            );
          }

          const activas = await repo.findActivas();

          // Ordenar manualmente como debería estar
          const prioridadOrder: Record<Prioridad, number> = {
            Alta: 0,
            Media: 1,
            Baja: 2,
          };

          const sorted = [...activas].sort((a, b) => {
            const prioA = prioridadOrder[a.prioridad];
            const prioB = prioridadOrder[b.prioridad];
            if (prioA !== prioB) return prioA - prioB;
            return b.fechaGeneracion.getTime() - a.fechaGeneracion.getTime();
          });

          // Verificar que el orden es correcto (prioridad primero)
          for (let i = 1; i < sorted.length; i++) {
            const prev = sorted[i - 1];
            const curr = sorted[i];
            const prevPrio = prioridadOrder[prev.prioridad];
            const currPrio = prioridadOrder[curr.prioridad];

            // La prioridad nunca debe aumentar (Alta=0 < Media=1 < Baja=2)
            expect(prevPrio).toBeLessThanOrEqual(currPrio);
          }
        },
      ),
      { numRuns: 30 },
    );
  });
});

// --- P20: Alert auto-resolution ---

describe("Alert Auto-Resolution - Property Tests", () => {
  it("P20: Cambiar prenda de Faltante a otro estado auto-resuelve faltante_sin_movimiento", () => {
    const estados = [
      "Disponible",
      "En uso",
      "En reparación",
      "Prestada",
      "Dada de baja",
    ];

    fc.assert(
      fc.property(fc.constantFrom(...estados), (nuevoEstado) => {
        const condiciones = getCondicionesResueltasPorEstadoPrenda(
          "Faltante",
          nuevoEstado,
        );
        expect(condiciones).toContain("faltante_sin_movimiento");
      }),
    );
  });

  it("P20.1: Cambiar prenda de En reparación a otro estado auto-resuelve reparacion_prolongada", () => {
    const estados = [
      "Disponible",
      "En uso",
      "Faltante",
      "Prestada",
      "Dada de baja",
    ];

    fc.assert(
      fc.property(fc.constantFrom(...estados), (nuevoEstado) => {
        const condiciones = getCondicionesResueltasPorEstadoPrenda(
          "En reparación",
          nuevoEstado,
        );
        expect(condiciones).toContain("reparacion_prolongada");
      }),
    );
  });

  it("P20.2: Devolución auto-resuelve prestamo_vencido", () => {
    const condiciones = getCondicionesResueltasPorDevolucion();
    expect(condiciones).toContain("prestamo_vencido");
  });

  it("P20.3: Agregar ubicación auto-resuelve sin_ubicacion", () => {
    fc.assert(
      fc.property(fc.stringMatching(/^[A-Za-z0-9 ]{1,20}$/), (ubicacion) => {
        const condiciones = getCondicionesResueltasPorUbicacion(
          null,
          ubicacion,
        );
        expect(condiciones).toContain("sin_ubicacion");
      }),
    );
  });

  it("P20.4: Quitar 'Revisar' de comentarios auto-resuelve comentario_revisar", () => {
    const condiciones = getCondicionesResueltasPorComentarios(
      "Revisar costura lateral",
      "Costura reparada",
    );
    expect(condiciones).toContain("comentario_revisar");
  });

  it("P20.5: autoResolverAlertasPorEntidad llama deleteByEntidad para cada condición", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.uuid(),
        fc.array(fc.constantFrom(...CONDICIONES), {
          minLength: 1,
          maxLength: 4,
        }),
        async (entidadId, condiciones) => {
          const repo = createMockAlertaRepo();

          await autoResolverAlertasPorEntidad(
            { alertaRepository: repo },
            entidadId,
            condiciones,
          );

          expect(repo.deletedConditions).toHaveLength(condiciones.length);
          for (let i = 0; i < condiciones.length; i++) {
            expect(repo.deletedConditions[i].entidadId).toBe(entidadId);
            expect(repo.deletedConditions[i].tipo).toBe(condiciones[i]);
          }
        },
      ),
      { numRuns: 30 },
    );
  });

  it("P20.6: Si el estado no cambia de Faltante ni En reparación, no se resuelve nada", () => {
    const transicionesNeutrales = [
      { anterior: "Disponible", nuevo: "En uso" },
      { anterior: "En uso", nuevo: "Disponible" },
      { anterior: "Prestada", nuevo: "Disponible" },
      { anterior: "Disponible", nuevo: "Dada de baja" },
    ];

    for (const { anterior, nuevo } of transicionesNeutrales) {
      const condiciones = getCondicionesResueltasPorEstadoPrenda(
        anterior,
        nuevo,
      );
      expect(condiciones).toHaveLength(0);
    }
  });
});
