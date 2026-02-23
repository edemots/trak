WITH group_template ("name", "icon") AS (
  VALUES
    ('Quotidien', '🛒'),
    ('Logement', '🏠️'),
    ('Loisirs', '🎮️'),
    ('Voiture / Moto', '🏍️'),
    ('Abonnements / tel', '📱'),
    ('Cadeaux', '🎁'),
    ('Épargne', '💰️'),
    ('Famille', '🧑‍🧑‍🧒'),
    ('Retrait cash', '🏧'),
    ('Santé', '💊'),
    ('Voyage', '🛩️'),
    ('Hors catégorie', '❔️')
),
alphabet ("chars") AS (
  VALUES ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
),
seed_group ("uid", "user_id", "created_at", "updated_at", "name", "icon") AS (
  SELECT
    substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1),
    "user"."id",
    CAST(unixepoch('subsecond') * 1000 AS integer),
    CAST(unixepoch('subsecond') * 1000 AS integer),
    group_template."name",
    group_template."icon"
  FROM "user"
  CROSS JOIN group_template
  CROSS JOIN alphabet
  WHERE NOT EXISTS (
    SELECT 1
    FROM "group"
    WHERE "group"."user_id" = "user"."id"
      AND "group"."name" = group_template."name"
      AND "group"."icon" = group_template."icon"
  )
)
INSERT OR IGNORE INTO "group" ("uid", "user_id", "created_at", "updated_at", "name", "icon")
SELECT
  seed_group."uid",
  seed_group."user_id",
  seed_group."created_at",
  seed_group."updated_at",
  seed_group."name",
  seed_group."icon"
FROM seed_group;

WITH group_template ("name", "icon") AS (
  VALUES
    ('Quotidien', '🛒'),
    ('Logement', '🏠️'),
    ('Loisirs', '🎮️'),
    ('Voiture / Moto', '🏍️'),
    ('Abonnements / tel', '📱'),
    ('Cadeaux', '🎁'),
    ('Épargne', '💰️'),
    ('Famille', '🧑‍🧑‍🧒'),
    ('Retrait cash', '🏧'),
    ('Santé', '💊'),
    ('Voyage', '🛩️'),
    ('Hors catégorie', '❔️')
),
category_template ("group_name", "group_icon", "name", "icon", "is_default") AS (
  VALUES
    ('Quotidien', '🛒', 'Autre', '📂', 1),
    ('Quotidien', '🛒', 'Alimentation', '🍎', 0),
    ('Logement', '🏠️', 'Autre', '📂', 1),
    ('Loisirs', '🎮️', 'Autre', '📂', 1),
    ('Voiture / Moto', '🏍️', 'Autre', '📂', 1),
    ('Abonnements / tel', '📱', 'Autre', '📂', 1),
    ('Épargne', '💰️', 'Autre', '📂', 1),
    ('Famille', '🧑‍🧑‍🧒', 'Autre', '📂', 1),
    ('Santé', '💊', 'Autre', '📂', 1),
    ('Voyage', '🛩️', 'Autre', '📂', 1),
    ('Abonnements / tel', '📱', 'Internet, TV', '🌐', 0),
    ('Abonnements / tel', '📱', 'Abonnements', '📺️', 0),
    ('Abonnements / tel', '📱', 'Téléphone', '📱', 0),
    ('Cadeaux', '🎁', 'Cadeaux', '🎁', 0),
    ('Famille', '🧑‍🧑‍🧒', 'Crèche, nounou, babysitter', '🚼️', 0),
    ('Hors catégorie', '❔️', 'Hors catégorie', '❔️', 0),
    ('Voiture / Moto', '🏍️', 'Assurances', '🛡️', 0),
    ('Voiture / Moto', '🏍️', 'Carburant', '⛽️', 0),
    ('Voiture / Moto', '🏍️', 'Contraventions', '👮', 0),
    ('Voiture / Moto', '🏍️', 'Entretien', '🔧', 0),
    ('Voiture / Moto', '🏍️', 'Financement', '💶', 0),
    ('Voiture / Moto', '🏍️', 'Parking', '🅿️', 0),
    ('Voiture / Moto', '🏍️', 'Péages', '🚦', 0),
    ('Logement', '🏠️', 'Assurance', '🛡️', 0),
    ('Logement', '🏠️', 'Energie', '⚡️', 0),
    ('Logement', '🏠️', 'Loyer, charge', '🏠️', 0),
    ('Loisirs', '🎮️', 'Restaurant, bar...', '🍸️', 0),
    ('Loisirs', '🎮️', 'Culture (ciné, concert...)', '🎟️', 0),
    ('Quotidien', '🛒', 'Animaux', '🐈‍⬛', 0),
    ('Quotidien', '🛒', 'Bien-être, soins', '💈', 0),
    ('Quotidien', '🛒', 'Shopping', '🛍️', 0),
    ('Logement', '🏠️', 'Travaux, bricolage, jardinage', '🔨', 0),
    ('Logement', '🏠️', 'Mobilier, électroménager, déco...', '🛋️', 0),
    ('Retrait cash', '🏧', 'Retrait cash', '🏧', 0),
    ('Santé', '💊', 'Médecins', '🧑‍⚕️', 0),
    ('Santé', '💊', 'Optique, audition...', '👓️', 0),
    ('Santé', '💊', 'Pharmacie & labo', '🔬', 0),
    ('Voyage', '🛩️', 'Hébergement', '🏨', 0),
    ('Voyage', '🛩️', 'Location véhicule', '🚙', 0),
    ('Voyage', '🛩️', 'Taxis', '🚕', 0),
    ('Voyage', '🛩️', 'Transports (Avion, train...)', '🛩️', 0),
    ('Voyage', '🛩️', 'Transports quotidiens (métro, bus)', '🚈', 0),
    ('Épargne', '💰️', 'Épargne bancaire', '💰️', 0),
    ('Épargne', '💰️', 'Épargne financière', '📈', 0),
    ('Épargne', '💰️', 'Placements boursiers', '📈', 0),
    ('Logement', '🏠️', 'Emprunt immo', '🏦', 0)
),
alphabet ("chars") AS (
  VALUES ('ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789')
),
seed_category ("uid", "created_at", "updated_at", "group_id", "name", "icon", "default_value") AS (
  SELECT
    substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1),
    CAST(unixepoch('subsecond') * 1000 AS integer),
    CAST(unixepoch('subsecond') * 1000 AS integer),
    "group"."id",
    category_template."name",
    category_template."icon",
    category_template."is_default"
  FROM "user"
  INNER JOIN group_template
    ON 1 = 1
  INNER JOIN "group"
    ON "group"."user_id" = "user"."id"
   AND "group"."name" = group_template."name"
   AND "group"."icon" = group_template."icon"
  INNER JOIN category_template
    ON category_template."group_name" = group_template."name"
   AND category_template."group_icon" = group_template."icon"
  CROSS JOIN alphabet
  WHERE NOT EXISTS (
    SELECT 1
    FROM "category"
    WHERE "category"."group_id" = "group"."id"
      AND "category"."name" = category_template."name"
      AND "category"."icon" = category_template."icon"
  )
)
INSERT OR IGNORE INTO "category" ("uid", "created_at", "updated_at", "group_id", "name", "icon", "default")
SELECT
  seed_category."uid",
  seed_category."created_at",
  seed_category."updated_at",
  seed_category."group_id",
  seed_category."name",
  seed_category."icon",
  seed_category."default_value"
FROM seed_category;
