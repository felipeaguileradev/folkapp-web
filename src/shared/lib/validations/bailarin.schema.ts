import { z } from "zod";

export const createBailarinSchema = z.object({
  nombreCompleto: z.string().min(1).max(100),
  genero: z.enum(["Masculino", "Femenino"]),
  cuadrosActivos: z.array(z.string().min(1)).max(3),
  colorNorte: z.string().nullable().optional(),
  tallas: z.object({
    camisa: z.string().nullable().optional(),
    pantalon: z.string().nullable().optional(),
    sombrero: z.string().nullable().optional(),
    calzado: z.string().nullable().optional(),
    personalizados: z
      .array(
        z.object({
          nombre: z.string().max(30),
          valor: z.string().max(30),
        }),
      )
      .max(5)
      .optional(),
  }),
  fechaIngreso: z.coerce.date(),
  notas: z.string().max(500).nullable().optional(),
});

export const updateBailarinSchema = createBailarinSchema.partial();

export type CreateBailarinInput = z.infer<typeof createBailarinSchema>;
export type UpdateBailarinInput = z.infer<typeof updateBailarinSchema>;
