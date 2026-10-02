import { cn } from "@/lib/ui/cn";
import { avatarColor, initiales } from "@/lib/ui/status";

type Props = {
  name: string;
  id: string;
  size?: number;
  presence?: boolean;
  // Bordure du point de présence = couleur du fond derrière l'avatar
  presenceRingClass?: string;
  // Avatar décoratif (le nom est déjà écrit à côté)
  decorative?: boolean;
  className?: string;
};

// Avatar à couleur stable (hash de l'id), initiales, point de présence 11 px
export default function Avatar({
  name,
  id,
  size = 34,
  presence = false,
  presenceRingClass = "border-bg",
  decorative = false,
  className,
}: Props) {
  return (
    <span
      {...(decorative
        ? { "aria-hidden": true }
        : { role: "img", "aria-label": name })}
      className={cn(
        "relative inline-flex shrink-0 select-none items-center justify-center rounded-full font-semibold text-white",
        avatarColor(id),
        className,
      )}
      style={{
        width: size,
        height: size,
        fontSize: Math.max(10, Math.round(size * 0.36)),
      }}
    >
      <span aria-hidden="true">{initiales(name)}</span>
      {presence && (
        <span
          aria-hidden="true"
          className={cn(
            "absolute -bottom-px -right-px size-[11px] rounded-full border-2 bg-success",
            presenceRingClass,
          )}
        />
      )}
    </span>
  );
}

type Personne = { id: string; name: string };

// Pile d'avatars : chevauchement −8 px, bordure 2 px couleur du fond, « +N »
export function AvatarStack({
  people,
  max = 4,
  size = 30,
  ringClass = "ring-surface",
  className,
}: {
  people: Personne[];
  max?: number;
  size?: number;
  ringClass?: string;
  className?: string;
}) {
  const visibles = people.slice(0, max);
  const reste = people.length - visibles.length;
  return (
    <span className={cn("flex items-center", className)}>
      {visibles.map((p, i) => (
        <Avatar
          key={p.id}
          id={p.id}
          name={p.name}
          size={size}
          className={cn("ring-2", ringClass, i > 0 && "-ml-2")}
        />
      ))}
      {reste > 0 && (
        <span
          role="img"
          aria-label={`et ${reste} autre${reste > 1 ? "s" : ""}`}
          className={cn(
            "-ml-2 inline-flex items-center justify-center rounded-full bg-surface-3 text-[11px] font-semibold text-fg-1 ring-2",
            ringClass,
          )}
          style={{ width: size, height: size }}
        >
          +{reste}
        </span>
      )}
    </span>
  );
}
