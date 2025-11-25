----------------------------------------------------------------------
-- 1. INDEX: add index (create if not exists)
----------------------------------------------------------------------

-- Helpful index for active styles
CREATE INDEX IF NOT EXISTS idx_presentation_styles_active
  ON presentation_styles (is_active);

----------------------------------------------------------------------
-- 2. ADD COLUMNS to existing tables (guarded)
----------------------------------------------------------------------

DO $$
BEGIN
  IF to_regclass('public.posts') IS NOT NULL THEN
    ALTER TABLE public.posts
      ADD COLUMN IF NOT EXISTS review_requested BOOLEAN NOT NULL DEFAULT FALSE;
  END IF;
END;
$$;

----------------------------------------------------------------------
-- 3. TABLE: post_revisions (create if not exists)
----------------------------------------------------------------------

CREATE TABLE IF NOT EXISTS post_revisions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- snapshot of content
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- revision workflow
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','approved','superseded')),

  -- audit
  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX IF NOT EXISTS idx_post_revisions_post_id
  ON post_revisions(post_id);

CREATE INDEX IF NOT EXISTS idx_post_revisions_status
  ON post_revisions(status);

----------------------------------------------------------------------
-- 4. TRIGGERS for updated_at on new tables (guarded)
--    Assumes function set_updated_at() already exists
----------------------------------------------------------------------

-- Trigger for presentation_styles
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'presentation_styles'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_presentation_styles'
  ) THEN
    CREATE TRIGGER set_timestamp_presentation_styles
    BEFORE UPDATE ON presentation_styles
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;

-- Trigger for post_revisions
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM pg_class WHERE relname = 'post_revisions'
  ) AND NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'set_timestamp_post_revisions'
  ) THEN
    CREATE TRIGGER set_timestamp_post_revisions
    BEFORE UPDATE ON post_revisions
    FOR EACH ROW EXECUTE FUNCTION set_updated_at();
  END IF;
END;
$$;