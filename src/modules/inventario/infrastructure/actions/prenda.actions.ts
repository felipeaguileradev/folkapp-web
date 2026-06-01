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
