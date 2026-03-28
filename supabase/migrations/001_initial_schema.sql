-- Sacred Word Database Schema for Supabase
-- Run this SQL in your Supabase SQL Editor

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- =====================================================
-- PROFILES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  preferred_version TEXT DEFAULT 'modern' CHECK (preferred_version IN ('modern', 'carey', 'kitabul')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only view their own profile
CREATE POLICY "Users can view own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can only update their own profile
CREATE POLICY "Users can update own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile (for new users)
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Auto-create profile on user signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name, avatar_url)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data->>'name', NEW.email),
    NEW.raw_user_meta_data->>'avatar_url'
  );
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- SAVED VERSES TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.saved_verses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'modern' CHECK (version IN ('modern', 'carey', 'kitabul')),
  explanation JSONB,
  prayer TEXT,
  key_themes TEXT[],
  tags TEXT[],
  personal_notes TEXT,
  is_favorite BOOLEAN DEFAULT FALSE,
  read_count INTEGER DEFAULT 0,
  last_read_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  UNIQUE(user_id, reference, version)
);

-- Enable RLS
ALTER TABLE public.saved_verses ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own verses
CREATE POLICY "Users can access own verses"
  ON public.saved_verses FOR ALL
  USING (auth.uid() = user_id);

-- Indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_saved_verses_user_id ON public.saved_verses(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_verses_reference ON public.saved_verses(reference);
CREATE INDEX IF NOT EXISTS idx_saved_verses_updated_at ON public.saved_verses(updated_at DESC);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_verses;

-- =====================================================
-- SAVED SNIPPETS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.saved_snippets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL CHECK (type IN ('insight', 'prayer', 'lyrics', 'note')),
  content TEXT NOT NULL,
  source_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced' CHECK (sync_status IN ('synced', 'pending', 'conflict')),
  UNIQUE(user_id, content, type)
);

-- Enable RLS
ALTER TABLE public.saved_snippets ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own snippets
CREATE POLICY "Users can access own snippets"
  ON public.saved_snippets FOR ALL
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_saved_snippets_user_id ON public.saved_snippets(user_id);
CREATE INDEX IF NOT EXISTS idx_saved_snippets_type ON public.saved_snippets(type);

-- Enable real-time
ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_snippets;

-- =====================================================
-- USER SETTINGS TABLE
-- =====================================================
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
  font_size TEXT DEFAULT 'base' CHECK (font_size IN ('sm', 'base', 'lg', 'xl')),
  font_family TEXT DEFAULT 'SolaimanLipi',
  language_version TEXT DEFAULT 'modern' CHECK (language_version IN ('modern', 'carey', 'kitabul')),
  app_lang TEXT DEFAULT 'bn' CHECK (app_lang IN ('bn', 'en')),
  auto_sync BOOLEAN DEFAULT TRUE,
  sync_frequency TEXT DEFAULT 'realtime' CHECK (sync_frequency IN ('realtime', '5min', 'manual')),
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own settings
CREATE POLICY "Users can access own settings"
  ON public.user_settings FOR ALL
  USING (auth.uid() = user_id);

-- Auto-create settings for new users
CREATE OR REPLACE FUNCTION public.handle_new_user_settings()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_settings (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

CREATE TRIGGER on_auth_user_created_settings
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_settings();

-- =====================================================
-- SYNC LOGS TABLE (for debugging)
-- =====================================================
CREATE TABLE IF NOT EXISTS public.sync_logs (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  device_id TEXT,
  action TEXT CHECK (action IN ('push', 'pull', 'conflict', 'merge')),
  records_count INTEGER,
  details JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.sync_logs ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own logs
CREATE POLICY "Users can access own sync logs"
  ON public.sync_logs FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: System can insert logs
CREATE POLICY "Service can insert sync logs"
  ON public.sync_logs FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Index
CREATE INDEX IF NOT EXISTS idx_sync_logs_user_id ON public.sync_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created_at ON public.sync_logs(created_at DESC);

-- =====================================================
-- CLEANUP FUNCTION
-- =====================================================
-- Function to clean up old sync logs (keep last 30 days)
CREATE OR REPLACE FUNCTION public.cleanup_old_sync_logs()
RETURNS void AS $$
BEGIN
  DELETE FROM public.sync_logs
  WHERE created_at < NOW() - INTERVAL '30 days';
END;
$$ LANGUAGE plpgsql;

-- =====================================================
-- GRANT PERMISSIONS
-- =====================================================
GRANT USAGE ON SCHEMA public TO anon;
GRANT USAGE ON SCHEMA public TO authenticated;
GRANT ALL ON ALL TABLES IN SCHEMA public TO anon;
GRANT ALL ON ALL TABLES IN SCHEMA public TO authenticated;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO anon;
GRANT ALL ON ALL SEQUENCES IN SCHEMA public TO authenticated;

-- =====================================================
-- DONE!
-- =====================================================
-- Now go to Authentication -> Providers -> Google
-- and configure your Google OAuth credentials
-- Also enable "Allow new users to sign up" in Authentication -> Settings
