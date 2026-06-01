"use client";

import { useEffect, useState } from "react";
import { createBrowserClient } from "@supabase/ssr";
import type { Role } from "@/shared/types";

/**
 * Hook que lee el rol del usuario desde el JWT (app_metadata).
 * Retorna el rol y si el usuario es admin.
 */
export function useUserRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const supabase = createBrowserClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
    );

    const getRole = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (session?.user) {
        const userRole =
          (session.user.app_metadata?.role as Role) ?? "encargado";
        setRole(userRole);
      }
      setIsLoading(false);
    };

    getRole();
  }, []);

  return {
    role,
    isAdmin: role === "admin",
    isEncargado: role === "encargado",
    isLoading,
  };
}
