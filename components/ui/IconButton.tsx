import { type ButtonHTMLAttributes, forwardRef, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";

type Props = Omit<ButtonHTMLAttributes<HTMLButtonElement>, "aria-label"> & {
  // Obligatoire : seul texte lu par les lecteurs d'écran
  label: string;
  size?: 36 | 44;
  children: ReactNode;
};

const IconButton = forwardRef<HTMLButtonElement, Props>(function IconButton(
  { label, size = 44, className, children, type = "button", ...reste },
  ref,
) {
  return (
    <button
      ref={ref}
      type={type}
      aria-label={label}
      title={label}
      className={cn(
        "relative inline-flex shrink-0 items-center justify-center rounded-sm text-fg-2 transition-colors duration-200",
        "hover:bg-surface-2 hover:text-fg disabled:cursor-not-allowed disabled:opacity-55",
        "focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft",
        size === 44 ? "size-11" : "size-9",
        className,
      )}
      {...reste}
    >
      {children}
    </button>
  );
});

export default IconButton;
