import { forwardRef, type ReactNode, type TextareaHTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";
import Champ, { classesChamp, decritPar } from "./Champ";

type Props = TextareaHTMLAttributes<HTMLTextAreaElement> & {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  counter?: boolean;
  wrapperClassName?: string;
};

const Textarea = forwardRef<HTMLTextAreaElement, Props>(function Textarea(
  {
    id,
    label,
    hint,
    error,
    counter,
    wrapperClassName,
    className,
    value,
    maxLength,
    rows = 5,
    ...reste
  },
  ref,
) {
  const longueur = typeof value === "string" ? value.length : 0;
  return (
    <Champ
      id={id}
      label={label}
      hint={hint}
      error={error}
      counter={
        counter && maxLength ? { value: longueur, max: maxLength } : undefined
      }
      className={wrapperClassName}
    >
      <textarea
        ref={ref}
        id={id}
        rows={rows}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={decritPar(id, error, hint)}
        className={cn(
          classesChamp(!!error),
          "min-h-[110px] resize-y px-3.5 py-3 leading-relaxed",
          className,
        )}
        {...reste}
      />
    </Champ>
  );
});

export default Textarea;
