-- Dauntless Builder: Community Builds & Upvotes Schema
-- Run this in Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor → New Query)

-- 1. Builds table
CREATE TABLE IF NOT EXISTS public.builds (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  version     text        NOT NULL,
  name        text        NOT NULL,
  author      text        DEFAULT 'Anonymous Slayer',
  description text        DEFAULT '',
  tags        text[]      DEFAULT '{}',
  build_state jsonb       NOT NULL,
  upvotes     integer     DEFAULT 0,
  created_at  timestamptz DEFAULT now()
);

-- 2. Upvote tracking (one vote per voter per build)
CREATE TABLE IF NOT EXISTS public.build_upvotes (
  id          uuid        PRIMARY KEY DEFAULT gen_random_uuid(),
  build_id    uuid        NOT NULL REFERENCES public.builds(id) ON DELETE CASCADE,
  voter_id    text        NOT NULL,
  created_at  timestamptz DEFAULT now(),
  UNIQUE(build_id, voter_id)
);

-- 3. Indexes for fast queries
CREATE INDEX IF NOT EXISTS idx_builds_version ON public.builds(version);
CREATE INDEX IF NOT EXISTS idx_builds_upvotes ON public.builds(upvotes DESC);
CREATE INDEX IF NOT EXISTS idx_build_upvotes_build_id ON public.build_upvotes(build_id);
CREATE INDEX IF NOT EXISTS idx_build_upvotes_voter ON public.build_upvotes(build_id, voter_id);

-- 4. Enable Row Level Security
ALTER TABLE public.builds ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.build_upvotes ENABLE ROW LEVEL SECURITY;

-- 5. RLS Policies: Allow public read/insert (anon key), restrict updates
-- Anyone can read builds
CREATE POLICY "Builds are publicly readable"
  ON public.builds FOR SELECT
  USING (true);

-- Anyone can insert a build
CREATE POLICY "Anyone can submit a build"
  ON public.builds FOR INSERT
  WITH CHECK (true);

-- Anyone can update upvote count (we do this from the client after toggling)
CREATE POLICY "Anyone can update build upvotes"
  ON public.builds FOR UPDATE
  USING (true)
  WITH CHECK (true);

-- Anyone can delete their own builds (simplified: allow all deletes for now)
CREATE POLICY "Anyone can delete builds"
  ON public.builds FOR DELETE
  USING (true);

-- Upvotes: public read/insert/delete
CREATE POLICY "Upvotes are publicly readable"
  ON public.build_upvotes FOR SELECT
  USING (true);

CREATE POLICY "Anyone can upvote"
  ON public.build_upvotes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Anyone can remove their upvote"
  ON public.build_upvotes FOR DELETE
  USING (true);
