import { SupabaseFuncionRepository } from "../../infrastructure/repositories";
import { SupabaseChecklistRepository } from "../../infrastructure/repositories";
import { ChecklistView } from "../components/ChecklistView";
import { notFound } from "next/navigation";

interface FuncionDetailPageProps {
  funcionId: string;
}

export async function FuncionDetailPage({ funcionId }: FuncionDetailPageProps) {
  const funcionRepository = new SupabaseFuncionRepository();
  const checklistRepository = new SupabaseChecklistRepository();

  const funcion = await funcionRepository.findById(funcionId);

  if (!funcion) {
    notFound();
  }

  const checklistItems = await checklistRepository.findByFuncion(funcionId);

  return (
    <div className="container mx-auto py-6 space-y-6">
      <ChecklistView funcion={funcion} items={checklistItems} />
    </div>
  );
}
