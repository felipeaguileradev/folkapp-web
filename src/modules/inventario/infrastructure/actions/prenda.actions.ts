"use server";

import { revalidatePath } from "next/cache";
import { createClient } from "@/shared/lib/supabase/server";
import type { Result } from "@/shared/types";
import { ImageUploadError } from "@/shared/types";
import type {
  CreatePrendaInput,
  UpdatePrendaInput,
} from "@/shared/lib/validations/prenda.schema";
import type { Prenda } from "../../domain/entities";
import type { PrendaFilters } from "../../domain/ports";
import { crearPrenda } from "../../application/use-cases";
import { actualizarPrenda } from "../../application/use-cases";
import { eliminarPrenda } from "../../application/use-cases";
import { buscarPrendas } from "../../application/use-cases";
import { SupabasePrendaRepository } from "../repositories";
import {
  autoResolverAlertasPorEntidad,
  getCondicionesResueltasPorEstadoPrenda,
  getCondicionesResueltasPorUbicacion,
  getCondicionesResueltasPorComentarios,
} from "@/modules/alertas/application/services";
import { SupabaseAlertaRepository } from "@/modules/alertas/infrastructure/repositories";

// --- Constantes de validación de imagen ---
const ALLOWED_MIME_TYPES = ["image/jpeg", "image/png", "image/webp"];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5 MB

/**
 * Sube una imagen de prenda a Supabase Storage.
 * Valida formato (JPG/PNG/WebP) y tamaño (max 5MB).
 * @returns URL pública de la imagen subida
 * @throws ImageUploadError si la validación falla
 */
export async function uploadPrendaImage(
  file: File,
  prendaId: string,
): Promise<string> {
  // Validar tipo MIME
  if (!ALLOWED_MIME_TYPES.includes(file.type)) {
    throw new ImageUploadError("format");
  }

  // Validar tamaño
  if (file.size > MAX_FILE_SIZE) {
    throw new ImageUploadError("size");
  }

  const supabase = createClient();
  const extension = file.name.split(".").pop() ?? "jpg";
  const filePath = `${prendaId}/${Date.now()}.${extension}`;

  const { error: uploadError } = await supabase.storage
    .from("prendas")
    .upload(filePath, file, {
      contentType: file.type,
      upsert: true,
    });

  if (uploadError) {
    throw new Error(`Error uploading image: ${uploadError.message}`);
  }

  const { data: publicUrlData } = supabase.storage
    .from("prendas")
    .getPublicUrl(filePath);

  return publicUrlData.publicUrl;
}

/**
 * Server Action: Crear una prenda en el inventario.
 * Genera automáticamente el código identificador.
 */
export async function crearPrendaAction(
  data: CreatePrendaInput,
  cuadroName: "Huaso" | "Norte" | "Rapa Nui",
): Promise<Result<Prenda, string>> {
  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);

  const result = await crearPrenda(
    { prendaRepository: repository },
    { data, cuadroName },
  );

  if (result.success) {
    revalidatePath("/inventario");
  }

  return result;
}

/** Datos individuales opcionales para cada prenda en creación masiva */
export interface BulkItemOverride {
  tallaONumero?: string | null;
  identificadorFisico?: string | null;
  color?: string | null;
  comentarios?: string | null;
}

/**
 * Server Action: Crear múltiples prendas idénticas (con opción de personalizar talla/identificador por unidad).
 * Genera automáticamente códigos secuenciales para cada una.
 */
export async function crearPrendasMasivoAction(
  baseData: CreatePrendaInput,
  cuadroName: "Huaso" | "Norte" | "Rapa Nui",
  cantidad: number,
  overrides?: BulkItemOverride[],
): Promise<Result<Prenda[], string>> {
  if (cantidad < 1 || cantidad > 50) {
    return { success: false, error: "La cantidad debe estar entre 1 y 50" };
  }

  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);

  const createdPrendas: Prenda[] = [];
  const errors: string[] = [];

  for (let i = 0; i < cantidad; i++) {
    const itemOverride = overrides?.[i];
    const itemData: CreatePrendaInput = {
      ...baseData,
      tallaONumero: itemOverride?.tallaONumero ?? baseData.tallaONumero,
      identificadorFisico:
        itemOverride?.identificadorFisico ?? baseData.identificadorFisico,
      color: itemOverride?.color ?? baseData.color,
      comentarios: itemOverride?.comentarios ?? baseData.comentarios,
    };

    const result = await crearPrenda(
      { prendaRepository: repository },
      { data: itemData, cuadroName },
    );

    if (result.success) {
      createdPrendas.push(result.data);
    } else {
      errors.push(`Prenda ${i + 1}: ${result.error}`);
    }
  }

  if (createdPrendas.length > 0) {
    revalidatePath("/inventario");
  }

  if (errors.length > 0 && createdPrendas.length === 0) {
    return { success: false, error: errors.join(". ") };
  }

  return { success: true, data: createdPrendas };
}

