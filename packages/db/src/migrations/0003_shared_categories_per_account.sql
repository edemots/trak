INSERT OR IGNORE INTO "bank_account" ("uid", "created_at", "updated_at", "name", "icon")
SELECT
  'legacy_' || "missing"."user_id",
  CAST(unixepoch('subsecond') * 1000 AS integer),
  CAST(unixepoch('subsecond') * 1000 AS integer),
  'Compte principal',
  'wallet'
FROM (
  SELECT DISTINCT "group"."user_id" AS "user_id"
  FROM "group"
  LEFT JOIN "bank_account_user" ON "bank_account_user"."user_id" = "group"."user_id"
  WHERE "bank_account_user"."user_id" IS NULL
) AS "missing";

INSERT OR IGNORE INTO "bank_account_user" ("bank_account_id", "user_id")
SELECT
  "bank_account"."id",
  "missing"."user_id"
FROM (
  SELECT DISTINCT "group"."user_id" AS "user_id"
  FROM "group"
  LEFT JOIN "bank_account_user" ON "bank_account_user"."user_id" = "group"."user_id"
  WHERE "bank_account_user"."user_id" IS NULL
) AS "missing"
INNER JOIN "bank_account" ON "bank_account"."uid" = 'legacy_' || "missing"."user_id";

ALTER TABLE "group" ADD COLUMN "bank_account_id" integer;

UPDATE "group"
SET "bank_account_id" = coalesce(
  (
    SELECT min("transaction"."bank_account_id")
    FROM "transaction"
    INNER JOIN "category" ON "category"."id" = "transaction"."category_id"
    WHERE "category"."group_id" = "group"."id"
  ),
  (
    SELECT min("recurring_rule"."bank_account_id")
    FROM "recurring_rule"
    INNER JOIN "category" ON "category"."id" = "recurring_rule"."category_id"
    WHERE "category"."group_id" = "group"."id"
  ),
  (
    SELECT min("bank_account_user"."bank_account_id")
    FROM "bank_account_user"
    WHERE "bank_account_user"."user_id" = "group"."user_id"
  ),
  (
    SELECT min("bank_account"."id")
    FROM "bank_account"
  )
)
WHERE "group"."bank_account_id" IS NULL;

UPDATE "category"
SET "group_id" = (
  SELECT min("group2"."id")
  FROM "group" AS "group2"
  INNER JOIN "group" AS "group_current" ON "group_current"."id" = "category"."group_id"
  WHERE "group2"."bank_account_id" = "group_current"."bank_account_id"
    AND "group2"."name" = "group_current"."name"
    AND "group2"."icon" = "group_current"."icon"
)
WHERE "category"."group_id" <> (
  SELECT min("group2"."id")
  FROM "group" AS "group2"
  INNER JOIN "group" AS "group_current" ON "group_current"."id" = "category"."group_id"
  WHERE "group2"."bank_account_id" = "group_current"."bank_account_id"
    AND "group2"."name" = "group_current"."name"
    AND "group2"."icon" = "group_current"."icon"
);

DELETE FROM "group"
WHERE "group"."id" NOT IN (
  SELECT min("group"."id")
  FROM "group"
  GROUP BY "group"."bank_account_id", "group"."name", "group"."icon"
);

UPDATE "transaction"
SET "category_id" = (
  SELECT min("category2"."id")
  FROM "category" AS "category2"
  INNER JOIN "category" AS "category_current" ON "category_current"."id" = "transaction"."category_id"
  WHERE "category2"."group_id" = "category_current"."group_id"
    AND "category2"."name" = "category_current"."name"
    AND "category2"."icon" = "category_current"."icon"
)
WHERE "transaction"."category_id" <> (
  SELECT min("category2"."id")
  FROM "category" AS "category2"
  INNER JOIN "category" AS "category_current" ON "category_current"."id" = "transaction"."category_id"
  WHERE "category2"."group_id" = "category_current"."group_id"
    AND "category2"."name" = "category_current"."name"
    AND "category2"."icon" = "category_current"."icon"
);

UPDATE "recurring_rule"
SET "category_id" = (
  SELECT min("category2"."id")
  FROM "category" AS "category2"
  INNER JOIN "category" AS "category_current" ON "category_current"."id" = "recurring_rule"."category_id"
  WHERE "category2"."group_id" = "category_current"."group_id"
    AND "category2"."name" = "category_current"."name"
    AND "category2"."icon" = "category_current"."icon"
)
WHERE "recurring_rule"."category_id" <> (
  SELECT min("category2"."id")
  FROM "category" AS "category2"
  INNER JOIN "category" AS "category_current" ON "category_current"."id" = "recurring_rule"."category_id"
  WHERE "category2"."group_id" = "category_current"."group_id"
    AND "category2"."name" = "category_current"."name"
    AND "category2"."icon" = "category_current"."icon"
);

DELETE FROM "category"
WHERE "category"."id" NOT IN (
  SELECT min("category"."id")
  FROM "category"
  GROUP BY "category"."group_id", "category"."name", "category"."icon"
);

CREATE INDEX IF NOT EXISTS "group_bank_account_id_idx" ON "group" ("bank_account_id");
CREATE UNIQUE INDEX IF NOT EXISTS "group_bank_account_name_icon_unique"
  ON "group" ("bank_account_id", "name", "icon");
CREATE UNIQUE INDEX IF NOT EXISTS "category_group_name_icon_unique"
  ON "category" ("group_id", "name", "icon");

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
seed_group ("uid", "user_id", "bank_account_id", "created_at", "updated_at", "name", "icon") AS (
  SELECT
    substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1)
      || substr(alphabet."chars", abs(random() % 62) + 1, 1),
    "owner"."user_id",
    "bank_account"."id",
    CAST(unixepoch('subsecond') * 1000 AS integer),
    CAST(unixepoch('subsecond') * 1000 AS integer),
    group_template."name",
    group_template."icon"
  FROM "bank_account"
  INNER JOIN (
    SELECT
      "bank_account_user"."bank_account_id",
      min("bank_account_user"."user_id") AS "user_id"
    FROM "bank_account_user"
    GROUP BY "bank_account_user"."bank_account_id"
  ) AS "owner" ON "owner"."bank_account_id" = "bank_account"."id"
  CROSS JOIN group_template
  CROSS JOIN alphabet
  WHERE NOT EXISTS (
    SELECT 1
    FROM "group"
    WHERE "group"."bank_account_id" = "bank_account"."id"
      AND "group"."name" = group_template."name"
      AND "group"."icon" = group_template."icon"
  )
)
INSERT OR IGNORE INTO "group" (
  "uid",
  "user_id",
  "bank_account_id",
  "created_at",
  "updated_at",
  "name",
  "icon"
)
SELECT
  seed_group."uid",
  seed_group."user_id",
  seed_group."bank_account_id",
  seed_group."created_at",
  seed_group."updated_at",
  seed_group."name",
  seed_group."icon"
FROM seed_group;

WITH category_template ("group_name", "group_icon", "name", "icon", "is_default") AS (
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
  FROM "group"
  INNER JOIN category_template
    ON category_template."group_name" = "group"."name"
   AND category_template."group_icon" = "group"."icon"
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
