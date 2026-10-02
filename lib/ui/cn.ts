import { type ClassValue, clsx } from "clsx";
import { extendTailwindMerge } from "tailwind-merge";

// tailwind-merge doit connaître les valeurs ajoutées par les tokens, sinon
// cn("text-h1", "text-fg") prendrait la taille pour une couleur et en supprimerait une.
const fusion = extendTailwindMerge({
  extend: {
    classGroups: {
      "font-size": [
        { text: ["display-xl", "h1", "h2", "h3", "kpi", "eyebrow"] },
      ],
      shadow: [{ shadow: ["glow", "focus"] }],
      ease: [{ ease: ["spring"] }],
      duration: [{ duration: ["fast", "base", "slow", "enter"] }],
      z: [{ z: ["header", "sticky", "toast", "overlay", "palette"] }],
    },
  },
});

// Assemble des classes conditionnelles en résolvant les conflits Tailwind
export function cn(...classes: ClassValue[]): string {
  return fusion(clsx(classes));
}
