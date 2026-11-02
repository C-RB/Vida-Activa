-- Surveys get their own mood and pain-area columns. Until now the post-session mood was stored in
-- fatigue_level because there was nowhere else to put it. Run once on existing databases:
-- docker compose exec -T db psql -U <user> -d <db> < this file.
\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE surveys ADD COLUMN IF NOT EXISTS mood_level INT;
ALTER TABLE surveys ADD COLUMN IF NOT EXISTS pain_area VARCHAR;

-- Move the mood that was kept in fatigue_level on post-session surveys.
UPDATE surveys
SET mood_level = fatigue_level, fatigue_level = NULL
WHERE type = 'POST_SESSION' AND mood_level IS NULL AND fatigue_level IS NOT NULL;

COMMIT;
