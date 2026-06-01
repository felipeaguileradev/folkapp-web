import { describe, it, expect } from "vitest";
import {
  canAssignPrenda,
  canReturnMovimiento,
  isOverdue,
} from "./movement-rules";
import { EstadoPrenda } from "@/shared/types";

describe("canAssignPrenda", () => {
  it("returns true when estado is 'Disponible'", () => {
    expect(canAssignPrenda("Disponible")).toBe(true);
  });

  it("returns false for all non-Disponible states", () => {
    const nonDisponibleStates: EstadoPrenda[] = [
      "En uso",
      "En reparación",
      "Faltante",
      "Prestada",
      "Dada de baja",
    ];

    for (const estado of nonDisponibleStates) {
      expect(canAssignPrenda(estado)).toBe(false);
    }
  });
});

describe("canReturnMovimiento", () => {
  it("returns true when devuelta is false", () => {
    expect(canReturnMovimiento({ devuelta: false })).toBe(true);
  });

  it("returns false when devuelta is true (prevents double devolution)", () => {
    expect(canReturnMovimiento({ devuelta: true })).toBe(false);
  });
});

describe("isOverdue", () => {
  it("returns true when not devuelta and fechaDevolucionEsperada is in the past", () => {
    const pastDate = new Date("2020-01-01");
    expect(
      isOverdue({ fechaDevolucionEsperada: pastDate, devuelta: false }),
    ).toBe(true);
  });

  it("returns false when devuelta is true even if fecha is in the past", () => {
    const pastDate = new Date("2020-01-01");
    expect(
      isOverdue({ fechaDevolucionEsperada: pastDate, devuelta: true }),
    ).toBe(false);
  });

  it("returns false when fechaDevolucionEsperada is null", () => {
    expect(isOverdue({ fechaDevolucionEsperada: null, devuelta: false })).toBe(
      false,
    );
  });

  it("returns false when fechaDevolucionEsperada is in the future", () => {
    const futureDate = new Date("2099-12-31");
    expect(
      isOverdue({ fechaDevolucionEsperada: futureDate, devuelta: false }),
    ).toBe(false);
  });
});
