import PageLegale from "@/components/legal/PageLegale";

export const metadata = {
  title: "Politique de confidentialité - TechLine Care",
};

// Texte juridique inchangé (seule la mise en forme évolue)
const SECTIONS = [
  {
    id: "donnees",
    titre: "Données collectées",
    texte:
      "Nom, prénom, adresse e-mail professionnelle et rôle des utilisateurs, ainsi que le contenu des demandes et des commentaires saisis dans l'application.",
  },
  {
    id: "finalites",
    titre: "Pourquoi nous les utilisons",
    texte:
      "Authentifier les utilisateurs, créer, suivre et traiter les demandes de support, assigner les agents et conserver un historique des actions.",
  },
  {
    id: "conservation",
    titre: "Durée de conservation",
    texte:
      "Les données sont conservées pendant la durée d'utilisation du compte, puis supprimées ou anonymisées dans un délai raisonnable.",
  },
  {
    id: "securite",
    titre: "Sécurité",
    texte:
      "L'accès est protégé par une authentification par jeton (JWT). Seules les personnes autorisées selon leur rôle peuvent consulter ou modifier les demandes.",
  },
  {
    id: "vos-droits",
    titre: "Vos droits (RGPD)",
    texte:
      "Vous pouvez demander l'accès, la rectification ou la suppression de vos données en écrivant à support@techline-care.fr. Vous pouvez également saisir la CNIL (www.cnil.fr).",
  },
];

export default function ConfidentialitePage() {
  return (
    <PageLegale
      courante="confidentialite"
      titre="Politique de confidentialité"
      sousTitre="Comment TechLine Care traite vos données personnelles."
      sections={SECTIONS.map((s) => ({
        id: s.id,
        titre: s.titre,
        contenu: <p>{s.texte}</p>,
      }))}
    />
  );
}
