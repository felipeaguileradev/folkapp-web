"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import type { Result } from "@/shared/types";
import type { Movimiento } from "../../domain/entities";
import {
  asignarPrenda,
  prestarPrenda,
  devolverPrenda,
  traspasarPrenda,
} from "../../application";
import type {
  AsignarPrendaInput,
  PrestarPrendaInput,
  TraspasarPrendaInput,
} from "../../application";
import { SupabaseMovimientoRepository } from "../repositories";
import { SupabasePrendaRepository } from "@/modules/inventario/infrastructure/repositories";

/**
 * Server Action: Asignar una prenda a un bailarín.
 * Obtiene el usuario actual y delega al caso de uso.
 */
export async function asignarPrendaAction(input: {
  prendaId: string;
  bailarinId: string;
  fechaDevolucionEsperada?: Date | null;
  observacion?: string | null;
}): Promise<Result<Movimiento, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const movimientoRepository = new SupabaseMovimientoRepository(supabase);
  const prendaRepository = new SupabasePrendaRepository(supabase);

  const useCaseInput: AsignarPrendaInput = {
    prendaId: input.prendaId,
    bailarinId: input.bailarinId,
    registradoPor: user.id,
    fechaDevolucionEsperada: input.fechaDevolucionEsperada ?? null,
    observacion: input.observacion ?? null,
  };

  const result = await asignarPrenda(
    { movimientoRepository, prendaRepository },
    useCaseInput,
  );

  if (result.success) {
    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error.message };
}

/**
 * Server Action: Prestar una prenda a un bailarín (interno o externo).
 * Obtiene el usuario actual y delega al caso de uso.
 */
export async function prestarPrendaAction(input: {
  prendaId: string;
  bailarinId: string;
  tipo: "Préstamo interno" | "Préstamo externo";
  fechaDevolucionEsperada?: Date | null;
  observacion?: string | null;
}): Promise<Result<Movimiento, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const movimientoRepository = new SupabaseMovimientoRepository(supabase);
  const prendaRepository = new SupabasePrendaRepository(supabase);

  const useCaseInput: PrestarPrendaInput = {
    prendaId: input.prendaId,
    bailarinId: input.bailarinId,
    tipo: input.tipo,
    registradoPor: user.id,
    fechaDevolucionEsperada: input.fechaDevolucionEsperada ?? null,
    observacion: input.observacion ?? null,
  };

  const result = await prestarPrenda(
    { movimientoRepository, prendaRepository },
    useCaseInput,
  );

  if (result.success) {
    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error.message };
}

/**
 * Server Action: Devolver una prenda (registrar devolución).
 * Obtiene el usuario actual y delega al caso de uso.
 * Auto-resuelve alertas de préstamo vencido.
 */
export async function devolverPrendaAction(
  movimientoId: string,
): Promise<Result<void, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const movimientoRepository = new SupabaseMovimientoRepository(supabase);

  // Obtener el movimiento para saber la prenda asociada
  const movimiento = await movimientoRepository.findById(movimientoId);

  const result = await devolverPrenda(
    { movimientoRepository },
    { movimientoId },
  );

  if (result.success && movimiento) {
    // Auto-resolver alerta de préstamo vencido para esta prenda
    const { SupabaseAlertaRepository } =
      await import("@/modules/alertas/infrastructure/repositories");
    const {
      autoResolverAlertasPorEntidad,
      getCondicionesResueltasPorDevolucion,
    } = await import("@/modules/alertas/application/services");

    const alertaRepository = new SupabaseAlertaRepository();
    const condiciones = getCondicionesResueltasPorDevolucion();
    await autoResolverAlertasPorEntidad(
      { alertaRepository },
      movimiento.prendaId,
      condiciones,
    );

    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    revalidatePath("/alertas");
    return { success: true, data: undefined };
  }

  if (result.success) {
    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    return { success: true, data: undefined };
  }

  return { success: false, error: result.error.message };
}

/**
 * Server Action: Traspasar una prenda de un bailarín a otro.
 * Obtiene el usuario actual y delega al caso de uso.
 */
export async function traspasarPrendaAction(input: {
  prendaId: string;
  bailarinOrigenId: string;
  bailarinDestinoId: string;
  observacion?: string | null;
}): Promise<Result<Movimiento, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const movimientoRepository = new SupabaseMovimientoRepository(supabase);
  const prendaRepository = new SupabasePrendaRepository(supabase);

  const useCaseInput: TraspasarPrendaInput = {
    prendaId: input.prendaId,
    bailarinOrigenId: input.bailarinOrigenId,
    bailarinDestinoId: input.bailarinDestinoId,
    registradoPor: user.id,
    observacion: input.observacion ?? null,
  };

  const result = await traspasarPrenda(
    { movimientoRepository, prendaRepository },
    useCaseInput,
  );

  if (result.success) {
    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    return { success: true, data: result.data };
  }

  return { success: false, error: result.error.message };
}

/**
 * Server Action: Desasignar una prenda de un bailarín.
 * Busca el movimiento activo (no devuelto) más reciente para esa prenda
 * y lo marca como devuelto, dejando la prenda "Disponible".
 */
export async function desasignarPrendaAction(input: {
  prendaId: string;
  bailarinId: string;
}): Promise<Result<void, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  // Buscar el movimiento activo más reciente de esta prenda para este bailarín
  const { data: movimientos, error: fetchError } = await supabase
    .from("movimientos")
    .select("id")
    .eq("prenda_id", input.prendaId)
    .eq("bailarin_id", input.bailarinId)
    .eq("devuelta", false)
    .order("created_at", { ascending: false })
    .limit(1);

  if (fetchError) {
    return { success: false, error: "Error al buscar el movimiento activo" };
  }

  if (!movimientos || movimientos.length === 0) {
    // No hay movimiento registrado, desasignar directamente la prenda
    const { error: updateError } = await supabase
      .from("prendas")
      .update({
        estado: "Disponible",
        bailarin_actual: null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", input.prendaId);

    if (updateError) {
      return { success: false, error: "Error al desasignar la prenda" };
    }

    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    revalidatePath(`/bailarines/${input.bailarinId}`);
    return { success: true, data: undefined };
  }

  // Usar la RPC de devolución con el movimiento encontrado
  const movimientoId = movimientos[0].id;
  const movimientoRepository = new SupabaseMovimientoRepository(supabase);

  const result = await devolverPrenda(
    { movimientoRepository },
    { movimientoId },
  );

  if (result.success) {
    revalidatePath("/movimientos");
    revalidatePath("/inventario");
    revalidatePath(`/bailarines/${input.bailarinId}`);
    return { success: true, data: undefined };
  }

  return { success: false, error: result.error.message };
}
