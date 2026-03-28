# Supabase Setup Guide for পবিত্র বানী

## ধাপ ১: Supabase প্রজেক্ট তৈরি করুন

1. https://supabase.com এ গিয়ে "New Project" এ ক্লিক করুন
2. প্রজেক্টের নাম দিন: `sacred-word`
3. Database Password সেট করুন (মনে রাখুন!)
4. Region: `Southeast Asia` (Singapore) সিলেক্ট করুন
5. "Create new project" এ ক্লিক করুন
6. প্রজেক্ট তৈরি হতে ২ মিনিট সময় লাগবে

## ধাপ ২: API Credentials কপি করুন

1. নতুন প্রজেক্টে গিয়ে **Settings** → **API** এ ক্লিক করুন
2. **Project URL** কপি করুন
3. **anon public** key কপি করুন

## ধাপ ৩: .env ফাইল আপডেট করুন

`.env` ফাইলে আপনার credentials যোগ করুন:

```env
VITE_SUPABASE_URL=https://xxxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

## ধাপ ৪: Database Schema তৈরি করুন

1. Supabase Dashboard → **SQL Editor** এ যান
2. নিচের SQL কোড কপি করে পেস্ট করুন:

```sql
-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES TABLE
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  display_name TEXT,
  avatar_url TEXT,
  preferred_version TEXT DEFAULT 'modern',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Auto-create profile on signup
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

-- SAVED VERSES TABLE
CREATE TABLE IF NOT EXISTS public.saved_verses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  reference TEXT NOT NULL,
  text TEXT NOT NULL,
  version TEXT NOT NULL DEFAULT 'modern',
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
  sync_status TEXT DEFAULT 'synced',
  UNIQUE(user_id, reference, version)
);

ALTER TABLE public.saved_verses ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own verses" ON public.saved_verses FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_verses_user_id ON public.saved_verses(user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_verses;

-- SAVED SNIPPETS TABLE
CREATE TABLE IF NOT EXISTS public.saved_snippets (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID REFERENCES auth.users ON DELETE CASCADE NOT NULL,
  type TEXT NOT NULL,
  content TEXT NOT NULL,
  source_reference TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  device_id TEXT,
  local_id TEXT,
  sync_status TEXT DEFAULT 'synced'
);

ALTER TABLE public.saved_snippets ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own snippets" ON public.saved_snippets FOR ALL USING (auth.uid() = user_id);

CREATE INDEX IF NOT EXISTS idx_saved_snippets_user_id ON public.saved_snippets(user_id);

ALTER PUBLICATION supabase_realtime ADD TABLE public.saved_snippets;

-- USER SETTINGS TABLE
CREATE TABLE IF NOT EXISTS public.user_settings (
  user_id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  theme TEXT DEFAULT 'dark',
  font_size TEXT DEFAULT 'base',
  font_family TEXT DEFAULT 'SolaimanLipi',
  language_version TEXT DEFAULT 'modern',
  app_lang TEXT DEFAULT 'bn',
  auto_sync BOOLEAN DEFAULT TRUE,
  sync_frequency TEXT DEFAULT 'realtime',
  last_sync_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.user_settings ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can access own settings" ON public.user_settings FOR ALL USING (auth.uid() = user_id);

-- Enable realtime
ALTER DATABASE postgres SET wal_level = 'logical';
```

3. **Run** বাটনে ক্লিক করুন

## ধাপ ৫: Google OAuth সেটআপ (Optional)

1. https://console.cloud.google.com এ গিয়ে প্রজেক্ট তৈরি করুন
2. **APIs & Services** → **Credentials** → **Create Credentials** → **OAuth client ID**
3. Application type: **Web application**
4. Authorized redirect URIs: `https://your-project.supabase.co/auth/v1/callback`
5. **Client ID** এবং **Client Secret** কপি করুন

Supabase Dashboard:
6. **Authentication** → **Providers** → **Google** → Enable করুন
7. Client ID এবং Client Secret পেস্ট করুন

## ধাপ ৬: Authentication Settings

1. **Authentication** → **Settings**
2. **Site URL**: `http://localhost:3000` (dev) / আপনার ডোমেইন (production)
3. **Redirect URLs**: আপনার ডোমেইন যোগ করুন
4. **Allow new users to sign up**: Enabled

## ধাপ ৭: অ্যাপ রান করুন

```bash
npm run dev
```

এখন Login বাটনে ক্লিক করলে Supabase authentication কাজ করবে!

## সমস্যা সমাধান

### "Supabase is not configured" error
→ .env ফাইলে VITE_SUPABASE_URL এবং VITE_SUPABASE_ANON_KEY সঠিকভাবে যোগ করুন

### "Database error"
→ SQL স্ক্রিপ্ট সঠিকভাবে রান হয়েছে কিনা দেখুন

### Google login কাজ করছে না
→ Google OAuth credentials সঠিক কিনা এবং Redirect URL মেলে কিনা দেখুন
