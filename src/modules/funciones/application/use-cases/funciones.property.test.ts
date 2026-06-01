import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { crearFuncion } from "./crear-funcion.use-case";
import { finalizarFuncion } from "./finalizar-funcion.use-case";
import type {
  CrearFuncionDeps,
  PlantillaPort,
  BailarinPort,
} from "./crear-funcion.use-case";
import type {
  Funcion,
  ChecklistItem,
  CreateChecklistItemDTO,
  CreateFuncionDTO,
} from "../../domain/entities";
import type {
  FuncionRepository,
  ChecklistRepository,
} from "../../domain/ports";
import type {
  GeneroBailarin,
  Categoria,
  EstadoVerificacion,
} from "@/shared/types";

// --- Helpers ---

const CATEGORIAS: Categoria[] = [
  "Tocado",
  "Ropa superior",
  "Ropa inferior",
  "Calzado",
  "Accesorio",
  "Joyería",
];

function createMockFuncion(overrides: Partial<Funcion> = {}): Funcion {
  return {
    id: crypto.randomUUID(),
    nombre: "Test Función",
    fecha: new Date(),
    lugar: null,
    estado: "Pendiente",
    cuadrosQueSePresenten: ["cuadro-1"],
    bailarinesConvocados: ["bailarin-1"],
    resultadoChecklist: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockChecklistItem(
  overrides: Partial<ChecklistItem> = {},
): ChecklistItem {
  return {
    id: crypto.randomUUID(),
    funcionId: "funcion-1",
    bailarinId: "bailarin-1",
    prendaNombre: "Prenda test",
    prendaCategoria: "Accesorio",
    estado: "pendiente",
    verificadoPor: null,
    fechaVerificacion: null,
    createdAt: new Date(),
    ...overrides,
  };
}

function createMockFuncionRepo(funciones: Funcion[] = []): FuncionRepository {
  return {
    findAll: async () => funciones,
    findById: async (id) => funciones.find((f) => f.id === id) ?? null,
    create: async (dto: CreateFuncionDTO) => {
      const funcion = createMockFuncion({ ...dto, id: crypto.randomUUID() });
      funciones.push(funcion);
      return funcion;
    },
    updateEstado: async (id, estado) => {
      const f = funciones.find((fn) => fn.id === id);
      if (f) (f as any).estado = estado;
    },
    saveResultado: async (id, resultado) => {
      const f = funciones.find((fn) => fn.id === id);
      if (f) f.resultadoChecklist = resultado;
    },
  };
}

function createMockChecklistRepo(): ChecklistRepository & {
  items: ChecklistItem[];
} {
  const items: ChecklistItem[] = [];
  return {
    items,
    findByFuncion: async (funcionId) =>
      items.filter((i) => i.funcionId === funcionId),
    findByFuncionAndBailarin: async (funcionId, bailarinId) =>
      items.filter(
        (i) => i.funcionId === funcionId && i.bailarinId === bailarinId,
      ),
    createMany: async (dtos: CreateChecklistItemDTO[]) => {
      const created = dtos.map((dto) => createMockChecklistItem(dto));
      items.push(...created);
      return created;
    },
    updateEstado: async (id, estado, verificadoPor) => {
      const item = items.find((i) => i.id === id);
      if (item) {
        item.estado = estado;
        item.verificadoPor = verificadoPor;
        item.fechaVerificacion = new Date();
      }
    },
  };
}

// --- P21: Checklist generation completeness ---

describe("Checklist Generation - Property Tests", () => {
  it("P21: Se genera exactamente 1 ítem por cada (bailarín × plantilla item) donde el bailarín participa en el cuadro", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Número de bailarines (1-5)
        fc.integer({ min: 1, max: 5 }),
        // Número de ítems en la plantilla (1-8)
        fc.integer({ min: 1, max: 8 }),
        async (numBailarines, numPlantillaItems) => {
          const cuadroId = "cuadro-1";

          // Crear bailarines que participan en el cuadro
          const bailarinIds = Array.from(
            { length: numBailarines },
            (_, i) => `bailarin-${i}`,
          );

          // Crear plantilla
          const plantillaItems = Array.from(
            { length: numPlantillaItems },
            (_, i) => ({
              categoria: CATEGORIAS[i % CATEGORIAS.length],
              nombrePrenda: `Prenda${i}`,
            }),
          );

          const bailarinRepo: BailarinPort = {
            findById: async (id) => ({
              id,
              genero: "Masculino" as GeneroBailarin,
              cuadrosActivos: [cuadroId],
            }),
          };

          const plantillaRepo: PlantillaPort = {
            findByCuadroYGenero: async () => plantillaItems,
          };

          const checklistRepo = createMockChecklistRepo();
          const funcionRepo = createMockFuncionRepo();

          const result = await crearFuncion(
            {
              funcionRepository: funcionRepo,
              checklistRepository: checklistRepo,
              plantillaRepository: plantillaRepo,
              bailarinRepository: bailarinRepo,
            },
            {
              nombre: "Test función",
              fecha: new Date(),
              lugar: null,
              cuadrosQueSePresenten: [cuadroId],
              bailarinesConvocados: bailarinIds,
            },
          );

          expect(result.success).toBe(true);
          if (result.success) {
            const expectedTotal = numBailarines * numPlantillaItems;
            expect(result.data.checklistItems).toHaveLength(expectedTotal);

            // Verificar que cada bailarín tiene exactamente numPlantillaItems ítems
            for (const bailarinId of bailarinIds) {
              const itemsForBailarin = result.data.checklistItems.filter(
                (item) => item.bailarinId === bailarinId,
              );
              expect(itemsForBailarin).toHaveLength(numPlantillaItems);
            }
          }
        },
      ),
      { numRuns: 30 },
    );
  });

  it("P21.1: Bailarín que NO participa en el cuadro no genera ítems", async () => {
    const cuadroId = "cuadro-1";
    const bailarinId = "bailarin-no-participa";

    const bailarinRepo: BailarinPort = {
      findById: async () => ({
        id: bailarinId,
        genero: "Masculino" as GeneroBailarin,
        cuadrosActivos: ["otro-cuadro"], // No participa en cuadro-1
      }),
    };

    const plantillaRepo: PlantillaPort = {
      findByCuadroYGenero: async () => [
        { categoria: "Accesorio", nombrePrenda: "Prenda1" },
      ],
    };

    const checklistRepo = createMockChecklistRepo();
    const funcionRepo = createMockFuncionRepo();

    const result = await crearFuncion(
      {
        funcionRepository: funcionRepo,
        checklistRepository: checklistRepo,
        plantillaRepository: plantillaRepo,
        bailarinRepository: bailarinRepo,
      },
      {
        nombre: "Test",
        fecha: new Date(),
        lugar: null,
        cuadrosQueSePresenten: [cuadroId],
        bailarinesConvocados: [bailarinId],
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.checklistItems).toHaveLength(0);
    }
  });

  it("P21.2: Sin plantilla definida no genera ítems", async () => {
    const cuadroId = "cuadro-1";
    const bailarinId = "bailarin-1";

    const bailarinRepo: BailarinPort = {
      findById: async () => ({
        id: bailarinId,
        genero: "Masculino" as GeneroBailarin,
        cuadrosActivos: [cuadroId],
      }),
    };

    const plantillaRepo: PlantillaPort = {
      findByCuadroYGenero: async () => [], // Sin plantilla
    };

    const checklistRepo = createMockChecklistRepo();
    const funcionRepo = createMockFuncionRepo();

    const result = await crearFuncion(
      {
        funcionRepository: funcionRepo,
        checklistRepository: checklistRepo,
        plantillaRepository: plantillaRepo,
        bailarinRepository: bailarinRepo,
      },
      {
        nombre: "Test",
        fecha: new Date(),
        lugar: null,
        cuadrosQueSePresenten: [cuadroId],
        bailarinesConvocados: [bailarinId],
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.checklistItems).toHaveLength(0);
    }
  });
});

