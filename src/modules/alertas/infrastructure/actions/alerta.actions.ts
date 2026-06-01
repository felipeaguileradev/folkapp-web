"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import type { Result } from "@/shared/types";
import { resolverAlerta } from "../../application/use-cases";
import { SupabaseAlertaRepository } from "../repositories";

/**
 * Server Action: Resolver una alerta manualmente.
 * Obtiene el usuario actual y marca la alerta como resuelta.
 */
export async function resolverAlertaAction(
  alertaId: string,
): Promise<Result<void, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const alertaRepository = new SupabaseAlertaRepository();

  const result = await resolverAlerta(
    { alertaRepository },
    { alertaId, usuario: user.id },
  );

  if (result.success) {
    revalidatePath("/alertas");
  }

  return result;
}

/**
 * Server Action: Recalcular alertas del sistema.
 * Ejecuta la generación de alertas para detectar nuevas condiciones.
 * Nota: En producción esto se integraría con los flujos de cambio de estado.
 */
export async function recalcularAlertasAction(): Promise<
  Result<{ alertasGeneradas: number }, string>
> {
  // La recalculación completa requiere todos los repositorios.
  // Por ahora retornamos un placeholder; la integración completa
  // se hará en la tarea 16.1 (Wire alert recalculation).
  revalidatePath("/alertas");
  return { success: true, data: { alertasGeneradas: 0 } };
}
