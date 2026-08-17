import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseBailarinRepository } from "../../infrastructure/repositories/supabase-bailarin.repository";
import { SupabaseCuadroRepository } from "@/modules/cuadros/infrastructure/repositories/supabase-cuadro.repository";
import { BailarinProfile } from "../components/BailarinProfile";
import { notFound } from "next/navigation";

interface BailarinProfilePageProps {
  bailarinId: string;
}

export async function BailarinProfilePage({
  bailarinId,
}: BailarinProfilePageProps) {
  const supabase = createClient();
  const repository = new SupabaseBailarinRepository(supabase);

  const bailarin = await repository.findById(bailarinId);

  if (!bailarin) {
    notFound();
  }

  // Cargar cuadros para resolver nombres
  let cuadrosMap: Record<string, string> = {};
  try {
    const cuadroRepository = new SupabaseCuadroRepository();
    const cuadros = await cuadroRepository.findAll();
    for (const cuadro of cuadros) {
      cuadrosMap[cuadro.id] = cuadro.nombre;
    }
  } catch {
    // Si falla la carga de cuadros, continuar con mapa vacío
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <BailarinProfile bailarin={bailarin} cuadrosMap={cuadrosMap} />
    </div>
  );
}
