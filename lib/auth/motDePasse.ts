import { timingSafeEqual } from "node:crypto";
import bcrypt from "bcrypt";

// Coût bcrypt : ~250 ms par vérification sur un serveur courant (ralentit les attaques par force brute)
const COUT = 12;

// Empreinte factice : la vérification prend le même temps qu'un compte existe ou non
const EMPREINTE_FACTICE =
  "$2b$12$efvyk1q6khIzy0Nn8S0u/.MFOhDmWg0FHzoK0jSj.BjZ09j0rkLSi";

export const estHache = (stocke: string) => /^\$2[aby]\$\d{2}\$/.test(stocke);

export function hacherMotDePasse(motDePasse: string): Promise<string> {
  return bcrypt.hash(motDePasse, COUT);
}

/* Vérifie un mot de passe saisi contre la valeur en base.
   Anciennes valeurs encore en clair : comparées en temps constant, et `aRehacher` indique
   qu'il faut les remplacer par une empreinte (migration progressive à la connexion). */
export async function verifierMotDePasse(
  saisi: string,
  stocke: string | null | undefined,
): Promise<{ ok: boolean; aRehacher: boolean }> {
  if (!stocke) {
    await bcrypt.compare(saisi, EMPREINTE_FACTICE);
    return { ok: false, aRehacher: false };
  }
  if (estHache(stocke)) {
    return { ok: await bcrypt.compare(saisi, stocke), aRehacher: false };
  }
  const a = Buffer.from(saisi);
  const b = Buffer.from(stocke);
  const ok = a.length === b.length && timingSafeEqual(a, b);
  return { ok, aRehacher: ok };
}
