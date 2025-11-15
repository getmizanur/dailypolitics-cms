-- ========================
-- CATEGORIES
-- (assume ids: 1=UK Politics, 2=World, 3=Opinion)
-- ========================
INSERT INTO categories (
  name, slug, description, parent_id, sort_order, is_active
) VALUES
  (
    'UK Politics',
    'uk-politics',
    'Coverage of Westminster, devolved administrations and UK-wide political stories.',
    NULL,
    1,
    TRUE
  ),
  (
    'World',
    'world',
    'International politics, diplomacy and elections.',
    NULL,
    2,
    TRUE
  ),
  (
    'Opinion',
    'opinion',
    'Columns, editorials and commentary.',
    NULL,
    3,
    TRUE
  );