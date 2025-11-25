-- Copy HTML → Markdown for POSTS
UPDATE posts
SET content_markdown = content_html
WHERE content_html IS NOT NULL;

UPDATE posts
SET excerpt_markdown = excerpt_html
WHERE excerpt_html IS NOT NULL;

-- Copy HTML → Markdown for POST_REVISIONS
UPDATE post_revisions
SET content_markdown = content_html
WHERE content_html IS NOT NULL;

UPDATE post_revisions
SET excerpt_markdown = excerpt_html
WHERE excerpt_html IS NOT NULL;