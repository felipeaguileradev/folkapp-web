import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { FuncionesPage } from "@/modules/funciones/presentation/pages/FuncionesPage";

export default function Page() {
  if (!isFeatureEnabled("funciones")) return notFound();
  return <FuncionesPage />;
}
