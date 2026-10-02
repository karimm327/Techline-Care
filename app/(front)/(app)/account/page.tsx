import { Check, Clock, LifeBuoy, Mail, Minus, ShieldCheck } from "lucide-react";
import Link from "next/link";
import FormulaireMotDePasse from "@/components/account/FormulaireMotDePasse";
import OngletsCompte from "@/components/account/OngletsCompte";
import Card from "@/components/ui/Card";
import Input from "@/components/ui/Input";
import { estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import {
  countAssignedDemandsByStatus,
  countCommentsByUser,
  findUserById,
} from "@/lib/db/queries/user.queries";
import { cn } from "@/lib/ui/cn";
import {
  DESCRIPTIONS_ROLES,
  DROITS,
  LIBELLES_ROLES,
  ROLES_MATRICE,
  type RoleMatrice,
} from "@/lib/ui/droits";
import { dateCourte } from "@/lib/ui/format";
import { avatarColor, initiales } from "@/lib/ui/status";

const ONGLETS = ["profil", "securite", "droits"] as const;

interface Props {
  searchParams: Promise<{ onglet?: string }>;
}

function TitreCarte({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="mb-4 font-display text-[17px] font-semibold">{children}</h2>
  );
}

export default async function AccountPage({ searchParams }: Props) {
  const moi = await requireUser();
  const { onglet } = await searchParams;
  const initial = (ONGLETS as readonly string[]).includes(onglet ?? "")
    ? (onglet as string)
    : "profil";

  const [user, parStatut, commentaires] = await Promise.all([
    findUserById(moi.id),
    countAssignedDemandsByStatus(moi.id),
    countCommentsByUser(moi.id),
  ]);
  const nom =
    `${user?.first_name ?? ""} ${user?.last_name ?? ""}`.trim() || moi.email;
  const role = (ROLES_MATRICE as readonly string[]).includes(moi.role)
    ? (moi.role as RoleMatrice)
    : "LECTURE";
  const compte = (s: string) =>
    parStatut.find((l) => l.status === s)?.total ?? 0;
  const assignees = parStatut.reduce((a, l) => a + l.total, 0);

  const stats = [
    { label: "Assignées", valeur: assignees, couleur: "text-fg" },
    {
      label: "En cours",
      valeur: compte("EN_COURS"),
      couleur: "text-st-encours-fg",
    },
    {
      label: "Clôturées",
      valeur: compte("CLOTUREE"),
      couleur: "text-st-cloturee-fg",
    },
    {
      label: "Commentaires",
      valeur: commentaires as number,
      couleur: "text-fg",
    },
  ];

  const entete = (
    <>
      <div
        aria-hidden="true"
        className="h-24 animate-grid bg-bg-sunken bg-[radial-gradient(circle_at_1px_1px,rgb(var(--line))_1px,transparent_0)] bg-[length:18px_18px] [animation-duration:8s]"
      />
      <div className="-mt-10 flex flex-wrap items-end gap-[18px] px-6 pb-5">
        <span
          aria-hidden="true"
          className={cn(
            "flex size-[88px] animate-pop items-center justify-center rounded-xl font-display text-[30px] font-semibold text-white ring-[5px] ring-surface",
            avatarColor(moi.id),
          )}
        >
          {initiales(nom)}
        </span>
        <div className="min-w-[200px] flex-1">
          <h1 className="font-display text-[26px] font-semibold leading-tight">
            {nom}
          </h1>
          <p className="mt-0.5 break-all text-fg-2">
            {user?.email ?? moi.email} ·{" "}
            <span className="font-semibold text-accent-fg-2">
              {LIBELLES_ROLES[role]}
            </span>
          </p>
        </div>
        <dl className="grid w-full grid-cols-4 gap-4 text-center sm:w-auto sm:gap-[22px]">
          {stats.map((s) => (
            <div key={s.label} className="flex flex-col-reverse">
              <dt className="text-xs text-fg-3">{s.label}</dt>
              <dd
                className={cn(
                  "font-display text-[22px] font-semibold tabular-nums",
                  s.couleur,
                )}
              >
                {s.valeur}
              </dd>
            </div>
          ))}
        </dl>
      </div>
    </>
  );

  const profil = (
    <div className="grid items-start gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
      <Card className="animate-rise">
        <TitreCarte>Informations personnelles</TitreCarte>
        <div className="grid gap-4 sm:grid-cols-2">
          <Input
            id="compte-prenom"
            label="Prénom"
            value={user?.first_name ?? ""}
            readOnly
          />
          <Input
            id="compte-nom"
            label="Nom"
            value={user?.last_name ?? ""}
            readOnly
          />
          <Input
            id="compte-email"
            label="E-mail"
            value={user?.email ?? moi.email}
            readOnly
            wrapperClassName="sm:col-span-2"
            className="text-fg-3"
            hint="Ces informations sont gérées par un administrateur."
          />
        </div>
        {user?.created_at && (
          <p className="mt-4 text-[12.5px] text-fg-4">
            Compte créé le {dateCourte(user.created_at)}.
          </p>
        )}
        {assignees > 0 && (
          <Link
            href={`/demands?agent=${moi.id}`}
            className="mt-4 inline-flex rounded-xs text-[13px] font-semibold text-accent-fg hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            Voir mes demandes assignées →
          </Link>
        )}
      </Card>
      <Card className="animate-rise [animation-delay:80ms]">
        <TitreCarte>Besoin d’aide ?</TitreCarte>
        <ul className="flex flex-col gap-1">
          <li>
            <a
              href="mailto:support@techline-care.fr"
              className="flex items-center gap-3 rounded-xl p-3 text-fg-1 transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
            >
              <span
                aria-hidden="true"
                className="flex size-9 items-center justify-center rounded-[10px] bg-accent/20 text-accent-fg-2"
              >
                <Mail strokeWidth={1.9} className="size-4" />
              </span>
              <span>
                <b className="block font-semibold text-fg">Écrire au support</b>
                <span className="text-[12.5px] text-fg-3">
                  support@techline-care.fr
                </span>
              </span>
            </a>
          </li>
          <li className="flex items-center gap-3 p-3 text-fg-1">
            <span
              aria-hidden="true"
              className="flex size-9 items-center justify-center rounded-[10px] bg-success/15 text-success-fg"
            >
              <Clock strokeWidth={1.9} className="size-4" />
            </span>
            <span>
              <b className="block font-semibold text-fg">Horaires</b>
              <span className="text-[12.5px] text-fg-3">
                Du lundi au vendredi, 9 h – 18 h
              </span>
            </span>
          </li>
          {!estLectureSeule(moi.role) && (
            <li>
              <Link
                href="/demands/new"
                className="flex items-center gap-3 rounded-xl p-3 text-fg-1 transition-colors hover:bg-surface-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
              >
                <span
                  aria-hidden="true"
                  className="flex size-9 items-center justify-center rounded-[10px] bg-prio-haute/15 text-prio-haute-fg"
                >
                  <LifeBuoy strokeWidth={1.9} className="size-4" />
                </span>
                <span>
                  <b className="block font-semibold text-fg">
                    Signaler un problème
                  </b>
                  <span className="text-[12.5px] text-fg-3">
                    Créer une demande de support
                  </span>
                </span>
              </Link>
            </li>
          )}
        </ul>
      </Card>
    </div>
  );

  const securite = (
    <Card className="animate-rise">
      <TitreCarte>Mot de passe</TitreCarte>
      <p className="-mt-2 mb-5 text-fg-3">
        Choisissez un mot de passe que vous n’utilisez nulle part ailleurs.
      </p>
      <FormulaireMotDePasse />
    </Card>
  );

  const droits = (
    <Card className="animate-rise overflow-hidden p-0 sm:p-0">
      <div className="flex items-start gap-3 px-5 pb-3 pt-5 sm:px-6">
        <span
          aria-hidden="true"
          className="flex size-9 shrink-0 items-center justify-center rounded-[10px] bg-accent/20 text-accent-fg-2"
        >
          <ShieldCheck strokeWidth={1.9} className="size-[18px]" />
        </span>
        <div>
          <h2 className="font-display text-[17px] font-semibold">Mes droits</h2>
          <p className="text-fg-3">
            Votre rôle : <b className="text-fg">{LIBELLES_ROLES[role]}</b> —{" "}
            {DESCRIPTIONS_ROLES[role]}
          </p>
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full min-w-[560px] border-collapse text-[13.5px]">
          <caption className="sr-only">
            Actions autorisées par rôle ; votre rôle est mis en évidence.
          </caption>
          <thead>
            <tr className="bg-surface-inset text-[11.5px] uppercase tracking-[.06em] text-fg-3">
              <th
                scope="col"
                className="px-5 py-2.5 text-left font-semibold sm:px-6"
              >
                Action
              </th>
              {ROLES_MATRICE.map((r) => (
                <th
                  key={r}
                  scope="col"
                  className={cn(
                    "px-3 py-2.5 text-center font-semibold",
                    r === role && "bg-accent/15 text-accent-fg-2",
                  )}
                >
                  {LIBELLES_ROLES[r]}
                  {r === role && <span className="sr-only"> (votre rôle)</span>}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {DROITS.map((d) => (
              <tr key={d.action}>
                <th
                  scope="row"
                  className="border-t border-line-soft px-5 py-3 text-left font-normal text-fg-1 sm:px-6"
                >
                  {d.action}
                </th>
                {ROLES_MATRICE.map((r) => {
                  const ok = d.roles.includes(r);
                  return (
                    <td
                      key={r}
                      className={cn(
                        "border-t border-line-soft px-3 py-3 text-center",
                        r === role && "bg-accent/[.08]",
                      )}
                    >
                      <span
                        role="img"
                        aria-label={ok ? "Autorisé" : "Non autorisé"}
                        className={cn(
                          "inline-flex size-6 items-center justify-center rounded-full",
                          ok
                            ? "bg-success/20 text-success-fg"
                            : "bg-surface-2 text-fg-4",
                        )}
                      >
                        {ok ? (
                          <Check
                            aria-hidden="true"
                            strokeWidth={3}
                            className="size-3.5"
                          />
                        ) : (
                          <Minus
                            aria-hidden="true"
                            strokeWidth={3}
                            className="size-3.5"
                          />
                        )}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Card>
  );

  return (
    <div className="mx-auto flex w-full max-w-6xl flex-col gap-6">
      <OngletsCompte
        entete={entete}
        initial={initial}
        onglets={[
          { value: "profil", label: "Profil", contenu: profil },
          { value: "securite", label: "Sécurité", contenu: securite },
          { value: "droits", label: "Mes droits", contenu: droits },
        ]}
      />
    </div>
  );
}
