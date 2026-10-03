-- =====================================================
-- TechLine Care - Suppression douce + journal d'activité
-- Sans risque : n'efface rien, ajoute seulement ce qui manque.
-- (Exécutée automatiquement au démarrage ; à lancer à la main dans pgAdmin seulement en cas de besoin)
-- =====================================================
SET search_path TO techlinecare;

-- Demande supprimée = marquée, jamais effacée
ALTER TABLE demands ADD COLUMN IF NOT EXISTS deleted_at    TIMESTAMP NULL;
ALTER TABLE demands ADD COLUMN IF NOT EXISTS deleted_by    UUID      NULL REFERENCES users (id_user);
ALTER TABLE demands ADD COLUMN IF NOT EXISTS delete_reason TEXT      NULL;

-- Journal d'activité
CREATE TABLE IF NOT EXISTS activity_logs
(
    id_activity_log UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    action          VARCHAR(150) NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    actor_label     VARCHAR(100) NOT NULL,
    id_user         UUID REFERENCES users (id_user),
    id_demand       UUID REFERENCES demands (id_demand)
);
ALTER TABLE activity_logs ADD COLUMN IF NOT EXISTS details TEXT NULL;
CREATE INDEX IF NOT EXISTS idx_activity_created ON activity_logs (created_at DESC);
CREATE INDEX IF NOT EXISTS idx_activity_demand ON activity_logs (id_demand);
