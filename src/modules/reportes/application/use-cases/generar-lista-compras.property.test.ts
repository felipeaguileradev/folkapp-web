import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { generarListaCompras } from "./generar-lista-compras.use-case";
import type { Prenda } from "@/modules/inventario/domain/entities";
import type {
  PrendaRepository,
  PrendaFilters,
} from "@/modules/inventario/domain/ports";
import type {
  EstadoPrenda,
  Genero,
  Categoria,
  Propietario,
} from "@/shared/types";

// --- Helpers ---

const ESTADOS: EstadoPrenda[] = [
  "Disponible",
  "En uso",
  "En reparación",
  "Faltante",
  "Prestada",
  "Dada de baja",
];
const GENEROS: Genero[] = ["Masculino", "Femenino", "Unisex"];
const CATEGORIAS: Categoria[] = [
  "Tocado",
  "Ropa superior",
  "Ropa inferior",
  "Calzado",
  "Accesorio",
  "Joyería",
];

function createMockPrenda(overrides: Partial<Prenda> = {}): Prenda {
  return {
    id: crypto.randomUUID(),
    codigoIdentificador: "MH-001",
    nombre: "Prenda test",
    cuadroId: "cuadro-1",
    genero: "Masculino",
    categoria: "Accesorio",
    color: null,
    tallaONumero: null,
    identificadorFisico: null,
    bailarinActualId: null,
    propietario: "Ballet",
    ubicacion: null,
    estado: "Disponible",
    fotoUrl: null,
    comentarios: null,
    fechaIngreso: new Date(),
    createdAt: new Date(),
    updatedAt: new Date(),
    ...overrides,
  };
}

function createMockPrendaRepo(prendas: Prenda[]): PrendaRepository {
  return {
    findById: async () => null,
    findAll: async (filters: PrendaFilters) => {
      let filtered = prendas;
      if (filters.estado)
        filtered = filtered.filter((p) => p.estado === filters.estado);
      if (filters.genero)
        filtered = filtered.filter((p) => p.genero === filters.genero);
      if (filters.cuadroId)
        filtered = filtered.filter((p) => p.cuadroId === filters.cuadroId);
      return {
        data: filtered,
        total: filtered.length,
        page: 1,
        pageSize: 10000,
        totalPages: 1,
      };
    },
    search: async () => [],
    create: async () => prendas[0],
    update: async () => prendas[0],
    delete: async () => {},
    getNextSequentialNumber: async () => 1,
    getSummary: async () => [],
  };
}

// --- Arbitraries ---

const prendaArb = fc
  .record({
    nombre: fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
    estado: fc.constantFrom(...ESTADOS),
    genero: fc.constantFrom(...GENEROS),
    categoria: fc.constantFrom(...CATEGORIAS),
    cuadroId: fc.constantFrom("cuadro-1", "cuadro-2", "cuadro-3"),
  })
  .map((fields) => createMockPrenda(fields));

// --- P23: Shopping list contains exactly "Faltante" items ---

describe("Lista de Compras - Property Tests", () => {
  it("P23: La lista de compras contiene exactamente las prendas con estado 'Faltante'", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(prendaArb, { minLength: 5, maxLength: 30 }),
        async (prendas) => {
          const repo = createMockPrendaRepo(prendas);
          const result = await generarListaCompras({ prendaRepository: repo });

          expect(result.success).toBe(true);
          if (!result.success) return;

          // Contar prendas faltantes en el input
          const faltantes = prendas.filter((p) => p.estado === "Faltante");

          // La suma de cantidades en la lista debe ser igual al total de faltantes
          const totalEnLista = result.data.reduce(
            (sum, item) => sum + item.cantidad,
            0,
          );
          expect(totalEnLista).toBe(faltantes.length);

          // Cada ítem en la lista debe corresponder a una prenda faltante real
          for (const item of result.data) {
            const matchingFaltantes = faltantes.filter(
              (p) =>
                p.cuadroId === item.cuadroNombre &&
                p.categoria === item.categoria &&
                p.nombre === item.nombre &&
                p.genero === item.genero,
            );
            expect(matchingFaltantes.length).toBe(item.cantidad);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it("P23.1: Sin prendas faltantes, la lista está vacía", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc
            .record({
              nombre: fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
              estado: fc.constantFrom(
                "Disponible" as const,
                "En uso" as const,
                "En reparación" as const,
                "Prestada" as const,
                "Dada de baja" as const,
              ),
              genero: fc.constantFrom(...GENEROS),
              categoria: fc.constantFrom(...CATEGORIAS),
            })
            .map((f) => createMockPrenda(f)),
          { minLength: 1, maxLength: 15 },
        ),
        async (prendas) => {
          const repo = createMockPrendaRepo(prendas);
          const result = await generarListaCompras({ prendaRepository: repo });

          expect(result.success).toBe(true);
          if (result.success) {
            expect(result.data).toHaveLength(0);
          }
        },
      ),
      { numRuns: 30 },
    );
  });

  it("P23.2: Prendas no-faltantes nunca aparecen en la lista", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(prendaArb, { minLength: 5, maxLength: 20 }),
        async (prendas) => {
          const repo = createMockPrendaRepo(prendas);
          const result = await generarListaCompras({ prendaRepository: repo });

          if (!result.success) return;

          // Obtener nombres de prendas no-faltantes
          const noFaltantes = prendas.filter((p) => p.estado !== "Faltante");

          for (const item of result.data) {
            // Verificar que no hay un ítem que solo corresponda a prendas no-faltantes
            const esSoloNoFaltante =
              noFaltantes.some(
                (p) =>
                  p.cuadroId === item.cuadroNombre &&
                  p.nombre === item.nombre &&
                  p.categoria === item.categoria &&
                  p.genero === item.genero,
              ) &&
              !prendas.some(
                (p) =>
                  p.estado === "Faltante" &&
                  p.cuadroId === item.cuadroNombre &&
                  p.nombre === item.nombre &&
                  p.categoria === item.categoria &&
                  p.genero === item.genero,
              );

            expect(esSoloNoFaltante).toBe(false);
          }
        },
      ),
      { numRuns: 30 },
    );
  });

  it("P23.3: La lista está agrupada por cuadro (ordenada)", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(
          fc
            .record({
              nombre: fc.stringMatching(/^[A-Z][a-z]{2,10}$/),
              estado: fc.constant("Faltante" as const),
              genero: fc.constantFrom(...GENEROS),
              categoria: fc.constantFrom(...CATEGORIAS),
              cuadroId: fc.constantFrom("cuadro-1", "cuadro-2", "cuadro-3"),
            })
            .map((f) => createMockPrenda(f)),
          { minLength: 3, maxLength: 15 },
        ),
        async (prendas) => {
          const repo = createMockPrendaRepo(prendas);
          const result = await generarListaCompras({ prendaRepository: repo });

          if (!result.success || result.data.length < 2) return;

          // Verificar que está ordenada por cuadroNombre
          for (let i = 1; i < result.data.length; i++) {
            expect(
              result.data[i - 1].cuadroNombre.localeCompare(
                result.data[i].cuadroNombre,
              ),
            ).toBeLessThanOrEqual(0);
          }
        },
      ),
      { numRuns: 30 },
    );
  });
});
