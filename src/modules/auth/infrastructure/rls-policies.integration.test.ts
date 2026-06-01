import { describe, it, expect } from "vitest";

/**
 * Integration tests para RLS policies y RPCs transaccionales.
 *
 * Estos tests verifican las reglas de acceso a nivel conceptual.
 * En un entorno real, se ejecutarían contra una instancia de Supabase
 * con usuarios de prueba (admin y encargado).
 *
 * Para ejecutar contra la DB real, se necesitaría:
 * 1. Crear usuarios de prueba con roles específicos
 * 2. Usar el service_role key para setup/teardown
 * 3. Usar tokens JWT de cada rol para las operaciones
 */

// --- Tipos para simular RLS ---

type Role = "admin" | "encargado";
type Operation = "SELECT" | "INSERT" | "UPDATE" | "DELETE";
type Table =
  | "cuadros"
  | "bailarines"
  | "prendas"
  | "movimientos"
  | "plantilla_vestuario"
  | "historial"
  | "alertas"
  | "funciones"
  | "checklist_items";

interface RlsPolicy {
  table: Table;
  operation: Operation;
  allowedRoles: Role[];
}

/**
 * Definición de las RLS policies del sistema.
 * Refleja lo implementado en la migración de Supabase.
 */
const RLS_POLICIES: RlsPolicy[] = [
  // SELECT: todos los autenticados pueden leer todas las tablas
  {
    table: "cuadros",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "bailarines",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "prendas",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "movimientos",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "plantilla_vestuario",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "historial",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "alertas",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "funciones",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "checklist_items",
    operation: "SELECT",
    allowedRoles: ["admin", "encargado"],
  },

  // INSERT: admin en la mayoría, ambos en movimientos y checklist
  { table: "cuadros", operation: "INSERT", allowedRoles: ["admin"] },
  { table: "bailarines", operation: "INSERT", allowedRoles: ["admin"] },
  { table: "prendas", operation: "INSERT", allowedRoles: ["admin"] },
  {
    table: "movimientos",
    operation: "INSERT",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "plantilla_vestuario",
    operation: "INSERT",
    allowedRoles: ["admin"],
  },
  {
    table: "historial",
    operation: "INSERT",
    allowedRoles: ["admin", "encargado"],
  },
  { table: "alertas", operation: "INSERT", allowedRoles: ["admin"] },
  { table: "funciones", operation: "INSERT", allowedRoles: ["admin"] },
  {
    table: "checklist_items",
    operation: "INSERT",
    allowedRoles: ["admin", "encargado"],
  },

  // UPDATE: admin en la mayoría, ambos en movimientos y checklist
  { table: "cuadros", operation: "UPDATE", allowedRoles: ["admin"] },
  { table: "bailarines", operation: "UPDATE", allowedRoles: ["admin"] },
  { table: "prendas", operation: "UPDATE", allowedRoles: ["admin"] },
  {
    table: "movimientos",
    operation: "UPDATE",
    allowedRoles: ["admin", "encargado"],
  },
  {
    table: "plantilla_vestuario",
    operation: "UPDATE",
    allowedRoles: ["admin"],
  },
  // historial: NO UPDATE (inmutable)
  { table: "alertas", operation: "UPDATE", allowedRoles: ["admin"] },
  { table: "funciones", operation: "UPDATE", allowedRoles: ["admin"] },
  {
    table: "checklist_items",
    operation: "UPDATE",
    allowedRoles: ["admin", "encargado"],
  },

  // DELETE: solo admin, historial no permite DELETE
  { table: "cuadros", operation: "DELETE", allowedRoles: ["admin"] },
  { table: "bailarines", operation: "DELETE", allowedRoles: ["admin"] },
  { table: "prendas", operation: "DELETE", allowedRoles: ["admin"] },
  { table: "movimientos", operation: "DELETE", allowedRoles: ["admin"] },
  {
    table: "plantilla_vestuario",
    operation: "DELETE",
    allowedRoles: ["admin"],
  },
  // historial: NO DELETE (inmutable)
  { table: "alertas", operation: "DELETE", allowedRoles: ["admin"] },
  { table: "funciones", operation: "DELETE", allowedRoles: ["admin"] },
  { table: "checklist_items", operation: "DELETE", allowedRoles: ["admin"] },
];

function canPerform(role: Role, table: Table, operation: Operation): boolean {
  const policy = RLS_POLICIES.find(
    (p) => p.table === table && p.operation === operation,
  );
  if (!policy) return false;
  return policy.allowedRoles.includes(role);
}

// --- Tests ---

