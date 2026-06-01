import { createClient } from "@/shared/lib/supabase/server";
import type { GeneroBailarin } from "@/shared/types";
import type { PlantillaItem } from "../../domain/entities";
import type { PlantillaRepository } from "../../domain/ports";
import { PlantillaMapper } from "../mappers";
import type { PlantillaRow } from "../mappers";

/** Implementación Supabase del repositorio de plantillas de vestuario */
export class SupabasePlantillaRepository implements PlantillaRepository {
  async findByCuadroYGenero(
    cuadroId: string,
    genero: GeneroBailarin,
  ): Promise<PlantillaItem[]> {
    const supabase = createClient();
    const { data, error } = await supabase
      .from("plantilla_vestuario")
      .select("*")
      .eq("cuadro_id", cuadroId)
      .eq("genero", genero)
      .order("orden");

    if (error) throw new Error(`Error fetching plantilla: ${error.message}`);

    return (data as PlantillaRow[]).map(PlantillaMapper.toDomain);
  }

  async setByCuadroYGenero(
    cuadroId: string,
    genero: GeneroBailarin,
    items: PlantillaItem[],
  ): Promise<void> {
    const supabase = createClient();

    // Eliminar ítems existentes para esta combinación cuadro-género
    const { error: deleteError } = await supabase
      .from("plantilla_vestuario")
      .delete()
      .eq("cuadro_id", cuadroId)
      .eq("genero", genero);

    if (deleteError)
      throw new Error(`Error deleting plantilla items: ${deleteError.message}`);

    // Insertar los nuevos ítems (si hay alguno)
    if (items.length === 0) return;

    const rows = items.map(PlantillaMapper.toRow);
    const { error: insertError } = await supabase
      .from("plantilla_vestuario")
      .insert(rows);

    if (insertError)
      throw new Error(
        `Error inserting plantilla items: ${insertError.message}`,
      );
  }
}
