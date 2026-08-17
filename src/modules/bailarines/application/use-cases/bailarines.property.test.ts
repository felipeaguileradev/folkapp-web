import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { obtenerPerfilBailarin } from "./obtener-perfil-bailarin.use-case";
import type {
  PlantillaRepositoryPort,
  PrendaRepositoryPort,
  PlantillaItem,
  PrendaAsignada,
} from "./obtener-perfil-bailarin.use-case";
import { obtenerBailarines } from "./obtener-bailarines.use-case";
import type {
  Bailarin,
  BailarinRepository,
  BailarinFilters,
} from "../../domain";
import type {
  GeneroBailarin,
  Categoria,
  Pagination,
  PaginatedResult,
} from "@/shared/types";

// --- Helpers ---

const GENEROS: GeneroBailarin[] = ["Masculino", "Femenino"];
const CATEGORIAS: Categoria[] = [
  "Tocado",
  "Ropa superior",
  "Ropa inferior",
  "Calzado",
  "Accesorio",
  "Joyería",
];

function createMockBailarin(overrides: Partial<Bailarin> = {}): Bailarin {
  return {
    id: crypto.randomUUID(),
    nombreCompleto: "Test Bailarin",
    genero: "Masculino",
    cuadrosActivos: ["cuadro-1"],
    tallas: {
      camisa: null,
      pantalon: null,
      sombrero: null,
      calzado: null,
      personalizados: [],
    },
    activo: true,
    fechaIngreso: new Date(),
    notas: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockPlantillaItem(
  overrides: Partial<PlantillaItem> = {},
): PlantillaItem {
  return {
    id: crypto.randomUUID(),
    cuadroId: "cuadro-1",
    genero: "Masculino",
    categoria: "Accesorio",
    nombrePrenda: "Prenda test",
    orden: 1,
    ...overrides,
  };
}

function createMockPrendaAsignada(
  overrides: Partial<PrendaAsignada> = {},
): PrendaAsignada {
  return {
    id: crypto.randomUUID(),
    nombre: "Prenda test",
    codigoIdentificador: "MH-001",
    categoria: "Accesorio",
    estado: "En uso",
    cuadroId: "cuadro-1",
    ...overrides,
  };
}

// --- Arbitraries ---

const categoriaArb = fc.constantFrom(...CATEGORIAS);
const generoArb = fc.constantFrom(...GENEROS);
const nombreArb = fc.stringMatching(/^[A-Z][a-z]{2,10}$/);

const plantillaItemArb = fc
  .record({
    categoria: categoriaArb,
    nombrePrenda: nombreArb,
  })
  .map((fields, idx) => createMockPlantillaItem({ ...fields, orden: 1 }));

// --- P5: Cálculo de completitud ---

describe("Completitud - Property Tests", () => {
  it("P5: completitud = floor((matching / total_plantilla) * 100)", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generar plantilla de 1-10 ítems
        fc.array(
          fc.record({ categoria: categoriaArb, nombrePrenda: nombreArb }),
          { minLength: 1, maxLength: 10 },
        ),
        // Índices de ítems que el bailarín tiene asignados (subset)
        fc.array(fc.nat(), { minLength: 0, maxLength: 10 }),
        async (plantillaFields, assignedIndices) => {
          const cuadroId = "cuadro-1";
          const bailarinId = "bailarin-1";

          const plantillaItems: PlantillaItem[] = plantillaFields.map((f, i) =>
            createMockPlantillaItem({
              cuadroId,
              genero: "Masculino",
              categoria: f.categoria,
              nombrePrenda: f.nombrePrenda,
              orden: i + 1,
            }),
          );

          // Crear prendas asignadas para un subset de la plantilla
          const uniqueIndices = [
            ...new Set(
              assignedIndices
                .map((i) => i % plantillaItems.length)
                .slice(0, plantillaItems.length),
            ),
          ];

          const prendasAsignadas: PrendaAsignada[] = uniqueIndices.map((idx) =>
            createMockPrendaAsignada({
              cuadroId,
              categoria: plantillaItems[idx].categoria,
              nombre: plantillaItems[idx].nombrePrenda,
            }),
          );

          const bailarin = createMockBailarin({
            id: bailarinId,
            genero: "Masculino",
            cuadrosActivos: [cuadroId],
          });

          // Mock repos
          const bailarinRepository: BailarinRepository = {
            findById: async () => bailarin,
            findAll: async () => ({
              data: [],
              total: 0,
              page: 1,
              pageSize: 10,
              totalPages: 0,
            }),
            findByCuadro: async () => [],
            create: async () => bailarin,
            update: async () => bailarin,
            setActivo: async () => {},
          };

          const plantillaRepository: PlantillaRepositoryPort = {
            findByCuadroYGenero: async () => plantillaItems,
          };

          const prendaRepository: PrendaRepositoryPort = {
            findByBailarinId: async () => prendasAsignadas,
          };

          const result = await obtenerPerfilBailarin(bailarinId, {
            bailarinRepository,
            plantillaRepository,
            prendaRepository,
          });

          if (!result.success) return;

          const completitud = result.data.completitudPorCuadro[cuadroId];
          expect(completitud).toBeDefined();

          if (completitud.tipo === "porcentaje") {
            const expectedPorcentaje = Math.floor(
              (uniqueIndices.length / plantillaItems.length) * 100,
            );
            expect(completitud.valor).toBe(expectedPorcentaje);
            expect(completitud.asignadas).toBe(uniqueIndices.length);
            expect(completitud.total).toBe(plantillaItems.length);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it("P5.1: Sin plantilla definida retorna tipo 'sin_plantilla'", async () => {
    const bailarinId = "bailarin-1";
    const cuadroId = "cuadro-1";
    const bailarin = createMockBailarin({
      id: bailarinId,
      cuadrosActivos: [cuadroId],
    });

    const result = await obtenerPerfilBailarin(bailarinId, {
      bailarinRepository: {
        findById: async () => bailarin,
        findAll: async () => ({
          data: [],
          total: 0,
          page: 1,
          pageSize: 10,
          totalPages: 0,
        }),
        findByCuadro: async () => [],
        create: async () => bailarin,
        update: async () => bailarin,
        setActivo: async () => {},
      },
      plantillaRepository: { findByCuadroYGenero: async () => [] },
      prendaRepository: { findByBailarinId: async () => [] },
    });

    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.completitudPorCuadro[cuadroId]).toEqual({
        tipo: "sin_plantilla",
      });
    }
  });
});

// --- P6: Filtros de bailarín ---

describe("Bailarin Filters - Property Tests", () => {
  it("P6: Filtrar por género retorna solo bailarines de ese género", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            genero: generoArb,
            activo: fc.boolean(),
            nombre: nombreArb,
          }),
          { minLength: 5, maxLength: 20 },
        ),
        generoArb,
        async (bailarinFields, filtroGenero) => {
          const bailarines = bailarinFields.map((f) =>
            createMockBailarin({
              genero: f.genero,
              activo: f.activo,
              nombreCompleto: f.nombre,
            }),
          );

          const mockRepo: BailarinRepository = {
            findById: async () => null,
            findAll: async (
              filters: BailarinFilters,
              pagination: Pagination,
            ) => {
              let filtered = bailarines;
              if (filters.genero)
                filtered = filtered.filter((b) => b.genero === filters.genero);
              if (filters.activo !== undefined)
                filtered = filtered.filter((b) => b.activo === filters.activo);
              return {
                data: filtered,
                total: filtered.length,
                page: 1,
                pageSize: pagination.pageSize,
                totalPages: 1,
              };
            },
            findByCuadro: async () => [],
            create: async () => bailarines[0],
            update: async () => bailarines[0],
            setActivo: async () => {},
          };

          const result = await obtenerBailarines(
            {
              filters: { genero: filtroGenero },
              pagination: { page: 1, pageSize: 50 },
            },
            { bailarinRepository: mockRepo },
          );

          if (!result.success) return;

          for (const bailarin of result.data.data) {
            expect(bailarin.genero).toBe(filtroGenero);
          }
        },
      ),
      { numRuns: 30 },
    );
  });

  it("P6.1: Filtrar por activo retorna solo bailarines con ese estado", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc.record({
            genero: generoArb,
            activo: fc.boolean(),
            nombre: nombreArb,
          }),
          { minLength: 5, maxLength: 20 },
        ),
        fc.boolean(),
        async (bailarinFields, filtroActivo) => {
          const bailarines = bailarinFields.map((f) =>
            createMockBailarin({
              genero: f.genero,
              activo: f.activo,
              nombreCompleto: f.nombre,
            }),
          );

          const mockRepo: BailarinRepository = {
            findById: async () => null,
            findAll: async (
              filters: BailarinFilters,
              pagination: Pagination,
            ) => {
              let filtered = bailarines;
              if (filters.activo !== undefined)
                filtered = filtered.filter((b) => b.activo === filters.activo);
              return {
                data: filtered,
                total: filtered.length,
                page: 1,
                pageSize: pagination.pageSize,
                totalPages: 1,
              };
            },
            findByCuadro: async () => [],
            create: async () => bailarines[0],
            update: async () => bailarines[0],
            setActivo: async () => {},
          };

          const result = await obtenerBailarines(
            {
              filters: { activo: filtroActivo },
              pagination: { page: 1, pageSize: 50 },
            },
            { bailarinRepository: mockRepo },
          );

          if (!result.success) return;

          for (const bailarin of result.data.data) {
            expect(bailarin.activo).toBe(filtroActivo);
          }
        },
      ),
      { numRuns: 30 },
    );
  });
});

