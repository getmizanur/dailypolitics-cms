CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  password_reset_token VARCHAR(255),
  password_reset_expires_at TIMESTAMPTZ NULL,
  email_verified BOOLEAN NOT NULL DEFAULT FALSE,
  role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
  bio TEXT,
  avatar VARCHAR(500),
  is_active BOOLEAN NOT NULL DEFAULT true,
  last_login TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  last_seen_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_users_role ON users(role);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active_true ON categories(id)
  WHERE is_active = TRUE;

CREATE TABLE header_styles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,  -- e.g. 'labour-red', 'breaking-news'
  name VARCHAR(255) NOT NULL,         -- e.g. 'Labour Red', 'Breaking News'
  description TEXT,

  background_hex VARCHAR(7)  NOT NULL,          -- '#DC241F'
  text_hex VARCHAR(7),                    -- '#FFFFFF' (optional override for contrast)

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE posts (
  id SERIAL PRIMARY KEY,
  
  -- URL identifier (opaque, BBC-style, e.g. 'c874nw4g2zzo')
  slug VARCHAR(64) NOT NULL UNIQUE,

  -- Core content
  title VARCHAR(255) NOT NULL,
  excerpt TEXT,
  content TEXT NOT NULL,

  -- Authorship
  author_id INTEGER REFERENCES users(id) ON DELETE SET NULL,

  -- Taxonomy
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

  -- Presentation
  header_style_id INTEGER REFERENCES header_styles(id) ON DELETE SET NULL,
  header_color_override VARCHAR(50),
  is_featured BOOLEAN NOT NULL DEFAULT FALSE,

  -- Hero image (main article image)
  hero_image_url VARCHAR(500),
  hero_image_alt VARCHAR(255),
  hero_image_caption TEXT,
  hero_image_credit VARCHAR(255),

  -- SEO
  meta_title VARCHAR(255),
  meta_description TEXT,

  -- Behaviour
  comments_enabled BOOLEAN NOT NULL DEFAULT TRUE,
  status VARCHAR(20) DEFAULT 'draft' CHECK (status IN ('draft', 'published', 'archived')),

  -- Static build control
  regenerate_static BOOLEAN NOT NULL DEFAULT FALSE,

  -- Timestamps
  published_at TIMESTAMPTZ NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at TIMESTAMPTZ NULL
);

CREATE INDEX idx_posts_author ON posts(author_id);

-- For "latest published posts"
CREATE INDEX idx_posts_status_published_at
  ON posts (status, published_at DESC);

-- For "latest posts in a category"
CREATE INDEX idx_posts_category_status_published_at
  ON posts (category_id, status, published_at DESC);

-- For "homepage hero strip"
CREATE INDEX idx_posts_featured_status_published_at
  ON posts (is_featured, status, published_at DESC);

-- For "incremental SSG build"
CREATE INDEX idx_posts_regenerate_published
  ON posts (regenerate_static, updated_at)
  WHERE status = 'published';

CREATE INDEX idx_posts_published_live
  ON posts (published_at DESC)
  WHERE status = 'published' AND deleted_at IS NULL;
  
  
-- If you ever query ids by slug very often, the UNIQUE already has an index; no extra needed.
-- If you want unique names too:
-- ALTER TABLE topics ADD CONSTRAINT unique_topics_name UNIQUE (name);

CREATE TABLE topics (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES topics (id) ON DELETE SET NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_topics_active ON topics(is_active);
CREATE INDEX idx_topics_parent ON topics(parent_id);

CREATE TABLE post_topics (
  post_id  INTEGER NOT NULL REFERENCES posts(id) ON DELETE CASCADE,
  topic_id INTEGER NOT NULL REFERENCES topics(id) ON DELETE CASCADE,
  PRIMARY KEY (post_id, topic_id)
);

CREATE INDEX idx_post_topics_topic_id ON post_topics (topic_id);
CREATE INDEX idx_post_topics_post_id ON post_topics (post_id);


-- Store any global password salt / pepper in settings:
-- INSERT INTO settings (setting_key, setting_value) VALUES ('password_global_salt', '...long-random-value...');

CREATE TABLE settings (
  id SERIAL PRIMARY KEY,
  setting_key VARCHAR(100) NOT NULL UNIQUE,
  setting_value TEXT,
  setting_type VARCHAR(20) DEFAULT 'string' CHECK (setting_type IN ('string', 'number', 'boolean', 'json')),
  description VARCHAR(255),
  created_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMPTZ NOT NULL DEFAULT CURRENT_TIMESTAMP
);

CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER set_timestamp_users
BEFORE UPDATE ON users
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_categories
BEFORE UPDATE ON categories
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_header_styles
BEFORE UPDATE ON header_styles
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_posts
BEFORE UPDATE ON posts
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_topics
BEFORE UPDATE ON topics
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

CREATE TRIGGER set_timestamp_settings
BEFORE UPDATE ON settings
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();
