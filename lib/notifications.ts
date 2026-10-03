import { db } from "@/lib/db";
import {
  creerNotifications,
  findInteresses,
  type NouvelleNotification,
} from "@/lib/db/queries/notification.queries";
import { libelleStatut } from "@/lib/ui/status";

// Règles de notification (F5, docs/refonte/06-features.md). Une erreur ici ne doit jamais
// faire échouer l'action principale : tout est journalisé et ignoré.

async function contexte(idDemand: string, idActeur: string) {
  const r = await db.query(
    `SELECT d.title,
            (SELECT first_name || ' ' || last_name FROM users WHERE id_user = $2) AS acteur
     FROM demands d WHERE d.id_demand = $1`,
    [idDemand, idActeur],
  );
  const ligne = r.rows[0] as
    | { title: string; acteur: string | null }
    | undefined;
  return {
    titre: ligne?.title ?? "une demande",
    acteur: ligne?.acteur ?? "Quelqu’un",
  };
}

async function sansEchec(f: () => Promise<void>) {
  try {
    await f();
  } catch (e) {
    console.error("⚠️ Notifications non créées :", (e as Error).message);
  }
}

// Après une création ou une modification : assignation et changement de statut
export async function notifierChangements(opts: {
  idDemand: string;
  idActeur: string;
  agentAvant?: string | null;
  agentApres?: string | null;
  // Code du nouveau statut, seulement s'il a changé
  nouveauStatut?: string | null;
}) {
  await sansEchec(async () => {
    const { titre, acteur } = await contexte(opts.idDemand, opts.idActeur);
    const liste: NouvelleNotification[] = [];

    if (opts.agentApres && opts.agentApres !== opts.agentAvant) {
      liste.push({
        idUser: opts.agentApres,
        type: "ASSIGNATION",
        idDemand: opts.idDemand,
        idActor: opts.idActeur,
        message: `${acteur} vous a assigné « ${titre} »`,
      });
    }
    if (opts.nouveauStatut) {
      const interesses = await findInteresses(opts.idDemand);
      for (const id of interesses) {
        // L'agent qui vient d'être assigné a déjà sa notification
        if (id === opts.agentApres && opts.agentApres !== opts.agentAvant)
          continue;
        liste.push({
          idUser: id,
          type: "STATUT",
          idDemand: opts.idDemand,
          idActor: opts.idActeur,
          message: `${acteur} a passé « ${titre} » en « ${libelleStatut(opts.nouveauStatut)} »`,
        });
      }
    }
    await creerNotifications(liste);
  });
}

// Après un commentaire : mentions, puis agent + créateur + abonnés (notes internes : mentions seulement)
export async function notifierCommentaire(opts: {
  idDemand: string;
  idAuteur: string;
  mentions: string[];
  interne: boolean;
}) {
  await sansEchec(async () => {
    const { titre, acteur } = await contexte(opts.idDemand, opts.idAuteur);
    const liste: NouvelleNotification[] = opts.mentions.map((id) => ({
      idUser: id,
      type: "MENTION",
      idDemand: opts.idDemand,
      idActor: opts.idAuteur,
      message: `${acteur} vous a mentionné dans « ${titre} »${opts.interne ? " (note interne)" : ""}`,
    }));
    if (!opts.interne) {
      for (const id of await findInteresses(opts.idDemand)) {
        if (opts.mentions.includes(id)) continue;
        liste.push({
          idUser: id,
          type: "COMMENTAIRE",
          idDemand: opts.idDemand,
          idActor: opts.idAuteur,
          message: `${acteur} a commenté « ${titre} »`,
        });
      }
    }
    await creerNotifications(liste);
  });
}
