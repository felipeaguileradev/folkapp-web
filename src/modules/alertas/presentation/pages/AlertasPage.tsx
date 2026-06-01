import { SupabaseAlertaRepository } from "../../infrastructure/repositories";
import { AlertasContent } from "../components/AlertasContent";

export async function AlertasPage() {
  const repository = new SupabaseAlertaRepository();

  const alertasActivas = await repository.findActivas();
  const alertasResueltas = await repository.findResueltas({
    page: 1,
    pageSize: 20,
  });

  return (
    <AlertasContent
      alertasActivas={alertasActivas}
      alertasResueltas={alertasResueltas.data}
    />
  );
}
