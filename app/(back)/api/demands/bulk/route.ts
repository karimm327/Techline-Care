import { type NextRequest, NextResponse } from "next/server";
import { exigerConnexion } from "@/lib/auth";
import { db } from "@/lib/db";
import { logActivity } from "@/lib/db/queries/activity.queries";
import { findAgentById } from "@/lib/db/queries/user.queries";
import { resumerChangements } from "@/lib/demandes/changements";
import { notifierChangements } from "@/lib/notifications";

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX = 50;

// Changement demandé pour une demande : codes de statut / priorité, identifiant d'agent (null = aucun)
type Changement = {
  id: string;
  status?: string;
  priority?: string;
  agentId?: string | null;
};

type Ligne = {
  id_demand: string;
  title: string;
  description: string;
  id_category: string;
  id_priority: string;
  id_status: string;
  id_assigned_agent: string | null;
  status: string;
  priority: string;
};

const erreur = (message: string, status = 400) =>
  NextResponse.json({ message }, { status });

// Actions groupées (F6) — ADMIN, AGENT.
//  - { ids, status?, priority?, agentId? } : même modification pour toutes les demandes ;
//  - { restaurer: [{ id, status, priority, agentId }] } : « Annuler » (valeurs précédentes).
// Tout ou rien (transaction), une ligne de journal par demande modifiée.
export async function PATCH(req: NextRequest) {
  const garde = exigerConnexion(req, ["ADMIN", "AGENT"]);
  if ("refus" in garde) return garde.refus;

  const body = await req.json().catch(() => ({}));
  let changements: Changement[];
  if (Array.isArray(body.restaurer)) {
    changements = body.restaurer;
  } else if (Array.isArray(body.ids)) {
    changements = body.ids.map((id: unknown) => ({
      id,
      status: body.status,
      priority: body.priority,
      agentId: body.agentId,
    }));
  } else {
    return erreur("Aucune demande sélectionnée.");
  }

  if (changements.length === 0) return erreur("Aucune demande sélectionnée.");
  if (changements.length > MAX)
    return erreur(`${MAX} demandes au maximum par action groupée.`);
  if (changements.some((c) => typeof c.id !== "string" || !UUID.test(c.id)))
    return erreur("Identifiant de demande invalide.");

  try {
    // Libellés → identifiants
    const [statuts, priorites] = await Promise.all([
      db.query("SELECT id_status, label FROM statuses"),
      db.query(
        "SELECT id_priority, label FROM priorities WHERE is_active = true",
      ),
    ]);
    const idStatut = new Map(statuts.rows.map((r) => [r.label, r.id_status]));
    const idPriorite = new Map(
      priorites.rows.map((r) => [r.label, r.id_priority]),
    );
    const agentsValides = new Set<string>();
    for (const c of changements) {
      if (c.status !== undefined && !idStatut.has(c.status))
        return erreur("Statut invalide.");
      if (c.priority !== undefined && !idPriorite.has(c.priority))
        return erreur("Priorité invalide.");
      if (c.agentId) {
        if (!UUID.test(c.agentId)) return erreur("Agent invalide.");
        if (!agentsValides.has(c.agentId)) {
          if ((await findAgentById(c.agentId)).length === 0)
            return erreur("Agent invalide.");
          agentsValides.add(c.agentId);
        }
      }
    }

    const ids = changements.map((c) => c.id);
    const { avant, apres } = await db.transaction(async (q) => {
      const r = await q(
        `SELECT d.id_demand, d.title, d.description, d.id_category, d.id_priority,
                d.id_status, d.id_assigned_agent, s.label AS status, p.label AS priority
         FROM demands d
         JOIN statuses s ON s.id_status = d.id_status
         JOIN priorities p ON p.id_priority = d.id_priority
         WHERE d.id_demand = ANY($1::uuid[]) AND d.deleted_at IS NULL
         FOR UPDATE OF d`,
        [ids],
      );
      const lignes = new Map<string, Ligne>(
        r.rows.map((l: Ligne) => [l.id_demand, l]),
      );
      const modifiees: {
        avant: Ligne;
        idStatus: string;
        idPriority: string;
        idAgent: string | null;
        codeStatut: string;
      }[] = [];
      for (const c of changements) {
        const l = lignes.get(c.id);
        if (!l) continue; // supprimée ou introuvable : ignorée
        const idStatus =
          c.status !== undefined ? idStatut.get(c.status) : l.id_status;
        const idPriority =
          c.priority !== undefined ? idPriorite.get(c.priority) : l.id_priority;
        const idAgent =
          c.agentId !== undefined ? c.agentId || null : l.id_assigned_agent;
        if (
          idStatus === l.id_status &&
          idPriority === l.id_priority &&
          idAgent === l.id_assigned_agent
        )
          continue;
        await q(
          `UPDATE demands
           SET id_status = $2, id_priority = $3, id_assigned_agent = $4, updated_at = now()
           WHERE id_demand = $1`,
          [c.id, idStatus, idPriority, idAgent],
        );
        modifiees.push({
          avant: l,
          idStatus,
          idPriority,
          idAgent,
          codeStatut: c.status ?? l.status,
        });
      }
      return { avant: modifiees.map((m) => m.avant), apres: modifiees };
    });

    // Journal et notifications après validation (ne bloquent pas l'action)
    for (const m of apres) {
      const details = await resumerChangements(m.avant, {
        title: m.avant.title,
        description: m.avant.description,
        idCategory: m.avant.id_category,
        idPriority: m.idPriority,
        idStatus: m.idStatus,
        idAssignedAgent: m.idAgent,
      });
      if (details) {
        await logActivity({
          action: "MODIFICATION",
          idUser: garde.user.id,
          idDemand: m.avant.id_demand,
          details: `${details} (action groupée)`,
        }).catch((e) => console.error(e));
      }
      await notifierChangements({
        idDemand: m.avant.id_demand,
        idActeur: garde.user.id,
        agentAvant: m.avant.id_assigned_agent,
        agentApres: m.idAgent,
        nouveauStatut: m.idStatus !== m.avant.id_status ? m.codeStatut : null,
      });
    }

    return NextResponse.json({
      modifiees: avant.length,
      // Pour « Annuler » : valeurs avant modification
      precedent: avant.map((l) => ({
        id: l.id_demand,
        status: l.status,
        priority: l.priority,
        agentId: l.id_assigned_agent,
      })),
    });
  } catch (error) {
    console.error(error);
    return erreur("Erreur serveur", 500);
  }
}
