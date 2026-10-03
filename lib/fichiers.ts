// Pièces jointes (F9) : types acceptés, contrôle de la signature, stockage sur disque.
// Le type annoncé par le navigateur n'est pas cru : seuls les premiers octets font foi.

import { randomUUID } from "node:crypto";
import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";

export const TAILLE_MAX = 10 * 1024 * 1024; // 10 Mo
export const TYPES_ACCEPTES = [
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
] as const;
export type TypeAccepte = (typeof TYPES_ACCEPTES)[number];

const EXTENSIONS: Record<TypeAccepte, string> = {
  "application/pdf": "pdf",
  "image/png": "png",
  "image/jpeg": "jpg",
  "image/webp": "webp",
};

// Type réel d'après la signature du fichier (null : refusé)
export function detecterType(octets: Uint8Array): TypeAccepte | null {
  const debut = (...valeurs: number[]) =>
    valeurs.every((v, i) => octets[i] === v);
  if (debut(0x25, 0x50, 0x44, 0x46)) return "application/pdf"; // %PDF
  if (debut(0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a)) return "image/png";
  if (debut(0xff, 0xd8, 0xff)) return "image/jpeg";
  if (
    debut(0x52, 0x49, 0x46, 0x46) && // RIFF....WEBP
    octets[8] === 0x57 &&
    octets[9] === 0x45 &&
    octets[10] === 0x42 &&
    octets[11] === 0x50
  )
    return "image/webp";
  return null;
}

// Nom d'origine nettoyé (affichage et téléchargement)
export function nomPropre(nom: string): string {
  const base = nom.split(/[\\/]/).pop() ?? "fichier";
  // Caractères de contrôle et réservés remplacés par « _ »
  const propre = Array.from(base, (c) =>
    c.charCodeAt(0) < 32 || '"<>|:*?'.includes(c) ? "_" : c,
  ).join("");
  return propre.trim().slice(0, 200) || "fichier";
}

export const dossierUpload = () =>
  path.resolve(process.env.UPLOAD_DIR || path.join(process.cwd(), "uploads"));

// Enregistre le fichier sous un nom aléatoire ; renvoie la clé relative au dossier
export async function enregistrerFichier(
  octets: Uint8Array,
  type: TypeAccepte,
): Promise<string> {
  const sousDossier = new Date().toISOString().slice(0, 7); // AAAA-MM
  const cle = `${sousDossier}/${randomUUID()}.${EXTENSIONS[type]}`;
  const chemin = path.join(dossierUpload(), cle);
  await mkdir(path.dirname(chemin), { recursive: true });
  await writeFile(chemin, octets);
  return cle;
}

export async function lireFichier(cle: string): Promise<Buffer> {
  const racine = dossierUpload();
  const chemin = path.resolve(racine, cle);
  // Une clé ne peut pas sortir du dossier d'upload
  if (!chemin.startsWith(racine + path.sep)) throw new Error("Clé invalide");
  return readFile(chemin);
}
