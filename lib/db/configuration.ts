import type { PoolConfig } from "pg";

// Connexion PostgreSQL : locale (sans SSL) ou hébergée (Aiven) avec le certificat CA du projet.
// DATABASE_CA_CERT : contenu du fichier ca.pem d'Aiven (texte PEM, retours à la ligne compris).
export function configurationPool(): PoolConfig {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL n'est pas configuré");

  const ca = process.env.DATABASE_CA_CERT?.replace(/\\n/g, "\n").trim();
  if (!ca) return { connectionString: url };

  // Le sslmode de l'URL écraserait la configuration SSL ci-dessous : on le retire
  // (substitution de texte : réécrire l'URL changerait l'encodage du paramètre options)
  return {
    connectionString: retirerSslmode(url),
    ssl: { ca, rejectUnauthorized: true },
  };
}

// « ?sslmode=require&options=… » → « ?options=… » (le reste de l'URL est conservé à l'identique)
export function retirerSslmode(url: string): string {
  return url
    .replace(/([?&])sslmode=[^&]*(&|$)/, (_, avant: string, apres: string) =>
      avant === "?" && apres ? "?" : apres ? avant : "",
    )
    .replace(/\?$/, "");
}
