-- Editorial worklfow and soft-delete tracking
ALTER TABLE posts
ADD COLUMN updated_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN deleted_by INTEGER REFERENCES users(id) ON DELETE SET NULL,
ADD COLUMN approved_by INTEGER REFERENCES users(id) ON DELETE SET NULL;

-- add approved at
ALTER TABLE posts
ADD COLUMN approved_at TIMESTAMPTZ;