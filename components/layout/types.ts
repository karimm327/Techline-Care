// Utilisateur connecté tel que transmis par AppShell (serveur) aux composants clients
export type UtilisateurShell = {
  id: string;
  nom: string;
  email: string;
  role: string;
  libelleRole: string;
  estAdmin: boolean;
  lectureSeule: boolean;
};
