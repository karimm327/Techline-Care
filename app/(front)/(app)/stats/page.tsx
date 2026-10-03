import { FilePlus2, RotateCcw, ShieldCheck, Timer } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import PageHeader from "@/components/layout/PageHeader";
import {
  CourbeCreesCloturees,
  DonutCategories,
} from "@/components/stats/Graphiques";
import Avatar from "@/components/ui/Avatar";
import Card from "@/components/ui/Card";
import EmptyState from "@/components/ui/EmptyState";
import Indicateur from "@/components/ui/Indicateur";
import { estLectureSeule } from "@/lib/auth";
import { requireUser } from "@/lib/auth/session";
import {
  findStatistiques,
  PERIODES,
  type Periode,
} from "@/lib/db/queries/stats.queries";
import { cn } from "@/lib/ui/cn";

const JOURS = ["Lun", "Mar", "Mer", "Jeu", "Ven"];
const HEURES = [
  "9 h",
  "10 h",
  "11 h",
  "12 h",
  "13 h",
  "14 h",
  "15 h",
  "16 h",
  "17 h",
];
// 6 niveaux d'intensité de la carte de chaleur (classes complètes pour Tailwind)
const NIVEAUX = [
  "bg-accent-soft/[.06]",
  "bg-accent-soft/[.18]",
  "bg-accent-soft/[.32]",
  "bg-accent-soft/50",
  "bg-accent-soft/70",
  "bg-accent-soft/90",
];

const heures = (h: number | null) =>
  h === null ? null : Math.round(h * 10) / 10;

