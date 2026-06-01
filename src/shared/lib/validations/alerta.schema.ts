import { z } from "zod";

export const createAlertaSchema = z.object({
  tipoCondicion: z.string().min(1),
  prioridad: z.enum(["Alta", "Media", "Baja"]),
  entidadId: z.string().uuid(),
  entidadTipo: z.enum(["prenda", "bailarin"]),
  descripcion: z.string().min(1),
});

export type CreateAlertaInput = z.infer<typeof createAlertaSchema>;
