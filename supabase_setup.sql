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
