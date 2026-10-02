"use client";

import { ArrowDown, ArrowUpDown } from "lucide-react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { cn } from "@/lib/ui/cn";

interface Props {
  label: string;
  field: string;
  className?: string;
}

// En-tête de colonne triable : conserve les filtres de l'URL, flèche qui pivote (180 ms)
export default function SortableHeader({ label, field, className }: Props) {
  const router = useRouter();
  const chemin = usePathname();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") ?? "created_at";
  const currentSortOrder = searchParams.get("sortOrder") ?? "DESC";
  const actif = field === currentSortBy;
  const ascendant = currentSortOrder === "ASC";

  function handleClick() {
    const params = new URLSearchParams(searchParams.toString());
    params.set("sortBy", field);
    params.set("sortOrder", actif && ascendant ? "DESC" : "ASC");
    params.delete("page"); // nouveau tri → page 1
    router.replace(`${chemin}?${params.toString()}`, { scroll: false });
  }

  return (
    <th
      scope="col"
      aria-sort={actif ? (ascendant ? "ascending" : "descending") : "none"}
      className={cn("px-3 py-2.5 text-left font-semibold", className)}
    >
      <button
        type="button"
        onClick={handleClick}
        className={cn(
          "inline-flex items-center gap-1 rounded-xs uppercase tracking-[.06em] transition-colors duration-[180ms]",
          "focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft",
          actif ? "text-fg" : "text-fg-3 hover:text-fg",
        )}
      >
        {label}
        {actif ? (
          <ArrowDown
            aria-hidden="true"
            strokeWidth={2.4}
            className={cn(
              "size-3.5 text-accent-fg transition-transform duration-[180ms] ease-out",
              ascendant && "rotate-180",
            )}
          />
        ) : (
          <ArrowUpDown
            aria-hidden="true"
            strokeWidth={2.2}
            className="size-3.5 text-fg-4"
          />
        )}
      </button>
    </th>
  );
}
