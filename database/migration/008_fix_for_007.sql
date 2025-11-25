------------------------------------------------------------
-- STEP 1: DROP old HTML fields
------------------------------------------------------------

ALTER TABLE posts DROP COLUMN IF EXISTS excerpt_html;
ALTER TABLE posts DROP COLUMN IF EXISTS content_html;

ALTER TABLE post_revisions DROP COLUMN IF EXISTS excerpt_html;
ALTER TABLE post_revisions DROP COLUMN IF EXISTS content_html;


------------------------------------------------------------
-- STEP 2: RENAME markdown → html
------------------------------------------------------------

-- POSTS
ALTER TABLE posts RENAME COLUMN excerpt_markdown TO excerpt_html;
ALTER TABLE posts RENAME COLUMN content_markdown TO content_html;

-- POST REVISIONS
ALTER TABLE post_revisions RENAME COLUMN excerpt_markdown TO excerpt_html;
ALTER TABLE post_revisions RENAME COLUMN content_markdown TO content_html;


------------------------------------------------------------
-- STEP 3: ADD BACK markdown source fields
------------------------------------------------------------

-- POSTS
ALTER TABLE posts
  ADD COLUMN IF NOT EXISTS excerpt_markdown TEXT,
  ADD COLUMN IF NOT EXISTS content_markdown TEXT;

-- POST REVISIONS
ALTER TABLE post_revisions
  ADD COLUMN IF NOT EXISTS excerpt_markdown TEXT,
  ADD COLUMN IF NOT EXISTS content_markdown TEXT;