-- 1) Rename header_styles -> presentation_styles
ALTER TABLE header_styles
  RENAME TO presentation_styles;

-- 2) Drop old colour columns (optional, once you're happy)
ALTER TABLE presentation_styles
  DROP COLUMN background_hex,
  DROP COLUMN text_hex;

-- 3) Add css_classes column
ALTER TABLE presentation_styles
  ADD COLUMN css_classes TEXT;

-- 4) Populate css_classes with some defaults
UPDATE presentation_styles
SET css_classes = 'post-header header header--' || slug
WHERE css_classes IS NULL;

-- 5) Rename posts.header_style_id -> presentation_style_id
ALTER TABLE posts
  RENAME COLUMN header_style_id TO presentation_style_id;

-- 6) (Optional) Rename trigger for clarity
ALTER TRIGGER set_timestamp_header_styles
ON presentation_styles
RENAME TO set_timestamp_presentation_styles;