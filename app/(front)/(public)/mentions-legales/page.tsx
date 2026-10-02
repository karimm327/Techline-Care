import Link from "next/link";
import PageLegale from "@/components/legal/PageLegale";

export const metadata = { title: "Mentions légales - TechLine Care" };

// Texte juridique inchangé (seule la mise en forme évolue)
export default function MentionsLegalesPage() {
  return (
    <PageLegale
      courante="mentions-legales"
      titre="Mentions légales"
      sections={[
        {
          id: "editeur",
          titre: "Éditeur",
          contenu: (
            <p>
              TechLine Care — application interne de gestion des demandes de
              support, réalisée dans le cadre d'un projet de formation.
            </p>
          ),
        },
        {
          id: "contact",
          titre: "Contact",
          contenu: <p>support@techline-care.fr</p>,
        },
        {
          id: "hebergement",
          titre: "Hébergement",
          contenu: (
            <p>
              Base de données PostgreSQL hébergée sur le serveur de
              l'établissement de formation.
            </p>
          ),
        },
        {
          id: "donnees-personnelles",
          titre: "Données personnelles",
          contenu: (
            <p>
              Voir la{" "}
              <Link
                href="/confidentialite"
                className="rounded-xs text-accent-fg underline underline-offset-2 hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
              >
                politique de confidentialité
              </Link>
              .
            </p>
          ),
        },
      ]}
    />
  );
}
