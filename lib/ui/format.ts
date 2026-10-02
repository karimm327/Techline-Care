// Formats d'affichage partagés (dates, références)

// « 7b20e1aa-… » → « #7B20E1AA »
export const reference = (id: string) => `#${id.slice(0, 8).toUpperCase()}`;

export const dateHeure = (d: string | Date) =>
  new Date(d).toLocaleString("fr-FR", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

export const dateCourte = (d: string | Date) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

export const heure = (d: string | Date) =>
  new Date(d).toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
  });

// « jeudi 2 octobre »
export const jourLong = (d: string | Date = new Date()) =>
  new Date(d).toLocaleDateString("fr-FR", {
    weekday: "long",
    day: "numeric",
    month: "long",
  });

// « il y a 4 min », « hier », « il y a 3 jours »
export function ilYA(d: string | Date) {
  const min = Math.floor((Date.now() - new Date(d).getTime()) / 60000);
  if (min < 1) return "à l'instant";
  if (min < 60) return `il y a ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `il y a ${h} h`;
  const j = Math.floor(h / 24);
  if (j === 1) return "hier";
  if (j < 30) return `il y a ${j} jours`;
  return dateCourte(d);
}

// Pluriel simple : pluriel(3, "demande") → « 3 demandes »
export const pluriel = (n: number, mot: string, motPluriel = `${mot}s`) =>
  `${n.toLocaleString("fr-FR")} ${n > 1 ? motPluriel : mot}`;