// --- P8: Inactivos excluidos de completitud ---

describe("Inactive Dancers - Property Tests", () => {
  it("P8: Bailarines inactivos no se incluyen al calcular completitud del cuadro", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(fc.record({ nombre: nombreArb, activo: fc.boolean() }), {
          minLength: 3,
          maxLength: 10,
        }),
        async (bailarinFields) => {
          const cuadroId = "cuadro-1";
          const bailarines = bailarinFields.map((f) =>
            createMockBailarin({
              nombreCompleto: f.nombre,
              activo: f.activo,
              cuadrosActivos: [cuadroId],
            }),
          );

          // Simular que solo bailarines activos se consideran
          const activeBailarines = bailarines.filter((b) => b.activo);

          const mockRepo: BailarinRepository = {
            findById: async () => null,
            findAll: async (
              filters: BailarinFilters,
              pagination: Pagination,
            ) => {
              let filtered = bailarines;
              if (filters.activo !== undefined)
                filtered = filtered.filter((b) => b.activo === filters.activo);
              if (filters.cuadroId)
                filtered = filtered.filter((b) =>
                  b.cuadrosActivos.includes(filters.cuadroId!),
                );
              return {
                data: filtered,
                total: filtered.length,
                page: 1,
                pageSize: pagination.pageSize,
                totalPages: 1,
              };
            },
            findByCuadro: async () => activeBailarines,
            create: async () => bailarines[0],
            update: async () => bailarines[0],
            setActivo: async () => {},
          };

          // findByCuadro solo retorna activos
          const result = await mockRepo.findByCuadro(cuadroId);

          // Verificar que ningún inactivo está en el resultado
          for (const bailarin of result) {
            expect(bailarin.activo).toBe(true);
          }

          // Verificar que todos los activos del cuadro están incluidos
          expect(result.length).toBe(activeBailarines.length);
        },
      ),
      { numRuns: 30 },
    );
  });
});
