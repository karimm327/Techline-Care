"use client";

import { Check, Minus } from "lucide-react";
import {
  forwardRef,
  type InputHTMLAttributes,
  type ReactNode,
  useEffect,
  useImperativeHandle,
  useRef,
} from "react";
import { cn } from "@/lib/ui/cn";

type Props = Omit<InputHTMLAttributes<HTMLInputElement>, "type"> & {
  label?: ReactNode;
  // État « certaines lignes cochées » (case « tout sélectionner »)
  indeterminate?: boolean;
};

// Vraie case à cocher native, masquée visuellement et redessinée aux tokens
const Checkbox = forwardRef<HTMLInputElement, Props>(function Checkbox(
  { label, indeterminate = false, className, ...reste },
  ref,
) {
  const interne = useRef<HTMLInputElement>(null);
  useImperativeHandle(ref, () => interne.current as HTMLInputElement);

  useEffect(() => {
    if (interne.current) interne.current.indeterminate = indeterminate;
  }, [indeterminate]);

  return (
    <label
      className={cn(
        "inline-flex min-h-11 cursor-pointer items-center gap-2.5 text-sm text-fg-1 has-[:disabled]:cursor-not-allowed has-[:disabled]:opacity-55",
        className,
      )}
    >
      <span className="relative inline-flex size-[18px] shrink-0">
        <input
          ref={interne}
          type="checkbox"
          className="peer absolute inset-0 m-0 size-full cursor-pointer appearance-none rounded-[5px] border border-line-field bg-bg transition-colors duration-150 checked:border-accent checked:bg-accent indeterminate:border-accent indeterminate:bg-accent hover:border-line-hover focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent-soft disabled:cursor-not-allowed"
          {...reste}
        />
        <Check
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none absolute inset-0.5 size-[14px] scale-75 text-white opacity-0 transition-[transform,opacity] duration-300 ease-spring peer-checked:scale-100 peer-checked:opacity-100 peer-indeterminate:opacity-0"
        />
        <Minus
          aria-hidden="true"
          strokeWidth={3}
          className="pointer-events-none absolute inset-0.5 size-[14px] text-white opacity-0 peer-indeterminate:opacity-100"
        />
      </span>
      {label}
    </label>
  );
});

export default Checkbox;
