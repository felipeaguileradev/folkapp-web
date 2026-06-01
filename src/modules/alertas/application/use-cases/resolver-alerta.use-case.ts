import type { Result } from "@/shared/types";
import type { AlertaRepository } from "../../domain/ports";

/** Dependencias del caso de uso ResolverAlerta */
export interface ResolverAlertaDeps {
  alertaRepository: AlertaRepository;
}

/** Input para resolver una alerta manualmente */
export interface ResolverAlertaInput {
  alertaId: string;
  usuario: string;
}

/**
 * Caso de uso: Resolver una alerta manualmente.
 * Marca la alerta como resuelta con el usuario que la resolvió y la fecha actual.
 */
export async function resolverAlerta(
  deps: ResolverAlertaDeps,
  input: ResolverAlertaInput,
): Promise<Result<void, string>> {
  const { alertaRepository } = deps;
  const { alertaId, usuario } = input;

  try {
    await alertaRepository.resolver(alertaId, usuario);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al resolver la alerta" };
  }
}
