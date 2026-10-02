"use client";

import Link from "next/link";
import { useEffect, useState } from "react";

type Utilisateur = {
  id_user: string;
  first_name: string;
  last_name: string;
  email: string;
  is_active: boolean;
  created_at: string;
  role: string;
};

type DemandeAssignee = {
  id_demand: string;
  title: string;
  created_at: string;
  updated_at: string;
  status: string;
  priority: string;
  category: string;
};

type Donnees = {
  user: Utilisateur;
  stats: Record<string, number>;
  demandes: DemandeAssignee[];
  commentaires: number;
};

type Onglet =
  | "apercu"
  | "profil"
  | "demandes"
  | "securite"
  | "droits"
  | "support";

const ROLES: Record<
  string,
  { label: string; badge: string; description: string }
> = {
  ADMIN: {
    label: "Administrateur",
    badge: "bg-[#0f3d2e] text-white",
    description: "Accès complet à l'application.",
  },
  AGENT: {
    label: "Agent",
    badge: "bg-white text-[#111]",
    description: "Traite et suit les demandes qui lui sont assignées.",
  },
  LECTURE: {
    label: "Lecture seule",
    badge: "bg-white/15 text-white ring-1 ring-white/30",
    description: "Consulte les demandes sans les modifier.",
  },
};

const STATUTS: Record<string, { label: string; badge: string }> = {
  NOUVELLE: { label: "Nouvelle", badge: "bg-[#efefef] text-[#111]" },
  EN_COURS: { label: "En cours", badge: "bg-[#111] text-white" },
  CLOTUREE: { label: "Clôturée", badge: "bg-[#e6f0eb] text-[#0f3d2e]" },
  ANNULEE: {
    label: "Annulée",
    badge: "bg-white text-[#6b6b6b] ring-1 ring-[#cfcfcf]",
  },
};

const PRIORITES: Record<string, { label: string; couleur: string }> = {
  BASSE: { label: "Basse", couleur: "bg-[#9a9a9a]" },
  NORMALE: { label: "Normale", couleur: "bg-[#111]" },
  HAUTE: { label: "Haute", couleur: "bg-red-600" },
};

const DROITS: {
  action: string;
  ADMIN: boolean;
  AGENT: boolean;
  LECTURE: boolean;
}[] = [
  { action: "Consulter les demandes", ADMIN: true, AGENT: true, LECTURE: true },
  { action: "Créer une demande", ADMIN: true, AGENT: true, LECTURE: false },
  { action: "Modifier une demande", ADMIN: true, AGENT: true, LECTURE: false },
  { action: "Changer le statut", ADMIN: true, AGENT: true, LECTURE: false },
  { action: "Assigner un agent", ADMIN: true, AGENT: true, LECTURE: false },
  { action: "Commenter une demande", ADMIN: true, AGENT: true, LECTURE: false },
  {
    action: "Supprimer une demande (avec motif)",
    ADMIN: true,
    AGENT: true,
    LECTURE: false,
  },
  {
    action: "Consulter le journal d'activité",
    ADMIN: true,
    AGENT: false,
    LECTURE: false,
  },
  {
    action: "Restaurer une demande supprimée",
    ADMIN: true,
    AGENT: false,
    LECTURE: false,
  },
  {
    action: "Gérer les utilisateurs et les rôles",
    ADMIN: true,
    AGENT: false,
    LECTURE: false,
  },
];

const ONGLETS: { id: Onglet; label: string; icone: string }[] = [
  {
    id: "apercu",
    label: "Vue d'ensemble",
    icone: "M3 3h7v9H3zM14 3h7v5h-7zM14 12h7v9h-7zM3 16h7v5H3z",
  },
  {
    id: "profil",
    label: "Profil",
    icone:
      "M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2M12 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8z",
  },
  {
    id: "demandes",
    label: "Mes demandes",
    icone:
      "M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2M9 5a2 2 0 0 0 2 2h2a2 2 0 0 0 2-2M9 5a2 2 0 0 1 2-2h2a2 2 0 0 1 2 2M9 14l2 2 4-4",
  },
  {
    id: "securite",
    label: "Sécurité",
    icone: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
  },
  {
    id: "droits",
    label: "Rôle et droits",
    icone: "M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6l8-3zM9 12l2 2 4-4",
  },
  {
    id: "support",
    label: "Aide et support",
    icone:
      "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM9.1 9a3 3 0 0 1 5.8 1c0 2-3 3-3 3M12 17h.01",
  },
];

