"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import type { Result } from "@/shared/types";
import type {
  Funcion,
  ChecklistItem,
  ResultadoChecklist,
} from "../../domain/entities";
import {
  crearFuncion,
  verificarItem,
  marcarFaltante,
  finalizarFuncion,
} from "../../application/use-cases";
import type {
  CrearFuncionInput,
  CrearFuncionResult,
} from "../../application/use-cases";
import { SupabaseFuncionRepository } from "../repositories";
import { SupabaseChecklistRepository } from "../repositories";
import { SupabasePlantillaRepository } from "@/modules/cuadros/infrastructure/repositories";
import { SupabaseBailarinRepository } from "@/modules/bailarines/infrastructure/repositories/supabase-bailarin.repository";

/**
 * Server Action: Crear una función con generación automática de checklist.
 */
export async function crearFuncionAction(
  input: CrearFuncionInput,
): Promise<Result<CrearFuncionResult, string>> {
  const supabase = createClient();
  const funcionRepository = new SupabaseFuncionRepository();
  const checklistRepository = new SupabaseChecklistRepository();
  const plantillaRepository = new SupabasePlantillaRepository();
  const bailarinRepository = new SupabaseBailarinRepository(supabase);

  const result = await crearFuncion(
    {
      funcionRepository,
      checklistRepository,
      plantillaRepository,
      bailarinRepository,
    },
    input,
  );

  if (result.success) {
    revalidatePath("/funciones");
  }

  return result;
}

/**
 * Server Action: Verificar un ítem del checklist.
 */
export async function verificarItemAction(
  itemId: string,
): Promise<Result<void, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const checklistRepository = new SupabaseChecklistRepository();

  const result = await verificarItem(
    { checklistRepository },
    { itemId, verificadoPor: user.id },
  );

  if (result.success) {
    revalidatePath("/funciones");
  }

  return result;
}

/**
 * Server Action: Marcar un ítem del checklist como faltante.
 */
export async function marcarFaltanteAction(
  itemId: string,
): Promise<Result<void, string>> {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { success: false, error: "Usuario no autenticado" };
  }

  const checklistRepository = new SupabaseChecklistRepository();

  const result = await marcarFaltante(
    { checklistRepository },
    { itemId, verificadoPor: user.id },
  );

  if (result.success) {
    revalidatePath("/funciones");
  }

  return result;
}

/**
 * Server Action: Finalizar una función y guardar el resultado del checklist.
 */
export async function finalizarFuncionAction(
  funcionId: string,
): Promise<Result<ResultadoChecklist, string>> {
  const funcionRepository = new SupabaseFuncionRepository();
  const checklistRepository = new SupabaseChecklistRepository();

  const result = await finalizarFuncion(
    { funcionRepository, checklistRepository },
    { funcionId },
  );

  if (result.success) {
    revalidatePath("/funciones");
    revalidatePath(`/funciones/${funcionId}`);
  }

  return result;
}
