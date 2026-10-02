import Link from "next/link";

// Footer public : identique au footer applicatif, sans la pastille de statut
export default function PublicFooter() {
  return (
    <footer className="flex flex-wrap items-center justify-between gap-3.5 border-t border-line bg-bg-sunken px-4 py-4 text-[12.5px] text-fg-3 sm:px-7">
      <p>
        © {new Date().getFullYear()}{" "}
        <span className="font-display font-semibold text-fg-1">
          TechLine Care
        </span>
      </p>
      <nav aria-label="Liens légaux" className="flex items-center gap-4">
        <Link
          href="/confidentialite"
          className="rounded-xs text-fg-2 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          Confidentialité
        </Link>
        <Link
          href="/mentions-legales"
          className="rounded-xs text-fg-2 transition-colors hover:text-fg focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
        >
          Mentions légales
        </Link>
      </nav>
    </footer>
  );
}
