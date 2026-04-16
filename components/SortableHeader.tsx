"use client";

import { useRouter, useSearchParams } from "next/navigation";

interface Props {
  label: string;
  field: string;
}

export default function SortableHeader({ label, field }: Props) {
  const router = useRouter();
  const searchParams = useSearchParams();

  const currentSortBy    = searchParams.get("sortBy")    ?? "created_at";
  const currentSortOrder = searchParams.get("sortOrder") ?? "DESC";

  function handleClick() {
    let newOrder = "ASC";

    if (field === currentSortBy) {
      newOrder = currentSortOrder === "ASC" ? "DESC" : "ASC";
    }

    router.push(`/demands?sortBy=${field}&sortOrder=${newOrder}`);
  }

  function icon() {
    if (field !== currentSortBy) return " ↕";
    return currentSortOrder === "ASC" ? " ↑" : " ↓";
  }

  return (
    <th
      onClick={handleClick}
      className="text-left p-3 cursor-pointer select-none hover:bg-gray-200 transition"
    >
      {label}{icon()}
    </th>
  );
}