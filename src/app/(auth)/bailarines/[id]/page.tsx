import { notFound } from "next/navigation";
import { isFeatureEnabled } from "@/lib/feature-flags";
import { BailarinProfilePage } from "@/modules/bailarines/presentation/pages/BailarinProfilePage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  if (!isFeatureEnabled("bailarines")) return notFound();
  return <BailarinProfilePage bailarinId={params.id} />;
}