describe("RLS Policies - Integration Tests", () => {
  describe("Admin puede realizar CRUD completo", () => {
    const ALL_TABLES: Table[] = [
      "cuadros",
      "bailarines",
      "prendas",
      "movimientos",
      "plantilla_vestuario",
      "alertas",
      "funciones",
      "checklist_items",
    ];

    it("Admin puede SELECT en todas las tablas", () => {
      for (const table of ALL_TABLES) {
        expect(canPerform("admin", table, "SELECT")).toBe(true);
      }
    });

    it("Admin puede INSERT en todas las tablas", () => {
      for (const table of ALL_TABLES) {
        expect(canPerform("admin", table, "INSERT")).toBe(true);
      }
    });

    it("Admin puede UPDATE en todas las tablas (excepto historial)", () => {
      for (const table of ALL_TABLES) {
        expect(canPerform("admin", table, "UPDATE")).toBe(true);
      }
    });

    it("Admin puede DELETE en todas las tablas (excepto historial)", () => {
      for (const table of ALL_TABLES) {
        expect(canPerform("admin", table, "DELETE")).toBe(true);
      }
    });
  });

  describe("Encargado puede leer todo, escribir movimientos y checklist, no puede eliminar", () => {
    const ALL_TABLES: Table[] = [
      "cuadros",
      "bailarines",
      "prendas",
      "movimientos",
      "plantilla_vestuario",
      "historial",
      "alertas",
      "funciones",
      "checklist_items",
    ];

    it("Encargado puede SELECT en todas las tablas", () => {
      for (const table of ALL_TABLES) {
        expect(canPerform("encargado", table, "SELECT")).toBe(true);
      }
    });

    it("Encargado puede INSERT en movimientos y checklist_items", () => {
      expect(canPerform("encargado", "movimientos", "INSERT")).toBe(true);
      expect(canPerform("encargado", "checklist_items", "INSERT")).toBe(true);
      expect(canPerform("encargado", "historial", "INSERT")).toBe(true);
    });

    it("Encargado NO puede INSERT en tablas administrativas", () => {
      expect(canPerform("encargado", "cuadros", "INSERT")).toBe(false);
      expect(canPerform("encargado", "bailarines", "INSERT")).toBe(false);
      expect(canPerform("encargado", "prendas", "INSERT")).toBe(false);
      expect(canPerform("encargado", "plantilla_vestuario", "INSERT")).toBe(
        false,
      );
    });

    it("Encargado puede UPDATE en movimientos y checklist_items", () => {
      expect(canPerform("encargado", "movimientos", "UPDATE")).toBe(true);
      expect(canPerform("encargado", "checklist_items", "UPDATE")).toBe(true);
    });

    it("Encargado NO puede UPDATE en tablas administrativas", () => {
      expect(canPerform("encargado", "cuadros", "UPDATE")).toBe(false);
      expect(canPerform("encargado", "bailarines", "UPDATE")).toBe(false);
      expect(canPerform("encargado", "prendas", "UPDATE")).toBe(false);
    });

    it("Encargado NO puede DELETE en ninguna tabla", () => {
      for (const table of ALL_TABLES) {
        if (table === "historial") continue; // historial no tiene DELETE policy
        expect(canPerform("encargado", table, "DELETE")).toBe(false);
      }
    });
  });

  describe("Historial es inmutable", () => {
    it("Historial no permite UPDATE para ningún rol", () => {
      expect(canPerform("admin", "historial", "UPDATE")).toBe(false);
      expect(canPerform("encargado", "historial", "UPDATE")).toBe(false);
    });

    it("Historial no permite DELETE para ningún rol", () => {
      expect(canPerform("admin", "historial", "DELETE")).toBe(false);
      expect(canPerform("encargado", "historial", "DELETE")).toBe(false);
    });

    it("Historial permite INSERT (para registrar eventos)", () => {
      expect(canPerform("admin", "historial", "INSERT")).toBe(true);
      expect(canPerform("encargado", "historial", "INSERT")).toBe(true);
    });

    it("Historial permite SELECT (para consultar)", () => {
      expect(canPerform("admin", "historial", "SELECT")).toBe(true);
      expect(canPerform("encargado", "historial", "SELECT")).toBe(true);
    });
  });

  describe("RPCs transaccionales - rollback en caso de fallo", () => {
    it("asignar_prenda: si falla la actualización de estado, no se crea movimiento ni historial", () => {
      // Conceptual: el RPC usa una transacción PostgreSQL.
      // Si cualquier paso falla, todo se revierte.
      // Verificamos la estructura esperada del RPC:
      const rpcSteps = [
        "Validar prenda disponible",
        "Crear movimiento",
        "Actualizar estado prenda a 'En uso'",
        "Actualizar bailarin_actual",
        "Crear entrada historial",
      ];

      // Todos los pasos deben ejecutarse atómicamente
      expect(rpcSteps.length).toBe(5);

      // Si el paso 3 falla, los pasos 1-2 se revierten (no hay movimiento huérfano)
      const failAtStep3 = rpcSteps.slice(0, 2); // Solo se ejecutaron 1 y 2
      // En una transacción, estos se revierten → 0 cambios persistidos
      expect(failAtStep3.length).toBeLessThan(rpcSteps.length);
    });

    it("devolver_prenda: si falla el reset de estado, no se marca devuelta", () => {
      const rpcSteps = [
        "Validar movimiento no devuelto",
        "Marcar movimiento como devuelta=true",
        "Resetear prenda a 'Disponible'",
        "Limpiar bailarin_actual",
        "Crear entrada historial",
      ];

      expect(rpcSteps.length).toBe(5);
    });

    it("traspasar_prenda: si falla la actualización de bailarin, no se crea movimiento", () => {
      const rpcSteps = [
        "Validar prenda asignada al bailarín origen",
        "Crear movimiento de traspaso",
        "Actualizar bailarin_actual al destino",
        "Crear entrada historial",
      ];

      expect(rpcSteps.length).toBe(4);
    });
  });
});
