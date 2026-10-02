import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import Kbd from "./Kbd";

export type VarianteBouton =
  | "primary"
  | "secondary"
  | "ghost"
  | "danger"
  | "success";
export type TailleBouton = "sm" | "md" | "lg";

const VARIANTES: Record<VarianteBouton, string> = {
  primary:
    "bg-accent text-white hover:brightness-110 hover:shadow-glow disabled:hover:brightness-100 disabled:hover:shadow-none",
  secondary:
    "bg-surface border border-line-strong/70 text-fg-1 hover:bg-surface-2 hover:text-fg",
  ghost: "bg-transparent text-accent-fg hover:bg-surface-2 hover:text-fg",
  danger: "bg-danger/15 text-danger-fg hover:bg-danger/25",
  success: "bg-success text-ink hover:brightness-110",
};

const TAILLES: Record<TailleBouton, string> = {
  sm: "h-8 px-3 text-[13px] gap-1.5",
  md: "h-10 px-4 text-[13.5px] gap-2",
  lg: "h-12 px-5 text-[14.5px] gap-2",
};

// Classes d'un bouton, réutilisables sur un <Link> stylé comme un bouton
export function classesBouton({
  variant = "primary",
  size = "md",
  className,
}: {
  variant?: VarianteBouton;
  size?: TailleBouton;
  className?: string;
} = {}) {
  return cn(
    "cible-tactile inline-flex shrink-0 select-none items-center justify-center whitespace-nowrap rounded-sm font-semibold",
    "transition-[transform,filter,box-shadow,background-color,color] duration-200 ease-out active:scale-[.96]",
    "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft",
    "disabled:cursor-not-allowed disabled:opacity-55 disabled:active:scale-100",
    VARIANTES[variant],
    TAILLES[size],
    className,
  );
}

// Spinner 16 px (M06)
export function Spinner({ className }: { className?: string }) {
  return (
    <span
      aria-hidden="true"
      className={cn(
        "inline-block size-4 shrink-0 animate-spin rounded-full border-2 border-current border-t-transparent opacity-80",
        className,
      )}
    />
  );
}

type Props = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: VarianteBouton;
  size?: TailleBouton;
  loading?: boolean;
  // Libellé pendant le chargement (ex. « Enregistrement… »)
  loadingLabel?: string;
  icon?: ReactNode;
  kbd?: string;
};

const Button = forwardRef<HTMLButtonElement, Props>(function Button(
  {
    variant = "primary",
    size = "md",
    loading = false,
    loadingLabel,
    icon,
    kbd,
    className,
    children,
    disabled,
    type = "button",
    ...reste
  },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      disabled={disabled || loading}
      aria-busy={loading || undefined}
      className={classesBouton({ variant, size, className })}
      {...reste}
    >
      {loading ? <Spinner /> : icon}
      {loading && loadingLabel ? loadingLabel : children}
      {kbd && !loading && (
        <Kbd className="ml-1 hidden border-white/30 bg-white/10 text-current md:inline-flex">
          {kbd}
        </Kbd>
      )}
    </button>
  );
});

export default Button;
