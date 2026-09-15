-- =====================================================
-- 002 — Hierarchical categories
-- Transforms flat categories into 3-level tree.
-- Apply AFTER 001_initial.sql
-- =====================================================

-- 1. Drop old unique constraint and add hierarchy columns
ALTER TABLE categories DROP CONSTRAINT IF EXISTS categories_name_key;

ALTER TABLE categories ADD COLUMN IF NOT EXISTS parent_id UUID REFERENCES categories(id) ON DELETE CASCADE;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS icon TEXT;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS level INT NOT NULL DEFAULT 0;
ALTER TABLE categories ADD COLUMN IF NOT EXISTS sort_order INT NOT NULL DEFAULT 0;

-- Enforce level range
DO $$ BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'categories_level_check') THEN
    ALTER TABLE categories ADD CONSTRAINT categories_level_check CHECK (level >= 0 AND level <= 5);
  END IF;
END $$;

-- Unique name per parent (allows same leaf name under different parents)
CREATE UNIQUE INDEX IF NOT EXISTS uq_categories_name_parent ON categories (name, parent_id);
-- Also keep fast lookup for parent filtering
CREATE INDEX IF NOT EXISTS idx_categories_parent ON categories(parent_id);
CREATE INDEX IF NOT EXISTS idx_categories_level ON categories(level);

-- 2. Make listings policies public (since APIs are public except auth)
DROP POLICY IF EXISTS "Authenticated users can create listings" ON listings;
DROP POLICY IF EXISTS "Owners can update their listings" ON listings;
DROP POLICY IF EXISTS "Owners can delete their listings" ON listings;

CREATE POLICY "Public can insert listings"
  ON listings FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update listings"
  ON listings FOR UPDATE USING (true);
CREATE POLICY "Public can delete listings"
  ON listings FOR DELETE USING (true);

-- Categories public write (dashboard manages categories without auth)
DROP POLICY IF EXISTS "Admins can insert categories" ON categories;
CREATE POLICY "Public can insert categories"
  ON categories FOR INSERT WITH CHECK (true);
CREATE POLICY "Public can update categories"
  ON categories FOR UPDATE USING (true);
CREATE POLICY "Public can delete categories"
  ON categories FOR DELETE USING (true);

-- Listings user_id is now optional (public creates without auth)
ALTER TABLE listings ALTER COLUMN user_id DROP NOT NULL;

-- 3. Clear old seed and insert hierarchical structure
DELETE FROM listings;
DELETE FROM categories;

-- Helper: insert and capture ids via CTEs
WITH level0 AS (
  INSERT INTO categories (name, description, icon, level, sort_order, parent_id) VALUES
    ('Hotel', 'Hotels and guest houses', 'bed-outline', 0, 1, NULL),
    ('Restaurant', 'Restaurants, cafes, bars and more', 'restaurant-outline', 0, 2, NULL),
    ('Emergency', 'Police, fire and emergency services', 'warning-outline', 0, 3, NULL),
    ('Hospital/Clinic', 'Hospitals and clinics', 'medkit-outline', 0, 4, NULL)
  RETURNING id, name
),
-- level1 under each main
level1_hotel AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, l.id, v.icon, 1, v.ord
  FROM level0 l JOIN (VALUES
    ('Hotel','bed-outline',1),
    ('Guest House','home-outline',2)
  ) AS v(name, icon, ord) ON l.name='Hotel'
  RETURNING id, name, parent_id
),
level1_restaurant AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, l.id, v.icon, 1, v.ord
  FROM level0 l JOIN (VALUES
    ('Cafe','cafe-outline',1),
    ('Bar','wine-outline',2),
    ('Lunch','fast-food-outline',3),
    ('Others','ellipsis-horizontal-outline',4)
  ) AS v(name, icon, ord) ON l.name='Restaurant'
  RETURNING id, name, parent_id
),
level1_emergency AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, l.id, v.icon, 1, v.ord
  FROM level0 l JOIN (VALUES
    ('Police station','shield-outline',1),
    ('Fire Station','flame-outline',2),
    ('Other','help-circle-outline',3)
  ) AS v(name, icon, ord) ON l.name='Emergency'
  RETURNING id, name, parent_id
),
level1_hospital AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, l.id, v.icon, 1, v.ord
  FROM level0 l JOIN (VALUES
    ('Hospital','medkit-outline',1),
    ('Clinic','pulse-outline',2)
  ) AS v(name, icon, ord) ON l.name='Hospital/Clinic'
  RETURNING id, name, parent_id
),
-- level2 leaves
level2_hotel_hotel AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'bed-outline', 2, v.ord
  FROM level1_hotel c JOIN (VALUES ('Hotel (1)',1),('Hotel (2)',2)) AS v(name, ord) ON c.name='Hotel'
  RETURNING id
),
level2_guesthouse AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'home-outline', 2, v.ord
  FROM level1_hotel c JOIN (VALUES ('Guest House (1)',1),('Guest House (2)',2)) AS v(name, ord) ON c.name='Guest House'
  RETURNING id
),
level2_cafe AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'cafe-outline', 2, v.ord
  FROM level1_restaurant c JOIN (VALUES ('Cafe (1)',1),('Cafe (2)',2)) AS v(name, ord) ON c.name='Cafe'
  RETURNING id
),
level2_bar AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'wine-outline', 2, v.ord
  FROM level1_restaurant c JOIN (VALUES ('Bar (1)',1),('Bar (2)',2)) AS v(name, ord) ON c.name='Bar'
  RETURNING id
),
level2_lunch AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'fast-food-outline', 2, v.ord
  FROM level1_restaurant c JOIN (VALUES ('Lunch (1)',1)) AS v(name, ord) ON c.name='Lunch'
  RETURNING id
),
level2_others AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'ellipsis-horizontal-outline', 2, v.ord
  FROM level1_restaurant c JOIN (VALUES ('1',1),('2',2)) AS v(name, ord) ON c.name='Others'
  RETURNING id
),
level2_hospital AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'medkit-outline', 2, v.ord
  FROM level1_hospital c JOIN (VALUES ('One',1),('Two',2)) AS v(name, ord) ON c.name='Hospital'
  RETURNING id
),
level2_clinic AS (
  INSERT INTO categories (name, parent_id, icon, level, sort_order)
  SELECT v.name, c.id, 'pulse-outline', 2, v.ord
  FROM level1_hospital c JOIN (VALUES ('one',1),('two',2)) AS v(name, ord) ON c.name='Clinic'
  RETURNING id
)
SELECT 'hierarchical seed done' AS status;
