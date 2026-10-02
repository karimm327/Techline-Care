import { Plus } from "lucide-react";
import type { ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type Props = {
  // Remplace la pastille « + » de l'illustration
  icon?: ReactNode;
  title: string;
  text?: ReactNode;
  action?: ReactNode;
  className?: string;
};

// Liste vide : deux cartes flottantes + pastille qui « pop » (maquette States)
export default function EmptyState({
  icon,
  title,
  text,
  action,
  className,
}: Props) {
  return (
    <div
      className={cn(
        "flex flex-col items-center px-4 py-[22px] text-center",
        className,
      )}
    >
      <div aria-hidden="true" className="relative mb-4 h-[90px] w-[120px]">
        <span className="absolute left-2.5 top-[18px] h-[60px] w-[100px] animate-float rounded-xl border border-line-strong bg-surface-2 [--r:-6deg] [animation-duration:5s]" />
        <span className="absolute left-[18px] top-2 h-[60px] w-[100px] animate-float rounded-xl border border-line-hover bg-surface-3 [--r:4deg] [animation-delay:.8s] [animation-duration:5s]" />
        <span className="absolute left-[46px] top-7 flex size-7 animate-pop items-center justify-center rounded-full bg-accent text-white [animation-delay:.3s]">
          {icon ?? <Plus strokeWidth={2.2} className="size-4" />}
        </span>
      </div>
      <h2 className="font-display text-[17px] font-semibold text-fg">
        {title}
      </h2>
      {text && <p className="mb-4 mt-1.5 max-w-sm text-fg-3">{text}</p>}
      {action}
    </div>
  );
}
