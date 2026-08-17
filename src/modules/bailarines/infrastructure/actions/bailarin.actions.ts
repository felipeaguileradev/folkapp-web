"use server";

// Server actions para el módulo de bailarines

import { Result } from "@/shared/types";
import { createClient } from "@/shared/lib/supabase/server";
import { Bailarin } from "../../domain";
import {
  crearBailarin,
  actualizarBailarin,
  toggleActivoBailarin,
} from "../../application";
import { SupabaseBailarinRepository } from "../repositories/supabase-bailarin.repository";

/** Bailarín simplificado para selectores */
export interface BailarinOption {
  id: string;
  nombreCompleto: string;
}

/**
 * Server Action: Obtener lista de bailarines activos para selectores.
 * Retorna solo id y nombre, ordenados alfabéticamente.
 */
export async function obtenerBailarinesActivosAction(): Promise<
  Result<BailarinOption[], string>
> {
  const client = createClient();

  const { data, error } = await client
    .from("bailarines")
    .select("id, nombre_completo")
    .eq("activo", true)
    .order("nombre_completo");

  if (error) {
    return { success: false, error: "Error al cargar bailarines" };
  }

  const bailarines: BailarinOption[] = (data ?? []).map((row) => ({
    id: row.id,
    nombreCompleto: row.nombre_completo,
  }));

  return { success: true, data: bailarines };
}

export async function crearBailarinAction(
  input: unknown,
): Promise<Result<Bailarin, string>> {
  const client = createClient();
  const bailarinRepository = new SupabaseBailarinRepository(client);

  return crearBailarin(input, { bailarinRepository });
}

export async function actualizarBailarinAction(
  id: string,
  input: unknown,
): Promise<Result<Bailarin, string>> {
  const client = createClient();
  const bailarinRepository = new SupabaseBailarinRepository(client);

  return actualizarBailarin(id, input, { bailarinRepository });
}

export async function toggleActivoAction(
  id: string,
  activo: boolean,
): Promise<Result<void, string>> {
  const client = createClient();
  const bailarinRepository = new SupabaseBailarinRepository(client);

  return toggleActivoBailarin({ id, activo }, { bailarinRepository });
}
