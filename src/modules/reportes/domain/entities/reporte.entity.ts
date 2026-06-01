import type {
  Categoria,
  EstadoPrenda,
  Genero,
  Propietario,
} from "@/shared/types";

/** Filtros para el reporte de inventario */
export interface ReporteInventarioFilters {
  cuadroId?: string;
  genero?: Genero;
  estado?: EstadoPrenda;
  bailarinId?: string;
}

/** Fila del reporte de inventario */
export interface ReporteInventarioItem {
  codigoIdentificador: string;
  nombre: string;
  cuadroNombre: string;
  genero: Genero;
  categoria: Categoria;
  estado: EstadoPrenda;
  propietario: Propietario;
  bailarinNombre: string | null;
  ubicacion: string | null;
}

/** Ítem de la lista de compras (prendas faltantes) */
export interface ListaComprasItem {
  cuadroNombre: string;
  categoria: Categoria;
  nombre: string;
  genero: Genero;
  cantidad: number;
}

/** Ficha de un bailarín para reporte */
export interface FichaBailarin {
  nombreCompleto: string;
  genero: string;
  tallas: Record<string, string | null>;
  vestuarioPorCuadro: Record<string, { nombre: string; categoria: string }[]>;
}

/** Reporte de estado de un cuadro */
export interface ReporteEstadoCuadro {
  cuadroNombre: string;
  completitudGeneral: number;
  alertasActivas: number;
  prendasEnReparacion: number;
  totalPrendas: number;
  totalBailarines: number;
}
