import { SupabaseFuncionRepository } from "../../infrastructure/repositories";
import { FuncionesContent } from "../components/FuncionesContent";

export async function FuncionesPage() {
  const repository = new SupabaseFuncionRepository();
  const funciones = await repository.findAll();

  return <FuncionesContent funciones={funciones} />;
}
