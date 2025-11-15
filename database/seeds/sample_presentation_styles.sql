-- ========================
-- HEADER STYLES
-- (assume ids: 1=Breaking News, 2=Analysis, 3=Feature)
-- ========================
INSERT INTO presentation_styles (
  slug, name, description,
  css_classes, is_active
) VALUES
  (
    'breaking-news',
    'Breaking News',
    'High-priority breaking stories.',
    NULL,
    TRUE
  ),
  (
    'analysis',
    'In-depth Analysis',
    'Long-form explainers and analysis.',
    NULL,
    TRUE
  ),
  (
    'feature',
    'Feature Story',
    'Human-interest and magazine-style pieces.',
    NULL,
    TRUE
  );

  -- Populate css_classes with some defaults
UPDATE presentation_styles
SET css_classes = 'post-header header header--' || slug
WHERE css_classes IS NULL;