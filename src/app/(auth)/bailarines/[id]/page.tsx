import { BailarinProfilePage } from "@/modules/bailarines/presentation/pages/BailarinProfilePage";

interface PageProps {
  params: { id: string };
}

export default function Page({ params }: PageProps) {
  return <BailarinProfilePage bailarinId={params.id} />;
}
