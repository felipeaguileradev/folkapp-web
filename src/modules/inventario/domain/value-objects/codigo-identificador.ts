import type { Genero } from "@/shared/types";

/** Letra que representa el género en el código identificador */
type GeneroCode = "M" | "F" | "U";

/** Letra que representa el cuadro en el código identificador */
type CuadroCode = "H" | "N" | "R";

/** Nombre del cuadro para mapeo */
type CuadroName = "Huaso" | "Norte" | "Rapa Nui";

const GENERO_MAP: Record<Genero, GeneroCode> = {
  Masculino: "M",
  Femenino: "F",
  Unisex: "U",
};

const CUADRO_MAP: Record<CuadroName, CuadroCode> = {
  Huaso: "H",
  Norte: "N",
  "Rapa Nui": "R",
};

const GENERO_REVERSE_MAP: Record<GeneroCode, Genero> = {
  M: "Masculino",
  F: "Femenino",
  U: "Unisex",
};

const CUADRO_REVERSE_MAP: Record<CuadroCode, CuadroName> = {
  H: "Huaso",
  N: "Norte",
  R: "Rapa Nui",
};

const CODIGO_REGEX = /^[MFU][HNR]-\d{3}$/;

/**
 * Value Object que representa el código identificador de una prenda.
 * Formato: "{G}{C}-{NNN}" donde G=género, C=cuadro, NNN=secuencial (001-999)
 * Ejemplo: "MH-001" = Masculino, Huaso, secuencial 1
 */
export class CodigoIdentificador {
  readonly genero: GeneroCode;
  readonly cuadro: CuadroCode;
  readonly secuencial: number;

  private constructor(
    genero: GeneroCode,
    cuadro: CuadroCode,
    secuencial: number,
  ) {
    this.genero = genero;
    this.cuadro = cuadro;
    this.secuencial = secuencial;
  }

  /**
   * Crea un CodigoIdentificador a partir de sus componentes.
   * @throws Error si el secuencial está fuera de rango (1-999)
   */
  static fromParts(
    genero: Genero,
    cuadroName: CuadroName,
    secuencial: number,
  ): CodigoIdentificador {
    if (secuencial < 1 || secuencial > 999) {
      throw new Error(
        `El número secuencial debe estar entre 1 y 999, recibido: ${secuencial}`,
      );
    }

    const generoCode = GENERO_MAP[genero];
    const cuadroCode = CUADRO_MAP[cuadroName];

    if (!generoCode) {
      throw new Error(`Género inválido: ${genero}`);
    }

    if (!cuadroCode) {
      throw new Error(`Cuadro inválido: ${cuadroName}`);
    }

    return new CodigoIdentificador(generoCode, cuadroCode, secuencial);
  }

  /**
   * Parsea un código identificador desde su representación en string.
   * @throws Error si el formato es inválido
   */
  static parse(codigo: string): CodigoIdentificador {
    if (!CODIGO_REGEX.test(codigo)) {
      throw new Error(
        `Formato de código inválido: "${codigo}". Debe ser "{G}{C}-{NNN}" (ej: "MH-001")`,
      );
    }

    const genero = codigo[0] as GeneroCode;
    const cuadro = codigo[1] as CuadroCode;
    const secuencial = parseInt(codigo.slice(3), 10);

    return new CodigoIdentificador(genero, cuadro, secuencial);
  }

  /** Retorna el nombre completo del género */
  getGeneroName(): Genero {
    return GENERO_REVERSE_MAP[this.genero];
  }

  /** Retorna el nombre completo del cuadro */
  getCuadroName(): CuadroName {
    return CUADRO_REVERSE_MAP[this.cuadro];
  }

  /** Retorna el código formateado: "MH-001" */
  toString(): string {
    const paddedSecuencial = this.secuencial.toString().padStart(3, "0");
    return `${this.genero}${this.cuadro}-${paddedSecuencial}`;
  }

  /** Compara igualdad con otro CodigoIdentificador */
  equals(other: CodigoIdentificador): boolean {
    return (
      this.genero === other.genero &&
      this.cuadro === other.cuadro &&
      this.secuencial === other.secuencial
    );
  }
}
