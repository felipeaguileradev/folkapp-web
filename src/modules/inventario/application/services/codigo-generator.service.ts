import type { Genero } from "@/shared/types";
import { SequenceLimitError } from "@/shared/types";
import { CodigoIdentificador } from "../../domain/value-objects";
import type { PrendaRepository } from "../../domain/ports";

/** Nombre del cuadro para mapeo a código */
type CuadroName = "Huaso" | "Norte" | "Rapa Nui";

/**
 * Servicio de aplicación que genera códigos identificadores para prendas.
 * Usa el repositorio para obtener el siguiente número secuencial disponible
 * y el value object CodigoIdentificador para construir el código.
 */
export async function generateCodigo(
  repository: PrendaRepository,
  genero: Genero,
  cuadroName: CuadroName,
): Promise<string> {
  const nextSequential = await repository.getNextSequentialNumber(
    genero,
    cuadroName,
  );

  if (nextSequential > 999) {
    throw new SequenceLimitError(genero, cuadroName);
  }

  const codigo = CodigoIdentificador.fromParts(
    genero,
    cuadroName,
    nextSequential,
  );

  return codigo.toString();
}
