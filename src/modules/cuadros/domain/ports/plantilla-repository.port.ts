import type { GeneroBailarin } from "@/shared/types";
import type { PlantillaItem } from "../entities/plantilla-item.entity";

/** Puerto del repositorio de plantillas de vestuario */
export interface PlantillaRepository {
  findByCuadroYGenero(
    cuadroId: string,
    genero: GeneroBailarin,
  ): Promise<PlantillaItem[]>;
  setByCuadroYGenero(
    cuadroId: string,
    genero: GeneroBailarin,
    items: PlantillaItem[],
  ): Promise<void>;
}
