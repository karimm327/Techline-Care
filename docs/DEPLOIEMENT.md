# Mise en ligne : GitLab / GitHub + Render + Aiven

L'application (Next.js) tourne sur **Render** ; la base PostgreSQL est hébergée chez **Aiven**.
Le code est récupéré par Render depuis le dépôt Git (GitHub ou GitLab).

## À régler AVANT d'ouvrir le site au public

1. **Mots de passe.** Ils sont hachés avec bcrypt (`db:schema`, `db:reset` et `db:hacher` hachent les
   valeurs en clair ; une ancienne valeur en clair est aussi remplacée à la première connexion).
2. **Comptes de test.** `seed.sql` crée 12 comptes qui partagent le mot de passe `SEED_PASSWORD`.
   Ne pas lancer le seed en production, ou changer ces mots de passe juste après.
3. **Pièces jointes.** Elles sont écrites sur le disque du serveur (`UPLOAD_DIR`). Le disque de Render
   est **effacé à chaque déploiement** : sans disque persistant (offre payante « Starter » + « Disk »),
   les fichiers joints seront perdus.

## 1. Base de données sur Aiven

1. Créer un compte sur <https://console.aiven.io>, puis **Create service → PostgreSQL**
   (offre *Free* pour commencer, région Europe).
2. Une fois le service démarré, onglet **Overview** :
   - copier la **Service URI** (`postgres://avnadmin:…@….aivencloud.com:PORT/defaultdb?sslmode=require`) ;
   - télécharger le **CA certificate** (`ca.pem`).
3. Construire la `DATABASE_URL` de l'application : reprendre l'URI et remplacer `?sslmode=require`
   par la sélection du schéma :

   ```
   postgres://avnadmin:MOTDEPASSE@HOTE.aivencloud.com:PORT/defaultdb?options=-c%20search_path%3Dtechlinecare
   ```

4. Créer les tables depuis votre poste, en pointant temporairement sur Aiven. Dans un fichier
   `.env.local` dédié (ou en remplaçant les valeurs le temps de la commande) :

   ```
   DATABASE_URL=<l'URL ci-dessus>
   DATABASE_CA_CERT=<contenu de ca.pem, retours à la ligne remplacés par \n>
   ```

   puis :

   ```bash
   npm run db:schema
   ```

   (`db:reset` ajoute aussi les comptes de test : à éviter en production, voir plus haut.)
   Les migrations v1 et v2 sont rejouées automatiquement à chaque démarrage de l'application.

## 2. Dépôt Git

Render se connecte à **GitHub**, **GitLab.com** ou **Bitbucket** — pas à un GitLab auto-hébergé
privé (comme celui de l'établissement). Créer un dépôt sur l'un de ces services, l'ajouter comme
second remote (`git remote add github <url>`) et y pousser la branche à déployer (par exemple `main`). Les fichiers `.env*` ne sont jamais versionnés (seul `.env.example` l'est).

## 3. Application sur Render

1. Sur <https://dashboard.render.com> : **New → Blueprint**, choisir le dépôt. Render lit
   `render.yaml` à la racine (service web Node, région Francfort, `npm ci && npm run build`,
   `npm start`, contrôle de santé sur `/api/health`).
   *Sans Blueprint* : **New → Web Service**, mêmes commandes de build et de démarrage.
2. Renseigner les variables d'environnement demandées :

   | Variable | Valeur |
   |---|---|
   | `DATABASE_URL` | l'URL construite à l'étape 1.3 |
   | `DATABASE_CA_CERT` | le contenu de `ca.pem` (coller le texte tel quel, sur plusieurs lignes) |
   | `JWT_SECRET` | générée automatiquement par le Blueprint (sinon : longue chaîne aléatoire) |
   | `TZ` | `Europe/Paris` (déjà dans le Blueprint) |
   | `NODE_VERSION` | `22` (déjà dans le Blueprint) |
   | `UPLOAD_DIR` | chemin du disque persistant si vous en ajoutez un (ex. `/var/data/uploads`) |

3. Lancer le déploiement. À la fin, ouvrir `https://<votre-service>.onrender.com/api/health` :
   la réponse doit être `{"status":"ok", …}`.

## Bon à savoir

- **Offre gratuite Render** : le service s'endort après 15 min sans visite ; la première page
  suivante met ~1 minute à s'afficher.
- **Offre gratuite Aiven** : petite base (1 Go), suffisante pour une équipe ; Aiven peut mettre en
  pause un service gratuit inutilisé longtemps.
- **Cookies** : en production le cookie de session est `Secure` ; Render fournit le HTTPS
  automatiquement.
- **Redéploiement** : chaque push sur la branche suivie redéploie automatiquement.
