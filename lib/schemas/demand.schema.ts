import { z } from "zod";

export const demandSchema = z.object({
  title: z.string().min(3, "Le titre doit être au moins de 3 caractères."),
  description: z
    .string()
    .min(10, "La description doit être au moins de 10 caractères."),
});

export type DemandInput = z.infer<typeof demandSchema>;
