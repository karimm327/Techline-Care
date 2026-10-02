"use client";

import { cn } from "@/lib/ui/cn";

type Props = {
  checked: boolean;
  onChange: (valeur: boolean) => void;
  label: string;
  // Description affichée sous le libellé
  description?: string;
  disabled?: boolean;
  // Libellé visible ou seulement lu par les lecteurs d'écran
  hideLabel?: boolean;
  className?: string;
};

// Interrupteur 44×26, pouce 20 px qui glisse en ressort 300 ms
export default function Switch({
  checked,
  onChange,
  label,
  description,
  disabled,
  hideLabel = false,
  className,
}: Props) {
  return (
    <label
      className={cn(
        "flex min-h-11 cursor-pointer items-center justify-between gap-4",
        disabled && "cursor-not-allowed opacity-55",
        className,
      )}
    >
      <span className={cn("flex flex-col", hideLabel && "sr-only")}>
        <span className="text-sm font-medium text-fg">{label}</span>
        {description && (
          <span className="text-[12.5px] text-fg-3">{description}</span>
        )}
      </span>
      <span className="relative inline-flex h-[26px] w-11 shrink-0">
        <input
          type="checkbox"
          role="switch"
          aria-checked={checked}
          checked={checked}
          disabled={disabled}
          onChange={(e) => onChange(e.target.checked)}
          className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-full bg-line-field transition-colors duration-200 checked:bg-accent focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft disabled:cursor-not-allowed"
        />
        <span
          aria-hidden="true"
          className="pointer-events-none absolute left-[3px] top-[3px] size-5 rounded-full bg-fg shadow-sm transition-transform duration-300 ease-spring peer-checked:translate-x-[18px]"
        />
      </span>
    </label>
  );
}
