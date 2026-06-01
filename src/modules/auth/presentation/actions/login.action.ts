"use server";

import { createClient } from "@/shared/lib/supabase/server";
import type { Result } from "@/shared/types";

/**
 * Server Action: Login con email y contraseña.
 * Muestra un mensaje genérico en caso de error para no revelar
 * si el email existe o no (Req 9.6).
 */
export async function loginAction(
  email: string,
  password: string,
): Promise<Result<void, string>> {
  const supabase = createClient();

  const { error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    // Mensaje genérico para no filtrar información (Req 9.6)
    return {
      success: false,
      error: "Credenciales inválidas. Verifica tu correo y contraseña.",
    };
  }

  return { success: true, data: undefined };
}

/**
 * Server Action: Cerrar sesión.
 */
export async function logoutAction(): Promise<Result<void, string>> {
  const supabase = createClient();

  const { error } = await supabase.auth.signOut();

  if (error) {
    return { success: false, error: "Error al cerrar sesión" };
  }

  return { success: true, data: undefined };
}
