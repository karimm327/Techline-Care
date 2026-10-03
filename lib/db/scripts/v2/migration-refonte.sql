-- =====================================================
-- TechLine Care - Migration v2 « Refonte »
-- Idempotente : n'efface rien, ajoute seulement ce qui manque.
-- À copier dans lib/db/scripts/v2/migration-refonte.sql et à exécuter
-- automatiquement après v1/migration-journal.sql (cf. lib/db/index.ts).
-- =====================================================
SET search_path TO techlinecare;

-- ---------- Statut ANNULEE (utilisé par l'UI mais absent du seed) ----------
INSERT INTO statuses (label, description)
VALUES ('ANNULEE', 'Demande annulée')
ON CONFLICT (label) DO NOTHING;

-- ---------- SLA ----------
-- Délais par priorité, en minutes ouvrées
ALTER TABLE priorities ADD COLUMN IF NOT EXISTS first_response_minutes INTEGER;
ALTER TABLE priorities ADD COLUMN IF NOT EXISTS resolution_minutes     INTEGER;
UPDATE priorities SET first_response_minutes = 60,  resolution_minutes = 240  WHERE label = 'HAUTE'   AND resolution_minutes IS NULL;
UPDATE priorities SET first_response_minutes = 240, resolution_minutes = 480  WHERE label = 'NORMALE' AND resolution_minutes IS NULL;
UPDATE priorities SET first_response_minutes = 480, resolution_minutes = 2880 WHERE label = 'BASSE'   AND resolution_minutes IS NULL;

ALTER TABLE demands ADD COLUMN IF NOT EXISTS created_by        UUID      NULL REFERENCES users (id_user);
ALTER TABLE demands ADD COLUMN IF NOT EXISTS due_at            TIMESTAMP NULL;  -- échéance de résolution
ALTER TABLE demands ADD COLUMN IF NOT EXISTS first_response_at TIMESTAMP NULL;  -- 1er commentaire d'un agent/admin
ALTER TABLE demands ADD COLUMN IF NOT EXISTS closed_at         TIMESTAMP NULL;  -- passage en CLOTUREE
ALTER TABLE demands ADD COLUMN IF NOT EXISTS reopened_count    INTEGER   NOT NULL DEFAULT 0;

-- Échéance = création + délai de résolution de la priorité (minutes calendaires).
-- Recalculée si elle ne correspond plus (délais modifiés, demandes insérées par le seed).
UPDATE demands d
SET due_at = d.created_at + make_interval(mins => p.resolution_minutes)
FROM priorities p
WHERE p.id_priority = d.id_priority
  AND p.resolution_minutes IS NOT NULL
  AND d.due_at IS DISTINCT FROM d.created_at + make_interval(mins => p.resolution_minutes);

CREATE INDEX IF NOT EXISTS idx_demands_due_at ON demands (due_at) WHERE deleted_at IS NULL;
CREATE INDEX IF NOT EXISTS idx_demands_created_at ON demands (created_at);

-- ---------- Commentaires : notes internes + réactions ----------
ALTER TABLE comments ADD COLUMN IF NOT EXISTS is_internal BOOLEAN NOT NULL DEFAULT FALSE;

CREATE TABLE IF NOT EXISTS comment_reactions
(
    id_comment UUID        NOT NULL REFERENCES comments (id_comment) ON DELETE CASCADE,
    id_user    UUID        NOT NULL REFERENCES users (id_user),
    emoji_code VARCHAR(20) NOT NULL DEFAULT 'plus1',
    created_at TIMESTAMP   NOT NULL DEFAULT now(),
    PRIMARY KEY (id_comment, id_user, emoji_code)
);

-- ---------- Mentions ----------
CREATE TABLE IF NOT EXISTS comment_mentions
(
    id_comment UUID NOT NULL REFERENCES comments (id_comment) ON DELETE CASCADE,
    id_user    UUID NOT NULL REFERENCES users (id_user),
    PRIMARY KEY (id_comment, id_user)
);

-- ---------- Notifications ----------
CREATE TABLE IF NOT EXISTS notifications
(
    id_notification UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    id_user         UUID        NOT NULL REFERENCES users (id_user),   -- destinataire
    type            VARCHAR(30) NOT NULL, -- ASSIGNATION | MENTION | SLA_PROCHE | SLA_DEPASSE | STATUT | COMMENTAIRE
    id_demand       UUID        NULL REFERENCES demands (id_demand),
    id_actor        UUID        NULL REFERENCES users (id_user),
    message         TEXT        NOT NULL,
    created_at      TIMESTAMP   NOT NULL DEFAULT now(),
    read_at         TIMESTAMP   NULL
);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications (id_user, created_at DESC) WHERE read_at IS NULL;

-- ---------- Abonnés (suivre une demande) ----------
CREATE TABLE IF NOT EXISTS demand_watchers
(
    id_demand  UUID      NOT NULL REFERENCES demands (id_demand),
    id_user    UUID      NOT NULL REFERENCES users (id_user),
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    PRIMARY KEY (id_demand, id_user)
);

-- ---------- Demandes liées ----------
CREATE TABLE IF NOT EXISTS demand_links
(
    id_demand_a UUID        NOT NULL REFERENCES demands (id_demand),
    id_demand_b UUID        NOT NULL REFERENCES demands (id_demand),
    kind        VARCHAR(20) NOT NULL DEFAULT 'LIEE', -- LIEE | DOUBLON
    created_by  UUID        NULL REFERENCES users (id_user),
    created_at  TIMESTAMP   NOT NULL DEFAULT now(),
    PRIMARY KEY (id_demand_a, id_demand_b),
    CHECK (id_demand_a <> id_demand_b)
);

-- ---------- Pièces jointes ----------
CREATE TABLE IF NOT EXISTS attachments
(
    id_attachment UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    id_demand     UUID         NOT NULL REFERENCES demands (id_demand),
    id_comment    UUID         NULL REFERENCES comments (id_comment),
    id_uploader   UUID         NOT NULL REFERENCES users (id_user),
    file_name     VARCHAR(255) NOT NULL,
    mime_type     VARCHAR(100) NOT NULL,
    size_bytes    INTEGER      NOT NULL,
    storage_key   VARCHAR(400) NOT NULL, -- chemin relatif dans UPLOAD_DIR
    created_at    TIMESTAMP    NOT NULL DEFAULT now(),
    deleted_at    TIMESTAMP    NULL
);
CREATE INDEX IF NOT EXISTS idx_attachments_demand ON attachments (id_demand) WHERE deleted_at IS NULL;

-- ---------- Vues enregistrées ----------
CREATE TABLE IF NOT EXISTS saved_views
(
    id_view    UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    id_user    UUID         NOT NULL REFERENCES users (id_user),
    name       VARCHAR(60)  NOT NULL,
    color      VARCHAR(20)  NOT NULL DEFAULT 'accent',
    query      VARCHAR(500) NOT NULL, -- query string des filtres (?statut=…&priorite=…)
    position   INTEGER      NOT NULL DEFAULT 0,
    created_at TIMESTAMP    NOT NULL DEFAULT now()
);

-- ---------- Réponses rapides ----------
CREATE TABLE IF NOT EXISTS quick_replies
(
    id_quick_reply UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    label          VARCHAR(60) NOT NULL,
    content        TEXT        NOT NULL,
    is_active      BOOLEAN     NOT NULL DEFAULT TRUE
);
INSERT INTO quick_replies (label, content)
SELECT * FROM (VALUES
    ('Relance envoyée', 'Une relance a été envoyée au service concerné. Nous revenons vers vous dès réception de la réponse.'),
    ('Pièce manquante', 'Il manque une pièce justificative pour traiter votre demande. Pouvez-vous l''ajouter en pièce jointe ?'),
    ('Demande traitée', 'Votre demande a été traitée. N''hésitez pas à nous recontacter si besoin.')
) AS v(label, content)
WHERE NOT EXISTS (SELECT 1 FROM quick_replies);

-- ---------- Préférences utilisateur ----------
CREATE TABLE IF NOT EXISTS user_preferences
(
    id_user          UUID PRIMARY KEY REFERENCES users (id_user),
    motion           BOOLEAN     NOT NULL DEFAULT TRUE,
    density          VARCHAR(10) NOT NULL DEFAULT 'confort', -- confort | compact
    shortcuts        BOOLEAN     NOT NULL DEFAULT TRUE,
    default_view     VARCHAR(10) NOT NULL DEFAULT 'liste',   -- liste | kanban
    notify_assign    BOOLEAN     NOT NULL DEFAULT TRUE,
    notify_mention   BOOLEAN     NOT NULL DEFAULT TRUE,
    notify_sla       BOOLEAN     NOT NULL DEFAULT TRUE,
    notify_digest    BOOLEAN     NOT NULL DEFAULT FALSE,
    updated_at       TIMESTAMP   NOT NULL DEFAULT now()
);
-- Thème d'affichage : sombre (TechLine Care, par défaut) | clair
ALTER TABLE user_preferences ADD COLUMN IF NOT EXISTS theme VARCHAR(10) NOT NULL DEFAULT 'sombre';

-- ---------- Sessions (révocation) ----------
CREATE TABLE IF NOT EXISTS user_sessions
(
    id_session   UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    id_user      UUID         NOT NULL REFERENCES users (id_user),
    user_agent   VARCHAR(300) NULL,
    created_at   TIMESTAMP    NOT NULL DEFAULT now(),
    last_seen_at TIMESTAMP    NOT NULL DEFAULT now(),
    revoked_at   TIMESTAMP    NULL
);

-- ---------- Présence (qui consulte / écrit sur une fiche) ----------
CREATE TABLE IF NOT EXISTS presence
(
    id_user      UUID        NOT NULL REFERENCES users (id_user),
    id_demand    UUID        NOT NULL REFERENCES demands (id_demand),
    state        VARCHAR(10) NOT NULL DEFAULT 'VIEW', -- VIEW | TYPING
    last_seen_at TIMESTAMP   NOT NULL DEFAULT now(),
    PRIMARY KEY (id_user, id_demand)
);

-- =====================================================
-- SLA tenus par la base (triggers) : tous les chemins d'écriture sont couverts
-- (PUT, PATCH, Kanban, actions groupées, scripts) sans dupliquer la règle dans le code.
-- =====================================================

-- Avant insertion / mise à jour d'une demande :
--  - échéance = création + délai de résolution de la priorité (recalculée si la priorité change) ;
--  - passage en CLOTUREE : closed_at = maintenant ;
--  - sortie de CLOTUREE : closed_at effacé, compteur de réouvertures + 1.
CREATE OR REPLACE FUNCTION techlinecare.tl_demande_sla() RETURNS trigger AS
$$
DECLARE
    v_cloturee UUID;
BEGIN
    SELECT id_status INTO v_cloturee FROM techlinecare.statuses WHERE label = 'CLOTUREE';

    IF TG_OP = 'INSERT' OR NEW.id_priority IS DISTINCT FROM OLD.id_priority OR NEW.due_at IS NULL THEN
        NEW.due_at := NEW.created_at + make_interval(mins => COALESCE(
                (SELECT resolution_minutes FROM techlinecare.priorities WHERE id_priority = NEW.id_priority), 480));
    END IF;

    IF TG_OP = 'INSERT' THEN
        IF NEW.id_status = v_cloturee THEN
            NEW.closed_at := COALESCE(NEW.closed_at, now());
        END IF;
    ELSIF NEW.id_status IS DISTINCT FROM OLD.id_status THEN
        IF NEW.id_status = v_cloturee THEN
            NEW.closed_at := now();
        ELSIF OLD.id_status = v_cloturee THEN
            NEW.closed_at := NULL;
            NEW.reopened_count := OLD.reopened_count + 1;
        END IF;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tl_demande_sla ON demands;
CREATE TRIGGER tl_demande_sla
    BEFORE INSERT OR UPDATE ON demands
    FOR EACH ROW EXECUTE FUNCTION techlinecare.tl_demande_sla();

-- Après un commentaire : 1re réponse = 1er commentaire public d'un agent / administrateur
-- autre que le créateur de la demande.
CREATE OR REPLACE FUNCTION techlinecare.tl_premiere_reponse() RETURNS trigger AS
$$
BEGIN
    IF NEW.is_internal THEN
        RETURN NEW;
    END IF;
    UPDATE techlinecare.demands d
    SET first_response_at = NEW.created_at
    WHERE d.id_demand = NEW.id_demand
      AND d.first_response_at IS NULL
      AND d.created_by IS DISTINCT FROM NEW.id_author
      AND EXISTS (SELECT 1
                  FROM techlinecare.users u
                           JOIN techlinecare.roles r ON r.id_role = u.id_role
                  WHERE u.id_user = NEW.id_author
                    AND UPPER(r.label) IN ('ADMIN', 'ADMINISTRATEUR', 'ADMINISTRATOR', 'AGENT'));
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS tl_premiere_reponse ON comments;
CREATE TRIGGER tl_premiere_reponse
    AFTER INSERT ON comments
    FOR EACH ROW EXECUTE FUNCTION techlinecare.tl_premiere_reponse();

-- ---------- Reprise de l'historique (une seule fois : colonnes encore vides) ----------
-- Créateur : entrée CREATION du journal
UPDATE demands d
SET created_by = a.id_user
FROM (SELECT DISTINCT ON (id_demand) id_demand, id_user
      FROM activity_logs
      WHERE action = 'CREATION' AND id_user IS NOT NULL
      ORDER BY id_demand, created_at) a
WHERE a.id_demand = d.id_demand AND d.created_by IS NULL;

-- Date de clôture : dernier passage « → CLOTUREE » du journal, sinon dernière modification
UPDATE demands d
SET closed_at = COALESCE(
        (SELECT max(a.created_at) FROM activity_logs a
         WHERE a.id_demand = d.id_demand AND a.action = 'MODIFICATION'
           AND a.details LIKE '%Statut : % → CLOTUREE%'),
        d.updated_at)
WHERE d.closed_at IS NULL
  AND d.id_status = (SELECT id_status FROM statuses WHERE label = 'CLOTUREE');

-- 1re réponse : 1er commentaire d'un agent / administrateur autre que le créateur
UPDATE demands d
SET first_response_at = (
    SELECT min(c.created_at)
    FROM comments c
             JOIN users u ON u.id_user = c.id_author
             JOIN roles r ON r.id_role = u.id_role
    WHERE c.id_demand = d.id_demand
      AND NOT c.is_internal
      AND c.id_author IS DISTINCT FROM d.created_by
      AND UPPER(r.label) IN ('ADMIN', 'ADMINISTRATEUR', 'ADMINISTRATOR', 'AGENT'))
WHERE d.first_response_at IS NULL;