const dateLongue = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
const dateCourte = (d: string) =>
  new Date(d).toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });

function depuis(d: string) {
  const jours = Math.floor((Date.now() - new Date(d).getTime()) / 86400000);
  if (jours <= 0) return "aujourd'hui";
  if (jours === 1) return "hier";
  if (jours < 30) return `il y a ${jours} jours`;
  if (jours < 365) return `il y a ${Math.floor(jours / 30)} mois`;
  return `il y a ${Math.floor(jours / 365)} an(s)`;
}

function Icone({
  d,
  className = "w-5 h-5",
}: {
  d: string;
  className?: string;
}) {
  return (
    <svg
      aria-hidden="true"
      className={className}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={d} />
    </svg>
  );
}

function Panneau({
  titre,
  sousTitre,
  action,
  children,
}: {
  titre: string;
  sousTitre?: string;
  action?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <section className="bg-white rounded-2xl border border-[#e6e6e6]">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3 px-5 sm:px-6 py-4 border-b border-[#efefef]">
        <div>
          <h2 className="text-base font-semibold text-[#111]">{titre}</h2>
          {sousTitre && (
            <p className="text-sm text-[#6b6b6b] mt-0.5">{sousTitre}</p>
          )}
        </div>
        {action}
      </div>
      <div className="p-5 sm:p-6">{children}</div>
    </section>
  );
}

function Badge({ code }: { code: string }) {
  const s = STATUTS[code] ?? { label: code, badge: "bg-[#efefef] text-[#111]" };
  return (
    <span
      className={`inline-flex px-2.5 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${s.badge}`}
    >
      {s.label}
    </span>
  );
}

export default function AccountPage() {
  const [donnees, setDonnees] = useState<Donnees | null>(null);
  const [erreur, setErreur] = useState("");
  const [onglet, setOnglet] = useState<Onglet>("apercu");

  // Onglet ouvert directement depuis l'URL (ex. /account#securite)
  useEffect(() => {
    const lire = () => {
      const h = window.location.hash.replace("#", "") as Onglet;
      if (ONGLETS.some((o) => o.id === h)) setOnglet(h);
    };
    lire();
    window.addEventListener("hashchange", lire);
    return () => window.removeEventListener("hashchange", lire);
  }, []);

  useEffect(() => {
    async function charger() {
      try {
        // Le cookie de session httpOnly suffit : pas de token côté navigateur
        const res = await fetch("/api/users/me");
        if (res.status === 401) {
          window.location.href = "/login";
          return;
        }
        const data = await res.json();
        if (!res.ok) throw new Error(data.message || "Erreur de chargement");
        setDonnees(data);
      } catch (e) {
        setErreur((e as Error).message || "Impossible de charger ton compte.");
      }
    }
    charger();
  }, []);

  const choisir = (id: Onglet) => {
    setOnglet(id);
    history.replaceState(null, "", `#${id}`);
  };

  const deconnexion = async () => {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => {});
    window.location.href = "/login";
  };

  if (erreur) {
    return (
      <div className="max-w-3xl mx-auto px-4 py-16">
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700">
          {erreur}
        </div>
      </div>
    );
  }

  if (!donnees) return <Chargement />;

  const { user, stats, demandes, commentaires } = donnees;
  const nomComplet = `${user.first_name} ${user.last_name}`;
  const initiales =
    `${user.first_name[0] ?? ""}${user.last_name[0] ?? ""}`.toUpperCase();
  const role = ROLES[user.role] ?? {
    label: user.role,
    badge: "bg-white text-[#111]",
    description: "",
  };

  return (
    <div className="min-h-full bg-[#f6f6f6]">
      {/* ================= En-tête profil ================= */}
      <div className="bg-[#0b0b0b] border-b-[3px] border-[#0f3d2e]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div className="flex items-center gap-4 sm:gap-5 min-w-0">
            <div className="relative shrink-0">
              <span className="w-16 h-16 sm:w-20 sm:h-20 rounded-2xl bg-[#0f3d2e] text-white text-2xl sm:text-3xl font-bold flex items-center justify-center ring-4 ring-white/10">
                {initiales}
              </span>
              <span
                className={`absolute -bottom-1 -right-1 w-5 h-5 rounded-full ring-4 ring-[#0b0b0b] ${user.is_active ? "bg-emerald-400" : "bg-[#9a9a9a]"}`}
                title={user.is_active ? "Compte actif" : "Compte désactivé"}
              />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold uppercase tracking-[2px] text-[#7fc8a9]">
                Mon compte
              </p>
              <h1 className="text-2xl sm:text-3xl font-bold text-white truncate">
                {nomComplet}
              </h1>
              <div className="mt-2 flex flex-wrap items-center gap-2 text-sm">
                <span
                  className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${role.badge}`}
                >
                  {role.label}
                </span>
                <span className="text-white/60 truncate">{user.email}</span>
              </div>
            </div>
          </div>
          <div className="flex gap-2 shrink-0">
            <Link
              href="/demands"
              className="flex-1 md:flex-none text-center whitespace-nowrap px-3 sm:px-5 py-2.5 rounded-full border border-white/25 text-white text-[13px] sm:text-sm font-medium hover:bg-white/10 transition"
            >
              Tableau de bord
            </Link>
            {user.role !== "LECTURE" && (
              <Link
                href="/demands/new"
                className="flex-1 md:flex-none text-center whitespace-nowrap px-3 sm:px-5 py-2.5 rounded-full bg-white text-[#111] text-[13px] sm:text-sm font-semibold hover:bg-[#0f3d2e] hover:text-white transition"
              >
                + Nouvelle demande
              </Link>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid grid-cols-[minmax(0,1fr)] lg:grid-cols-[260px_minmax(0,1fr)] gap-6 items-start">
        {/* ==== Menu latéral ==== */}
        <nav
          className="min-w-0 lg:sticky lg:top-24 bg-white rounded-2xl border border-[#e6e6e6] p-2"
          aria-label="Sections du compte"
        >
          <ul className="flex lg:flex-col gap-1 overflow-x-auto [scrollbar-width:none]">
            {ONGLETS.map((o) => {
              const actif = onglet === o.id;
              return (
                <li key={o.id} className="shrink-0">
                  <button
                    type="button"
                    onClick={() => choisir(o.id)}
                    aria-current={actif ? "page" : undefined}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium whitespace-nowrap transition ${
                      actif
                        ? "bg-[#111] text-white"
                        : "text-[#444] hover:bg-[#f6f6f6] hover:text-[#111]"
                    }`}
                  >
                    <Icone
                      d={o.icone}
                      className={`w-[18px] h-[18px] ${actif ? "text-[#7fc8a9]" : "text-[#9a9a9a]"}`}
                    />
                    {o.label}
                    {o.id === "demandes" && stats.total > 0 && (
                      <span
                        className={`ml-auto text-[11px] font-semibold px-2 py-0.5 rounded-full ${actif ? "bg-white/15 text-white" : "bg-[#e6f0eb] text-[#0f3d2e]"}`}
                      >
                        {stats.total}
                      </span>
                    )}
                  </button>
                </li>
              );
            })}
          </ul>
          <div className="hidden lg:block border-t border-[#efefef] mt-2 pt-2">
            <button
              type="button"
              onClick={deconnexion}
              className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium text-red-600 hover:bg-red-50 transition"
            >
              <Icone
                d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4M16 17l5-5-5-5M21 12H9"
                className="w-[18px] h-[18px]"
              />
              Déconnexion
            </button>
          </div>
        </nav>

        {/* === Contenu ===== */}
        <div className="min-w-0 space-y-6">
          {onglet === "apercu" && (
            <Apercu
              stats={stats}
              demandes={demandes}
              commentaires={commentaires}
              user={user}
              onVoirTout={() => choisir("demandes")}
            />
          )}
          {onglet === "profil" && <Profil user={user} role={role} />}
          {onglet === "demandes" && (
            <MesDemandes demandes={demandes} total={stats.total} />
          )}
          {onglet === "securite" && <Securite onDeconnexion={deconnexion} />}
          {onglet === "droits" && <Droits roleActuel={user.role} />}
          {onglet === "support" && <Support />}

          <button
            type="button"
            onClick={deconnexion}
            className="lg:hidden w-full py-3 rounded-2xl border border-red-200 bg-white text-sm font-semibold text-red-600"
          >
            Déconnexion
          </button>
        </div>
      </div>
    </div>
  );
}

