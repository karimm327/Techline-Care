// Sessions révoquées (F14), gardées en mémoire pour une vérification synchrone du jeton.
// Chargées depuis la base au démarrage (lib/db/index.ts) et mises à jour à chaque révocation.
// Un seul processus Node : suffisant pour ce projet ; plusieurs instances demanderaient un cache partagé.

const globalPourAuth = globalThis as unknown as {
  sessionsRevoquees?: Set<string>;
};
const revoquees = globalPourAuth.sessionsRevoquees ?? new Set<string>();
globalPourAuth.sessionsRevoquees = revoquees;

export const estRevoquee = (sid: string | undefined | null) =>
  !!sid && revoquees.has(sid);

export function marquerRevoquees(sids: string[]) {
  for (const sid of sids) revoquees.add(sid);
}
