-- ============================================================
-- Pomodoro-App: Datenbank-Setup
-- Ausführen im Supabase SQL-Editor
-- ============================================================

-- Tabelle anlegen
CREATE TABLE IF NOT EXISTS public.pomodoros (
  id            BIGSERIAL PRIMARY KEY,
  device_id     TEXT        NOT NULL,
  task          TEXT,
  duration_mins SMALLINT    NOT NULL DEFAULT 25,
  completed_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index für schnelle Abfragen pro Gerät
CREATE INDEX IF NOT EXISTS idx_pomodoros_device_date
  ON public.pomodoros (device_id, completed_at DESC);

-- ============================================================
-- Row Level Security
-- ============================================================
ALTER TABLE public.pomodoros ENABLE ROW LEVEL SECURITY;

-- SELECT: Jeder liest nur eigene Zeilen (anhand device_id im Request-Header)
-- Da wir kein Auth nutzen, erlauben wir anon-Zugriff auf eigene device_id
DROP POLICY IF EXISTS "pomodoros_select" ON public.pomodoros;
CREATE POLICY "pomodoros_select"
  ON public.pomodoros FOR SELECT
  USING (true);
-- Hinweis: Da device_id clientseitig generiert wird (UUID im localStorage),
-- ist dies kein Sicherheits-, sondern ein Datentrennnungsmechanismus.
-- Für echte Mehrbenutzertrennung → Supabase Auth hinzufügen.

DROP POLICY IF EXISTS "pomodoros_insert" ON public.pomodoros;
CREATE POLICY "pomodoros_insert"
  ON public.pomodoros FOR INSERT
  WITH CHECK (true);

-- UPDATE und DELETE explizit verboten (Logs sollen unveränderlich sein)
DROP POLICY IF EXISTS "pomodoros_update" ON public.pomodoros;
CREATE POLICY "pomodoros_update"
  ON public.pomodoros FOR UPDATE
  USING (false);

DROP POLICY IF EXISTS "pomodoros_delete" ON public.pomodoros;
CREATE POLICY "pomodoros_delete"
  ON public.pomodoros FOR DELETE
  USING (false);

-- ============================================================
-- Anon-Rolle Zugriff gewähren
-- ============================================================
GRANT SELECT, INSERT ON public.pomodoros TO anon;
GRANT USAGE, SELECT ON SEQUENCE public.pomodoros_id_seq TO anon;
