import type { GeneroBailarin, Categoria } from "@/shared/types";
import type { PlantillaItem } from "../../domain/entities";

/** Fila de la tabla `plantilla_vestuario` en Supabase */
export interface PlantillaRow {
  id: string;
  cuadro_id: string;
  genero: GeneroBailarin;
  categoria: Categoria;
  nombre_prenda: string;
  orden: number;
}

/** Mapper entre la fila de Supabase y la entidad de dominio */
export const PlantillaMapper = {
  toDomain(row: PlantillaRow): PlantillaItem {
    return {
      id: row.id,
      cuadroId: row.cuadro_id,
      genero: row.genero,
      categoria: row.categoria,
      nombrePrenda: row.nombre_prenda,
      orden: row.orden,
    };
  },

  toRow(item: PlantillaItem): PlantillaRow {
    return {
      id: item.id,
      cuadro_id: item.cuadroId,
      genero: item.genero,
      categoria: item.categoria,
      nombre_prenda: item.nombrePrenda,
      orden: item.orden,
    };
  },
};
