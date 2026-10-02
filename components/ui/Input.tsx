import { forwardRef, type InputHTMLAttributes, type ReactNode } from "react";
import { cn } from "@/lib/ui/cn";
import Champ, { classesChamp, decritPar } from "./Champ";

type Props = InputHTMLAttributes<HTMLInputElement> & {
  id: string;
  label?: ReactNode;
  hint?: ReactNode;
  error?: string;
  // Affiche « n/maxLength » (nécessite maxLength)
  counter?: boolean;
  wrapperClassName?: string;
};

const Input = forwardRef<HTMLInputElement, Props>(function Input(
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
      <input
        ref={ref}
        id={id}
        value={value}
        maxLength={maxLength}
        aria-invalid={error ? true : undefined}
        aria-describedby={decritPar(id, error, hint)}
        className={cn(classesChamp(!!error), "h-[46px] px-3.5", className)}
        {...reste}
      />
    </Champ>
  );
});

export default Input;
