-- A routine now holds several weekdays instead of one. init.sql only runs on an empty volume, so existing
-- databases need this script once: docker compose exec -T db psql -U <user> -d <db> < this file.
\set ON_ERROR_STOP on
BEGIN;

ALTER TABLE routines ADD COLUMN IF NOT EXISTS days_of_week INT[] NOT NULL DEFAULT '{}';

-- Carry over the old single weekday (only while the old column still exists).
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'routines' AND column_name = 'day_of_week'
  ) THEN
    UPDATE routines SET days_of_week = ARRAY[day_of_week]
    WHERE days_of_week = '{}' AND day_of_week IS NOT NULL;
  END IF;
END $$;

-- The previous form saved one routine per chosen day. Merge those copies (same patient, name, dates and time,
-- no sessions yet) into the oldest one and drop the rest.
CREATE TEMP TABLE routine_groups ON COMMIT DROP AS
SELECT
  (array_agg(id ORDER BY created_at, id))[1] AS keep_id,
  array_agg(id) AS ids
FROM routines
WHERE NOT EXISTS (SELECT 1 FROM sessions s WHERE s.routine_id = routines.id)
GROUP BY patient_id, specialist_id, name, start_date, end_date, scheduled_time
HAVING count(*) > 1;

UPDATE routines r
SET days_of_week = (
  SELECT array_agg(DISTINCT d ORDER BY d)
  FROM routines r2, unnest(r2.days_of_week) AS d
  WHERE r2.id = ANY (g.ids)
)
FROM routine_groups g
WHERE r.id = g.keep_id;

DELETE FROM routines
WHERE id IN (SELECT unnest(ids) FROM routine_groups)
  AND id NOT IN (SELECT keep_id FROM routine_groups);

ALTER TABLE routines DROP COLUMN IF EXISTS day_of_week;

COMMIT;
