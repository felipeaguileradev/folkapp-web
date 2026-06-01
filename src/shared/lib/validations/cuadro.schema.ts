import { z } from "zod";

export const createCuadroSchema = z.object({
  nombre: z.string().min(1).max(50),
  zonaGeografica: z.string().min(1).max(100),
  descripcion: z.string().max(500).nullable().optional(),
  colorUi: z.string().min(1),
});

export const updateCuadroSchema = createCuadroSchema.partial();

export type CreateCuadroInput = z.infer<typeof createCuadroSchema>;
export type UpdateCuadroInput = z.infer<typeof updateCuadroSchema>;
