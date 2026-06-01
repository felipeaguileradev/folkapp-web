import { createClient } from "@/shared/lib/supabase/server";
import { SupabaseBailarinRepository } from "../../infrastructure/repositories/supabase-bailarin.repository";
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

  return (
    <div className="container mx-auto py-6 space-y-6">
      <BailarinProfile bailarin={bailarin} />
    </div>
  );
}
