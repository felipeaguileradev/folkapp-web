import { SupabaseCuadroRepository } from "../../infrastructure/repositories";
import { CuadrosContent } from "../components/CuadrosContent";

export async function CuadrosPage() {
  const repository = new SupabaseCuadroRepository();
  const cuadros = await repository.findAll();

  return <CuadrosContent cuadros={cuadros} />;
}