// --- P22: Checklist statistics correctness ---

describe("Checklist Statistics - Property Tests", () => {
  it("P22: verificados + faltantes + pendientes = total siempre", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 20 }),
        fc.array(
          fc.constantFrom(
            "pendiente" as const,
            "verificado" as const,
            "faltante" as const,
          ),
          { minLength: 1, maxLength: 20 },
        ),
        async (totalItems, estados) => {
          const funcionId = "funcion-1";
          const funcion = createMockFuncion({
            id: funcionId,
            estado: "En curso",
          });
          const funcionRepo = createMockFuncionRepo([funcion]);

          // Crear ítems con los estados dados
          const items: ChecklistItem[] = estados.map((estado, i) =>
            createMockChecklistItem({
              funcionId,
              bailarinId: `bailarin-${i % 3}`,
              prendaNombre: `Prenda${i}`,
              estado,
            }),
          );

          const checklistRepo = createMockChecklistRepo();
          checklistRepo.items.push(...items);

          const result = await finalizarFuncion(
            {
              funcionRepository: funcionRepo,
              checklistRepository: checklistRepo,
            },
            { funcionId },
          );

          expect(result.success).toBe(true);
          if (result.success) {
            const {
              verificados,
              faltantes,
              pendientes,
              totalItems: total,
            } = result.data;

            // La invariante principal: la suma siempre es igual al total
            expect(verificados + faltantes + pendientes).toBe(total);

            // El total coincide con la cantidad de ítems
            expect(total).toBe(items.length);

            // Cada contador coincide con los estados reales
            const expectedVerificados = items.filter(
              (i) => i.estado === "verificado",
            ).length;
            const expectedFaltantes = items.filter(
              (i) => i.estado === "faltante",
            ).length;
            const expectedPendientes = items.filter(
              (i) => i.estado === "pendiente",
            ).length;

            expect(verificados).toBe(expectedVerificados);
            expect(faltantes).toBe(expectedFaltantes);
            expect(pendientes).toBe(expectedPendientes);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it("P22.1: Función ya finalizada no se puede finalizar de nuevo", async () => {
    const funcionId = "funcion-1";
    const funcion = createMockFuncion({ id: funcionId, estado: "Finalizada" });
    const funcionRepo = createMockFuncionRepo([funcion]);
    const checklistRepo = createMockChecklistRepo();

    const result = await finalizarFuncion(
      { funcionRepository: funcionRepo, checklistRepository: checklistRepo },
      { funcionId },
    );

    expect(result.success).toBe(false);
  });

  it("P22.2: Checklist vacío produce todos los contadores en 0", async () => {
    const funcionId = "funcion-1";
    const funcion = createMockFuncion({ id: funcionId, estado: "En curso" });
    const funcionRepo = createMockFuncionRepo([funcion]);
    const checklistRepo = createMockChecklistRepo();
    // No agregar ítems

    const result = await finalizarFuncion(
      { funcionRepository: funcionRepo, checklistRepository: checklistRepo },
      { funcionId },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.totalItems).toBe(0);
      expect(result.data.verificados).toBe(0);
      expect(result.data.faltantes).toBe(0);
      expect(result.data.pendientes).toBe(0);
    }
  });
});
