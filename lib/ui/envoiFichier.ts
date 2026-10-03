"use client";

// Contrôles côté navigateur (le serveur revérifie la signature réelle du fichier)
export const TAILLE_MAX_FICHIER = 10 * 1024 * 1024;
export const ACCEPT_FICHIERS =
  "application/pdf,image/png,image/jpeg,image/webp,.pdf,.png,.jpg,.jpeg,.webp";

export function verifierFichier(f: File): string | null {
  if (f.size > TAILLE_MAX_FICHIER)
    return "Fichier trop lourd : 10 Mo au maximum.";
  if (
    !/\.(pdf|png|jpe?g|webp)$/i.test(f.name) &&
    !/^(application\/pdf|image\/(png|jpeg|webp))$/.test(f.type)
  )
    return "Format non accepté : PDF, PNG, JPG ou WEBP uniquement.";
  return null;
}

// Envoi multipart avec progression (fetch ne donne pas la progression de l'upload)
export function envoyerFichier<T>(
  url: string,
  fichier: File,
  surProgression: (ratio: number) => void,
): Promise<T> {
  return new Promise((resoudre, rejeter) => {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.responseType = "json";
    xhr.upload.onprogress = (e) => {
      if (e.lengthComputable) surProgression(e.loaded / e.total);
    };
    xhr.onload = () => {
      if (xhr.status >= 200 && xhr.status < 300) resoudre(xhr.response as T);
      else rejeter(new Error(xhr.response?.message ?? "Envoi impossible."));
    };
    xhr.onerror = () =>
      rejeter(new Error("Connexion interrompue pendant l’envoi."));
    const donnees = new FormData();
    donnees.append("fichier", fichier);
    xhr.send(donnees);
  });
}

// Pastille de type : PDF corail, image bleue, autre grise
export function typeFichier(nom: string, mime?: string) {
  if (mime === "application/pdf" || /\.pdf$/i.test(nom))
    return { libelle: "PDF", classe: "bg-prio-haute/15 text-prio-haute-fg" };
  if (mime?.startsWith("image/") || /\.(png|jpe?g|webp)$/i.test(nom))
    return { libelle: "IMG", classe: "bg-st-nouvelle/15 text-st-nouvelle-fg" };
  return { libelle: "FIC", classe: "bg-surface-3 text-fg-2" };
}
