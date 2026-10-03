// @mentions dans un commentaire : « @Prénom Nom » d'une personne mentionnable.
// Fonctions pures (testées par lib/demandes/mentions.test.mjs).

export type Personne = { id: string; nom: string };

const normaliser = (s: string) =>
  s
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "")
    .toLowerCase();

const LETTRE_OU_CHIFFRE = /[\p{L}\p{N}]/u;

// Identifiants des personnes mentionnées (sans doublon). Les noms les plus longs sont
// cherchés d'abord : « @Lucas Petit » ne compte pas aussi comme « @Lucas ».
export function extraireMentions(
  texte: string,
  personnes: Personne[],
): string[] {
  let t = normaliser(texte);
  const trouves: string[] = [];
  const tries = [...personnes].sort((a, b) => b.nom.length - a.nom.length);
  for (const p of tries) {
    const motif = `@${normaliser(p.nom)}`;
    let i = t.indexOf(motif);
    while (i >= 0) {
      const suivant = t.charAt(i + motif.length);
      if (!LETTRE_OU_CHIFFRE.test(suivant)) {
        if (!trouves.includes(p.id)) trouves.push(p.id);
        // Mention consommée : masquée pour les noms plus courts
        t =
          t.slice(0, i) + " ".repeat(motif.length) + t.slice(i + motif.length);
      }
      i = t.indexOf(motif, i + 1);
    }
  }
  return trouves;
}

export type Segment = { texte: string; mention?: boolean };

// Découpe un texte pour surligner les mentions à l'affichage
export function decouperMentions(texte: string, noms: string[]): Segment[] {
  if (noms.length === 0 || !texte.includes("@")) return [{ texte }];
  const echapper = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  const alternatives = [...noms]
    .sort((a, b) => b.length - a.length)
    .map(echapper)
    .join("|");
  const motif = new RegExp(`@(?:${alternatives})(?![\\p{L}\\p{N}])`, "giu");
  const segments: Segment[] = [];
  let dernier = 0;
  for (const m of texte.matchAll(motif)) {
    const debut = m.index ?? 0;
    if (debut > dernier) segments.push({ texte: texte.slice(dernier, debut) });
    segments.push({ texte: m[0], mention: true });
    dernier = debut + m[0].length;
  }
  if (dernier < texte.length) segments.push({ texte: texte.slice(dernier) });
  return segments;
}
