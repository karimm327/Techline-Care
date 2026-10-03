"use client";

import { Upload } from "lucide-react";
import { type DragEvent, useId, useRef, useState } from "react";
import { cn } from "@/lib/ui/cn";
import { ACCEPT_FICHIERS } from "@/lib/ui/envoiFichier";

type Props = {
  onFichiers: (fichiers: File[]) => void;
  disabled?: boolean;
  className?: string;
};

// Zone de dépôt de fichiers : glisser-déposer (bordure pulsée M13) ou clic / clavier pour parcourir
export default function DropZone({
  onFichiers,
  disabled = false,
  className,
}: Props) {
  const id = useId();
  const champ = useRef<HTMLInputElement>(null);
  const [survol, setSurvol] = useState(false);
  const profondeur = useRef(0);

  const recevoir = (liste: FileList | null) => {
    const fichiers = Array.from(liste ?? []);
    if (fichiers.length) onFichiers(fichiers);
  };

  const evenements = disabled
    ? {}
    : {
        onDragEnter: (e: DragEvent) => {
          e.preventDefault();
          profondeur.current += 1;
          setSurvol(true);
        },
        onDragOver: (e: DragEvent) => e.preventDefault(),
        onDragLeave: () => {
          profondeur.current -= 1;
          if (profondeur.current <= 0) setSurvol(false);
        },
        onDrop: (e: DragEvent) => {
          e.preventDefault();
          profondeur.current = 0;
          setSurvol(false);
          recevoir(e.dataTransfer.files);
        },
      };

  return (
    <label
      htmlFor={id}
      {...evenements}
      className={cn(
        "flex cursor-pointer flex-col items-center gap-1.5 rounded-[14px] border-[1.5px] border-dashed px-6 py-[22px] text-center text-[13.5px] text-accent-fg-2 transition-colors",
        "focus-within:outline focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-accent-soft",
        survol ? "animate-drop" : "border-accent-fg/50 hover:bg-accent/5",
        disabled && "cursor-not-allowed opacity-50",
        className,
      )}
    >
      <Upload aria-hidden="true" strokeWidth={1.8} className="size-[26px]" />
      <span>
        Glissez vos fichiers ou <span className="underline">parcourez</span>
      </span>
      <span className="text-xs text-fg-3">PDF, PNG, JPG, WEBP · 10 Mo max</span>
      <input
        ref={champ}
        id={id}
        type="file"
        multiple
        accept={ACCEPT_FICHIERS}
        disabled={disabled}
        onChange={(e) => {
          recevoir(e.target.files);
          e.target.value = ""; // permet de renvoyer le même fichier
        }}
        className="sr-only"
      />
    </label>
  );
}
