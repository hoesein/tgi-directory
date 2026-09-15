-- =====================================================
-- Directory App — Initial Supabase Migration
-- Run this in the Supabase SQL Editor or via CLI:
--   supabase db push
-- =====================================================

-- 1. Users table (extends Supabase auth.users)
CREATE TABLE IF NOT EXISTS users (
  id         UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  name       TEXT NOT NULL CHECK (char_length(name) <= 50),
  email      TEXT NOT NULL UNIQUE,
  role       TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Auto-create a user row when a new auth user signs up
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.users (id, name, email, role)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.email,
    'user'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION handle_new_user();

-- 2. Categories table
CREATE TABLE IF NOT EXISTS categories (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name        TEXT NOT NULL UNIQUE CHECK (char_length(name) <= 50),
  description TEXT CHECK (char_length(description) <= 200),
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. Listings table
CREATE TABLE IF NOT EXISTS listings (
  id          UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title       TEXT NOT NULL CHECK (char_length(title) <= 100),
  description TEXT NOT NULL CHECK (char_length(description) <= 500),
  category_id UUID NOT NULL REFERENCES categories(id) ON DELETE RESTRICT,
  user_id     UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  location    TEXT NOT NULL,
  phone       TEXT CHECK (char_length(phone) <= 20),
  email       TEXT,
  website     TEXT,
  image       TEXT,
  created_at  TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Indexes for common queries
CREATE INDEX IF NOT EXISTS idx_listings_category ON listings(category_id);
CREATE INDEX IF NOT EXISTS idx_listings_user ON listings(user_id);

-- 4. Row-Level Security (RLS)
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE listings ENABLE ROW LEVEL SECURITY;

-- Users: anyone can read, only the owner can update their own row
CREATE POLICY "Public can view user profiles"
  ON users FOR SELECT
  USING (true);

CREATE POLICY "Users can update own profile"
  ON users FOR UPDATE
  USING (auth.uid() = id);

-- Categories: anyone can read, only admins can insert
CREATE POLICY "Public can view categories"
  ON categories FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert categories"
  ON categories FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Listings: anyone can read, only the owner can update/delete
CREATE POLICY "Public can view listings"
  ON listings FOR SELECT
  USING (true);

CREATE POLICY "Authenticated users can create listings"
  ON listings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Owners can update their listings"
  ON listings FOR UPDATE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Owners can delete their listings"
  ON listings FOR DELETE
  USING (
    auth.uid() = user_id
    OR EXISTS (
      SELECT 1 FROM users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- 5. Seed some default categories
INSERT INTO categories (name, description) VALUES
  ('Home Services', 'Plumbing, electrical, cleaning, and more'),
  ('Daily Needs', 'Groceries, pharmacy, and everyday essentials'),
  ('Doctor', 'Medical professionals and clinics'),
  ('Cake Shop', 'Bakeries and custom cakes'),
  ('Restaurants', 'Dining and food delivery'),
  ('Hotels', 'Accommodation and lodging'),
  ('Salon & Spa', 'Beauty, grooming, and wellness'),
  ('Education', 'Schools, tutors, and training centers')
ON CONFLICT (name) DO NOTHING;
