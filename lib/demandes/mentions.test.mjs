// Tests de lib/demandes/mentions.ts — npm test
import assert from "node:assert/strict";
import { test } from "node:test";
import { decouperMentions, extraireMentions } from "./mentions.ts";

const personnes = [
  { id: "1", nom: "Lucas Petit" },
  { id: "2", nom: "Émilie Durand" },
  { id: "3", nom: "Lucas" },
];

test("extraireMentions : nom complet, accents, casse", () => {
  assert.deepEqual(
    extraireMentions("@Lucas Petit peux-tu relancer ?", personnes),
    ["1"],
  );
  assert.deepEqual(extraireMentions("merci @emilie durand", personnes), ["2"]);
  assert.deepEqual(extraireMentions("pas de mention ici", personnes), []);
});

test("extraireMentions : limite de mot et nom plus court", () => {
  assert.deepEqual(extraireMentions("@Lucas Petitjean", personnes), ["3"]);
  assert.deepEqual(
    extraireMentions("@Lucas Petit et @Lucas", personnes).sort(),
    ["1", "3"],
  );
});

test("decouperMentions", () => {
  assert.deepEqual(
    decouperMentions("Salut @Lucas Petit, merci", ["Lucas Petit"]),
    [
      { texte: "Salut " },
      { texte: "@Lucas Petit", mention: true },
      { texte: ", merci" },
    ],
  );
  assert.deepEqual(decouperMentions("sans arobase", ["Lucas Petit"]), [
    { texte: "sans arobase" },
  ]);
});
