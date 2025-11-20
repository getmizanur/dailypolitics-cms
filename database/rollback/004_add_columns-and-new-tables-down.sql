----------------------------------------------------------------------
-- ROLLBACK: presentation_styles + post_revisions + new columns
-- This reverses:
--  - creation of post_revisions
--  - posts.review_requested
----------------------------------------------------------------------


----------------------------------------------------------------------
-- 1. DROP TABLE post_revisions (if exists)
--    This will also remove its indexes and triggers.
----------------------------------------------------------------------

DROP TABLE IF EXISTS post_revisions;


----------------------------------------------------------------------
-- 2. DROP COLUMNS from existing tables (guarded)
----------------------------------------------------------------------

-- 2.1 posts.review_requested
DO $$
BEGIN
  IF to_regclass('public.posts') IS NOT NULL THEN
    ALTER TABLE public.posts
      DROP COLUMN IF EXISTS review_requested;
  END IF;
END;
$$;


-- Note:
-- We do NOT drop the set_updated_at() function here, since it is
-- also used by other tables (users, posts, categories, topics, etc).