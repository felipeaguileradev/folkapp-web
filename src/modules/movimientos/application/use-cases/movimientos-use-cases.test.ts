import { describe, it, expect, vi } from "vitest";
import { asignarPrenda } from "./asignar-prenda.use-case";
import { prestarPrenda } from "./prestar-prenda.use-case";
import { devolverPrenda } from "./devolver-prenda.use-case";
import { traspasarPrenda } from "./traspasar-prenda.use-case";
import { obtenerMovimientosActivos } from "./obtener-movimientos-activos.use-case";
import type { MovimientoRepository } from "../../domain/ports";
import type { PrendaRepository } from "@/modules/inventario/domain/ports";
import type { Prenda } from "@/modules/inventario/domain/entities";
import type { Movimiento } from "../../domain/entities";

// --- Helpers para crear mocks ---

function createMockPrenda(overrides: Partial<Prenda> = {}): Prenda {
  return {
    id: "prenda-1",
    codigoIdentificador: "MH-001",
    nombre: "Manta",
    cuadroId: "cuadro-1",
    genero: "Masculino",
    categoria: "Ropa superior",
    color: null,
    tallaONumero: null,
    identificadorFisico: null,
    bailarinActualId: null,
    propietario: "Ballet",
    ubicacion: null,
    estado: "Disponible",
    fotoUrl: null,
    comentarios: null,
    fechaIngreso: new Date("2024-01-01"),
    createdAt: new Date("2024-01-01"),
    updatedAt: new Date("2024-01-01"),
    ...overrides,
  };
}

function createMockMovimiento(overrides: Partial<Movimiento> = {}): Movimiento {
  return {
    id: "mov-1",
    prendaId: "prenda-1",
    bailarinId: "bailarin-1",
    bailarinDestinoId: null,
    tipo: "Asignación",
    fechaInicio: new Date("2024-06-01"),
    fechaDevolucionEsperada: null,
    devuelta: false,
    registradoPor: "user-1",
    observacion: null,
    estadoResultante: "En uso",
    createdAt: new Date("2024-06-01"),
    ...overrides,
  };
}

function createMockMovimientoRepository(
  overrides: Partial<MovimientoRepository> = {},
): MovimientoRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findActivos: vi.fn().mockResolvedValue([]),
    findByPrenda: vi.fn().mockResolvedValue([]),
    findByBailarin: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockImplementation(async (dto) => ({
      id: "mov-new",
      ...dto,
      createdAt: new Date(),
    })),
    marcarDevuelto: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

function createMockPrendaRepository(
  overrides: Partial<PrendaRepository> = {},
): PrendaRepository {
  return {
    findById: vi.fn().mockResolvedValue(null),
    findAll: vi.fn().mockResolvedValue({
      data: [],
      total: 0,
      page: 1,
      pageSize: 10,
      totalPages: 0,
    }),
    search: vi.fn().mockResolvedValue([]),
    create: vi.fn().mockResolvedValue(createMockPrenda()),
    update: vi.fn().mockResolvedValue(createMockPrenda()),
    delete: vi.fn().mockResolvedValue(undefined),
    getNextSequentialNumber: vi.fn().mockResolvedValue(1),
    getSummary: vi.fn().mockResolvedValue([]),
    ...overrides,
  };
}

// --- Tests ---

describe("AsignarPrendaUseCase", () => {
  it("asigna una prenda disponible correctamente", async () => {
    const prenda = createMockPrenda({ estado: "Disponible" });
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(prenda),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await asignarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "prenda-1",
        bailarinId: "bailarin-1",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipo).toBe("Asignación");
      expect(result.data.estadoResultante).toBe("En uso");
      expect(result.data.prendaId).toBe("prenda-1");
      expect(result.data.bailarinId).toBe("bailarin-1");
      expect(result.data.devuelta).toBe(false);
    }
    expect(movimientoRepository.create).toHaveBeenCalledOnce();
  });

  it("rechaza asignación si la prenda no está disponible", async () => {
    const prenda = createMockPrenda({
      estado: "En uso",
      bailarinActualId: "otro-bailarin",
    });
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(prenda),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await asignarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "prenda-1",
        bailarinId: "bailarin-1",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("no está disponible");
    }
    expect(movimientoRepository.create).not.toHaveBeenCalled();
  });

  it("rechaza asignación si la prenda no existe", async () => {
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(null),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await asignarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "no-existe",
        bailarinId: "bailarin-1",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("no encontrada");
    }
  });
});

describe("PrestarPrendaUseCase", () => {
  it("presta una prenda disponible como préstamo interno", async () => {
    const prenda = createMockPrenda({ estado: "Disponible" });
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(prenda),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await prestarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "prenda-1",
        bailarinId: "bailarin-1",
        tipo: "Préstamo interno",
        registradoPor: "user-1",
        fechaDevolucionEsperada: new Date("2024-12-31"),
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipo).toBe("Préstamo interno");
      expect(result.data.estadoResultante).toBe("Prestada");
    }
  });

  it("presta una prenda disponible como préstamo externo", async () => {
    const prenda = createMockPrenda({ estado: "Disponible" });
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(prenda),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await prestarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "prenda-1",
        bailarinId: "bailarin-1",
        tipo: "Préstamo externo",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipo).toBe("Préstamo externo");
      expect(result.data.estadoResultante).toBe("Prestada");
    }
  });

  it("rechaza préstamo si la prenda no está disponible", async () => {
    const prenda = createMockPrenda({ estado: "Prestada" });
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(prenda),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await prestarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "prenda-1",
        bailarinId: "bailarin-1",
        tipo: "Préstamo interno",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(false);
    expect(movimientoRepository.create).not.toHaveBeenCalled();
  });
});

