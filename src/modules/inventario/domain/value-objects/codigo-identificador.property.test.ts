import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import { CodigoIdentificador } from "./codigo-identificador";
import type { Genero } from "@/shared/types";

const GENEROS: Genero[] = ["Masculino", "Femenino", "Unisex"];
const CUADROS = ["Huaso", "Norte", "Rapa Nui"] as const;
const CODIGO_REGEX = /^[MFU][HNR]-\d{3}$/;

// Arbitraries
const generoArb = fc.constantFrom(...GENEROS);
const cuadroArb = fc.constantFrom(...CUADROS);
const secuencialArb = fc.integer({ min: 1, max: 999 });

describe("CodigoIdentificador - Property Tests", () => {
  it("P1: Todo código generado cumple el formato {G}{C}-{NNN}", () => {
    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        secuencialArb,
        (genero, cuadro, seq) => {
          const codigo = CodigoIdentificador.fromParts(genero, cuadro, seq);
          const str = codigo.toString();

          // Debe cumplir el regex
          expect(str).toMatch(CODIGO_REGEX);

          // Debe tener exactamente 6 caracteres
          expect(str).toHaveLength(6);

          // La parte numérica debe ser 3 dígitos con padding
          const numericPart = str.slice(3);
          expect(numericPart).toHaveLength(3);
          expect(parseInt(numericPart, 10)).toBe(seq);
        },
      ),
    );
  });

  it("P1.1: El primer carácter corresponde al género correcto", () => {
    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        secuencialArb,
        (genero, cuadro, seq) => {
          const codigo = CodigoIdentificador.fromParts(genero, cuadro, seq);
          const str = codigo.toString();

          const expectedGeneroCode =
            genero === "Masculino" ? "M" : genero === "Femenino" ? "F" : "U";
          expect(str[0]).toBe(expectedGeneroCode);
        },
      ),
    );
  });

  it("P1.2: El segundo carácter corresponde al cuadro correcto", () => {
    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        secuencialArb,
        (genero, cuadro, seq) => {
          const codigo = CodigoIdentificador.fromParts(genero, cuadro, seq);
          const str = codigo.toString();

          const expectedCuadroCode =
            cuadro === "Huaso" ? "H" : cuadro === "Norte" ? "N" : "R";
          expect(str[1]).toBe(expectedCuadroCode);
        },
      ),
    );
  });

  it("P1.3: El tercer carácter siempre es un guión", () => {
    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        secuencialArb,
        (genero, cuadro, seq) => {
          const codigo = CodigoIdentificador.fromParts(genero, cuadro, seq);
          const str = codigo.toString();

          expect(str[2]).toBe("-");
        },
      ),
    );
  });

  it("P1.4: fromParts y parse son operaciones inversas (roundtrip)", () => {
    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        secuencialArb,
        (genero, cuadro, seq) => {
          const original = CodigoIdentificador.fromParts(genero, cuadro, seq);
          const parsed = CodigoIdentificador.parse(original.toString());

          expect(parsed.equals(original)).toBe(true);
          expect(parsed.getGeneroName()).toBe(genero);
          expect(parsed.getCuadroName()).toBe(cuadro);
          expect(parsed.secuencial).toBe(seq);
        },
      ),
    );
  });

  it("P1.5: Secuencial fuera de rango (0 o >999) lanza error", () => {
    const invalidSeqArb = fc.oneof(
      fc.integer({ min: -100, max: 0 }),
      fc.integer({ min: 1000, max: 9999 }),
    );

    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        invalidSeqArb,
        (genero, cuadro, seq) => {
          expect(() =>
            CodigoIdentificador.fromParts(genero, cuadro, seq),
          ).toThrow();
        },
      ),
    );
  });

  it("P1.6: Dos códigos con mismos parámetros son iguales", () => {
    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        secuencialArb,
        (genero, cuadro, seq) => {
          const a = CodigoIdentificador.fromParts(genero, cuadro, seq);
          const b = CodigoIdentificador.fromParts(genero, cuadro, seq);

          expect(a.equals(b)).toBe(true);
          expect(a.toString()).toBe(b.toString());
        },
      ),
    );
  });

  it("P1.7: Códigos con parámetros diferentes no son iguales", () => {
    fc.assert(
      fc.property(
        generoArb,
        cuadroArb,
        secuencialArb,
        generoArb,
        cuadroArb,
        secuencialArb,
        (g1, c1, s1, g2, c2, s2) => {
          fc.pre(g1 !== g2 || c1 !== c2 || s1 !== s2);

          const a = CodigoIdentificador.fromParts(g1, c1, s1);
          const b = CodigoIdentificador.fromParts(g2, c2, s2);

          expect(a.equals(b)).toBe(false);
        },
      ),
    );
  });
});
