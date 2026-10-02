"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  label: string;
  field: string;
}

export default function SortableHeader({ label, field }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSortBy = searchParams.get("sortBy") ?? "created_at";
  const currentSortOrder = searchParams.get("sortOrder") ?? "DESC";
  const actif = field === currentSortBy;

  function handleClick() {
    const newOrder = actif && currentSortOrder === "ASC" ? "DESC" : "ASC";
    // Nouveau tri → on revient à la page 1
    router.push(`/demands?sortBy=${field}&sortOrder=${newOrder}`);
  }

  return (
    <th
      scope="col"
      aria-sort={
        actif
          ? currentSortOrder === "ASC"
            ? "ascending"
            : "descending"
          : "none"
      }
      className="px-4 py-3 text-left"
    >
      <button
        type="button"
        onClick={handleClick}
        className={`inline-flex items-center gap-1 text-xs font-semibold uppercase tracking-wide transition ${
          actif ? "text-slate-900" : "text-slate-500 hover:text-slate-900"
        }`}
      >
        {label}
        <svg
          aria-hidden="true"
          className={`w-3.5 h-3.5 ${actif ? "text-blue-600" : "text-slate-300"}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          {!actif ? (
            <path d="m7 15 5 5 5-5M7 9l5-5 5 5" />
          ) : currentSortOrder === "ASC" ? (
            <path d="m7 14 5-5 5 5" />
          ) : (
            <path d="m7 10 5 5 5-5" />
          )}
        </svg>
      </button>
    </th>
  );
}