/* == Onglets == */

function Apercu({
  stats,
  demandes,
  commentaires,
  user,
  onVoirTout,
}: {
  stats: Record<string, number>;
  demandes: DemandeAssignee[];
  commentaires: number;
  user: Utilisateur;
  onVoirTout: () => void;
}) {
  const taux = stats.total
    ? Math.round(((stats.CLOTUREE ?? 0) / stats.total) * 100)
    : 0;
  const cartes = [
    {
      titre: "Demandes assignées",
      valeur: stats.total ?? 0,
      detail: "Au total",
      accent: "bg-[#111]",
    },
    {
      titre: "En cours",
      valeur: stats.EN_COURS ?? 0,
      detail: "À traiter",
      accent: "bg-[#111]",
    },
    {
      titre: "Clôturées",
      valeur: stats.CLOTUREE ?? 0,
      detail: `${taux} % du total`,
      accent: "bg-[#0f3d2e]",
    },
    {
      titre: "Commentaires",
      valeur: commentaires,
      detail: "Écrits par toi",
      accent: "bg-[#9a9a9a]",
    },
  ];

  return (
    <>
      <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
        {cartes.map((c) => (
          <div
            key={c.titre}
            className="relative overflow-hidden bg-white rounded-2xl border border-[#e6e6e6] p-5"
          >
            <span className={`absolute left-0 top-0 h-full w-1 ${c.accent}`} />
            <p className="text-sm text-[#6b6b6b]">{c.titre}</p>
            <p className="mt-2 text-3xl font-bold text-[#111] tabular-nums">
              {c.valeur}
            </p>
            <p className="mt-1 text-xs text-[#9a9a9a]">{c.detail}</p>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-[minmax(0,1fr)] xl:grid-cols-3 gap-6">
        <div className="xl:col-span-2 min-w-0">
          <Panneau
            titre="Activité récente"
            sousTitre="Les dernières demandes qui te sont assignées"
            action={
              demandes.length > 0 ? (
                <button
                  type="button"
                  onClick={onVoirTout}
                  className="text-sm font-semibold text-[#0f3d2e] hover:underline"
                >
                  Tout voir →
                </button>
              ) : undefined
            }
          >
            {demandes.length === 0 ? (
              <Vide texte="Aucune demande ne t'est assignée pour le moment." />
            ) : (
              <ul className="divide-y divide-[#efefef] -my-2">
                {demandes.slice(0, 4).map((d) => (
                  <li key={d.id_demand}>
                    <Link
                      href={`/demands/${d.id_demand}`}
                      className="flex items-center gap-4 py-3 group"
                    >
                      <span
                        className={`w-2 h-2 rounded-full shrink-0 ${PRIORITES[d.priority]?.couleur ?? "bg-[#9a9a9a]"}`}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium text-[#111] truncate group-hover:text-[#0f3d2e]">
                          {d.title}
                        </p>
                        <p className="text-xs text-[#9a9a9a]">
                          {d.category} · mise à jour {depuis(d.updated_at)}
                        </p>
                      </div>
                      <Badge code={d.status} />
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </Panneau>
        </div>

        <div className="space-y-6">
          <Panneau titre="Progression">
            <div className="flex items-end justify-between mb-2">
              <span className="text-sm text-[#6b6b6b]">Taux de clôture</span>
              <span className="text-2xl font-bold text-[#111] tabular-nums">
                {taux} %
              </span>
            </div>
            <div className="h-2.5 rounded-full bg-[#efefef] overflow-hidden">
              <div
                className="h-full rounded-full bg-[#0f3d2e] transition-all duration-700"
                style={{ width: `${taux}%` }}
              />
            </div>
            <p className="mt-3 text-xs text-[#9a9a9a]">
              Membre depuis {dateLongue(user.created_at)}
            </p>
          </Panneau>

          <Panneau titre="Raccourcis">
            <div className="grid gap-2">
              {[
                { label: "Créer une demande", href: "/demands/new" },
                { label: "Voir toutes les demandes", href: "/demands" },
                {
                  label: "Politique de confidentialité",
                  href: "/confidentialite",
                },
              ].map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  className="flex items-center justify-between px-4 py-3 rounded-xl bg-[#f6f6f6] text-sm font-medium text-[#111] hover:bg-[#e6f0eb] hover:text-[#0f3d2e] transition"
                >
                  {r.label}
                  <span aria-hidden="true">→</span>
                </Link>
              ))}
            </div>
          </Panneau>
        </div>
      </div>
    </>
  );
}

function Profil({
  user,
  role,
}: {
  user: Utilisateur;
  role: { label: string; description: string };
}) {
  const lignes = [
    { libelle: "Prénom", valeur: user.first_name },
    { libelle: "Nom", valeur: user.last_name },
    { libelle: "Adresse e-mail", valeur: user.email },
    {
      libelle: "Rôle",
      valeur: `${role.label}${role.description ? ` — ${role.description}` : ""}`,
    },
    {
      libelle: "État du compte",
      valeur: user.is_active ? "Actif" : "Désactivé",
    },
    { libelle: "Membre depuis", valeur: dateLongue(user.created_at) },
    { libelle: "Identifiant", valeur: user.id_user, mono: true },
  ];

  return (
    <Panneau
      titre="Informations personnelles"
      sousTitre="Les informations associées à ton compte"
    >
      <dl className="divide-y divide-[#efefef] -my-2">
        {lignes.map((l) => (
          <div
            key={l.libelle}
            className="grid sm:grid-cols-3 gap-1 sm:gap-4 py-3.5"
          >
            <dt className="text-sm text-[#6b6b6b]">{l.libelle}</dt>
            <dd
              className={`sm:col-span-2 text-sm font-medium text-[#111] break-all ${l.mono ? "font-mono text-xs text-[#6b6b6b]" : ""}`}
            >
              {l.valeur}
            </dd>
          </div>
        ))}
      </dl>
      <div className="mt-6 flex items-start gap-3 rounded-xl bg-[#f6f6f6] p-4 text-sm text-[#444]">
        <Icone
          d="M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 8v4M12 16h.01"
          className="w-5 h-5 shrink-0 text-[#0f3d2e]"
        />
        Pour modifier ton nom, ton e-mail ou ton rôle, contacte un
        administrateur.
      </div>
    </Panneau>
  );
}

function MesDemandes({
  demandes,
  total,
}: {
  demandes: DemandeAssignee[];
  total: number;
}) {
  return (
    <Panneau
      titre="Demandes qui me sont assignées"
      sousTitre={
        total > demandes.length
          ? `Les ${demandes.length} plus récentes sur ${total}`
          : `${total} demande${total > 1 ? "s" : ""}`
      }
      action={
        <Link
          href="/demands"
          className="text-sm font-semibold text-[#0f3d2e] hover:underline"
        >
          Tableau de bord →
        </Link>
      }
    >
      {demandes.length === 0 ? (
        <Vide texte="Aucune demande ne t'est assignée pour le moment." />
      ) : (
        <div className="overflow-x-auto -mx-5 sm:-mx-6">
          <table className="w-full text-sm min-w-[560px]">
            <thead>
              <tr className="text-left text-xs uppercase tracking-wide text-[#9a9a9a] border-b border-[#efefef]">
                <th className="px-5 sm:px-6 py-2 font-semibold">Demande</th>
                <th className="px-3 py-2 font-semibold">Priorité</th>
                <th className="px-3 py-2 font-semibold">Statut</th>
                <th className="px-5 sm:px-6 py-2 font-semibold text-right">
                  Mise à jour
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#efefef]">
              {demandes.map((d) => (
                <tr key={d.id_demand} className="hover:bg-[#fafafa]">
                  <td className="px-5 sm:px-6 py-3 max-w-[280px]">
                    <Link
                      href={`/demands/${d.id_demand}`}
                      className="block font-medium text-[#111] truncate hover:text-[#0f3d2e]"
                    >
                      {d.title}
                    </Link>
                    <span className="text-xs text-[#9a9a9a]">{d.category}</span>
                  </td>
                  <td className="px-3 py-3">
                    <span className="inline-flex items-center gap-2 text-[#444]">
                      <span
                        className={`w-2 h-2 rounded-full ${PRIORITES[d.priority]?.couleur ?? "bg-[#9a9a9a]"}`}
                      />
                      {PRIORITES[d.priority]?.label ?? d.priority}
                    </span>
                  </td>
                  <td className="px-3 py-3">
                    <Badge code={d.status} />
                  </td>
                  <td className="px-5 sm:px-6 py-3 text-right text-[#6b6b6b] whitespace-nowrap">
                    {dateCourte(d.updated_at)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Panneau>
  );
}

function Securite({ onDeconnexion }: { onDeconnexion: () => void }) {
  const [actuel, setActuel] = useState("");
  const [nouveau, setNouveau] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [voir, setVoir] = useState(false);
  const [etat, setEtat] = useState<{
    type: "ok" | "erreur";
    texte: string;
  } | null>(null);
  const [envoi, setEnvoi] = useState(false);

  const regles = [
    { ok: nouveau.length >= 8, texte: "8 caractères minimum" },
    { ok: /[A-Z]/.test(nouveau), texte: "1 majuscule" },
    { ok: /\d/.test(nouveau), texte: "1 chiffre" },
    {
      ok: nouveau.length > 0 && nouveau === confirmation,
      texte: "Les deux mots de passe correspondent",
    },
  ];
  const force =
    regles.slice(0, 3).filter((r) => r.ok).length +
    (/[^A-Za-z0-9]/.test(nouveau) ? 1 : 0);
  const valide = actuel.length > 0 && regles.every((r) => r.ok);

  async function enregistrer(e: React.FormEvent) {
    e.preventDefault();
    if (!valide) return;
    setEnvoi(true);
    setEtat(null);
    try {
      const res = await fetch("/api/users/me/password", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ actuel, nouveau }),
      });
      const data = await res.json().catch(() => ({}));
      if (!res.ok)
        throw new Error(
          data.message || "Impossible de modifier le mot de passe.",
        );
      setEtat({ type: "ok", texte: "Mot de passe modifié avec succès." });
      setActuel("");
      setNouveau("");
      setConfirmation("");
    } catch (err) {
      setEtat({ type: "erreur", texte: (err as Error).message });
    } finally {
      setEnvoi(false);
    }
  }

  const champ =
    "w-full rounded-xl border border-[#e6e6e6] bg-[#fafafa] px-4 py-3 text-sm text-[#111] outline-none transition focus:bg-white focus:border-[#111] focus:ring-4 focus:ring-black/5";

  return (
    <>
      <Panneau
        titre="Mot de passe"
        sousTitre="Choisis un mot de passe que tu n'utilises nulle part ailleurs"
      >
        <form onSubmit={enregistrer} className="max-w-lg space-y-4">
          {[
            {
              id: "actuel",
              label: "Mot de passe actuel",
              valeur: actuel,
              set: setActuel,
              auto: "current-password",
            },
            {
              id: "nouveau",
              label: "Nouveau mot de passe",
              valeur: nouveau,
              set: setNouveau,
              auto: "new-password",
            },
            {
              id: "confirmation",
              label: "Confirmer le nouveau mot de passe",
              valeur: confirmation,
              set: setConfirmation,
              auto: "new-password",
            },
          ].map((c) => (
            <div key={c.id}>
              <label
                htmlFor={c.id}
                className="block text-sm font-medium text-[#111] mb-1.5"
              >
                {c.label}
              </label>
              <input
                id={c.id}
                type={voir ? "text" : "password"}
                autoComplete={c.auto}
                value={c.valeur}
                onChange={(e) => c.set(e.target.value)}
                className={champ}
              />
            </div>
          ))}

          <label className="flex items-center gap-2 text-sm text-[#6b6b6b] cursor-pointer select-none">
            <input
              type="checkbox"
              checked={voir}
              onChange={(e) => setVoir(e.target.checked)}
              className="accent-[#0f3d2e]"
            />
            Afficher les mots de passe
          </label>

          {nouveau && (
            <div>
              <div className="flex gap-1.5">
                {[1, 2, 3, 4].map((n) => (
                  <span
                    key={n}
                    className={`h-1.5 flex-1 rounded-full transition ${n <= force ? (force >= 3 ? "bg-[#0f3d2e]" : force === 2 ? "bg-amber-500" : "bg-red-500") : "bg-[#efefef]"}`}
                  />
                ))}
              </div>
              <ul className="mt-3 grid sm:grid-cols-2 gap-1.5">
                {regles.map((r) => (
                  <li
                    key={r.texte}
                    className={`flex items-center gap-2 text-xs ${r.ok ? "text-[#0f3d2e]" : "text-[#9a9a9a]"}`}
                  >
                    <span
                      className={`w-4 h-4 rounded-full flex items-center justify-center text-[10px] ${r.ok ? "bg-[#0f3d2e] text-white" : "bg-[#efefef]"}`}
                    >
                      {r.ok ? "✓" : ""}
                    </span>
                    {r.texte}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {etat && (
            <p
              className={`text-sm rounded-xl px-4 py-3 ${etat.type === "ok" ? "bg-[#e6f0eb] text-[#0f3d2e]" : "bg-red-50 text-red-700"}`}
            >
              {etat.texte}
            </p>
          )}

          <button
            type="submit"
            disabled={!valide || envoi}
            className="inline-flex items-center gap-2 rounded-full bg-[#111] px-6 py-3 text-sm font-semibold text-white hover:bg-[#0f3d2e] transition disabled:bg-[#cfcfcf] disabled:cursor-not-allowed"
          >
            {envoi && (
              <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
            )}
            Mettre à jour le mot de passe
          </button>
        </form>
      </Panneau>

      <Panneau titre="Session" sousTitre="Ta connexion sur cet appareil">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex items-center gap-3">
            <span className="w-10 h-10 rounded-xl bg-[#e6f0eb] text-[#0f3d2e] flex items-center justify-center">
              <Icone d="M4 5h16v11H4zM2 20h20" />
            </span>
            <div>
              <p className="text-sm font-medium text-[#111]">Cet appareil</p>
              <p className="text-xs text-[#9a9a9a]">
                La session expire automatiquement après 24 h.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onDeconnexion}
            className="px-5 py-2.5 rounded-full border border-[#e6e6e6] text-sm font-semibold text-red-600 hover:bg-red-50 hover:border-red-200 transition"
          >
            Se déconnecter
          </button>
        </div>
      </Panneau>
    </>
  );
}

function Droits({ roleActuel }: { roleActuel: string }) {
  const roles = ["ADMIN", "AGENT", "LECTURE"] as const;
  return (
    <Panneau
      titre="Rôle et droits"
      sousTitre="Ce que chaque rôle peut faire dans TechLine Care"
    >
      <div className="overflow-x-auto -mx-5 sm:-mx-6">
        <table className="w-full text-sm min-w-[520px]">
          <thead>
            <tr className="border-b border-[#efefef]">
              <th className="px-5 sm:px-6 py-3 text-left text-xs uppercase tracking-wide text-[#9a9a9a] font-semibold">
                Action
              </th>
              {roles.map((r) => (
                <th
                  key={r}
                  className={`px-3 py-3 text-center text-xs font-semibold ${r === roleActuel ? "text-[#0f3d2e]" : "text-[#9a9a9a]"}`}
                >
                  <span
                    className={`inline-block px-2.5 py-1 rounded-full ${r === roleActuel ? "bg-[#e6f0eb]" : ""}`}
                  >
                    {ROLES[r].label}
                    {r === roleActuel ? " (toi)" : ""}
                  </span>
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#efefef]">
            {DROITS.map((d) => (
              <tr key={d.action}>
                <td className="px-5 sm:px-6 py-3 text-[#111]">{d.action}</td>
                {roles.map((r) => (
                  <td
                    key={r}
                    className={`px-3 py-3 text-center ${r === roleActuel ? "bg-[#f3f8f5]" : ""}`}
                  >
                    {d[r] ? (
                      <span
                        className="inline-flex w-6 h-6 rounded-full bg-[#0f3d2e] text-white items-center justify-center text-xs"
                        role="img"
                        aria-label="Autorisé"
                      >
                        ✓
                      </span>
                    ) : (
                      <span
                        className="inline-flex w-6 h-6 rounded-full bg-[#efefef] text-[#9a9a9a] items-center justify-center text-xs"
                        role="img"
                        aria-label="Non autorisé"
                      >
                        –
                      </span>
                    )}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="mt-5 text-xs text-[#9a9a9a]">
        Besoin d'un accès supplémentaire ? Fais la demande à un administrateur.
      </p>
    </Panneau>
  );
}

function Support() {
  const blocs = [
    {
      titre: "Écrire au support",
      texte: "support@techline-care.fr",
      href: "mailto:support@techline-care.fr",
      icone: "M3 5h18v14H3zM3 7l9 6 9-6",
    },
    {
      titre: "Horaires",
      texte: "Du lundi au vendredi, 9 h – 18 h",
      icone: "M12 21a9 9 0 1 0 0-18 9 9 0 0 0 0 18zM12 7v5l3 2",
    },
    {
      titre: "Signaler un problème",
      texte: "Créer une demande de support",
      href: "/demands/new",
      icone:
        "M12 9v4M12 17h.01M10.3 3.9 1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z",
    },
    {
      titre: "Données personnelles",
      texte: "Politique de confidentialité",
      href: "/confidentialite",
      icone: "M5 11h14v10H5zM8 11V7a4 4 0 0 1 8 0v4",
    },
  ];
  return (
    <Panneau
      titre="Aide et support"
      sousTitre="Une question ou un problème ? Nous sommes là."
    >
      <div className="grid sm:grid-cols-2 gap-3">
        {blocs.map((b) => {
          const contenu = (
            <>
              <span className="w-10 h-10 rounded-xl bg-[#111] text-white flex items-center justify-center shrink-0 group-hover:bg-[#0f3d2e] transition">
                <Icone d={b.icone} className="w-[18px] h-[18px]" />
              </span>
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-[#111]">
                  {b.titre}
                </span>
                <span className="block text-sm text-[#6b6b6b] truncate">
                  {b.texte}
                </span>
              </span>
            </>
          );
          return b.href ? (
            <Link
              key={b.titre}
              href={b.href}
              className="group flex items-center gap-3 rounded-xl border border-[#e6e6e6] p-4 hover:border-[#0f3d2e] transition"
            >
              {contenu}
            </Link>
          ) : (
            <div
              key={b.titre}
              className="group flex items-center gap-3 rounded-xl border border-[#e6e6e6] p-4"
            >
              {contenu}
            </div>
          );
        })}
      </div>
    </Panneau>
  );
}

function Vide({ texte }: { texte: string }) {
  return (
    <div className="text-center py-10 rounded-xl bg-[#f6f6f6]">
      <p className="text-sm text-[#6b6b6b]">{texte}</p>
    </div>
  );
}

function Chargement() {
  return (
    <div className="min-h-full bg-[#f6f6f6] animate-pulse">
      <div className="bg-[#0b0b0b] h-36" />
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8 grid lg:grid-cols-[260px_1fr] gap-6">
        <div className="h-72 bg-white rounded-2xl" />
        <div className="space-y-4">
          <div className="grid grid-cols-2 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-28 bg-white rounded-2xl" />
            ))}
          </div>
          <div className="h-64 bg-white rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
