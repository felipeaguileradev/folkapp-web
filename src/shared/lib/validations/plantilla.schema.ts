import { z } from "zod";

export const createPlantillaSchema = z.object({
  cuadroId: z.string().uuid(),
  genero: z.enum(["Masculino", "Femenino"]),
  categoria: z.enum([
    "Tocado",
    "Ropa superior",
    "Ropa inferior",
    "Calzado",
    "Accesorio",
    "Joyería",
  ]),
  nombrePrenda: z.string().min(1).max(100),
  orden: z.number().int().min(0),
});

export type CreatePlantillaInput = z.infer<typeof createPlantillaSchema>;