/**
 * Server Action: Actualizar una prenda existente.
 * Después de actualizar, auto-resuelve alertas si las condiciones cambiaron.
 */
export async function actualizarPrendaAction(
  id: string,
  data: UpdatePrendaInput,
): Promise<Result<Prenda, string>> {
  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);

  // Obtener estado anterior para comparar
  const prendaAnterior = await repository.findById(id);

  const result = await actualizarPrenda(
    { prendaRepository: repository },
    { id, data },
  );

  if (result.success && prendaAnterior) {
    const alertaRepository = new SupabaseAlertaRepository();
    const prendaNueva = result.data;

    // Auto-resolver alertas por cambio de estado
    if (data.estado && prendaAnterior.estado !== data.estado) {
      const condiciones = getCondicionesResueltasPorEstadoPrenda(
        prendaAnterior.estado,
        data.estado,
      );
      if (condiciones.length > 0) {
        await autoResolverAlertasPorEntidad(
          { alertaRepository },
          id,
          condiciones,
        );
      }
    }

    // Auto-resolver por ubicación
    const condicionesUbicacion = getCondicionesResueltasPorUbicacion(
      prendaAnterior.ubicacion,
      prendaNueva.ubicacion,
    );
    if (condicionesUbicacion.length > 0) {
      await autoResolverAlertasPorEntidad(
        { alertaRepository },
        id,
        condicionesUbicacion,
      );
    }

    // Auto-resolver por comentarios
    const condicionesComentarios = getCondicionesResueltasPorComentarios(
      prendaAnterior.comentarios,
      prendaNueva.comentarios,
    );
    if (condicionesComentarios.length > 0) {
      await autoResolverAlertasPorEntidad(
        { alertaRepository },
        id,
        condicionesComentarios,
      );
    }

    revalidatePath("/inventario");
    revalidatePath(`/inventario/${id}`);
    revalidatePath("/alertas");
  }

  return result;
}

/**
 * Server Action: Eliminar una prenda del inventario.
 */
export async function eliminarPrendaAction(
  id: string,
): Promise<Result<void, string>> {
  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);

  const result = await eliminarPrenda({ prendaRepository: repository }, { id });

  if (result.success) {
    revalidatePath("/inventario");
  }

  return result;
}

/**
 * Server Action: Buscar prendas por nombre, código o nombre de bailarín.
 */
export async function buscarPrendasAction(
  query: string,
  filters?: PrendaFilters,
): Promise<Result<Prenda[], string>> {
  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);

  return buscarPrendas({ prendaRepository: repository }, { query, filters });
}

/**
 * Server Action: Eliminar múltiples prendas del inventario.
 */
export async function eliminarPrendasMasivoAction(
  ids: string[],
): Promise<Result<{ deleted: number; errors: string[] }, string>> {
  if (ids.length === 0) {
    return {
      success: false,
      error: "No se seleccionaron prendas para eliminar",
    };
  }

  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);

  const errors: string[] = [];
  let deleted = 0;

  for (const id of ids) {
    const result = await eliminarPrenda(
      { prendaRepository: repository },
      { id },
    );
    if (result.success) {
      deleted++;
    } else {
      errors.push(`Error al eliminar ${id}: ${result.error}`);
    }
  }

  revalidatePath("/inventario");

  if (deleted === 0) {
    return { success: false, error: "No se pudo eliminar ninguna prenda" };
  }

  return { success: true, data: { deleted, errors } };
}

/** Prenda simplificada para selectores de asignación rápida */
export interface PrendaDisponibleOption {
  id: string;
  nombre: string;
  codigoIdentificador: string;
  categoria: string;
  cuadroId: string;
  color: string | null;
  tallaONumero: string | null;
  identificadorFisico: string | null;
  propietario: string;
}

/**
 * Server Action: Obtener prendas disponibles filtradas por género.
 * Incluye prendas con género "Unisex" además del género indicado.
 * Solo retorna prendas con estado "Disponible".
 */
export async function obtenerPrendasDisponiblesAction(
  genero: "Masculino" | "Femenino",
): Promise<Result<PrendaDisponibleOption[], string>> {
  const supabase = createClient();

  const { data, error } = await supabase
    .from("prendas")
    .select(
      "id, nombre, codigo_identificador, categoria, cuadro_id, color, talla_o_numero, identificador_fisico, propietario",
    )
    .eq("estado", "Disponible")
    .in("genero", [genero, "Unisex"])
    .order("nombre");

  if (error) {
    return { success: false, error: "Error al cargar prendas disponibles" };
  }

  const prendas: PrendaDisponibleOption[] = (data ?? []).map((row) => ({
    id: row.id,
    nombre: row.nombre,
    codigoIdentificador: row.codigo_identificador,
    categoria: row.categoria,
    cuadroId: row.cuadro_id,
    color: row.color,
    tallaONumero: row.talla_o_numero,
    identificadorFisico: row.identificador_fisico,
    propietario: row.propietario,
  }));

  return { success: true, data: prendas };
}
