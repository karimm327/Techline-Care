// Limitation des tentatives de connexion (mémoire du serveur, une instance) :
// au-delà de MAX_ECHECS échecs en FENETRE_MS pour un même couple IP + e-mail, blocage temporaire.
const MAX_ECHECS = 5;
const FENETRE_MS = 15 * 60 * 1000;

type Compteur = { echecs: number; debut: number };

const globalPourLimiteur = globalThis as unknown as {
  tentativesConnexion?: Map<string, Compteur>;
};
const tentatives =
  globalPourLimiteur.tentativesConnexion ?? new Map<string, Compteur>();
globalPourLimiteur.tentativesConnexion = tentatives;

const cle = (ip: string, email: string) =>
  `${ip}|${email.trim().toLowerCase()}`;

// Secondes d'attente restantes si bloqué, sinon 0
export function attenteAvantNouvelEssai(ip: string, email: string): number {
  const c = tentatives.get(cle(ip, email));
  if (!c) return 0;
  const ecoule = Date.now() - c.debut;
  if (ecoule > FENETRE_MS) {
    tentatives.delete(cle(ip, email));
    return 0;
  }
  return c.echecs >= MAX_ECHECS ? Math.ceil((FENETRE_MS - ecoule) / 1000) : 0;
}

export function noterEchec(ip: string, email: string) {
  const k = cle(ip, email);
  const c = tentatives.get(k);
  if (!c || Date.now() - c.debut > FENETRE_MS) {
    tentatives.set(k, { echecs: 1, debut: Date.now() });
  } else {
    c.echecs += 1;
  }
  // Ménage simple pour ne pas grossir indéfiniment
  if (tentatives.size > 10_000) {
    for (const [cleAncienne, v] of tentatives) {
      if (Date.now() - v.debut > FENETRE_MS) tentatives.delete(cleAncienne);
    }
  }
}

export function effacerEchecs(ip: string, email: string) {
  tentatives.delete(cle(ip, email));
}

// Adresse du client derrière le proxy de Render (première IP de X-Forwarded-For)
export function adresseClient(headers: Headers): string {
  return (
    headers.get("x-forwarded-for")?.split(",")[0]?.trim() ||
    headers.get("x-real-ip") ||
    "inconnue"
  );
}
