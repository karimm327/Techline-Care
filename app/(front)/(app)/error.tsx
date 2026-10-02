"use client";

import { RotateCw } from "lucide-react";
import { useEffect, useState, useTransition } from "react";
import Alert from "@/components/ui/Alert";
import Button from "@/components/ui/Button";
import { cn } from "@/lib/ui/cn";

// Erreur dans une page de l'application : message + « Réessayer » (reset), icône qui tourne pendant la tentative
export default function ErreurApplication({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  const [enCours, demarrer] = useTransition();
  const [tentatives, setTentatives] = useState(0);

  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="mx-auto w-full max-w-2xl py-6">
      <Alert
        key={tentatives}
        tone="danger"
        title="Impossible de charger cette page"
        action={
          <Button
            variant="secondary"
            size="sm"
            onClick={() => {
              setTentatives((n) => n + 1);
              demarrer(() => reset());
            }}
            icon={
              <RotateCw
                aria-hidden="true"
                strokeWidth={2.4}
                className={cn("size-3.5", enCours && "animate-spin")}
              />
            }
          >
            Réessayer
          </Button>
        }
      >
        La connexion au serveur a échoué. Vos données ne sont pas perdues.
        {error.digest && (
          <span className="mt-1 block font-mono text-[11.5px] text-fg-4">
            Référence : {error.digest}
          </span>
        )}
      </Alert>
    </div>
  );
}
