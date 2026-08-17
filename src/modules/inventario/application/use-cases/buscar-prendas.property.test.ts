import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { buscarPrendas } from "./buscar-prendas.use-case";
import type { Prenda } from "../../domain/entities";
import type { PrendaRepository, PrendaFilters } from "../../domain/ports";
import type {
  Genero,
  Categoria,
  EstadoPrenda,
  Propietario,
} from "@/shared/types";

// --- Helpers ---

const GENEROS: Genero[] = ["Masculino", "Femenino", "Unisex"];
const CATEGORIAS: Categoria[] = [
  "Tocado",
  "Ropa superior",
  "Ropa inferior",
  "Calzado",
  "Accesorio",
  "Joyería",
];
const ESTADOS: EstadoPrenda[] = [
  "Disponible",
  "En uso",
  "En reparación",
  "Faltante",
  "Prestada",
  "Dada de baja",
];
const PROPIETARIOS: Propietario[] = ["Ballet", "Personal"];

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

// Arbitraries
const prendaArb = fc
  .record({
    nombre: fc.stringMatching(/^[a-zA-Z]{3,20}$/),
    codigoIdentificador: fc.stringMatching(/^[A-Z]{2}-\d{3}$/),
    genero: fc.constantFrom(...GENEROS),
    categoria: fc.constantFrom(...CATEGORIAS),
    estado: fc.constantFrom(...ESTADOS),
    propietario: fc.constantFrom(...PROPIETARIOS),
  })
  .map((fields) => createMockPrenda(fields));

const searchTermArb = fc.stringMatching(/^[a-zA-Z]{2,8}$/);

function createMockRepository(prendas: Prenda[]): PrendaRepository {
  return {
    findById: async () => null,
    findAll: async () => ({
      data: prendas,
      total: prendas.length,
      page: 1,
      pageSize: 10,
      totalPages: 1,
    }),
    search: async (query: string, filters: PrendaFilters) => {
      const lowerQuery = query.toLowerCase();
      return prendas.filter((p) => {
        const matchesQuery =
          p.nombre.toLowerCase().includes(lowerQuery) ||
          p.codigoIdentificador.toLowerCase().includes(lowerQuery);
        const matchesFilters =
          (!filters.genero || p.genero === filters.genero) &&
          (!filters.categoria || p.categoria === filters.categoria) &&
          (!filters.estado || p.estado === filters.estado) &&
          (!filters.propietario || p.propietario === filters.propietario) &&
          (!filters.cuadroId || p.cuadroId === filters.cuadroId);
        return matchesQuery && matchesFilters;
      });
    },
    create: async (dto) => createMockPrenda(dto as Partial<Prenda>),
    update: async (id, data) => createMockPrenda({ id, ...data }),
    delete: async () => {},
    getNextSequentialNumber: async () => 1,
    getSummary: async () => [],
  };
}

describe("BuscarPrendas - Property Tests", () => {
  it("P2: La búsqueda solo retorna prendas cuyo nombre o código contiene el término", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(prendaArb, { minLength: 1, maxLength: 20 }),
        searchTermArb,
        async (prendas, searchTerm) => {
          const repository = createMockRepository(prendas);
          const result = await buscarPrendas(
            { prendaRepository: repository },
            { query: searchTerm },
          );
          if (!result.success) return;
          const lowerTerm = searchTerm.toLowerCase();
          for (const prenda of result.data) {
            const matches =
              prenda.nombre.toLowerCase().includes(lowerTerm) ||
              prenda.codigoIdentificador.toLowerCase().includes(lowerTerm);
            expect(matches).toBe(true);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it("P2.1: Búsqueda con menos de 2 caracteres retorna error", async () => {
    await fc.assert(
      fc.asyncProperty(fc.stringMatching(/^[a-z]?$/), async (shortQuery) => {
        const repository = createMockRepository([]);
        const result = await buscarPrendas(
          { prendaRepository: repository },
          { query: shortQuery },
        );
        expect(result.success).toBe(false);
      }),
    );
  });

  it("P2.2: Si una prenda contiene el término exacto en su nombre, siempre aparece en resultados", async () => {
    await fc.assert(
      fc.asyncProperty(searchTermArb, async (searchTerm) => {
        const targetPrenda = createMockPrenda({
          nombre: `Prenda ${searchTerm} especial`,
        });
        const otherPrendas = [
          createMockPrenda({ nombre: "OtraPrendaXYZ" }),
          createMockPrenda({ nombre: "DiferenteABC" }),
        ];
        const repository = createMockRepository([
          targetPrenda,
          ...otherPrendas,
        ]);
        const result = await buscarPrendas(
          { prendaRepository: repository },
          { query: searchTerm },
        );
        if (!result.success) return;
        const foundIds = result.data.map((p) => p.id);
        expect(foundIds).toContain(targetPrenda.id);
      }),
      { numRuns: 50 },
    );
  });

  it("P2.3: La búsqueda es case-insensitive", async () => {
    await fc.assert(
      fc.asyncProperty(fc.stringMatching(/^[a-z]{2,8}$/), async (term) => {
        const prenda = createMockPrenda({
          nombre: `Prenda ${term.toUpperCase()} test`,
        });
        const repository = createMockRepository([prenda]);
        const result = await buscarPrendas(
          { prendaRepository: repository },
          { query: term.toLowerCase() },
        );
        if (!result.success) return;
        expect(result.data.length).toBeGreaterThanOrEqual(1);
        expect(result.data.some((p) => p.id === prenda.id)).toBe(true);
      }),
      { numRuns: 30 },
    );
  });

  it("P2.4: Los filtros reducen o mantienen la cantidad de resultados", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(prendaArb, { minLength: 5, maxLength: 20 }),
        searchTermArb,
        fc.constantFrom(...GENEROS),
        async (prendas, searchTerm, generoFilter) => {
          const repository = createMockRepository(prendas);
          const resultSinFiltro = await buscarPrendas(
            { prendaRepository: repository },
            { query: searchTerm },
          );
          const resultConFiltro = await buscarPrendas(
            { prendaRepository: repository },
            { query: searchTerm, filters: { genero: generoFilter } },
          );
          if (!resultSinFiltro.success || !resultConFiltro.success) return;
          expect(resultConFiltro.data.length).toBeLessThanOrEqual(
            resultSinFiltro.data.length,
          );
          for (const prenda of resultConFiltro.data) {
            expect(prenda.genero).toBe(generoFilter);
          }
        },
      ),
      { numRuns: 30 },
    );
  });
});
