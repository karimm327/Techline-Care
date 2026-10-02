"use client";

import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

type Category = { id_category: string; label: string };
type Priority = { id_priority: string; label: string };
type Agent = { id_user: string; first_name: string; last_name: string };
type Status = { id_status: string; label: string };

type Demand = {
  title: string;
  description: string;
  id_category: string;
  id_priority: string;
  id_status: string;
  id_assigned_agent: string | null;
};

type Props = {
  submitUrl: string;
  method: "POST" | "PUT";
  redirectTo: string;
  initialData?: Demand;
};

/* ---------- Couleurs ---------- */

const COULEURS_CATEGORIE = [
  "from-violet-500 to-fuchsia-500",
  "from-sky-500 to-cyan-500",
  "from-emerald-500 to-teal-500",
  "from-amber-500 to-orange-500",
  "from-rose-500 to-pink-500",
  "from-indigo-500 to-blue-500",
];

const PRIORITES: Record<
  string,
  { label: string; actif: string; point: string; ordre: number }
> = {
  BASSE: {
    label: "Basse",
    actif: "bg-slate-600 text-white ring-slate-600",
    point: "bg-slate-400",
    ordre: 1,
  },
  NORMALE: {
    label: "Normale",
    actif: "bg-amber-500 text-white ring-amber-500",
    point: "bg-amber-500",
    ordre: 2,
  },
  HAUTE: {
    label: "Haute",
    actif: "bg-red-600 text-white ring-red-600",
    point: "bg-red-500",
    ordre: 3,
  },
};

const STATUTS: Record<
  string,
  { label: string; actif: string; point: string; ordre: number }
> = {
  NOUVELLE: {
    label: "Nouvelle",
    actif: "bg-slate-700 text-white ring-slate-700",
    point: "bg-slate-400",
    ordre: 1,
  },
  EN_COURS: {
    label: "En cours",
    actif: "bg-blue-600 text-white ring-blue-600",
    point: "bg-blue-500",
    ordre: 2,
  },
  CLOTUREE: {
    label: "Clôturée",
    actif: "bg-emerald-600 text-white ring-emerald-600",
    point: "bg-emerald-500",
    ordre: 3,
  },
  ANNULEE: {
    label: "Annulée",
    actif: "bg-red-600 text-white ring-red-600",
    point: "bg-red-500",
    ordre: 4,
  },
};

const COULEURS_AVATAR = [
  "bg-violet-500",
  "bg-sky-500",
  "bg-emerald-500",
  "bg-amber-500",
  "bg-rose-500",
  "bg-indigo-500",
];

const initiales = (a: Agent) =>
  `${a.first_name?.[0] ?? ""}${a.last_name?.[0] ?? ""}`.toUpperCase();

/* ---------- Petits composants ---------- */

function Bloc({
  numero,
  titre,
  sousTitre,
  couleur,
  ouvert,
  complet,
  resume,
  onToggle,
  children,
}: {
  numero: number;
  titre: string;
  sousTitre: string;
  couleur: string;
  ouvert: boolean;
  complet: boolean;
  resume?: string;
  onToggle: () => void;
  children: React.ReactNode;
}) {
  return (
    <section
      className={`rounded-2xl border bg-white shadow-sm transition ${ouvert ? "border-slate-300 shadow-md" : "border-slate-200 hover:shadow-md"}`}
    >
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={ouvert}
        className="w-full flex items-center gap-3 p-5 sm:px-6 text-left"
      >
        <span
          className={`w-9 h-9 shrink-0 rounded-xl text-white text-sm font-bold flex items-center justify-center shadow-sm transition ${complet && !ouvert ? "bg-emerald-500" : `bg-gradient-to-br ${couleur}`}`}
        >
          {complet && !ouvert ? (
            <svg
              aria-hidden="true"
              className="w-4 h-4"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="3"
            >
              <path d="M5 12.5l4.5 4.5L19 7" />
            </svg>
          ) : (
            numero
          )}
        </span>
        <span className="min-w-0 flex-1">
          <span className="block text-base font-semibold text-slate-900">
            {titre}
          </span>
          <span
            className={`block text-xs truncate ${!ouvert && resume ? "text-emerald-700 font-medium" : "text-slate-500"}`}
          >
            {!ouvert && resume ? resume : sousTitre}
          </span>
        </span>
        {/* Signe + / − animé */}
        <span
          className={`relative w-9 h-9 shrink-0 rounded-full transition ${ouvert ? "bg-slate-900" : "bg-slate-100"}`}
          aria-hidden="true"
        >
          <span
            className={`absolute left-1/2 top-1/2 w-3.5 h-0.5 -translate-x-1/2 -translate-y-1/2 rounded ${ouvert ? "bg-white" : "bg-slate-700"}`}
          />
          <span
            className={`absolute left-1/2 top-1/2 w-3.5 h-0.5 -translate-x-1/2 -translate-y-1/2 rounded transition-transform duration-300 ${ouvert ? "bg-white rotate-0" : "bg-slate-700 rotate-90"}`}
          />
        </span>
      </button>

      {/* Contenu repliable (animation de hauteur) */}
      <div
        className={`grid transition-[grid-template-rows] duration-300 ease-out ${ouvert ? "grid-rows-[1fr]" : "grid-rows-[0fr]"}`}
      >
        <div className="overflow-hidden" inert={!ouvert}>
          <div className="px-5 sm:px-6 pb-6 pt-1">{children}</div>
        </div>
      </div>
    </section>
  );
}

