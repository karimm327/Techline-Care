import type { HTMLAttributes } from "react";
import { cn } from "@/lib/ui/cn";

type Props = HTMLAttributes<HTMLElement> & {
  as?: "div" | "section" | "article" | "li" | "aside";
  // M05 : élévation au survol (désactivée sur les écrans tactiles)
  interactive?: boolean;
};

export default function Card({
  as: Element = "div",
  interactive = false,
  className,
  ...reste
}: Props) {
  return (
    <Element
      className={cn(
        "rounded-md border border-line bg-surface p-5 sm:p-6",
        interactive &&
          "transition-[transform,box-shadow,border-color] duration-[280ms] ease-out [@media(hover:hover)]:hover:-translate-y-[3px] [@media(hover:hover)]:hover:border-line-hover [@media(hover:hover)]:hover:shadow-md",
        className,
      )}
      {...reste}
    />
  );
}
