-- ========================
-- SETTINGS
-- ========================
INSERT INTO settings (
  setting_key,
  setting_value,
  setting_type,
  description
) VALUES
  (
    'site_name',
    'DailyPolitics',
    'string',
    'The public name of the site.'
  ),
  (
    'site_tagline',
    'Independent analysis and political reporting.',
    'string',
    'Short description or tagline for metadata.'
  ),
  (
    'password_global_salt',
    'changeme-super-secret-salt',
    'string',
    'Global salt / pepper used in password hashing (store real value securely).'
  ),
  (
    'last_build_time',
    '2025-11-10T23:00:00Z',
    'string',
    'Timestamp of the last static site build.'
  );