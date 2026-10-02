import { CircleAlert, CircleCheck, Info, TriangleAlert } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type Ton = "info" | "warning" | "danger" | "success";

const TONS: Record<
  Ton,
  { boite: string; pastille: string; titre: string; icone: ReactNode }
> = {
  info: {
    boite: "bg-st-nouvelle/10 border-st-nouvelle/[.38]",
    pastille: "bg-st-nouvelle/20 text-st-nouvelle-fg",
    titre: "text-st-nouvelle-fg",
    icone: <Info strokeWidth={2.2} className="size-[18px]" />,
  },
  warning: {
    boite: "bg-st-encours/10 border-st-encours/[.38]",
    pastille: "bg-st-encours/20 text-st-encours-fg",
    titre: "text-st-encours-fg",
    icone: <TriangleAlert strokeWidth={2.2} className="size-[18px]" />,
  },
  danger: {
    boite: "bg-danger/10 border-danger/[.38] animate-shake",
    pastille: "bg-danger/20 text-danger-fg",
    titre: "text-danger-fg",
    icone: <CircleAlert strokeWidth={2.2} className="size-[18px]" />,
  },
  success: {
    boite: "bg-success/10 border-success/[.38]",
    pastille: "bg-success/20 text-success-fg",
    titre: "text-success-fg",
    icone: <CircleCheck strokeWidth={2.2} className="size-[18px]" />,
  },
};

type Props = {
  tone?: Ton;
  title?: ReactNode;
  children?: ReactNode;
  // Bouton(s) sous le texte (ex. « Réessayer »)
  action?: ReactNode;
  className?: string;
};

// Message contextuel. danger : secousse à l'apparition, annoncé immédiatement.
export default function Alert({
  tone = "info",
  title,
  children,
  action,
  className,
}: Props) {
  const t = TONS[tone];
  const urgent = tone === "danger" || tone === "warning";
  return (
    <div
      role={urgent ? "alert" : "status"}
      className={cn("flex gap-3.5 rounded-xl border p-4", t.boite, className)}
    >
      <span
        aria-hidden="true"
        className={cn(
          "flex size-9 shrink-0 items-center justify-center rounded-full",
          t.pastille,
        )}
      >
        {t.icone}
      </span>
      <div className="min-w-0 flex-1 self-center">
        {title && <p className={cn("font-semibold", t.titre)}>{title}</p>}
        {children && (
          <div className={cn("text-[13.5px] text-fg-1", title && "mt-1")}>
            {children}
          </div>
        )}
        {action && <div className="mt-3 flex flex-wrap gap-2">{action}</div>}
      </div>
    </div>
  );
}
