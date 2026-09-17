-- ==========================================================
-- CALL N PIZZA CAFE — SECURE SUPABASE SETUP SCRIPT
-- ==========================================================
-- Run this script in your Supabase SQL Editor:
-- https://supabase.com/dashboard/project/aqyfjialkabscadrlyzw/sql
--
-- Security Model:
-- 1. PUBLIC (anon & authenticated): Read-only (SELECT) access.
-- 2. ADMIN (authenticated only): Explicit INSERT, UPDATE, DELETE access.
-- 3. ANONYMOUS: ZERO write policies. Cannot insert, update, or delete.
-- ==========================================================

-- 1. CATEGORIES TABLE
CREATE TABLE IF NOT EXISTS public.categories (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  icon TEXT DEFAULT '🍽️',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. MENU ITEMS TABLE
CREATE TABLE IF NOT EXISTS public.menu_items (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  description TEXT,
  category TEXT REFERENCES public.categories(id) ON DELETE SET NULL,
  image TEXT,
  price NUMERIC DEFAULT 0,
  sizes JSONB,
  available BOOLEAN DEFAULT true,
  featured BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- 3. GALLERY ITEMS TABLE
-- Uses visible boolean (frontend hidden = !visible)
CREATE TABLE IF NOT EXISTS public.gallery_items (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  image TEXT NOT NULL,
  category TEXT DEFAULT 'Pizza',
  description TEXT DEFAULT '',
  visible BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 4. RESTAURANT SETTINGS TABLE
-- Single row with integer id = 1
CREATE TABLE IF NOT EXISTS public.restaurant_settings (
  id INTEGER PRIMARY KEY DEFAULT 1,
  name TEXT DEFAULT 'Call N Pizza Cafe',
  name_tamil TEXT DEFAULT 'கால் என் பீட்சா கஃபே',
  tagline TEXT DEFAULT 'Delicious Pizza, Burgers & More',
  description TEXT,
  phone TEXT DEFAULT '9944399984',
  phone_display TEXT DEFAULT '99443 99984',
  phone_tel TEXT DEFAULT 'tel:+919944399984',
  whatsapp_number TEXT DEFAULT '919944399984',
  whatsapp_url TEXT DEFAULT 'https://wa.me/919944399984',
  facebook_url TEXT,
  instagram_url TEXT,
  youtube_url TEXT,
  google_maps_url TEXT,
  website TEXT DEFAULT 'www.callnpizzacafe.com',
  address TEXT DEFAULT 'Eravanchery, Manavalanallur, Tamil Nadu 609501',
  address_tamil TEXT DEFAULT 'எரவாஞ்சேரி, மணவாளநல்லூர், தமிழ்நாடு 609501',
  opening_hours TEXT DEFAULT '10:00 AM – 10:00 PM',
  opening_time TEXT DEFAULT '10:00 AM',
  closing_time TEXT DEFAULT '10:00 PM',
  days_open TEXT DEFAULT 'Every Day',
  is_halal BOOLEAN DEFAULT true,
  home_delivery BOOLEAN DEFAULT true,
  logo TEXT DEFAULT '/logo.png',
  currency TEXT DEFAULT '₹',
  is_open BOOLEAN DEFAULT true,
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Ensure id is 1 constraint for single-row settings table
INSERT INTO public.restaurant_settings (id)
VALUES (1)
ON CONFLICT (id) DO NOTHING;

-- 5. GRANT SCHEMA & TABLE PRIVILEGES
GRANT USAGE ON SCHEMA public TO anon, authenticated;

-- Public can SELECT
GRANT SELECT ON public.categories TO anon, authenticated;
GRANT SELECT ON public.menu_items TO anon, authenticated;
GRANT SELECT ON public.gallery_items TO anon, authenticated;
GRANT SELECT ON public.restaurant_settings TO anon, authenticated;

-- Authenticated admin users can INSERT, UPDATE, DELETE
GRANT INSERT, UPDATE, DELETE ON public.categories TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.menu_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.gallery_items TO authenticated;
GRANT INSERT, UPDATE, DELETE ON public.restaurant_settings TO authenticated;

-- 6. ROW LEVEL SECURITY (RLS) POLICIES
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.menu_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.gallery_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.restaurant_settings ENABLE ROW LEVEL SECURITY;

-- Clean up any existing policies
DROP POLICY IF EXISTS "Public select categories" ON public.categories;
DROP POLICY IF EXISTS "Public mutate categories" ON public.categories;
DROP POLICY IF EXISTS "Public read categories" ON public.categories;
DROP POLICY IF EXISTS "Public write categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public read categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated admin write categories" ON public.categories;
DROP POLICY IF EXISTS "Allow public select categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated insert categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated update categories" ON public.categories;
DROP POLICY IF EXISTS "Allow authenticated delete categories" ON public.categories;

DROP POLICY IF EXISTS "Public select menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Public mutate menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Public read menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Public write menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow public read menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated admin write menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow public select menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated insert menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated update menu_items" ON public.menu_items;
DROP POLICY IF EXISTS "Allow authenticated delete menu_items" ON public.menu_items;

DROP POLICY IF EXISTS "Public select gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Public mutate gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Public read gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Public write gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Allow public read gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Allow authenticated admin write gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Allow public select gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Allow authenticated insert gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Allow authenticated update gallery_items" ON public.gallery_items;
DROP POLICY IF EXISTS "Allow authenticated delete gallery_items" ON public.gallery_items;

DROP POLICY IF EXISTS "Public select restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Public mutate restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Public read restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Public write restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Allow public read restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Allow authenticated admin write restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Allow public select restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Allow authenticated insert restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Allow authenticated update restaurant_settings" ON public.restaurant_settings;
DROP POLICY IF EXISTS "Allow authenticated delete restaurant_settings" ON public.restaurant_settings;

-- ── Categories Policies ──
-- Public can only SELECT
CREATE POLICY "Allow public select categories"
  ON public.categories FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated admins can INSERT
CREATE POLICY "Allow authenticated insert categories"
  ON public.categories FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated admins can UPDATE
CREATE POLICY "Allow authenticated update categories"
  ON public.categories FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can DELETE
CREATE POLICY "Allow authenticated delete categories"
  ON public.categories FOR DELETE
  TO authenticated
  USING (true);

-- ── Menu Items Policies ──
-- Public can only SELECT
CREATE POLICY "Allow public select menu_items"
  ON public.menu_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated admins can INSERT
CREATE POLICY "Allow authenticated insert menu_items"
  ON public.menu_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated admins can UPDATE
CREATE POLICY "Allow authenticated update menu_items"
  ON public.menu_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can DELETE
CREATE POLICY "Allow authenticated delete menu_items"
  ON public.menu_items FOR DELETE
  TO authenticated
  USING (true);

-- ── Gallery Items Policies ──
-- Public can only SELECT
CREATE POLICY "Allow public select gallery_items"
  ON public.gallery_items FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated admins can INSERT
CREATE POLICY "Allow authenticated insert gallery_items"
  ON public.gallery_items FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated admins can UPDATE
CREATE POLICY "Allow authenticated update gallery_items"
  ON public.gallery_items FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can DELETE
CREATE POLICY "Allow authenticated delete gallery_items"
  ON public.gallery_items FOR DELETE
  TO authenticated
  USING (true);

-- ── Restaurant Settings Policies ──
-- Public can only SELECT
CREATE POLICY "Allow public select restaurant_settings"
  ON public.restaurant_settings FOR SELECT
  TO anon, authenticated
  USING (true);

-- Authenticated admins can INSERT
CREATE POLICY "Allow authenticated insert restaurant_settings"
  ON public.restaurant_settings FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Authenticated admins can UPDATE
CREATE POLICY "Allow authenticated update restaurant_settings"
  ON public.restaurant_settings FOR UPDATE
  TO authenticated
  USING (true)
  WITH CHECK (true);

-- Authenticated admins can DELETE
CREATE POLICY "Allow authenticated delete restaurant_settings"
  ON public.restaurant_settings FOR DELETE
  TO authenticated
  USING (true);

-- 7. STORAGE BUCKET & POLICIES FOR restaurant-images
INSERT INTO storage.buckets (id, name, public)
VALUES ('restaurant-images', 'restaurant-images', true)
ON CONFLICT (id) DO UPDATE SET public = true;

DROP POLICY IF EXISTS "Public read restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Public insert restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Public update restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Public delete restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public read restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated write restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated update restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated delete restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow public select restaurant-images" ON storage.objects;
DROP POLICY IF EXISTS "Allow authenticated insert restaurant-images" ON storage.objects;

-- Public can view/download images
CREATE POLICY "Allow public select restaurant-images"
  ON storage.objects FOR SELECT
  TO anon, authenticated
  USING (bucket_id = 'restaurant-images');

-- Authenticated admins can upload new images
CREATE POLICY "Allow authenticated insert restaurant-images"
  ON storage.objects FOR INSERT
  TO authenticated
  WITH CHECK (bucket_id = 'restaurant-images');

-- Authenticated admins can update images
CREATE POLICY "Allow authenticated update restaurant-images"
  ON storage.objects FOR UPDATE
  TO authenticated
  USING (bucket_id = 'restaurant-images');

-- Authenticated admins can delete images
CREATE POLICY "Allow authenticated delete restaurant-images"
  ON storage.objects FOR DELETE
  TO authenticated
  USING (bucket_id = 'restaurant-images');
