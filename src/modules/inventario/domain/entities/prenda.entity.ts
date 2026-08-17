import type {
  Genero,
  Categoria,
  EstadoPrenda,
  Propietario,
} from "@/shared/types";

/** Entidad de dominio que representa una prenda del inventario */
export interface Prenda {
  id: string;
  codigoIdentificador: string; // "{G}{C}-{NNN}"
  nombre: string; // max 100
  cuadroId: string;
  genero: Genero;
  categoria: Categoria;
  color: string | null; // max 50
  tallaONumero: string | null; // max 20
  identificadorFisico: string | null; // max 50
  bailarinActualId: string | null;
  propietario: Propietario;
  propietarioNombre: string | null; // nombre del dueño si propietario es "Personal"
  ubicacion: string | null; // max 100
  estado: EstadoPrenda;
  fotoUrl: string | null;
  comentarios: string | null; // max 500
  fechaIngreso: Date;
  createdAt: Date;
  updatedAt: Date;
}

/** DTO para crear una prenda (sin id ni timestamps) */
export interface CreatePrendaDTO {
  codigoIdentificador: string;
  nombre: string;
  cuadroId: string;
  genero: Genero;
  categoria: Categoria;
  color?: string | null;
  tallaONumero?: string | null;
  identificadorFisico?: string | null;
  bailarinActualId?: string | null;
  propietario: Propietario;
  propietarioNombre?: string | null;
  ubicacion?: string | null;
  estado: EstadoPrenda;
  comentarios?: string | null;
  fechaIngreso: Date;
}

/** DTO para actualizar una prenda (todos los campos opcionales) */
export interface UpdatePrendaDTO {
  nombre?: string;
  cuadroId?: string;
  genero?: Genero;
  categoria?: Categoria;
  color?: string | null;
  tallaONumero?: string | null;
  identificadorFisico?: string | null;
  bailarinActualId?: string | null;
  propietario?: Propietario;
  propietarioNombre?: string | null;
  ubicacion?: string | null;
  estado?: EstadoPrenda;
  fotoUrl?: string | null;
  comentarios?: string | null;
  fechaIngreso?: Date;
}