describe("DevolverPrendaUseCase", () => {
  it("devuelve un movimiento activo correctamente", async () => {
    const movimiento = createMockMovimiento({ devuelta: false });
    const movimientoRepository = createMockMovimientoRepository({
      findById: vi.fn().mockResolvedValue(movimiento),
    });

    const result = await devolverPrenda(
      { movimientoRepository },
      { movimientoId: "mov-1" },
    );

    expect(result.success).toBe(true);
    expect(movimientoRepository.marcarDevuelto).toHaveBeenCalledWith("mov-1");
  });

  it("rechaza devolución si el movimiento ya fue devuelto", async () => {
    const movimiento = createMockMovimiento({ devuelta: true });
    const movimientoRepository = createMockMovimientoRepository({
      findById: vi.fn().mockResolvedValue(movimiento),
    });

    const result = await devolverPrenda(
      { movimientoRepository },
      { movimientoId: "mov-1" },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("ya fue devuelto");
    }
    expect(movimientoRepository.marcarDevuelto).not.toHaveBeenCalled();
  });

  it("rechaza devolución si el movimiento no existe", async () => {
    const movimientoRepository = createMockMovimientoRepository({
      findById: vi.fn().mockResolvedValue(null),
    });

    const result = await devolverPrenda(
      { movimientoRepository },
      { movimientoId: "no-existe" },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain("no encontrado");
    }
  });
});

describe("TraspasarPrendaUseCase", () => {
  it("traspasa una prenda entre bailarines preservando el estado", async () => {
    const prenda = createMockPrenda({
      estado: "En uso",
      bailarinActualId: "bailarin-origen",
    });
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(prenda),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await traspasarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "prenda-1",
        bailarinOrigenId: "bailarin-origen",
        bailarinDestinoId: "bailarin-destino",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tipo).toBe("Traspaso");
      expect(result.data.bailarinDestinoId).toBe("bailarin-destino");
      expect(result.data.estadoResultante).toBe("En uso"); // preservado
    }
  });

  it("rechaza traspaso si la prenda no está asignada al bailarín de origen", async () => {
    const prenda = createMockPrenda({
      estado: "En uso",
      bailarinActualId: "otro-bailarin",
    });
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(prenda),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await traspasarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "prenda-1",
        bailarinOrigenId: "bailarin-origen",
        bailarinDestinoId: "bailarin-destino",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(false);
    if (!result.success) {
      expect(result.error.message).toContain(
        "no está asignada al bailarín de origen",
      );
    }
    expect(movimientoRepository.create).not.toHaveBeenCalled();
  });

  it("rechaza traspaso si la prenda no existe", async () => {
    const prendaRepository = createMockPrendaRepository({
      findById: vi.fn().mockResolvedValue(null),
    });
    const movimientoRepository = createMockMovimientoRepository();

    const result = await traspasarPrenda(
      { movimientoRepository, prendaRepository },
      {
        prendaId: "no-existe",
        bailarinOrigenId: "bailarin-origen",
        bailarinDestinoId: "bailarin-destino",
        registradoPor: "user-1",
      },
    );

    expect(result.success).toBe(false);
  });
});

describe("ObtenerMovimientosActivosUseCase", () => {
  it("retorna movimientos activos con isVencido=false cuando no están vencidos", async () => {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + 30);

    const movimientos: Movimiento[] = [
      createMockMovimiento({
        id: "mov-1",
        devuelta: false,
        fechaDevolucionEsperada: futureDate,
      }),
    ];
    const movimientoRepository = createMockMovimientoRepository({
      findActivos: vi.fn().mockResolvedValue(movimientos),
    });

    const result = await obtenerMovimientosActivos(
      { movimientoRepository },
      { filters: {} },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isVencido).toBe(false);
    }
  });

  it("marca movimientos como vencidos cuando la fecha de devolución ya pasó", async () => {
    const pastDate = new Date("2023-01-01");

    const movimientos: Movimiento[] = [
      createMockMovimiento({
        id: "mov-1",
        devuelta: false,
        fechaDevolucionEsperada: pastDate,
      }),
    ];
    const movimientoRepository = createMockMovimientoRepository({
      findActivos: vi.fn().mockResolvedValue(movimientos),
    });

    const result = await obtenerMovimientosActivos(
      { movimientoRepository },
      { filters: {} },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data).toHaveLength(1);
      expect(result.data[0].isVencido).toBe(true);
    }
  });

  it("movimientos sin fecha de devolución esperada no están vencidos", async () => {
    const movimientos: Movimiento[] = [
      createMockMovimiento({
        id: "mov-1",
        devuelta: false,
        fechaDevolucionEsperada: null,
      }),
    ];
    const movimientoRepository = createMockMovimientoRepository({
      findActivos: vi.fn().mockResolvedValue(movimientos),
    });

    const result = await obtenerMovimientosActivos(
      { movimientoRepository },
      { filters: {} },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data[0].isVencido).toBe(false);
    }
  });

  it("siempre filtra por devuelta=false", async () => {
    const movimientoRepository = createMockMovimientoRepository();

    await obtenerMovimientosActivos(
      { movimientoRepository },
      { filters: { tipo: "Asignación" } },
    );

    expect(movimientoRepository.findActivos).toHaveBeenCalledWith({
      tipo: "Asignación",
      devuelta: false,
    });
  });
});
