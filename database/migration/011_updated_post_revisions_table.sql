DROP TABLE IF EXISTS post_revisions CASCADE;
CREATE TABLE post_revisions (
  id SERIAL PRIMARY KEY,

  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  -- Content snapshot
  title VARCHAR(255) NOT NULL,
  excerpt_markdown TEXT,
  excerpt_html     TEXT,
  content_markdown TEXT NOT NULL,
  content_html     TEXT NOT NULL,

  -- Metadata snapshot
  meta_title       VARCHAR(255),
  meta_description TEXT,
  category_id           INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  presentation_style_id INTEGER REFERENCES presentation_styles(id) ON DELETE SET NULL,

  -- Why this revision was created (reason for change)
  change_reason TEXT,

  -- Revision lifecycle
  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft', 'approved', 'superseded')),

  created_by  INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_revisions_post_id    ON post_revisions(post_id);
CREATE INDEX idx_post_revisions_status     ON post_revisions(status);
CREATE INDEX idx_post_revisions_created_at ON post_revisions(created_at);

CREATE UNIQUE INDEX uniq_post_revisions_one_draft_per_post
ON post_revisions(post_id)
WHERE status = 'draft';