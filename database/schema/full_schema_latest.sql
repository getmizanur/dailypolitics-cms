------------------------------------------------------------------------------
-- USERS
------------------------------------------------------------------------------

CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMPTZ,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'author'
    CHECK (role IN ('admin', 'editor', 'author')),
  bio TEXT,
  avatar VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ
);

CREATE INDEX idx_users_role ON users(role);


------------------------------------------------------------------------------
-- PRESENTATION STYLES (header colours)
------------------------------------------------------------------------------

CREATE TABLE presentation_styles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,
  name VARCHAR(255) NOT NULL,
  description TEXT,
  css_classes VARCHAR(255) NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


------------------------------------------------------------------------------
-- CATEGORIES
------------------------------------------------------------------------------

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  presentation_style_id INTEGER REFERENCES presentation_styles(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active_true ON categories(id)
  WHERE is_active = TRUE;


------------------------------------------------------------------------------
-- POSTS
------------------------------------------------------------------------------

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,

  slug VARCHAR(64) NOT NULL UNIQUE,

  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

  presentation_style_id INTEGER REFERENCES presentation_styles(id) ON DELETE SET NULL,
  header_color_override VARCHAR(50),

  is_featured BOOLEAN NOT NULL DEFAULT FALSE,

  hero_image_url VARCHAR(500),
  hero_image_alt VARCHAR(255),
  hero_image_caption TEXT,
  hero_image_credit VARCHAR(255),

  meta_title VARCHAR(255),
  meta_description TEXT,

  comments_enabled BOOLEAN NOT NULL DEFAULT TRUE,

  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','published','archived')),

  review_requested BOOLEAN NOT NULL DEFAULT FALSE,

  regenerate_static BOOLEAN NOT NULL DEFAULT FALSE,

  published_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ
);

CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category_status ON posts(category_id, status, published_at DESC);
CREATE INDEX idx_posts_status_published_at ON posts(status, published_at DESC);
CREATE INDEX idx_posts_featured_status_published_at ON posts(is_featured, status, published_at DESC);

CREATE INDEX idx_posts_published_live
  ON posts (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;

CREATE INDEX idx_posts_regenerate_published
  ON posts (regenerate_static, updated_at)
  WHERE status = 'published';


------------------------------------------------------------------------------
-- POST REVISIONS
------------------------------------------------------------------------------

CREATE TABLE post_revisions (
  id SERIAL PRIMARY KEY,
  post_id INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,

  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  status VARCHAR(20) NOT NULL DEFAULT 'draft'
    CHECK (status IN ('draft','submitted','approved','superseded')),

  created_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
  approved_at TIMESTAMPTZ,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_post_revisions_post_id ON post_revisions(post_id);
CREATE INDEX idx_post_revisions_status ON post_revisions(status);


------------------------------------------------------------------------------
-- TOPICS
------------------------------------------------------------------------------

CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES topics(id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT TRUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topics_active ON topics(is_active);
CREATE INDEX idx_topics_parent ON topics(parent_id);


------------------------------------------------------------------------------
-- POST ↔ TOPIC PIVOT TABLE
------------------------------------------------------------------------------

CREATE TABLE post_topics (
  post_id  INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, topic_id)
);

CREATE INDEX idx_post_topics_topic_id ON post_topics(topic_id);
CREATE INDEX idx_post_topics_post_id ON post_topics(post_id);


------------------------------------------------------------------------------
-- SETTINGS
------------------------------------------------------------------------------

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'string'
    CHECK (setting_type IN ('string','number','boolean','json')),
  description VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);


------------------------------------------------------------------------------
-- UPDATED_AT TRIGGER
------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;


-- triggers

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_presentation_styles
BEFORE UPDATE ON presentation_styles
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_posts
BEFORE UPDATE ON posts
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_topics
BEFORE UPDATE ON topics
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_post_revisions
BEFORE UPDATE ON post_revisions
FOR EACH ROW EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_settings
BEFORE UPDATE ON settings
FOR EACH ROW EXECUTE FUNCTION set_updated_at();