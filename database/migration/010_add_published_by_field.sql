ALTER TABLE public.posts
ADD COLUMN published_by integer;

ALTER TABLE public.posts
ADD CONSTRAINT posts_published_by_fkey
    FOREIGN KEY (published_by)
    REFERENCES public.users (id)
    ON UPDATE NO ACTION
    ON DELETE SET NULL;