import { ChevronDown } from "lucide-react";
import { forwardRef, type ReactNode, type SelectHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";
import Champ, { classesChamp, decritPar } from "./Champ";

type Props = SelectHTMLAttributes<HTMLSelectElement> & {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  wrapperClassName?: string;
};

// Liste déroulante native (accessible et mobile) habillée aux tokens
const Select = forwardRef<HTMLSelectElement, Props>(function Select(
  { id, label, hint, error, wrapperClassName, className, children, ...reste },
  ref,
) {
  return (
    <Champ
      id={id}
      label={label}
      hint={hint}
      error={error}
      className={wrapperClassName}
    >
      <span className="relative block">
        <select
          ref={ref}
          id={id}
          aria-invalid={error ? true : undefined}
          aria-describedby={decritPar(id, error, hint)}
          className={cn(
            classesChamp(!!error),
            "h-[46px] cursor-pointer appearance-none pl-3.5 pr-10",
            className,
          )}
          {...reste}
        >
          {children}
        </select>
        <ChevronDown
          aria-hidden="true"
          strokeWidth={1.9}
          className="pointer-events-none absolute right-3.5 top-1/2 size-4 -translate-y-1/2 text-fg-3"
        />
      </span>
    </Champ>
  );
});

export default Select;
