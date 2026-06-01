import { z } from "zod";

export const createMovimientoSchema = z.object({
  prendaId: z.string().uuid(),
  bailarinId: z.string().uuid(),
  bailarinDestinoId: z.string().uuid().nullable().optional(),
  tipo: z.enum([
    "Asignación",
    "Préstamo interno",
    "Préstamo externo",
    "Devolución",
    "Traspaso",
  ]),
  fechaDevolucionEsperada: z.coerce.date().nullable().optional(),
  observacion: z.string().max(500).nullable().optional(),
});

export type CreateMovimientoInput = z.infer<typeof createMovimientoSchema>;
