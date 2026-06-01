import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { asignarPrenda } from "./asignar-prenda.use-case";
import { prestarPrenda } from "./prestar-prenda.use-case";
import { devolverPrenda } from "./devolver-prenda.use-case";
import { traspasarPrenda } from "./traspasar-prenda.use-case";
import {
  canAssignPrenda,
  canReturnMovimiento,
  isOverdue,
} from "../../domain/rules";
import type { Movimiento, CreateMovimientoDTO } from "../../domain/entities";
import type { MovimientoRepository } from "../../domain/ports";
import type { Prenda } from "@/modules/inventario/domain/entities";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";
import type { EstadoPrenda } from "@/shared/types";

// --- Helpers ---

const ESTADOS: EstadoPrenda[] = [
  "Disponible",
  "En uso",
  "En reparación",
  "Faltante",
  "Prestada",
  "Dada de baja",
];
const ESTADOS_NO_DISPONIBLE: EstadoPrenda[] = [
  "En uso",
  "En reparación",
  "Faltante",
  "Prestada",
  "Dada de baja",
];

function createMockPrenda(
  estado: EstadoPrenda,
  bailarinActualId: string | null = null,
): Prenda {
  return {
    id: "prenda-1",
    codigoIdentificador: "MH-001",
    nombre: "Test prenda",
    cuadroId: "cuadro-1",
    genero: "Masculino",
    categoria: "Accesorio",
    color: null,
    tallaONumero: null,
    identificadorFisico: null,
    bailarinActualId,
    propietario: "Ballet",
    ubicacion: "Armario 1",
    estado,
    fotoUrl: null,
    comentarios: null,
    fechaIngreso: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
  };
}

function createMockMovimiento(overrides: Partial<Movimiento> = {}): Movimiento {
  return {
    id: "mov-1",
    prendaId: "prenda-1",
    bailarinId: "bailarin-1",
    bailarinDestinoId: null,
    tipo: "Asignación",
    fechaInicio: new Date(),
    fechaDevolucionEsperada: null,
    devuelta: false,
    registradoPor: "user-1",
    observacion: null,
    estadoResultante: "En uso",
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockMovimientoRepo(
  movimientos: Movimiento[] = [],
): MovimientoRepository {
  return {
    findById: async (id) => movimientos.find((m) => m.id === id) ?? null,
    findActivos: async () => movimientos.filter((m) => !m.devuelta),
    findByPrenda: async () => movimientos,
    findByBailarin: async () => movimientos,
    create: async (dto: CreateMovimientoDTO) => ({
      id: crypto.randomUUID(),
      ...dto,
      createdAt: new Date(),
    }),
    marcarDevuelto: async () => {},
  };
}

function createMockPrendaRepo(prenda: Prenda): PrendaRepository {
  return {
    findById: async () => prenda,
    findAll: async () => ({
      data: [prenda],
      total: 1,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }),
    search: async () => [prenda],
    create: async () => prenda,
    update: async () => prenda,
    delete: async () => {},
    getNextSequentialNumber: async () => 1,
  };
}

// --- P9: Movement state transitions ---

describe("Movement State Transitions - Property Tests", () => {
  it("P9: Asignar produce estado resultante 'En uso'", async () => {
    const prenda = createMockPrenda("Disponible");
    const result = await asignarPrenda(
      {
        movimientoRepository: createMockMovimientoRepo(),
        prendaRepository: createMockPrendaRepo(prenda),
      },
      {
        prendaId: "prenda-1",
        bailarinId: "bailarin-1",
        registradoPor: "user-1",
      },
    );
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.estadoResultante).toBe("En uso");
      expect(result.data.tipo).toBe("Asignación");
    }
  });

  it("P9.1: Prestar produce estado resultante 'Prestada'", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(
          "Préstamo interno" as const,
          "Préstamo externo" as const,
        ),
        async (tipoPrestamo) => {
          const prenda = createMockPrenda("Disponible");
          const result = await prestarPrenda(
            {
              movimientoRepository: createMockMovimientoRepo(),
              prendaRepository: createMockPrendaRepo(prenda),
            },
            {
              prendaId: "prenda-1",
              bailarinId: "bailarin-1",
              tipo: tipoPrestamo,
              registradoPor: "user-1",
            },
          );
          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data.estadoResultante).toBe("Prestada");
          }
        },
      ),
    );
  });
});

// --- P10: Non-available prenda rejection ---

