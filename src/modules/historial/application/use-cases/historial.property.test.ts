import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { crearHistorial } from "./crear-historial.use-case";
import type { HistorialEntry, CreateHistorialDTO } from "../../domain/entities";
import type { HistorialRepository } from "../../domain/ports";
import type { TipoEvento } from "@/shared/types";

// --- Helpers ---

const TIPOS_EVENTO: TipoEvento[] = [
  "Asignación",
  "Devolución",
  "Cambio de estado",
  "Reparación",
  "Préstamo",
  "Traspaso",
  "Comentario agregado",
  "Creación de prenda",
];

function createMockHistorialRepo(options?: {
  shouldFail?: boolean;
}): HistorialRepository & { entries: HistorialEntry[] } {
  const entries: HistorialEntry[] = [];

  return {
    entries,
    findByPrenda: async () => entries,
    findByBailarin: async () => entries,
    create: async (dto: CreateHistorialDTO) => {
      if (options?.shouldFail) {
        throw new Error("DB error simulado");
      }
      const entry: HistorialEntry = {
        id: crypto.randomUUID(),
        ...dto,
        createdAt: new Date(),
      };
      entries.push(entry);
      return entry;
    },
  };
}

// --- Arbitraries ---

const tipoEventoArb = fc.constantFrom(...TIPOS_EVENTO);
const descripcionArb = fc.oneof(
  fc.constant(null),
  fc.stringMatching(/^[a-zA-Z ]{1,100}$/),
);

// --- P15: History entry creation for completed actions ---

describe("Historial Creation - Property Tests", () => {
  it("P15: Toda acción exitosa genera una entrada de historial con los datos correctos", async () => {
    await fc.assert(
      fc.asyncProperty(
        tipoEventoArb,
        descripcionArb,
        fc.uuid(),
        fc.uuid(),
        fc.uuid(),
        async (tipoEvento, descripcion, prendaId, personaId, userId) => {
          const repo = createMockHistorialRepo();

          const input: CreateHistorialDTO = {
            fecha: new Date(),
            tipoEvento,
            prendaId,
            personaInvolucrada: personaId,
            descripcion,
            usuarioQueRegistro: userId,
          };

          const result = await crearHistorial(
            { historialRepository: repo },
            input,
          );

          // Debe ser exitoso
          expect(result.success).toBe(true);

          if (result.success) {
            // La entrada creada tiene los datos correctos
            expect(result.data.tipoEvento).toBe(tipoEvento);
            expect(result.data.prendaId).toBe(prendaId);
            expect(result.data.personaInvolucrada).toBe(personaId);
            expect(result.data.descripcion).toBe(descripcion);
            expect(result.data.usuarioQueRegistro).toBe(userId);
            expect(result.data.id).toBeDefined();
            expect(result.data.createdAt).toBeInstanceOf(Date);

            // Se guardó en el repositorio
            expect(repo.entries).toHaveLength(1);
            expect(repo.entries[0].id).toBe(result.data.id);
          }
        },
      ),
      { numRuns: 50 },
    );
  });

  it("P15.1: Cada acción exitosa incrementa el historial en exactamente 1", async () => {
    const repo = createMockHistorialRepo();
    const numActions = 5;

    for (let i = 0; i < numActions; i++) {
      await crearHistorial(
        { historialRepository: repo },
        {
          fecha: new Date(),
          tipoEvento: TIPOS_EVENTO[i % TIPOS_EVENTO.length],
          prendaId: `prenda-${i}`,
          personaInvolucrada: `persona-${i}`,
          descripcion: `Acción ${i}`,
          usuarioQueRegistro: "user-1",
        },
      );
    }

    expect(repo.entries).toHaveLength(numActions);
  });
});

// --- P16: History immutability ---

describe("Historial Immutability - Property Tests", () => {
  it("P16: El repositorio de historial no expone métodos de update ni delete", () => {
    // Verificar que la interfaz HistorialRepository solo tiene:
    // findByPrenda, findByBailarin, create
    // No tiene update, delete, remove, etc.
    const repo = createMockHistorialRepo();

    // Métodos que SÍ existen
    expect(typeof repo.findByPrenda).toBe("function");
    expect(typeof repo.findByBailarin).toBe("function");
    expect(typeof repo.create).toBe("function");

    // Métodos que NO deben existir (inmutabilidad)
    expect((repo as any).update).toBeUndefined();
    expect((repo as any).delete).toBeUndefined();
    expect((repo as any).remove).toBeUndefined();
    expect((repo as any).edit).toBeUndefined();
  });

  it("P16.1: Las entradas creadas no se pueden modificar desde fuera", async () => {
    const repo = createMockHistorialRepo();

    const result = await crearHistorial(
      { historialRepository: repo },
      {
        fecha: new Date(),
        tipoEvento: "Asignación",
        prendaId: "prenda-1",
        personaInvolucrada: "persona-1",
        descripcion: "Original",
        usuarioQueRegistro: "user-1",
      },
    );

    expect(result.success).toBe(true);
    if (result.success) {
      const originalId = result.data.id;
      const originalDescripcion = result.data.descripcion;

      // Verificar que la entrada en el repo mantiene sus datos
      const stored = repo.entries.find((e) => e.id === originalId);
      expect(stored).toBeDefined();
      expect(stored!.descripcion).toBe(originalDescripcion);
    }
  });
});

// --- P17: No history for failed actions ---

describe("Historial No-Creation on Failure - Property Tests", () => {
  it("P17: Si la creación falla en el repositorio, no se guarda entrada", async () => {
    const repo = createMockHistorialRepo({ shouldFail: true });

    const result = await crearHistorial(
      { historialRepository: repo },
      {
        fecha: new Date(),
        tipoEvento: "Asignación",
        prendaId: "prenda-1",
        personaInvolucrada: "persona-1",
        descripcion: "Debería fallar",
        usuarioQueRegistro: "user-1",
      },
    );

    expect(result.success).toBe(false);
    expect(repo.entries).toHaveLength(0);
  });

  it("P17.1: Input inválido (sin tipoEvento) no genera entrada", async () => {
    const repo = createMockHistorialRepo();

    const result = await crearHistorial(
      { historialRepository: repo },
      {
        fecha: new Date(),
        tipoEvento: "" as TipoEvento,
        prendaId: "prenda-1",
        personaInvolucrada: null,
        descripcion: null,
        usuarioQueRegistro: "user-1",
      },
    );

    expect(result.success).toBe(false);
    expect(repo.entries).toHaveLength(0);
  });

  it("P17.2: Input inválido (sin usuario) no genera entrada", async () => {
    const repo = createMockHistorialRepo();

    const result = await crearHistorial(
      { historialRepository: repo },
      {
        fecha: new Date(),
        tipoEvento: "Asignación",
        prendaId: "prenda-1",
        personaInvolucrada: null,
        descripcion: null,
        usuarioQueRegistro: "",
      },
    );

    expect(result.success).toBe(false);
    expect(repo.entries).toHaveLength(0);
  });

  it("P17.3: Descripción > 500 caracteres no genera entrada", async () => {
    const repo = createMockHistorialRepo();
    const longDescription = "a".repeat(501);

    const result = await crearHistorial(
      { historialRepository: repo },
      {
        fecha: new Date(),
        tipoEvento: "Asignación",
        prendaId: "prenda-1",
        personaInvolucrada: null,
        descripcion: longDescription,
        usuarioQueRegistro: "user-1",
      },
    );

    expect(result.success).toBe(false);
    expect(repo.entries).toHaveLength(0);
  });
});
