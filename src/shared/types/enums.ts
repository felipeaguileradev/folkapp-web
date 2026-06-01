// Tipos de dominio compartidos para BFV Wardrobe Management

/** Género de una prenda */
export type Genero = "Masculino" | "Femenino" | "Unisex";

/** Género de un bailarín (sin opción Unisex) */
export type GeneroBailarin = "Masculino" | "Femenino";

/** Categoría de prenda */
export type Categoria =
  | "Tocado"
  | "Ropa superior"
  | "Ropa inferior"
  | "Calzado"
  | "Accesorio"
  | "Joyería";

/** Estado actual de una prenda */
export type EstadoPrenda =
  | "Disponible"
  | "En uso"
  | "En reparación"
  | "Faltante"
  | "Prestada"
  | "Dada de baja";

/** Tipo de movimiento registrado */
export type TipoMovimiento =
  | "Asignación"
  | "Préstamo interno"
  | "Préstamo externo"
  | "Devolución"
  | "Traspaso";

/** Propietario de una prenda */
export type Propietario = "Ballet" | "Personal";

/** Prioridad de una alerta */
export type Prioridad = "Alta" | "Media" | "Baja";

/** Estado de una función/evento */
export type EstadoFuncion = "Pendiente" | "En curso" | "Finalizada";

/** Tipo de evento registrado en el historial */
export type TipoEvento =
  | "Asignación"
  | "Devolución"
  | "Cambio de estado"
  | "Reparación"
  | "Préstamo"
  | "Traspaso"
  | "Comentario agregado"
  | "Creación de prenda";

/** Estado de verificación de un ítem del checklist */
export type EstadoVerificacion = "pendiente" | "verificado" | "faltante";

/** Rol de usuario en el sistema */
export type Role = "admin" | "encargado";