describe("Non-available Prenda Rejection - Property Tests", () => {
  it("P10: No se puede asignar una prenda que no está 'Disponible'", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...ESTADOS_NO_DISPONIBLE),
        async (estado) => {
          const prenda = createMockPrenda(estado);
          const result = await asignarPrenda(
            {
              movimientoRepository: createMockMovimientoRepo(),
              prendaRepository: createMockPrendaRepo(prenda),
            },
            {
              prendaId: "prenda-1",
              bailarinId: "bailarin-1",
              registradoPor: "user-1",
            },
          );
          expect(result.success).toBe(false);
        },
      ),
    );
  });

  it("P10.1: No se puede prestar una prenda que no está 'Disponible'", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.constantFrom(...ESTADOS_NO_DISPONIBLE),
        fc.constantFrom(
          "Préstamo interno" as const,
          "Préstamo externo" as const,
        ),
        async (estado, tipo) => {
          const prenda = createMockPrenda(estado);
          const result = await prestarPrenda(
            {
              movimientoRepository: createMockMovimientoRepo(),
              prendaRepository: createMockPrendaRepo(prenda),
            },
            {
              prendaId: "prenda-1",
              bailarinId: "bailarin-1",
              tipo,
              registradoPor: "user-1",
            },
          );
          expect(result.success).toBe(false);
        },
      ),
    );
  });
});

// --- P11: Devolution resets prenda state ---

describe("Devolution - Property Tests", () => {
  it("P11: Devolver un movimiento no-devuelto tiene éxito", async () => {
    const movimiento = createMockMovimiento({ devuelta: false });
    const result = await devolverPrenda(
      { movimientoRepository: createMockMovimientoRepo([movimiento]) },
      { movimientoId: movimiento.id },
    );
    expect(result.success).toBe(true);
  });
});

// --- P12: Overdue loan detection ---

describe("Overdue Detection - Property Tests", () => {
  it("P12: Préstamo con fecha vencida se detecta como overdue", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 365 }), (daysAgo) => {
        const pastDate = new Date();
        pastDate.setDate(pastDate.getDate() - daysAgo);

        const movimiento = {
          fechaDevolucionEsperada: pastDate,
          devuelta: false,
        };
        expect(isOverdue(movimiento)).toBe(true);
      }),
    );
  });

  it("P12.1: Préstamo con fecha futura NO es overdue", () => {
    fc.assert(
      fc.property(fc.integer({ min: 1, max: 365 }), (daysAhead) => {
        const futureDate = new Date();
        futureDate.setDate(futureDate.getDate() + daysAhead);

        const movimiento = {
          fechaDevolucionEsperada: futureDate,
          devuelta: false,
        };
        expect(isOverdue(movimiento)).toBe(false);
      }),
    );
  });

  it("P12.2: Préstamo ya devuelto nunca es overdue", () => {
    fc.assert(
      fc.property(fc.integer({ min: -365, max: 365 }), (daysOffset) => {
        const date = new Date();
        date.setDate(date.getDate() + daysOffset);

        const movimiento = { fechaDevolucionEsperada: date, devuelta: true };
        expect(isOverdue(movimiento)).toBe(false);
      }),
    );
  });

  it("P12.3: Préstamo sin fecha de devolución nunca es overdue", () => {
    const movimiento = { fechaDevolucionEsperada: null, devuelta: false };
    expect(isOverdue(movimiento)).toBe(false);
  });
});

// --- P13: Traspaso preserves estado and updates bailarin ---

describe("Traspaso - Property Tests", () => {
  it("P13: Traspaso preserva el estado de la prenda", async () => {
    await fc.assert(
      fc.asyncProperty(fc.constantFrom(...ESTADOS), async (estadoOriginal) => {
        const prenda = createMockPrenda(estadoOriginal, "bailarin-origen");
        const result = await traspasarPrenda(
          {
            movimientoRepository: createMockMovimientoRepo(),
            prendaRepository: createMockPrendaRepo(prenda),
          },
          {
            prendaId: "prenda-1",
            bailarinOrigenId: "bailarin-origen",
            bailarinDestinoId: "bailarin-destino",
            registradoPor: "user-1",
          },
        );
        expect(result.success).toBe(true);
        if (result.success) {
          expect(result.data.estadoResultante).toBe(estadoOriginal);
          expect(result.data.bailarinDestinoId).toBe("bailarin-destino");
          expect(result.data.tipo).toBe("Traspaso");
        }
      }),
    );
  });
});

// --- P14: Double devolution rejection ---

describe("Double Devolution - Property Tests", () => {
  it("P14: No se puede devolver un movimiento ya devuelto", async () => {
    const movimiento = createMockMovimiento({ devuelta: true });
    const result = await devolverPrenda(
      { movimientoRepository: createMockMovimientoRepo([movimiento]) },
      { movimientoId: movimiento.id },
    );
    expect(result.success).toBe(false);
  });

  it("P14.1: canReturnMovimiento es false para movimientos devueltos", () => {
    expect(canReturnMovimiento({ devuelta: true })).toBe(false);
    expect(canReturnMovimiento({ devuelta: false })).toBe(true);
  });

  it("P14.2: canAssignPrenda solo es true para 'Disponible'", () => {
    fc.assert(
      fc.property(fc.constantFrom(...ESTADOS), (estado) => {
        if (estado === "Disponible") {
          expect(canAssignPrenda(estado)).toBe(true);
        } else {
          expect(canAssignPrenda(estado)).toBe(false);
        }
      }),
    );
  });
});
