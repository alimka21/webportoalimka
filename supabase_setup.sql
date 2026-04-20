-- Create projects table in Supabase
CREATE TABLE IF NOT EXISTS public.projects (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    title TEXT NOT NULL,
    description TEXT,
    prompt_text TEXT,
    support_urls TEXT[],
    image_url TEXT,
    link TEXT,
    type TEXT CHECK (type IN ('free', 'paid')) DEFAULT 'free',
    created_at TIMESTAMPTZ DEFAULT now(),
    author_uid TEXT
);

-- Note: Because we use Firebase Auth for login (not Supabase Auth directly), 
-- the 'auth.role()' check inside Supabase will be 'anon'.
-- By disabling RLS here, we allow the React frontend to insert data freely.
-- The Admin page itself is protected by Firebase authentication in the React code.
ALTER TABLE public.projects DISABLE ROW LEVEL SECURITY;
