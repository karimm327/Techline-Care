import { Fragment } from "react";

const URL_REGEX = /(https?:\/\/[^\s<>"')\]]+)/g;

// Texte libre avec liens http(s) cliquables (ouverts dans un nouvel onglet)
export default function TexteAvecLiens({ texte }: { texte: string }) {
  const morceaux = texte.split(URL_REGEX);
  return (
    <>
      {morceaux.map((m, i) =>
        i % 2 === 1 ? (
          <a
            // biome-ignore lint/suspicious/noArrayIndexKey: découpage stable d'un texte figé
            key={i}
            href={m}
            target="_blank"
            rel="noopener noreferrer"
            className="break-all rounded-xs text-accent-fg underline underline-offset-2 hover:text-accent-fg-2 focus-visible:outline focus-visible:outline-2 focus-visible:outline-accent-soft"
          >
            {m}
          </a>
        ) : (
          // biome-ignore lint/suspicious/noArrayIndexKey: découpage stable d'un texte figé
          <Fragment key={i}>{m}</Fragment>
        ),
      )}
    </>
  );
}
