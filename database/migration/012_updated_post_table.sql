-- Table: public.posts

CREATE TABLE IF NOT EXISTS public.posts
(
    ----------------------------------------------------------------------
    -- Identity & URL
    ----------------------------------------------------------------------
    id   integer NOT NULL DEFAULT nextval('posts_id_seq'::regclass),  -- Surrogate primary key
    slug varchar(64) NOT NULL,                                        -- Opaque BBC-style ID used in URLs (unique, stable)

    CONSTRAINT posts_pkey     PRIMARY KEY (id),
    CONSTRAINT posts_slug_key UNIQUE (slug),

    ----------------------------------------------------------------------
    -- Core content (author-facing + rendered)
    ----------------------------------------------------------------------
    title            varchar(255) NOT NULL,  -- Main article headline

    -- Markdown source (editable)
    excerpt_markdown  text,                 -- Short standfirst / intro in Markdown
    content_markdown  text,                 -- Full article body in Markdown (canonical source)

    -- Rendered HTML (frontend / SSG)
    excerpt_html      text,                 -- Rendered HTML version of excerpt_markdown
    content_html      text NOT NULL,        -- Rendered HTML version of content_markdown

    ----------------------------------------------------------------------
    -- Relationships / taxonomy / presentation
    ----------------------------------------------------------------------
    author_id             integer,          -- Byline author (nullable to allow orphans if user removed)
    category_id           integer NOT NULL, -- Main category (e.g. UK politics, Brexit, Breaking)
    presentation_style_id integer,          -- Link to presentation_styles for header colour / styling
    header_color_override varchar(50),      -- Optional custom header colour overriding presentation_style

    is_featured           boolean NOT NULL DEFAULT false,  -- Used for homepage hero / featured strips

    CONSTRAINT posts_author_id_fkey FOREIGN KEY (author_id)
        REFERENCES public.users (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,

    CONSTRAINT posts_category_id_fkey FOREIGN KEY (category_id)
        REFERENCES public.categories (id)
        ON UPDATE NO ACTION
        ON DELETE RESTRICT,

    CONSTRAINT posts_header_style_id_fkey FOREIGN KEY (presentation_style_id)
        REFERENCES public.presentation_styles (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,

    ----------------------------------------------------------------------
    -- Hero image (main article image)
    ----------------------------------------------------------------------
    hero_image_url     varchar(500),        -- URL of main hero image
    hero_image_alt     varchar(255),        -- Alt text for accessibility / SEO
    hero_image_caption text,                -- Caption displayed under the image
    hero_image_credit  varchar(255),        -- Photographer / agency credit

    ----------------------------------------------------------------------
    -- SEO metadata
    ----------------------------------------------------------------------
    meta_title       varchar(255),          -- Optional custom <title>; falls back to title if null
    meta_description text,                  -- SEO / social share description

    ----------------------------------------------------------------------
    -- Behaviour flags / editorial state
    ----------------------------------------------------------------------
    comments_enabled  boolean NOT NULL DEFAULT true,    -- Whether comments are allowed
    status            varchar(20) DEFAULT 'draft',       -- draft / published / archived
    regenerate_static boolean NOT NULL DEFAULT false,    -- Hint for SSG: regenerate this post on next build
    review_requested  boolean NOT NULL DEFAULT false,    -- Author requested editorial review

    CONSTRAINT posts_status_check CHECK (
        status::text = ANY (
            ARRAY['draft'::varchar, 'published'::varchar, 'archived'::varchar]::text[]
        )
    ),

    ----------------------------------------------------------------------
    -- Lifecycle timestamps
    ----------------------------------------------------------------------
    published_at timestamptz,                          -- When the article first went live
    created_at   timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Created in CMS
    updated_at   timestamptz NOT NULL DEFAULT CURRENT_TIMESTAMP, -- Last edit (trigger-managed)
    deleted_at   timestamptz,                          -- Soft delete / unpublish timestamp

    ----------------------------------------------------------------------
    -- Audit: who did what
    ----------------------------------------------------------------------
    updated_by   integer,          -- User who last updated the article
    deleted_by   integer,          -- User who soft-deleted / unpublished it
    approved_by  integer,          -- User who approved the article (if workflow in use)
    approved_at  timestamptz,      -- When it was approved
    published_by integer,          -- User who actually published it

    CONSTRAINT posts_updated_by_fkey FOREIGN KEY (updated_by)
        REFERENCES public.users (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,

    CONSTRAINT posts_deleted_by_fkey FOREIGN KEY (deleted_by)
        REFERENCES public.users (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,

    CONSTRAINT posts_approved_by_fkey FOREIGN KEY (approved_by)
        REFERENCES public.users (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL,

    CONSTRAINT posts_published_by_fkey FOREIGN KEY (published_by)
        REFERENCES public.users (id)
        ON UPDATE NO ACTION
        ON DELETE SET NULL
)
TABLESPACE pg_default;

ALTER TABLE IF EXISTS public.posts
    OWNER TO postgres;

----------------------------------------------------------------------
-- Indexes
----------------------------------------------------------------------

CREATE INDEX IF NOT EXISTS idx_posts_author
    ON public.posts USING btree
    (author_id ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_category_status_published_at
    ON public.posts USING btree
    (category_id ASC NULLS LAST,
     status COLLATE pg_catalog."default" ASC NULLS LAST,
     published_at DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_featured_status_published_at
    ON public.posts USING btree
    (is_featured ASC NULLS LAST,
     status COLLATE pg_catalog."default" ASC NULLS LAST,
     published_at DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

CREATE INDEX IF NOT EXISTS idx_posts_published_live
    ON public.posts USING btree
    (published_at DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default
    WHERE status::text = 'published'::text
      AND deleted_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_posts_regenerate_published
    ON public.posts USING btree
    (regenerate_static ASC NULLS LAST,
     updated_at ASC NULLS LAST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default
    WHERE status::text = 'published'::text;

CREATE INDEX IF NOT EXISTS idx_posts_status_published_at
    ON public.posts USING btree
    (status COLLATE pg_catalog."default" ASC NULLS LAST,
     published_at DESC NULLS FIRST)
    WITH (fillfactor=100, deduplicate_items=True)
    TABLESPACE pg_default;

----------------------------------------------------------------------
-- Trigger: keep updated_at in sync
----------------------------------------------------------------------

CREATE OR REPLACE TRIGGER set_timestamp_posts
    BEFORE UPDATE ON public.posts
    FOR EACH ROW
    EXECUTE FUNCTION public.set_updated_at();