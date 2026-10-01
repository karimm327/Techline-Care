-- =====================================================
-- TechLine Care - Schema SQL
-- PostgreSQL
-- =====================================================

-- Suppression du schéma
DROP SCHEMA IF EXISTS techlinecare CASCADE;

-- Création du schéma
CREATE SCHEMA IF NOT EXISTS techlinecare;
SET search_path TO techlinecare;

-- =====================================================
-- TABLE : roles
-- =====================================================
CREATE TABLE roles
(
    id_role     UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    label       VARCHAR(50) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE
);

-- =====================================================
-- TABLE : priorities
-- =====================================================
CREATE TABLE priorities
(
    id_priority UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    label       VARCHAR(30) NOT NULL UNIQUE,
    level       INTEGER     NOT NULL,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE
);

-- =====================================================
-- TABLE : statuses
-- =====================================================
CREATE TABLE statuses
(
    id_status   UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    label       VARCHAR(30) NOT NULL UNIQUE,
    description VARCHAR(255),
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE
);

-- =====================================================
-- TABLE : categories
-- =====================================================
CREATE TABLE categories
(
    id_category UUID PRIMARY KEY     DEFAULT gen_random_uuid(),
    label       VARCHAR(50) NOT NULL UNIQUE,
    is_active   BOOLEAN     NOT NULL DEFAULT TRUE
);

-- =====================================================
-- TABLE : users
-- =====================================================
CREATE TABLE users
(
    id_user    UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    first_name VARCHAR(50)  NOT NULL,
    last_name  VARCHAR(50)  NOT NULL,
    email      VARCHAR(150) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    is_active  BOOLEAN      NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP    NOT NULL DEFAULT now(),
    id_role    UUID         NOT NULL,
    CONSTRAINT fk_users_role
        FOREIGN KEY (id_role)
            REFERENCES roles (id_role)
);

-- =====================================================
-- TABLE : demands
-- =====================================================
CREATE TABLE demands
(
    id_demand         UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    title             VARCHAR(200) NOT NULL,
    description       TEXT         NOT NULL,
    created_at        TIMESTAMP    NOT NULL DEFAULT now(),
    updated_at        TIMESTAMP    NOT NULL DEFAULT now(),
    id_category       UUID         NOT NULL,
    id_priority       UUID         NOT NULL,
    id_status         UUID         NOT NULL,
    id_assigned_agent UUID,
    -- Suppression douce : la demande est marquée, jamais effacée
    deleted_at        TIMESTAMP,
    deleted_by        UUID,
    delete_reason     TEXT,
    CONSTRAINT fk_demands_deleted_by
        FOREIGN KEY (deleted_by)
            REFERENCES users (id_user),
    CONSTRAINT fk_demands_category
        FOREIGN KEY (id_category)
            REFERENCES categories (id_category),
    CONSTRAINT fk_demands_priority
        FOREIGN KEY (id_priority)
            REFERENCES priorities (id_priority),
    CONSTRAINT fk_demands_status
        FOREIGN KEY (id_status)
            REFERENCES statuses (id_status),
    CONSTRAINT fk_demands_agent
        FOREIGN KEY (id_assigned_agent)
            REFERENCES users (id_user)
);

-- =====================================================
-- TABLE : comments
-- =====================================================
CREATE TABLE comments
(
    id_comment UUID PRIMARY KEY   DEFAULT gen_random_uuid(),
    content    TEXT      NOT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT now(),
    id_demand  UUID      NOT NULL,
    id_author  UUID      NOT NULL,
    CONSTRAINT fk_comments_demand
        FOREIGN KEY (id_demand)
            REFERENCES demands (id_demand),
    CONSTRAINT fk_comments_author
        FOREIGN KEY (id_author)
            REFERENCES users (id_user)
);

-- =====================================================
-- TABLE : activity_logs
-- =====================================================
CREATE TABLE activity_logs
(
    id_activity_log UUID PRIMARY KEY      DEFAULT gen_random_uuid(),
    action          VARCHAR(150) NOT NULL,
    created_at      TIMESTAMP    NOT NULL DEFAULT now(),
    actor_label     VARCHAR(100) NOT NULL,
    id_user         UUID,
    id_demand       UUID,
    details         TEXT,
    CONSTRAINT fk_activity_user
        FOREIGN KEY (id_user)
            REFERENCES users (id_user),
    CONSTRAINT fk_activity_demand
        FOREIGN KEY (id_demand)
            REFERENCES demands (id_demand)
);

-- =====================================================
-- FIN DU SCHEMA
-- =====================================================
