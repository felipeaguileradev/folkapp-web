"use server";

import type { Result, GeneroBailarin } from "@/shared/types";
import type {
  CreateCuadroInput,
  UpdateCuadroInput,
} from "@/shared/lib/validations/cuadro.schema";
import type { CreatePlantillaInput } from "@/shared/lib/validations/plantilla.schema";
import type { Cuadro, PlantillaItem } from "../../domain/entities";
import {
  crearCuadro,
  actualizarCuadro,
  eliminarCuadro,
  obtenerCuadros,
  gestionarPlantilla,
} from "../../application/use-cases";
import { SupabaseCuadroRepository } from "../repositories";
import { SupabasePlantillaRepository } from "../repositories";

function getCuadroRepository() {
  return new SupabaseCuadroRepository();
}

function getPlantillaRepository() {
  return new SupabasePlantillaRepository();
}

/** Server Action: Crear un cuadro de baile */
export async function crearCuadroAction(
  input: CreateCuadroInput,
): Promise<Result<Cuadro, string>> {
  return crearCuadro({ cuadroRepository: getCuadroRepository() }, input);
}

/** Server Action: Actualizar un cuadro existente */
export async function actualizarCuadroAction(
  id: string,
  input: UpdateCuadroInput,
): Promise<Result<Cuadro, string>> {
  return actualizarCuadro(
    { cuadroRepository: getCuadroRepository() },
    { id, data: input },
  );
}

/** Server Action: Eliminar un cuadro por su ID */
export async function eliminarCuadroAction(
  id: string,
): Promise<Result<void, string>> {
  return eliminarCuadro({ cuadroRepository: getCuadroRepository() }, id);
}

/** Server Action: Obtener todos los cuadros */
export async function obtenerCuadrosAction(): Promise<
  Result<Cuadro[], string>
> {
  return obtenerCuadros({ cuadroRepository: getCuadroRepository() });
}

/** Server Action: Gestionar la plantilla de vestuario de un cuadro-género */
export async function gestionarPlantillaAction(
  cuadroId: string,
  genero: GeneroBailarin,
  items: CreatePlantillaInput[],
): Promise<Result<PlantillaItem[], string>> {
  return gestionarPlantilla(
    {
      cuadroRepository: getCuadroRepository(),
      plantillaRepository: getPlantillaRepository(),
    },
    { cuadroId, genero, items },
  );
}
