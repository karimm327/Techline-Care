import Link from "next/link";
import Kbd from "@/components/ui/Kbd";
import packageJson from "@/package.json";
import StatusPill from "./StatusPill";

const LIENS_LEGAUX = [
  { label: "Confidentialité", href: "/confidentialite" },
  { label: "Mentions légales", href: "/mentions-legales" },
  { label: "RGPD", href: "/confidentialite#vos-droits" },
];

// Footer applicatif fin : version, état des services, horaires du support, liens légaux
export default function AppFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3.5 border-t border-line bg-bg-sunken px-4 py-4 text-[12.5px] text-fg-3 sm:px-7">
      <div className="flex items-center gap-3">
        <span className="font-display font-semibold text-fg-1">
          TechLine Care
        </span>
        <span>© {new Date().getFullYear()}</span>
        <Kbd className="rounded-[5px] border-line-strong/70 bg-transparent text-fg-3">
          v{packageJson.version}
        </Kbd>
      </div>
      <div className="flex flex-wrap items-center gap-4">
        <StatusPill />
        <span>Support : lun.–ven., 9 h – 18 h</span>
      </div>
      <nav aria-label="Liens légaux" className="flex items-center gap-4">
        {LIENS_LEGAUX.map((l) => (
          <Link
            key={l.href}
            href={l.href}
            className="rounded-xs text-fg-2 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            {l.label}
          </Link>
        ))}
      </nav>
    </footer>
  );
}
