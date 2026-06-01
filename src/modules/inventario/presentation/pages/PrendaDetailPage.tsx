import { createClient } from "@/shared/lib/supabase/server";
import { SupabasePrendaRepository } from "../../infrastructure/repositories";
import { PrendaCard } from "../components/PrendaCard";
import { notFound } from "next/navigation";

interface PrendaDetailPageProps {
  prendaId: string;
}

export async function PrendaDetailPage({ prendaId }: PrendaDetailPageProps) {
  const supabase = createClient();
  const repository = new SupabasePrendaRepository(supabase);

  const prenda = await repository.findById(prendaId);

  if (!prenda) {
    notFound();
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      <PrendaCard prenda={prenda} />
    </div>
  );
}
