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
