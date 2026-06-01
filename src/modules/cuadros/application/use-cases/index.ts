export { crearCuadro } from "./crear-cuadro.use-case";
export type { CrearCuadroDeps } from "./crear-cuadro.use-case";

export { actualizarCuadro } from "./actualizar-cuadro.use-case";
export type {
  ActualizarCuadroDeps,
  ActualizarCuadroInput,
} from "./actualizar-cuadro.use-case";

export { eliminarCuadro } from "./eliminar-cuadro.use-case";
export type { EliminarCuadroDeps } from "./eliminar-cuadro.use-case";

export { obtenerCuadros, obtenerCuadroPorId } from "./obtener-cuadros.use-case";
export type { ObtenerCuadrosDeps } from "./obtener-cuadros.use-case";

export { gestionarPlantilla } from "./gestionar-plantilla.use-case";
export type {
  GestionarPlantillaDeps,
  GestionarPlantillaInput,
} from "./gestionar-plantilla.use-case";

export { calcularCompletitud } from "./calcular-completitud.use-case";
export type {
  CalcularCompletitudDeps,
  CalcularCompletitudInput,
  CompletitudResult,
} from "./calcular-completitud.use-case";
