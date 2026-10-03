// Tests de lib/sla.ts — lancer avec : npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { calculerSla, formaterDuree } from "./sla.ts";

const H = 3600 * 1000;
const debut = new Date("2026-10-01T08:00:00Z");
const quatreHeures = new Date(debut.getTime() + 4 * H);

test("formaterDuree", () => {
  assert.equal(formaterDuree(25), "25 min");
  assert.equal(formaterDuree(100), "1 h 40");
  assert.equal(formaterDuree(180), "3 h");
  assert.equal(formaterDuree(65), "1 h 05");
  assert.equal(formaterDuree(1680), "1 j 4 h");
  assert.equal(formaterDuree(2880), "2 j");
  assert.equal(formaterDuree(-5), "0 min");
});

test("pas de SLA : annulée ou sans échéance", () => {
  assert.equal(
    calculerSla({ statut: "ANNULEE", createdAt: debut, dueAt: quatreHeures }),
    null,
  );
  assert.equal(
    calculerSla({ statut: "NOUVELLE", createdAt: debut, dueAt: null }),
    null,
  );
});

test("ouverte, large marge → ok", () => {
  const s = calculerSla({
    statut: "NOUVELLE",
    createdAt: debut,
    dueAt: quatreHeures,
    maintenant: debut.getTime() + H,
  });
  assert.equal(s.etat, "ok");
  assert.equal(s.libelle, "3 h");
  assert.equal(s.ratioRestant, 0.75);
});

test("moins de 25 % restant → warn", () => {
  const s = calculerSla({
    statut: "EN_COURS",
    createdAt: debut,
    dueAt: quatreHeures,
    maintenant: debut.getTime() + 3.5 * H,
  });
  assert.equal(s.etat, "warn");
  assert.equal(s.libelle, "30 min");
});

test("échéance passée → late", () => {
  const s = calculerSla({
    statut: "EN_COURS",
    createdAt: debut,
    dueAt: quatreHeures,
    maintenant: quatreHeures.getTime() + 25 * 60000,
  });
  assert.equal(s.etat, "late");
  assert.equal(s.libelle, "Dépassé · 25 min");
  assert.equal(s.ratioRestant, 0);
});

test("clôturée dans les temps → done ; en retard → late", () => {
  const ok = calculerSla({
    statut: "CLOTUREE",
    createdAt: debut,
    dueAt: quatreHeures,
    closedAt: new Date(debut.getTime() + 2 * H),
  });
  assert.equal(ok.etat, "done");
  assert.equal(ok.libelle, "Respecté");
  const retard = calculerSla({
    statut: "CLOTUREE",
    createdAt: debut,
    dueAt: quatreHeures,
    closedAt: new Date(quatreHeures.getTime() + 2 * H),
  });
  assert.equal(retard.etat, "late");
  assert.equal(retard.libelle, "Hors délai · 2 h");
});
