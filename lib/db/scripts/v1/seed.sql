SET search_path TO techlinecare;

-- Nettoyage des tables
TRUNCATE TABLE
    activity_logs,
    comments,
    demands,
    users,
    categories,
    statuses,
    priorities,
    roles
    CASCADE;

-- =====================================================
-- ROLES
-- =====================================================
INSERT INTO roles (label, description)
VALUES ('ADMIN', 'Administrateur de l’application'),
       ('AGENT', 'Agent traitant les demandes'),
       ('LECTURE', 'Consultation uniquement');

-- =====================================================
-- PRIORITIES
-- =====================================================
INSERT INTO priorities (label, level)
VALUES ('BASSE', 1),
       ('NORMALE', 2),
       ('HAUTE', 3);

-- =====================================================
-- STATUSES
-- =====================================================
INSERT INTO statuses (label, description)
VALUES ('NOUVELLE', 'Demande créée, non traitée'),
       ('EN_COURS', 'Demande en cours de traitement'),
       ('CLOTUREE', 'Demande terminée');

-- =====================================================
-- CATEGORIES
-- =====================================================
INSERT INTO categories (label)
VALUES ('Autre'),
       ('Social'),
       ('Administratif'),
       ('Santé');

-- =====================================================
-- USERS
-- =====================================================
INSERT INTO users (first_name, last_name, email, password, id_role)
VALUES ('Alice', 'Martin', 'alice.martin@techline-care.fr', 'alicePwd!',
        (SELECT id_role FROM roles WHERE label = 'ADMIN')),
       ('Bruno', 'Lefevre', 'bruno.lefevre@techline-care.fr', 'brunoPwd!',
        (SELECT id_role FROM roles WHERE label = 'ADMIN')),
       ('Claire', 'Dubois', 'claire.dubois@techline-care.fr', 'clairePwd!',
        (SELECT id_role FROM roles WHERE label = 'ADMIN')),
       ('David', 'Moreau', 'david.moreau@techline-care.fr', 'davidPwd!',
        (SELECT id_role FROM roles WHERE label = 'ADMIN')),

       ('Emma', 'Bernard', 'emma.bernard@techline-care.fr', 'emmaPwd!',
        (SELECT id_role FROM roles WHERE label = 'AGENT')),
       ('Lucas', 'Petit', 'lucas.petit@techline-care.fr', 'lucasPwd!',
        (SELECT id_role FROM roles WHERE label = 'AGENT')),
       ('Sarah', 'Nguyen', 'sarah.nguyen@techline-care.fr', 'sarahPwd!',
        (SELECT id_role FROM roles WHERE label = 'AGENT')),
       ('Thomas', 'Roche', 'thomas.roche@techline-care.fr', 'thomasPwd!',
        (SELECT id_role FROM roles WHERE label = 'AGENT')),

       ('Isabelle', 'Garnier', 'isabelle.garnier@techline-care.fr', 'isabellePwd!',
        (SELECT id_role FROM roles WHERE label = 'LECTURE')),
       ('Julien', 'Marchand', 'julien.marchand@techline-care.fr', 'julienPwd!',
        (SELECT id_role FROM roles WHERE label = 'LECTURE')),
       ('Nadia', 'Benali', 'nadia.benali@techline-care.fr', 'nadiaPwd!',
        (SELECT id_role FROM roles WHERE label = 'LECTURE')),
       ('Olivier', 'Renard', 'olivier.renard@techline-care.fr', 'olivierPwd!',
        (SELECT id_role FROM roles WHERE label = 'LECTURE'));

-- =====================================================
-- DEMANDS
-- =====================================================

-- NOUVELLE
INSERT INTO demands (title, description, id_category, id_priority, id_status)
VALUES ('Demande aide logement', 'Demande concernant une aide au logement.',
        (SELECT id_category FROM categories WHERE label = 'Social'),
        (SELECT id_priority FROM priorities WHERE label = 'HAUTE'),
        (SELECT id_status FROM statuses WHERE label = 'NOUVELLE')),

       ('Question dossier administratif', 'Question relative à un dossier administratif.',
        (SELECT id_category FROM categories WHERE label = 'Administratif'),
        (SELECT id_priority FROM priorities WHERE label = 'NORMALE'),
        (SELECT id_status FROM statuses WHERE label = 'NOUVELLE')),

       ('Orientation vers service santé', 'Demande d’orientation vers un service de santé.',
        (SELECT id_category FROM categories WHERE label = 'Santé'),
        (SELECT id_priority FROM priorities WHERE label = 'BASSE'),
        (SELECT id_status FROM statuses WHERE label = 'NOUVELLE'));

