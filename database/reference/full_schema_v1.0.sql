CREATE TABLE users (
  id SERIAL PRIMARY KEY,
  name VARCHAR(255) NOT NULL,
  email VARCHAR(255) NOT NULL UNIQUE,
  password_hash VARCHAR(255) NOT NULL,
  role VARCHAR(20) DEFAULT 'author' CHECK (role IN ('admin', 'editor', 'author')),
  bio TEXT,
  avatar VARCHAR(500),
  is_active BOOLEAN DEFAULT true,
  last_login TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_users_email ON users(email);
CREATE INDEX idx_users_role ON users(role);

CREATE TABLE categories (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES categories(id) ON DELETE SET NULL,
  sort_order INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_categories_slug ON categories(slug);
CREATE INDEX idx_categories_parent ON categories(parent_id);
CREATE INDEX idx_categories_active ON categories(is_active);

CREATE TABLE topcis (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  slug VARCHAR(100) NOT NULL UNIQUE,
  description TEXT,
  parent_id INTEGER REFERENCES cate(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE header_styles (
  id SERIAL PRIMARY KEY,
  slug VARCHAR(100) NOT NULL UNIQUE,  -- e.g. 'labour-red', 'breaking-news'
  name VARCHAR(255) NOT NULL,         -- e.g. 'Labour Red', 'Breaking News'
  description TEXT,

  background_hex VARCHAR(7)  NOT NULL,          -- '#DC241F'
  text_hex VARCHAR(7),                    -- '#FFFFFF' (optional override for contrast)

  is_active BOOLEAN NOT NULL DEFAULT TRUE,

  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
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
  author_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,

  -- Taxonomy
  category_id INTEGER NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,

  -- Presentation
  header_style_id BIGINT REFERENCES header_styles(id) ON DELETE SET NULL,
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
  published_at TIMESTAMP,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE INDEX idx_posts_slug ON posts(slug);
CREATE INDEX idx_posts_status ON posts(status);
CREATE INDEX idx_posts_author ON posts(author_id);
CREATE INDEX idx_posts_category ON posts(category_id);
CREATE INDEX idx_posts_published_at ON posts(published_at);
CREATE INDEX idx_posts_featured ON posts(is_featured);

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

