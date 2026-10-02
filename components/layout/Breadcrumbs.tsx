"use client";

import { ChevronRight } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Fragment } from "react";
import { cn } from "@/lib/ui/cn";
import { miettesPour } from "./navigation";

// Fil d'Ariane du header, construit depuis la route ; dernier segment = page courante
export default function Breadcrumbs({ className }: { className?: string }) {
  const miettes = miettesPour(usePathname());
  if (miettes.length === 0) return null;

  return (
    <nav aria-label="Fil d’Ariane" className={cn("min-w-0", className)}>
      <ol className="flex items-center gap-2 text-[13px] text-fg-3">
        {miettes.map((m, i) => {
          const derniere = i === miettes.length - 1;
          return (
            <Fragment key={`${m.label}-${m.href ?? ""}`}>
              {i > 0 && (
                <li aria-hidden="true" className="flex">
                  <ChevronRight strokeWidth={2} className="size-3.5" />
                </li>
              )}
              <li className="truncate">
                {derniere ? (
                  <span aria-current="page" className="font-medium text-fg">
                    {m.label}
                  </span>
                ) : m.href ? (
                  <Link
                    href={m.href}
                    className="rounded-xs text-fg-3 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
                  >
                    {m.label}
                  </Link>
                ) : (
                  <span>{m.label}</span>
                )}
              </li>
            </Fragment>
          );
        })}
      </ol>
    </nav>
  );
}
