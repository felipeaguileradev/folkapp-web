import { BailarinesPage } from "@/modules/bailarines/presentation/pages/BailarinesPage";

interface PageProps {
  searchParams: {
    page?: string;
    cuadroId?: string;
    genero?: string;
    activo?: string;
    q?: string;
  };
}

export default function Page({ searchParams }: PageProps) {
  return <BailarinesPage searchParams={searchParams} />;
}
