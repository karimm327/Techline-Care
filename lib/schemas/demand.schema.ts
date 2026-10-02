import { z } from "zod";

// Règles d'une demande, partagées par le formulaire (client) et l'API (serveur)
export const demandSchema = z.object({
  title: z
    .string()
    .trim()
    .min(3, "Le titre doit être au moins de 3 caractères.")
    .max(200, "Le titre ne doit pas dépasser 200 caractères."),
  description: z
    .string()
    .trim()
    .min(10, "La description doit être au moins de 10 caractères."),
});

export type DemandInput = z.infer<typeof demandSchema>;

// Premier message d'erreur par champ : { title: "…", description: "…" }
export function erreursDemande(
  donnees: unknown,
): Partial<Record<keyof DemandInput, string>> {
  const resultat = demandSchema.safeParse(donnees);
  if (resultat.success) return {};
  const erreurs: Partial<Record<keyof DemandInput, string>> = {};
  for (const probleme of resultat.error.issues) {
    const champ = probleme.path[0] as keyof DemandInput;
    if (!erreurs[champ]) erreurs[champ] = probleme.message;
  }
  return erreurs;
}
