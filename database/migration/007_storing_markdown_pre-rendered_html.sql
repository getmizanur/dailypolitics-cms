----------------------------------------------------------------------
-- MIGRATION: Rename content/excerpt → markdown + add HTML fields
----------------------------------------------------------------------


----------------------------------------------------------------------
-- 1. POSTS TABLE
----------------------------------------------------------------------

-- 1.1 Rename content → content_markdown (if old col exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='posts' AND column_name='content'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='posts' AND column_name='content_markdown'
  ) THEN
    ALTER TABLE posts RENAME COLUMN content TO content_markdown;
  END IF;
END;
$$;

-- 1.2 Rename excerpt → excerpt_markdown (if old col exists)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='posts' AND column_name='excerpt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name='posts' AND column_name='excerpt_markdown'
  ) THEN
    ALTER TABLE posts RENAME COLUMN excerpt TO excerpt_markdown;
  END IF;
END;
$$;

-- 1.3 Add content_html if missing
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS content_html TEXT;

-- 1.4 Add excerpt_html if missing
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS excerpt_html TEXT;


----------------------------------------------------------------------
-- 2. POST_REVISIONS TABLE
----------------------------------------------------------------------

-- 2.1 Rename content → content_markdown
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='post_revisions' AND column_name='content'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='post_revisions' AND column_name='content_markdown'
  ) THEN
    ALTER TABLE post_revisions RENAME COLUMN content TO content_markdown;
  END IF;
END;
$$;

-- 2.2 Rename excerpt → excerpt_markdown
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='post_revisions' AND column_name='excerpt'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='post_revisions' AND column_name='excerpt_markdown'
  ) THEN
    ALTER TABLE post_revisions RENAME COLUMN excerpt TO excerpt_markdown;
  END IF;
END;
$$;

-- 2.3 Add content_html if missing
ALTER TABLE post_revisions
  ADD COLUMN IF NOT EXISTS content_html TEXT;

-- 2.4 Add excerpt_html if missing
ALTER TABLE post_revisions
  ADD COLUMN IF NOT EXISTS excerpt_html TEXT;


----------------------------------------------------------------------
-- 3. OPTIONAL: Ensure both tables have HTML + Markdown populated
-- (no data modification here — your app/SSG can fill HTML later)
----------------------------------------------------------------------

-- No-op placeholder, included for clarity
-- SELECT 'Migration completed: markdown + HTML fields added' AS status;