-- EN_COURS
INSERT INTO demands (title, description, id_category, id_priority, id_status, id_assigned_agent)
VALUES ('Renouvellement aide sociale', 'Renouvellement d’une aide sociale existante.',
        (SELECT id_category FROM categories WHERE label = 'Social'),
        (SELECT id_priority FROM priorities WHERE label = 'NORMALE'),
        (SELECT id_status FROM statuses WHERE label = 'EN_COURS'),
        (SELECT id_user FROM users WHERE email = 'emma.bernard@techline-care.fr')),

       ('Suivi dossier allocation', 'Suivi d’un dossier d’allocation.',
        (SELECT id_category FROM categories WHERE label = 'Administratif'),
        (SELECT id_priority FROM priorities WHERE label = 'HAUTE'),
        (SELECT id_status FROM statuses WHERE label = 'EN_COURS'),
        (SELECT id_user FROM users WHERE email = 'lucas.petit@techline-care.fr')),

       ('Demande accompagnement santé', 'Demande d’accompagnement pour un suivi santé.',
        (SELECT id_category FROM categories WHERE label = 'Santé'),
        (SELECT id_priority FROM priorities WHERE label = 'BASSE'),
        (SELECT id_status FROM statuses WHERE label = 'EN_COURS'),
        (SELECT id_user FROM users WHERE email = 'sarah.nguyen@techline-care.fr'));

-- CLOTUREE
INSERT INTO demands (title, description, id_category, id_priority, id_status, id_assigned_agent)
VALUES ('Aide financière exceptionnelle', 'Demande d’aide financière exceptionnelle.',
        (SELECT id_category FROM categories WHERE label = 'Social'),
        (SELECT id_priority FROM priorities WHERE label = 'HAUTE'),
        (SELECT id_status FROM statuses WHERE label = 'CLOTUREE'),
        (SELECT id_user FROM users WHERE email = 'thomas.roche@techline-care.fr')),

       ('Mise à jour situation familiale', 'Mise à jour de la situation familiale.',
        (SELECT id_category FROM categories WHERE label = 'Administratif'),
        (SELECT id_priority FROM priorities WHERE label = 'NORMALE'),
        (SELECT id_status FROM statuses WHERE label = 'CLOTUREE'),
        (SELECT id_user FROM users WHERE email = 'emma.bernard@techline-care.fr')),

       ('Orientation centre médical', 'Orientation vers un centre médical spécialisé.',
        (SELECT id_category FROM categories WHERE label = 'Santé'),
        (SELECT id_priority FROM priorities WHERE label = 'BASSE'),
        (SELECT id_status FROM statuses WHERE label = 'CLOTUREE'),
        (SELECT id_user FROM users WHERE email = 'lucas.petit@techline-care.fr'));

-- =====================================================
-- COMMENTS
-- =====================================================
INSERT INTO comments (content, id_demand, id_author)
VALUES ('Dossier en cours de vérification.',
        (SELECT id_demand FROM demands WHERE title = 'Renouvellement aide sociale'),
        (SELECT id_user FROM users WHERE email = 'emma.bernard@techline-care.fr')),

       ('Pièces complémentaires demandées à l’usager.',
        (SELECT id_demand FROM demands WHERE title = 'Suivi dossier allocation'),
        (SELECT id_user FROM users WHERE email = 'lucas.petit@techline-care.fr')),

       ('Demande validée et clôturée.',
        (SELECT id_demand FROM demands WHERE title = 'Aide financière exceptionnelle'),
        (SELECT id_user FROM users WHERE email = 'thomas.roche@techline-care.fr')),

       ('Usager orienté vers le centre adapté.',
        (SELECT id_demand FROM demands WHERE title = 'Orientation centre médical'),
        (SELECT id_user FROM users WHERE email = 'lucas.petit@techline-care.fr'));

-- =====================================================
-- ACTIVITY LOGS
-- =====================================================
INSERT INTO activity_logs (action, actor_label, id_user, id_demand)
VALUES ('Création de la demande « Demande aide logement »',
        'Alice Martin (ADMIN)',
        (SELECT id_user FROM users WHERE email = 'alice.martin@techline-care.fr'),
        (SELECT id_demand FROM demands WHERE title = 'Demande aide logement'));

INSERT INTO activity_logs (action, actor_label, id_user)
VALUES ('Création des comptes agents pour le service',
        'Alice Martin (ADMIN)',
        (SELECT id_user FROM users WHERE email = 'alice.martin@techline-care.fr'));
