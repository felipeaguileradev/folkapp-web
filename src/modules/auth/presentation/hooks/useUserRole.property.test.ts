import { describe, it, expect } from "vitest";
import * as fc from "fast-check";
import type { Role } from "@/shared/types";

// --- Helpers ---

/**
 * Simula la lógica de control de acceso por rol.
 * Estas funciones representan las reglas de negocio que el hook useUserRole
 * y los server actions deben respetar.
 */

type Action =
  | "crear_prenda"
  | "actualizar_prenda"
  | "eliminar_prenda"
  | "crear_bailarin"
  | "actualizar_bailarin"
  | "eliminar_bailarin"
  | "crear_movimiento"
  | "devolver_movimiento"
  | "traspasar_movimiento"
  | "verificar_checklist"
  | "resolver_alerta"
  | "crear_funcion"
  | "finalizar_funcion"
  | "generar_reporte";

const ALL_ACTIONS: Action[] = [
  "crear_prenda",
  "actualizar_prenda",
  "eliminar_prenda",
  "crear_bailarin",
  "actualizar_bailarin",
  "eliminar_bailarin",
  "crear_movimiento",
  "devolver_movimiento",
  "traspasar_movimiento",
  "verificar_checklist",
  "resolver_alerta",
  "crear_funcion",
  "finalizar_funcion",
  "generar_reporte",
];

/** Acciones que requieren rol admin */
const ADMIN_ONLY_ACTIONS: Action[] = ["eliminar_prenda", "eliminar_bailarin"];

/** Acciones permitidas para encargado */
const ENCARGADO_ALLOWED_ACTIONS: Action[] = ALL_ACTIONS.filter(
  (a) => !ADMIN_ONLY_ACTIONS.includes(a),
);

/**
 * Determina si un rol puede ejecutar una acción.
 * Admin puede hacer todo. Encargado no puede eliminar.
 */
function canPerformAction(role: Role, action: Action): boolean {
  if (role === "admin") return true;
  return ENCARGADO_ALLOWED_ACTIONS.includes(action);
}

/**
 * Determina si un rol puede ver un botón de acción.
 * Los botones de eliminar se ocultan para encargado.
 */
function canSeeButton(role: Role, action: Action): boolean {
  if (role === "admin") return true;
  return !ADMIN_ONLY_ACTIONS.includes(action);
}

// --- Arbitraries ---

const roleArb = fc.constantFrom<Role>("admin", "encargado");
const actionArb = fc.constantFrom(...ALL_ACTIONS);
const adminOnlyActionArb = fc.constantFrom(...ADMIN_ONLY_ACTIONS);
const encargadoAllowedActionArb = fc.constantFrom(...ENCARGADO_ALLOWED_ACTIONS);

// --- P24: Role-based access control ---

describe("Role-Based Access Control - Property Tests", () => {
  it("P24: Admin puede realizar TODAS las acciones", () => {
    fc.assert(
      fc.property(actionArb, (action) => {
        expect(canPerformAction("admin", action)).toBe(true);
      }),
    );
  });

  it("P24.1: Encargado NO puede eliminar prendas ni bailarines", () => {
    fc.assert(
      fc.property(adminOnlyActionArb, (action) => {
        expect(canPerformAction("encargado", action)).toBe(false);
      }),
    );
  });

  it("P24.2: Encargado SÍ puede realizar todas las demás acciones", () => {
    fc.assert(
      fc.property(encargadoAllowedActionArb, (action) => {
        expect(canPerformAction("encargado", action)).toBe(true);
      }),
    );
  });

  it("P24.3: Admin siempre ve todos los botones", () => {
    fc.assert(
      fc.property(actionArb, (action) => {
        expect(canSeeButton("admin", action)).toBe(true);
      }),
    );
  });

  it("P24.4: Encargado no ve botones de eliminar", () => {
    fc.assert(
      fc.property(adminOnlyActionArb, (action) => {
        expect(canSeeButton("encargado", action)).toBe(false);
      }),
    );
  });

  it("P24.5: Encargado sí ve botones de acciones permitidas", () => {
    fc.assert(
      fc.property(encargadoAllowedActionArb, (action) => {
        expect(canSeeButton("encargado", action)).toBe(true);
      }),
    );
  });

  it("P24.6: Las acciones admin-only son exactamente eliminar_prenda y eliminar_bailarin", () => {
    expect(ADMIN_ONLY_ACTIONS).toHaveLength(2);
    expect(ADMIN_ONLY_ACTIONS).toContain("eliminar_prenda");
    expect(ADMIN_ONLY_ACTIONS).toContain("eliminar_bailarin");
  });

  it("P24.7: Para cualquier rol, las acciones de lectura/escritura de movimientos están permitidas", () => {
    const movimientoActions: Action[] = [
      "crear_movimiento",
      "devolver_movimiento",
      "traspasar_movimiento",
    ];

    fc.assert(
      fc.property(
        roleArb,
        fc.constantFrom(...movimientoActions),
        (role, action) => {
          expect(canPerformAction(role, action)).toBe(true);
        },
      ),
    );
  });

  it("P24.8: Para cualquier rol, verificar checklist está permitido", () => {
    fc.assert(
      fc.property(roleArb, (role) => {
        expect(canPerformAction(role, "verificar_checklist")).toBe(true);
      }),
    );
  });
});
