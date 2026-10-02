import Skeleton from "@/components/ui/Skeleton";

// Squelettes (M14) reprenant la forme réelle de chaque écran

function Annonce({ texte }: { texte: string }) {
  return <output className="sr-only">{texte}</output>;
}

function Carte({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div
      className={`rounded-md border border-line bg-surface p-5 sm:p-6 ${className}`}
    >
      {children}
    </div>
  );
}

export function SqueletteFiche() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      aria-busy="true"
    >
      <Annonce texte="Chargement de la demande…" />
      <Carte className="rounded-lg">
        <div className="flex gap-2.5">
          <Skeleton className="h-[34px] w-28" />
          <Skeleton className="h-[26px] w-24" />
        </div>
        <Skeleton className="mt-4 h-8 w-2/3" />
        <div className="mt-3 flex gap-2">
          <Skeleton className="h-[26px] w-24" />
          <Skeleton className="h-[26px] w-28" />
          <Skeleton className="h-[26px] w-24" />
        </div>
        <div className="mt-6 grid grid-cols-3 gap-4 border-t border-line pt-5">
          {["a", "b", "c"].map((k) => (
            <div key={k} className="flex flex-col items-center gap-2">
              <Skeleton className="size-8 rounded-full" />
              <Skeleton className="h-3.5 w-16" />
            </div>
          ))}
        </div>
      </Carte>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(280px,1fr)]">
        <div className="flex flex-col gap-5">
          <Carte>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-2 h-4 w-11/12" />
            <Skeleton className="mt-2 h-4 w-3/4" />
          </Carte>
          <Carte>
            <Skeleton className="h-9 w-48" />
            <div className="mt-5 flex gap-3">
              <Skeleton className="size-9 rounded-full" />
              <Skeleton className="h-14 flex-1" />
            </div>
          </Carte>
        </div>
        <div className="flex flex-col gap-5">
          <Carte>
            <Skeleton className="h-5 w-24" />
            <Skeleton className="mt-4 h-4 w-full" />
            <Skeleton className="mt-3 h-4 w-full" />
          </Carte>
          <Carte>
            <Skeleton className="h-5 w-32" />
            <Skeleton className="mt-4 h-16 w-full" />
          </Carte>
        </div>
      </div>
    </div>
  );
}

export function SqueletteFormulaire() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      aria-busy="true"
    >
      <Annonce texte="Chargement du formulaire…" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-52" />
        <Skeleton className="h-9 w-72" />
      </div>
      <div className="grid gap-5 lg:grid-cols-[minmax(0,2fr)_minmax(300px,1fr)]">
        <Carte className="flex flex-col gap-5">
          <Skeleton className="h-[46px] w-full" />
          <div className="grid grid-cols-2 gap-2.5 sm:grid-cols-4">
            {["a", "b", "c", "d"].map((k) => (
              <Skeleton key={k} className="h-14 rounded-xl" />
            ))}
          </div>
          <Skeleton className="h-12 w-full rounded-xl" />
          <Skeleton className="h-40 w-full" />
        </Carte>
        <Carte>
          <Skeleton className="h-3.5 w-32" />
          <Skeleton className="mt-3 h-28 w-full rounded-xl" />
        </Carte>
      </div>
    </div>
  );
}

export function SqueletteJournal() {
  return (
    <div className="flex flex-col gap-6" aria-busy="true">
      <Annonce texte="Chargement du journal…" />
      <div className="flex flex-col gap-2">
        <Skeleton className="h-3.5 w-32" />
        <Skeleton className="h-9 w-64" />
      </div>
      <div className="grid grid-cols-[repeat(auto-fit,minmax(170px,1fr))] gap-3">
        {["a", "b", "c", "d", "e"].map((k) => (
          <Skeleton key={k} className="h-[104px] rounded-[14px]" />
        ))}
      </div>
      <Carte>
        <Skeleton className="h-10 w-full" />
        {["1", "2", "3", "4", "5"].map((k) => (
          <div key={k} className="mt-5 flex gap-3.5">
            <Skeleton className="size-7 rounded-full" />
            <div className="flex-1">
              <Skeleton className="h-4 w-2/3" />
              <Skeleton className="mt-2 h-3 w-1/3" />
            </div>
          </div>
        ))}
      </Carte>
    </div>
  );
}

export function SqueletteCompte() {
  return (
    <div
      className="mx-auto flex w-full max-w-6xl flex-col gap-6"
      aria-busy="true"
    >
      <Annonce texte="Chargement du compte…" />
      <div className="overflow-hidden rounded-md border border-line bg-surface">
        <Skeleton className="h-24 rounded-none" />
        <div className="-mt-10 flex items-end gap-[18px] px-6 pb-5">
          <Skeleton className="size-[88px] rounded-xl" />
          <div className="flex-1">
            <Skeleton className="h-7 w-48" />
            <Skeleton className="mt-2 h-4 w-64" />
          </div>
        </div>
        <div className="flex gap-3 border-t border-line px-4 py-3">
          <Skeleton className="h-5 w-16" />
          <Skeleton className="h-5 w-20" />
          <Skeleton className="h-5 w-24" />
        </div>
      </div>
      <Carte>
        <Skeleton className="h-5 w-56" />
        <Skeleton className="mt-4 h-[46px] w-full" />
      </Carte>
    </div>
  );
}
