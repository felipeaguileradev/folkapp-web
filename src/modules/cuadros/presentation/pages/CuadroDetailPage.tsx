import { SupabaseCuadroRepository } from "../../infrastructure/repositories";
import { SupabasePlantillaRepository } from "../../infrastructure/repositories";
import { CuadroDetail } from "../components/CuadroDetail";
import { notFound } from "next/navigation";

interface CuadroDetailPageProps {
  cuadroId: string;
}

export async function CuadroDetailPage({ cuadroId }: CuadroDetailPageProps) {
  const cuadroRepository = new SupabaseCuadroRepository();
  const plantillaRepository = new SupabasePlantillaRepository();

  const cuadro = await cuadroRepository.findById(cuadroId);

  if (!cuadro) {
    notFound();
  }

  const plantillaMasculino = await plantillaRepository.findByCuadroYGenero(
    cuadroId,
    "Masculino",
  );
  const plantillaFemenino = await plantillaRepository.findByCuadroYGenero(
    cuadroId,
    "Femenino",
  );

  return (
    <div className="container mx-auto py-6 space-y-6">
      <CuadroDetail
        cuadro={cuadro}
        plantillaMasculino={plantillaMasculino}
        plantillaFemenino={plantillaFemenino}
      />
    </div>
  );
}
