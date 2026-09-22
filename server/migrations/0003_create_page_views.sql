CREATE TABLE page_views (
  id SERIAL PRIMARY KEY,
  path TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX page_views_created_at_idx ON page_views (created_at DESC);
CREATE INDEX page_views_path_idx ON page_views (path);
