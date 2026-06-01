export {
  crearCuadro,
  actualizarCuadro,
  eliminarCuadro,
  obtenerCuadros,
  obtenerCuadroPorId,
  gestionarPlantilla,
  calcularCompletitud,
} from "./use-cases";

export type {
  CrearCuadroDeps,
  ActualizarCuadroDeps,
  ActualizarCuadroInput,
  EliminarCuadroDeps,
  ObtenerCuadrosDeps,
  GestionarPlantillaDeps,
  GestionarPlantillaInput,
  CalcularCompletitudDeps,
  CalcularCompletitudInput,
  CompletitudResult,
} from "./use-cases";
