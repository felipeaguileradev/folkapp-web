import { z } from "zod";

export const createFuncionSchema = z.object({
  nombre: z.string().min(1).max(100),
  fecha: z.coerce.date(),
  lugar: z.string().max(200).nullable().optional(),
  cuadrosQueSePresenten: z.array(z.string().uuid()).min(1).max(3),
  bailarinesConvocados: z.array(z.string().uuid()).min(1),
});

export type CreateFuncionInput = z.infer<typeof createFuncionSchema>;
