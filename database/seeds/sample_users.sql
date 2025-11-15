-- ========================
-- USERS
-- ========================
INSERT INTO users (
  name, email, password_hash, password_reset_token,
  password_reset_expires_at, email_verified, role,
  bio, avatar, is_active, last_login, last_seen_at
) VALUES
  (
    'Alice Admin',
    'alice.admin@dailypolitics.com',
    'hashed-password-alice',        -- dummy hash
    NULL,
    NULL,
    TRUE,
    'admin',
    'Site administrator and political editor.',
    'https://example.com/avatars/alice.png',
    TRUE,
    '2025-11-10 09:00:00+00',
    '2025-11-10 09:05:00+00'
  ),
  (
    'Ed Editor',
    'ed.editor@dailypolitics.com',
    'hashed-password-ed',
    NULL,
    NULL,
    TRUE,
    'editor',
    'Commissioning editor for UK politics.',
    'https://example.com/avatars/ed.png',
    TRUE,
    '2025-11-10 10:00:00+00',
    '2025-11-10 10:10:00+00'
  ),
  (
    'Wendy Writer',
    'wendy.writer@dailypolitics.com',
    'hashed-password-wendy',
    NULL,
    NULL,
    FALSE,
    'author',
    'Political reporter covering Westminster and elections.',
    'https://example.com/avatars/wendy.png',
    TRUE,
    '2025-11-09 18:30:00+00',
    '2025-11-09 18:45:00+00'
  );