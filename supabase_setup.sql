-- Create projects table in Supabase
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    image_url TEXT,
    link TEXT,
    type TEXT CHECK (type IN ('free', 'paid')) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now(),
    author_uid TEXT
);

-- Set up Row Level Security (RLS)
ALTER TABLE public.projects ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can view projects
CREATE POLICY "Allow public read-only access" ON public.projects
    FOR SELECT USING (true);

-- Policy: Only authenticated users can insert/update/delete (or you can restrict to a specific email)
-- For now, let's allow all authenticated users for simplicity, or refine as needed.
CREATE POLICY "Allow authenticated full access" ON public.projects
    FOR ALL USING (auth.role() = 'authenticated');

-- Create settings table
CREATE TABLE IF NOT EXISTS public.settings (
    id TEXT PRIMARY KEY,
    content JSONB NOT NULL,
    updated_at TIMESTAMPTZ DEFAULT now()
);

-- Policy: Anyone can view settings
ALTER TABLE public.settings ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Allow public read-only access for settings" ON public.settings
    FOR SELECT USING (true);

-- Policy: Only authenticated users can manage settings
CREATE POLICY "Allow authenticated manage settings" ON public.settings
    FOR ALL USING (auth.role() = 'authenticated');

-- Insert default settings
INSERT INTO public.settings (id, content) VALUES ('site_config', '{
    "hero_title": "Pendidik & Digital Kreator",
    "hero_subtitle": "Membangun jembatan antara teknologi dan pendidikan untuk menciptakan masa depan yang lebih bermakna melalui inovasi digital.",
    "profile_image": "https://picsum.photos/seed/profile/400/400",
    "facebook_url": "https://facebook.com",
    "instagram_url": "https://instagram.com",
    "youtube_url": "https://youtube.com",
    "tiktok_url": "https://tiktok.com",
    "linkedin_url": "https://linkedin.com",
    "email_contact": "kpbgalimka@gmail.com"
}') ON CONFLICT (id) DO NOTHING;

