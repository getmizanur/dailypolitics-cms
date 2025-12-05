ALTER TABLE post_revisions
ADD COLUMN IF NOT EXISTS category_id INTEGER;

ALTER TABLE post_revisions
ADD CONSTRAINT post_revisions_category_id_fkey
FOREIGN KEY (category_id)
REFERENCES categories(id)
ON DELETE SET NULL;