function BoutonSuivant({ onClick }: { onClick: () => void }) {
  return (
    <div className="mt-5 flex justify-end">
      <button
        type="button"
        onClick={onClick}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-semibold text-slate-900 ring-1 ring-slate-300 hover:bg-slate-900 hover:text-white hover:ring-slate-900 transition"
      >
        Continuer
        <svg
          aria-hidden="true"
          className="w-4 h-4"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M5 12h14M12 5l7 7-7 7" />
        </svg>
      </button>
    </div>
  );
}

function Pastilles<T extends string>({
  options,
  valeur,
  onChange,
  styles,
}: {
  options: { id: T; label: string }[];
  valeur: T | "";
  onChange: (v: T) => void;
  styles: Record<string, { label: string; actif: string; point: string }>;
}) {
  return (
    <div className="flex flex-wrap gap-2">
      {options.map((o) => {
        const s = styles[o.label] ?? {
          label: o.label,
          actif: "bg-slate-700 text-white ring-slate-700",
          point: "bg-slate-400",
        };
        const choisi = valeur === o.id;
        return (
          <button
            key={o.id}
            type="button"
            onClick={() => onChange(o.id)}
            aria-pressed={choisi}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium ring-1 transition-all duration-200 active:scale-95 ${
              choisi
                ? `${s.actif} shadow-md`
                : "bg-white text-slate-700 ring-slate-200 hover:ring-slate-400 hover:-translate-y-0.5"
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${choisi ? "bg-white" : s.point}`}
            />
            {s.label}
          </button>
        );
      })}
    </div>
  );
}

/* ---------- Formulaire ---------- */

export default function DemandForm({
  submitUrl,
  method,
  redirectTo,
  initialData,
}: Props) {
  const router = useRouter();

  const [categories, setCategories] = useState<Category[]>([]);
  const [priorities, setPriorities] = useState<Priority[]>([]);
  const [agents, setAgents] = useState<Agent[]>([]);
  const [statuses, setStatuses] = useState<Status[]>([]);
  const [chargement, setChargement] = useState(true);

  const [title, setTitle] = useState(initialData?.title || "");
  const [description, setDescription] = useState(
    initialData?.description || "",
  );
  const [categoryId, setCategoryId] = useState(initialData?.id_category || "");
  const [priorityId, setPriorityId] = useState(initialData?.id_priority || "");
  const [agentId, setAgentId] = useState(initialData?.id_assigned_agent || "");
  const [statusId, setStatusId] = useState(initialData?.id_status || "");

  const [error, setError] = useState("");
  const [envoi, setEnvoi] = useState(false);
  const [tente, setTente] = useState(false);

  // Blocs ouverts (le 1er est ouvert au départ)
  const [ouverts, setOuverts] = useState<number[]>([1]);
  const basculer = (n: number) =>
    setOuverts((o) => (o.includes(n) ? o.filter((x) => x !== n) : [...o, n]));
  const passerA = (actuel: number, suivant: number) =>
    setOuverts((o) => [...o.filter((x) => x !== actuel), suivant]);

  useEffect(() => {
    async function loadData() {
      try {
        const [catRes, prioRes, agentRes, statusRes] = await Promise.all([
          fetch("/api/categories"),
          fetch("/api/priorities"),
          fetch("/api/users?role=agent"),
          fetch("/api/statuses"),
        ]);
        const [catData, prioData, agentData, statusData] = await Promise.all([
          catRes.json(),
          prioRes.json(),
          agentRes.json(),
          statusRes.json(),
        ]);
        setCategories(Array.isArray(catData) ? catData : []);
        setPriorities(Array.isArray(prioData) ? prioData : []);
        setAgents(Array.isArray(agentData) ? agentData : []);
        setStatuses(Array.isArray(statusData) ? statusData : []);
      } catch {
        setError("Erreur lors du chargement des données.");
      } finally {
        setChargement(false);
      }
    }
    loadData();
  }, []);

  useEffect(() => {
    if (initialData) {
      setTitle(initialData.title);
      setDescription(initialData.description);
      setCategoryId(initialData.id_category);
      setPriorityId(initialData.id_priority);
      setAgentId(initialData.id_assigned_agent || "");
      setStatusId(initialData.id_status || "");
    }
  }, [initialData]);

  // Vérifications en direct
  const erreurs = {
    title: title.trim().length < 3 ? "Au moins 3 caractères." : "",
    description:
      description.trim().length < 10 ? "Au moins 10 caractères." : "",
    category: !categoryId ? "Choisis une catégorie." : "",
    priority: !priorityId ? "Choisis une priorité." : "",
    status: method === "PUT" && !statusId ? "Choisis un statut." : "",
  };
  const valide = Object.values(erreurs).every((e) => !e);

  const prioritesTriees = [...priorities].sort(
    (a, b) =>
      (PRIORITES[a.label]?.ordre ?? 9) - (PRIORITES[b.label]?.ordre ?? 9),
  );
  const statutsTries = [...statuses].sort(
    (a, b) => (STATUTS[a.label]?.ordre ?? 9) - (STATUTS[b.label]?.ordre ?? 9),
  );
  const agentChoisi = agents.find((a) => a.id_user === agentId);

  // Résumés affichés quand un bloc est fermé
  const libellePriorite = priorities.find(
    (p) => p.id_priority === priorityId,
  )?.label;
  const libelleStatut = statuses.find((x) => x.id_status === statusId)?.label;
  const resume1 = title.trim() ? title.trim() : "";
  const resume2 = [
    categories.find((c) => c.id_category === categoryId)?.label,
    libellePriorite
      ? `Priorité ${PRIORITES[libellePriorite]?.label ?? libellePriorite}`
      : "",
    method === "PUT" && libelleStatut
      ? (STATUTS[libelleStatut]?.label ?? libelleStatut)
      : "",
  ]
    .filter(Boolean)
    .join(" · ");
  const resume3 = agentChoisi
    ? `${agentChoisi.first_name} ${agentChoisi.last_name}`
    : "Non assigné";
  const complet1 = !erreurs.title && !erreurs.description;
  const complet2 = !erreurs.category && !erreurs.priority && !erreurs.status;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setTente(true);
    if (!valide) {
      // Ouvre les blocs qui contiennent une erreur
      setOuverts((o) => [
        ...new Set([...o, ...(complet1 ? [] : [1]), ...(complet2 ? [] : [2])]),
      ]);
      return;
    }

    setEnvoi(true);
    try {
      const res = await fetch(submitUrl, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({
          title,
          description,
          idCategory: categoryId,
          idPriority: priorityId,
          idAssignedAgent: agentId || null,
          ...(method === "PUT" && { idStatus: statusId }),
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        if (data.message?.name && data.message.name === "ZodError") {
          const message = JSON.parse(data.message.message)
            .map((z: { message: string }) => z.message)
            .join("\n");
          throw new Error(message);
        }
        throw new Error(
          typeof data.message === "string"
            ? data.message
            : method === "POST"
              ? "Erreur lors de la création"
              : "Erreur lors de la mise à jour",
        );
      }

      router.push(redirectTo);
      router.refresh();
    } catch (err) {
      setError((err as Error).message);
      setEnvoi(false);
    }
  }

  const champ =
    "w-full rounded-xl border bg-slate-50/60 px-4 py-3 text-sm text-slate-900 placeholder:text-slate-400 outline-none transition focus:bg-white focus:ring-4";
  const champOk = "border-slate-200 focus:border-blue-500 focus:ring-blue-100";
  const champKo = "border-red-300 focus:border-red-500 focus:ring-red-100";
  const aide = (msg: string) =>
    tente && msg ? <p className="mt-1.5 text-xs text-red-600">{msg}</p> : null;

  if (chargement) {
    return (
      <div className="space-y-5 animate-pulse">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="rounded-2xl border border-slate-200 bg-white p-6"
          >
            <div className="h-5 w-40 bg-slate-200 rounded mb-5" />
            <div className="h-11 bg-slate-100 rounded-xl mb-3" />
            <div className="h-11 bg-slate-100 rounded-xl" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5" noValidate>
      {error && (
        <div className="flex items-start gap-3 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 whitespace-pre-line">
          <svg
            aria-hidden="true"
            className="w-5 h-5 shrink-0 mt-0.5"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
          >
            <circle cx="12" cy="12" r="9" />
            <path d="M12 8v4M12 16h.01" />
          </svg>
          {error}
        </div>
      )}

      {/* 1. Description */}
      <Bloc
        numero={1}
        titre="La demande"
        sousTitre="Décris clairement le besoin"
        couleur="from-blue-500 to-indigo-500"
        ouvert={ouverts.includes(1)}
        complet={complet1}
        resume={resume1}
        onToggle={() => basculer(1)}
      >
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="titre"
                className="text-sm font-medium text-slate-700"
              >
                Titre
              </label>
              <span
                className={`text-xs tabular-nums ${title.length > 200 ? "text-red-600" : "text-slate-400"}`}
              >
                {title.length}/200
              </span>
            </div>
            <input
              id="titre"
              type="text"
              value={title}
              maxLength={200}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Ex. : Problème d'accès au dossier social"
              className={`${champ} ${tente && erreurs.title ? champKo : champOk}`}
            />
            {aide(erreurs.title)}
          </div>
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label
                htmlFor="description"
                className="text-sm font-medium text-slate-700"
              >
                Description
              </label>
              <span className="text-xs text-slate-400 tabular-nums">
                {description.length} caractères
              </span>
            </div>
            <textarea
              id="description"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              rows={5}
              placeholder="Contexte, étapes, ce qui est attendu…"
              className={`${champ} resize-y ${tente && erreurs.description ? champKo : champOk}`}
            />
            {aide(erreurs.description)}
          </div>
        </div>
        <BoutonSuivant onClick={() => passerA(1, 2)} />
      </Bloc>

      {/* 2. Classement */}
      <Bloc
        numero={2}
        titre="Classement"
        sousTitre="Catégorie et niveau d'urgence"
        couleur="from-violet-500 to-fuchsia-500"
        ouvert={ouverts.includes(2)}
        complet={complet2}
        resume={resume2}
        onToggle={() => basculer(2)}
      >
        <div className="space-y-5">
          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Catégorie</p>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {categories.map((c, i) => {
                const choisi = categoryId === c.id_category;
                return (
                  <button
                    key={c.id_category}
                    type="button"
                    onClick={() => setCategoryId(c.id_category)}
                    aria-pressed={choisi}
                    className={`relative overflow-hidden rounded-xl px-3 py-3 text-sm font-medium text-left transition-all duration-200 active:scale-95 ${
                      choisi
                        ? `bg-gradient-to-br ${COULEURS_CATEGORIE[i % COULEURS_CATEGORIE.length]} text-white shadow-lg`
                        : "bg-slate-50 text-slate-700 ring-1 ring-slate-200 hover:ring-slate-400 hover:-translate-y-0.5"
                    }`}
                  >
                    <span
                      className={`block w-2 h-2 rounded-full mb-2 ${choisi ? "bg-white" : `bg-gradient-to-br ${COULEURS_CATEGORIE[i % COULEURS_CATEGORIE.length]}`}`}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
            {aide(erreurs.category)}
          </div>

          <div>
            <p className="text-sm font-medium text-slate-700 mb-2">Priorité</p>
            <Pastilles
              options={prioritesTriees.map((p) => ({
                id: p.id_priority,
                label: p.label,
              }))}
              valeur={priorityId}
              onChange={setPriorityId}
              styles={PRIORITES}
            />
            {aide(erreurs.priority)}
          </div>

          {method === "PUT" && (
            <div>
              <p className="text-sm font-medium text-slate-700 mb-2">Statut</p>
              <Pastilles
                options={statutsTries.map((s) => ({
                  id: s.id_status,
                  label: s.label,
                }))}
                valeur={statusId}
                onChange={setStatusId}
                styles={STATUTS}
              />
              {aide(erreurs.status)}
            </div>
          )}
        </div>
        <BoutonSuivant onClick={() => passerA(2, 3)} />
      </Bloc>

      {/* 3. Agent */}
      <Bloc
        numero={3}
        titre="Prise en charge"
        sousTitre="Agent assigné (optionnel)"
        couleur="from-emerald-500 to-teal-500"
        ouvert={ouverts.includes(3)}
        complet={true}
        resume={resume3}
        onToggle={() => basculer(3)}
      >
        {agents.length === 0 ? (
          <div className="rounded-xl border border-dashed border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
            Aucun agent disponible : aucun utilisateur n'a le rôle{" "}
            <strong>AGENT</strong> dans la base.
          </div>
        ) : (
          <div className="grid sm:grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => setAgentId("")}
              aria-pressed={!agentId}
              className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-all active:scale-[.98] ${
                !agentId
                  ? "bg-slate-800 text-white shadow-md"
                  : "bg-slate-50 text-slate-600 ring-1 ring-slate-200 hover:ring-slate-400"
              }`}
            >
              <span
                className={`w-9 h-9 rounded-full flex items-center justify-center border-2 border-dashed ${!agentId ? "border-white/60" : "border-slate-300"}`}
              >
                –
              </span>
              Non assigné
            </button>
            {agents.map((a, i) => {
              const choisi = agentId === a.id_user;
              return (
                <button
                  key={a.id_user}
                  type="button"
                  onClick={() => setAgentId(a.id_user)}
                  aria-pressed={choisi}
                  className={`flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-left transition-all active:scale-[.98] ${
                    choisi
                      ? "bg-emerald-600 text-white shadow-md"
                      : "bg-slate-50 text-slate-800 ring-1 ring-slate-200 hover:ring-emerald-400 hover:-translate-y-0.5"
                  }`}
                >
                  <span
                    className={`w-9 h-9 rounded-full text-white text-xs font-bold flex items-center justify-center ${choisi ? "bg-white/25" : COULEURS_AVATAR[i % COULEURS_AVATAR.length]}`}
                  >
                    {initiales(a)}
                  </span>
                  <span className="font-medium">
                    {a.first_name} {a.last_name}
                  </span>
                  {choisi && (
                    <svg
                      aria-hidden="true"
                      className="w-4 h-4 ml-auto"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="3"
                    >
                      <path d="M5 12.5l4.5 4.5L19 7" />
                    </svg>
                  )}
                </button>
              );
            })}
          </div>
        )}
        {agentChoisi && (
          <p className="mt-3 text-xs text-emerald-700">
            ✓ La demande sera suivie par {agentChoisi.first_name}{" "}
            {agentChoisi.last_name}.
          </p>
        )}
      </Bloc>

      {/* Actions */}
      <div className="flex flex-col-reverse sm:flex-row sm:items-center sm:justify-end gap-3 pt-1">
        <button
          type="button"
          onClick={() => router.back()}
          className="px-5 py-3 rounded-xl text-sm font-medium text-slate-700 bg-white ring-1 ring-slate-200 hover:bg-slate-50 transition"
        >
          Annuler
        </button>
        <button
          type="submit"
          disabled={envoi}
          className="inline-flex items-center justify-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold text-white bg-gradient-to-r from-blue-600 to-indigo-600 shadow-lg shadow-blue-600/20 hover:shadow-blue-600/40 hover:-translate-y-0.5 active:translate-y-0 transition disabled:opacity-60 disabled:cursor-wait"
        >
          {envoi && (
            <span className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
          )}
          {envoi
            ? "Enregistrement…"
            : method === "POST"
              ? "Créer la demande"
              : "Mettre à jour la demande"}
        </button>
      </div>
    </form>
  );
}
