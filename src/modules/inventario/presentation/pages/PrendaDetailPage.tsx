import { createClient } from "@/shared/lib/supabase/server";
import { SupabasePrendaRepository } from "../../infrastructure/repositories";
import { SupabaseCuadroRepository } from "@/modules/cuadros/infrastructure/repositories";
import { SupabaseBailarinRepository } from "@/modules/bailarines/infrastructure/repositories";
import { PrendaCard } from "../components/PrendaCard";
import { notFound } from "next/navigation";

interface PrendaDetailPageProps {
  prendaId: string;
}

export async function PrendaDetailPage({ prendaId }: PrendaDetailPageProps) {
  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);
  const cuadroRepository = new SupabaseCuadroRepository();
  const bailarinRepository = new SupabaseBailarinRepository(supabase);

  const [prenda, cuadros] = await Promise.all([
    repository.findById(prendaId),
    cuadroRepository.findAll(),
  ]);

  if (!prenda) {
    notFound();
  }

  let bailarinNombre: string | null = null;
  if (prenda.bailarinActualId) {
    const bailarin = await bailarinRepository.findById(prenda.bailarinActualId);
    bailarinNombre = bailarin?.nombreCompleto ?? null;
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PrendaCard
        prenda={prenda}
        cuadros={cuadros}
        bailarinNombre={bailarinNombre}
      />
    </div>
  );
}
