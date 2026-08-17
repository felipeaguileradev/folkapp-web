import { z } from "zod";

export const createPrendaSchema = z.object({
  nombre: z.string().min(1).max(100),
  cuadroId: z.string().uuid(),
  genero: z.enum(["Masculino", "Femenino", "Unisex"]),
  categoria: z.enum([
    "Tocado",
    "Ropa superior",
    "Ropa inferior",
    "Calzado",
    "Accesorio",
    "Joyería",
  ]),
  color: z.string().max(50).nullable().optional(),
  tallaONumero: z.string().max(20).nullable().optional(),
  identificadorFisico: z.string().max(50).nullable().optional(),
  propietario: z.enum(["Ballet", "Personal"]),
  propietarioNombre: z.string().max(100).nullable().optional(),
  bailarinActualId: z.string().uuid().nullable().optional(),
  ubicacion: z.string().max(100).nullable().optional(),
  estado: z.enum([
    "Disponible",
    "En uso",
    "En reparación",
    "Faltante",
    "Prestada",
    "Dada de baja",
  ]),
  comentarios: z.string().max(500).nullable().optional(),
  fechaIngreso: z.coerce.date(),
});

export const updatePrendaSchema = createPrendaSchema.partial();

export type CreatePrendaInput = z.infer<typeof createPrendaSchema>;
export type UpdatePrendaInput = z.infer<typeof updatePrendaSchema>;
