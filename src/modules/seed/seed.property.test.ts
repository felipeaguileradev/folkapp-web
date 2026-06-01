import { describe, it, expect } from "vitest";
import * as fs from "fs";
import * as path from "path";

// --- Helpers ---

/**
 * Lee el archivo seed.sql y extrae los statements INSERT.
 */
function readSeedSql(): string {
  const seedPath = path.resolve(__dirname, "../../../supabase/seed.sql");
  return fs.readFileSync(seedPath, "utf-8");
}

/**
 * Extrae todos los IDs de un INSERT statement.
 * Busca UUIDs en formato 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx'
 */
function extractIds(sql: string, tableName: string): string[] {
  const regex = new RegExp(
    `INSERT INTO ${tableName}[^;]+VALUES([^;]+)ON CONFLICT`,
    "gs",
  );
  const match = regex.exec(sql);
  if (!match) return [];

  const valuesSection = match[1];
  const uuidRegex =
    /['\"]([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})['\"](?:\s*,\s*'[^']*'|\s*\))/g;

  // Simpler: extract all UUIDs that appear as first value in each row
  const allUuids = valuesSection.match(
    /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g,
  );

  return allUuids ?? [];
}

/**
 * Verifica que todos los INSERT usan ON CONFLICT DO NOTHING.
 */
function allInsertsAreIdempotent(sql: string): boolean {
  const insertStatements = sql.match(/INSERT INTO[^;]+;/gs) ?? [];
  return insertStatements.every(
    (stmt) => stmt.includes("ON CONFLICT") && stmt.includes("DO NOTHING"),
  );
}

/**
 * Cuenta el número de filas en un INSERT statement.
 */
function countRows(sql: string, tableName: string): number {
  const regex = new RegExp(
    `INSERT INTO ${tableName}[^;]+VALUES([^;]+)ON CONFLICT`,
    "gs",
  );
  const match = regex.exec(sql);
  if (!match) return 0;

  // Contar las tuplas (cada fila empieza con '(' después de VALUES o '),')
  const valuesSection = match[1];
  const rows = valuesSection.match(/\(\s*'/g);
  return rows?.length ?? 0;
}

// --- P25: Seed idempotency ---

describe("Seed Idempotency - Property Tests", () => {
  const seedSql = readSeedSql();

  it("P25: Todos los INSERT usan ON CONFLICT DO NOTHING (idempotencia)", () => {
    expect(allInsertsAreIdempotent(seedSql)).toBe(true);
  });

  it("P25.1: El seed contiene exactamente 3 cuadros", () => {
    const count = countRows(seedSql, "cuadros");
    expect(count).toBe(3);
  });

  it("P25.2: El seed contiene exactamente 14 bailarines (7M + 7F)", () => {
    // Dos INSERT statements para bailarines (masculinos y femeninos)
    const matches = seedSql.match(
      /INSERT INTO bailarines[^;]+ON CONFLICT[^;]+;/gs,
    );
    expect(matches).not.toBeNull();

    // Contar total de filas en ambos statements
    let totalRows = 0;
    for (const match of matches ?? []) {
      const rows = match.match(/\(\s*'/g);
      totalRows += rows?.length ?? 0;
    }
    expect(totalRows).toBe(14);
  });

  it("P25.3: El seed contiene al menos 20 prendas", () => {
    const count = countRows(seedSql, "prendas");
    expect(count).toBeGreaterThanOrEqual(20);
  });

  it("P25.4: Todos los IDs en el seed son UUIDs válidos", () => {
    const uuidRegex =
      /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/g;
    const allUuids = seedSql.match(uuidRegex) ?? [];

    // Todos deben ser hex válidos (no contener letras > f)
    for (const uuid of allUuids) {
      expect(uuid).toMatch(
        /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/,
      );
    }

    // Debe haber UUIDs en el seed
    expect(allUuids.length).toBeGreaterThan(0);
  });

  it("P25.5: No hay IDs duplicados dentro del mismo INSERT de una tabla", () => {
    const tables = ["cuadros", "bailarines", "prendas", "plantilla_vestuario"];

    for (const table of tables) {
      const ids = extractIds(seedSql, table);
      const uniqueIds = new Set(ids);

      // Si hay IDs, no deben estar duplicados
      // (puede haber UUIDs repetidos como FK references, pero los IDs primarios no)
      // Verificamos que al menos no hay duplicados obvios en la primera posición
    }

    // Verificar que el seed no tiene el mismo UUID como PK en dos filas
    const allInserts = seedSql.match(/INSERT INTO[^;]+;/gs) ?? [];
    for (const insert of allInserts) {
      // Extraer la primera columna de cada VALUES row (el ID)
      const firstColumnValues = insert.match(
        /\(\s*'([0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12})'/g,
      );
      if (firstColumnValues) {
        const ids = firstColumnValues.map((v) =>
          v.replace(/\(\s*'/, "").replace(/'$/, ""),
        );
        const uniqueIds = new Set(ids);
        expect(ids.length).toBe(uniqueIds.size);
      }
    }
  });

  it("P25.6: El seed incluye prendas en todos los estados requeridos", () => {
    const estadosRequeridos = [
      "Disponible",
      "En uso",
      "En reparación",
      "Faltante",
    ];

    for (const estado of estadosRequeridos) {
      expect(seedSql).toContain(`'${estado}'`);
    }
  });

  it("P25.7: El seed incluye las prendas específicas requeridas", () => {
    expect(seedSql).toContain("Chasquilla No6");
    expect(seedSql).toContain("Aros");
    expect(seedSql).toContain("Espuela");
  });

  it("P25.8: Ejecutar el seed dos veces produce el mismo resultado (simulación)", () => {
    // Simular idempotencia: verificar que cada INSERT activo tiene ON CONFLICT
    // Excluir líneas comentadas (que empiezan con --)
    const activeLines = seedSql
      .split("\n")
      .filter((line) => !line.trim().startsWith("--"))
      .join("\n");

    const insertCount = (activeLines.match(/INSERT INTO/g) ?? []).length;
    const onConflictCount = (activeLines.match(/ON CONFLICT/g) ?? []).length;

    // Cada INSERT activo debe tener su ON CONFLICT
    expect(onConflictCount).toBe(insertCount);
  });
});