export default async function StatistiquesPage({
  searchParams,
}: {
  searchParams: Promise<{ periode?: string }>;
}) {
  const moi = await requireUser();
  if (estLectureSeule(moi.role)) redirect("/demands"); // ADMIN et AGENT uniquement

  const { periode: brut } = await searchParams;
  const demande = Number(brut ?? 14);
  const periode = (PERIODES as readonly number[]).includes(demande)
    ? (demande as Periode)
    : 14;
  const s = await findStatistiques(periode);
  const k = s.kpi;
  const variation =
    k.creesAvant > 0
      ? Math.round(((k.crees - k.creesAvant) / k.creesAvant) * 100)
      : null;
  const maxChaleur = Math.max(1, ...s.heatmap.flat());

  return (
    <div className="flex flex-col gap-6">
      <PageHeader
        eyebrow="Pilotage"
        title="Statistiques"
        subtitle={`Volume, délais et respect des SLA de l’équipe sur ${periode} jours.`}
        actions={
          <nav
            aria-label="Période"
            className="inline-flex rounded-[11px] border border-line bg-bg-sunken p-1"
          >
            {PERIODES.map((p) => (
              <Link
                key={p}
                href={`/stats?periode=${p}`}
                aria-current={p === periode ? "page" : undefined}
                className={cn(
                  "flex h-[34px] items-center rounded-[8px] px-3.5 text-[13px] font-semibold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
                  p === periode
                    ? "bg-surface-3 text-fg shadow-sm"
                    : "text-fg-3 hover:text-fg",
                )}
              >
                {p} j
              </Link>
            ))}
          </nav>
        }
      />

      {/* Indicateurs compacts, alignés à gauche (précisions au survol) */}
      <section
        aria-label="Indicateurs"
        className="-mt-2 flex flex-wrap items-center gap-x-1 gap-y-1"
      >
        <Indicateur
          label="demandes créées"
          icone={FilePlus2}
          couleurIcone="text-st-nouvelle-fg"
          valeur={k.crees}
          indication={
            variation === null
              ? `${k.clotureesPeriode} clôturée${k.clotureesPeriode > 1 ? "s" : ""} sur la période`
              : `${variation > 0 ? "+" : ""}${variation} % vs période précédente`
          }
        />
        <Indicateur
          label="délai moyen de résolution"
          icone={Timer}
          couleurIcone="text-st-encours-fg"
          valeur={heures(k.delaiMoyenH)}
          decimales={1}
          unite="h"
          indication={
            k.delaiMoyenH === null
              ? "Aucune clôture sur la période"
              : "De la création à la clôture"
          }
        />
        <Indicateur
          label="SLA respectés"
          icone={ShieldCheck}
          couleurIcone="text-success-fg"
          valeur={k.slaRespectes}
          unite="%"
          indication="Objectif 90 %"
        />
        <Indicateur
          label="réouverture"
          icone={RotateCcw}
          couleurIcone="text-prio-haute-fg"
          valeur={k.reouverture}
          unite="%"
          indication="Demandes clôturées puis rouvertes"
        />
      </section>

      <div className="grid items-start gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Card className="animate-rise [animation-delay:200ms]">
          <div className="mb-3 flex flex-wrap items-center justify-between gap-2.5">
            <h2 className="font-display text-h3">Créées vs clôturées</h2>
            <span className="flex gap-4 text-[12.5px] text-fg-2">
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-[3px] w-3 rounded-full bg-accent-soft"
                />
                Créées
              </span>
              <span className="flex items-center gap-1.5">
                <span
                  aria-hidden="true"
                  className="h-[3px] w-3 rounded-full bg-success"
                />
                Clôturées
              </span>
            </span>
          </div>
          <CourbeCreesCloturees serie={s.serie} />
        </Card>
        <Card className="animate-rise [animation-delay:260ms]">
          <h2 className="mb-3 font-display text-h3">Par catégorie</h2>
          <DonutCategories categories={s.categories} />
        </Card>
      </div>

      <div className="grid items-start gap-4 xl:grid-cols-2">
        <Card className="animate-rise [animation-delay:300ms]">
          <h2 className="font-display text-h3">Pics d’arrivée des demandes</h2>
          <p className="mb-3.5 mt-1 text-[12.5px] text-fg-3">
            Jour × heure, plus foncé = plus de demandes
          </p>
          <div className="overflow-x-auto">
            <table className="w-full min-w-[420px] border-separate border-spacing-[5px]">
              <caption className="sr-only">
                Nombre de demandes créées par jour et par heure
              </caption>
              <thead>
                <tr>
                  <td />
                  {HEURES.map((h) => (
                    <th
                      key={h}
                      scope="col"
                      className="text-center text-[11px] font-normal text-fg-4"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {s.heatmap.map((ligne, r) => (
                  <tr key={JOURS[r]}>
                    <th
                      scope="row"
                      className="pr-1 text-left text-xs font-normal text-fg-3"
                    >
                      {JOURS[r]}
                    </th>
                    {ligne.map((n, c) => (
                      <td
                        key={HEURES[c]}
                        title={`${JOURS[r]} ${HEURES[c]} : ${n}`}
                        className={cn(
                          "h-7 animate-pop rounded-[6px]",
                          NIVEAUX[
                            n === 0
                              ? 0
                              : Math.min(5, Math.ceil((n / maxChaleur) * 5))
                          ],
                        )}
                        style={{
                          animationDelay: `${300 + (r * 9 + c) * 18}ms`,
                        }}
                      >
                        <span className="sr-only">{n}</span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card className="animate-rise [animation-delay:340ms]">
          <h2 className="mb-3.5 font-display text-h3">
            Performance des agents
          </h2>
          {s.agents.length === 0 ? (
            <EmptyState
              title="Aucun agent"
              text="Les agents actifs apparaîtront ici."
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full min-w-[420px] border-collapse text-[13.5px]">
                <thead>
                  <tr className="text-[11.5px] uppercase tracking-[.06em] text-fg-3">
                    <th scope="col" className="py-2 text-left font-semibold">
                      Agent
                    </th>
                    <th scope="col" className="p-2 text-right font-semibold">
                      Clôturées
                    </th>
                    <th scope="col" className="p-2 text-right font-semibold">
                      Délai moy.
                    </th>
                    <th
                      scope="col"
                      className="w-[130px] py-2 pl-3 text-left font-semibold"
                    >
                      SLA
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {s.agents.map((a, i) => (
                    <tr
                      key={a.id}
                      className="animate-rise transition-colors hover:bg-surface-row"
                      style={{ animationDelay: `${400 + i * 70}ms` }}
                    >
                      <td className="border-t border-line-soft py-2.5">
                        <span className="inline-flex items-center gap-2.5">
                          <Avatar id={a.id} name={a.nom} size={28} decorative />
                          {a.nom}
                        </span>
                      </td>
                      <td className="border-t border-line-soft p-2 text-right tabular-nums">
                        {a.cloturees}
                      </td>
                      <td className="border-t border-line-soft p-2 text-right text-fg-2">
                        {a.delaiMoyenH === null
                          ? "—"
                          : `${String(heures(a.delaiMoyenH)).replace(".", ",")} h`}
                      </td>
                      <td className="border-t border-line-soft py-2.5 pl-3">
                        {a.sla === null ? (
                          <span className="text-fg-4">—</span>
                        ) : (
                          <span className="flex items-center gap-2">
                            <span className="h-1.5 flex-1 overflow-hidden rounded-full bg-bg-sunken">
                              <span
                                className={cn(
                                  "block h-full origin-left animate-bar rounded-full",
                                  a.sla >= 90
                                    ? "bg-success"
                                    : a.sla >= 80
                                      ? "bg-accent-soft"
                                      : "bg-st-encours",
                                )}
                                style={{
                                  width: `${a.sla}%`,
                                  animationDelay: `${600 + i * 90}ms`,
                                }}
                              />
                            </span>
                            <span className="text-xs text-fg-2">{a.sla} %</span>
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}
