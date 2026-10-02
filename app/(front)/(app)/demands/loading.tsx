import Skeleton from "@/components/ui/Skeleton";

// M14 — squelette du tableau de bord (forme réelle : en-tête, KPI, filtres, tableau)
export default function ChargementDemandes() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <output className="sr-only">Chargement des demandes…</output>
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-48" />
        <Skeleton className="h-9 w-64" />
        <Skeleton className="h-4 w-96 max-w-full" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(220px,1fr))] gap-4">
        {["a", "b", "c"].map((k) => (
          <div
            key={k}
            className="rounded-md border border-line bg-surface px-5 py-[18px]"
          >
            <Skeleton className="h-3.5 w-32" />
            <div className="mt-3 flex items-end justify-between">
              <Skeleton className="h-9 w-16" />
              <Skeleton className="h-9 w-[104px]" />
            </div>
            <Skeleton className="mt-3 h-3 w-40" />
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <Skeleton className="h-9 w-64 rounded-full" />
        {["s", "p", "c", "a"].map((k) => (
          <Skeleton key={k} className="h-9 w-24 rounded-full" />
        ))}
      </div>
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        <div className="border-b border-line px-[18px] py-3.5">
          <Skeleton className="h-5 w-44" />
        </div>
        {["1", "2", "3", "4", "5", "6"].map((k) => (
          <div
            key={k}
            className="flex items-center gap-6 border-t border-line-soft px-[18px] py-3.5 first:border-t-0"
          >
            <div className="flex-1">
              <Skeleton className="h-4 w-3/5" />
              <Skeleton className="mt-1.5 h-3 w-24" />
            </div>
            <Skeleton className="hidden h-[26px] w-24 md:block" />
            <Skeleton className="hidden h-4 w-20 md:block" />
            <Skeleton className="hidden h-[26px] w-32 rounded-full md:block" />
          </div>
        ))}
      </div>
    </div>
  );
}
