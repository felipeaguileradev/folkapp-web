import type { Result } from "@/shared/types";
import type { AlertaRepository } from "../../domain/ports";

/** Dependencias del caso de uso AutoResolverAlerta */
export interface AutoResolverAlertaDeps {
  alertaRepository: AlertaRepository;
}

/** Input para resolver una alerta automáticamente */
export interface AutoResolverAlertaInput {
  alertaId: string;
}

/**
 * Caso de uso: Resolver una alerta automáticamente por el sistema.
 * Se invoca cuando la condición que generó la alerta ya no se cumple.
 * Marca la alerta como resuelta con "Resuelta por sistema" y la fecha actual.
 */
export async function autoResolverAlerta(
  deps: AutoResolverAlertaDeps,
  input: AutoResolverAlertaInput,
): Promise<Result<void, string>> {
  const { alertaRepository } = deps;
  const { alertaId } = input;

  try {
    await alertaRepository.resolverAutomatica(alertaId);
    return { success: true, data: undefined };
  } catch {
    return { success: false, error: "Error al auto-resolver la alerta" };
  }
}
