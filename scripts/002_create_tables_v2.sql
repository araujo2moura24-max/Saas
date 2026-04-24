-- ===========================================
-- OpsCore SaaS - Database Setup v2
-- Fixed column names to match application code
-- ===========================================

-- 1. PROFILES TABLE (extends auth.users)
-- ===========================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL DEFAULT '',
  company_name TEXT,
  phone TEXT,
  document TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "profiles_select_own" ON public.profiles 
  FOR SELECT USING (auth.uid() = id);
CREATE POLICY "profiles_insert_own" ON public.profiles 
  FOR INSERT WITH CHECK (auth.uid() = id);
CREATE POLICY "profiles_update_own" ON public.profiles 
  FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "profiles_delete_own" ON public.profiles 
  FOR DELETE USING (auth.uid() = id);

-- 2. ONBOARDING TABLE
-- Columns match app code: goals, team_size, business_type, current_step
-- ===========================================
CREATE TABLE IF NOT EXISTS public.onboarding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID UNIQUE NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  goals TEXT[] DEFAULT '{}',
  team_size TEXT,
  business_type TEXT,
  current_step INTEGER DEFAULT 1,
  completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.onboarding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "onboarding_select_own" ON public.onboarding 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "onboarding_insert_own" ON public.onboarding 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "onboarding_update_own" ON public.onboarding 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "onboarding_delete_own" ON public.onboarding 
  FOR DELETE USING (auth.uid() = user_id);

-- 3. LEADS TABLE (CRM)
-- Status values in English to match app code: new, contacted, qualified, proposal, won, lost
-- ===========================================
CREATE TABLE IF NOT EXISTS public.leads (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT,
  status TEXT DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;

CREATE POLICY "leads_select_own" ON public.leads 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "leads_insert_own" ON public.leads 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "leads_update_own" ON public.leads 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "leads_delete_own" ON public.leads 
  FOR DELETE USING (auth.uid() = user_id);

-- 4. TASKS TABLE (Operations)
-- Status/priority values in English to match app code: pending, in_progress, completed / low, medium, high
-- ===========================================
CREATE TABLE IF NOT EXISTS public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'in_progress', 'completed')),
  priority TEXT DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  due_date DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;

CREATE POLICY "tasks_select_own" ON public.tasks 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "tasks_insert_own" ON public.tasks 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "tasks_update_own" ON public.tasks 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "tasks_delete_own" ON public.tasks 
  FOR DELETE USING (auth.uid() = user_id);

-- 5. FINANCES TABLE
-- ===========================================
CREATE TABLE IF NOT EXISTS public.finances (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('income', 'expense')),
  description TEXT NOT NULL,
  amount NUMERIC(12,2) NOT NULL DEFAULT 0,
  category TEXT NOT NULL DEFAULT 'outros',
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

ALTER TABLE public.finances ENABLE ROW LEVEL SECURITY;

CREATE POLICY "finances_select_own" ON public.finances 
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "finances_insert_own" ON public.finances 
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "finances_update_own" ON public.finances 
  FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "finances_delete_own" ON public.finances 
  FOR DELETE USING (auth.uid() = user_id);

-- ===========================================
-- INDEXES for performance
-- ===========================================
CREATE INDEX IF NOT EXISTS idx_onboarding_user_id ON public.onboarding(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_user_id ON public.leads(user_id);
CREATE INDEX IF NOT EXISTS idx_leads_status ON public.leads(status);
CREATE INDEX IF NOT EXISTS idx_tasks_user_id ON public.tasks(user_id);
CREATE INDEX IF NOT EXISTS idx_tasks_status ON public.tasks(status);
CREATE INDEX IF NOT EXISTS idx_finances_user_id ON public.finances(user_id);
CREATE INDEX IF NOT EXISTS idx_finances_type ON public.finances(type);
CREATE INDEX IF NOT EXISTS idx_finances_date ON public.finances(date);

-- ===========================================
-- TRIGGER: Auto-create profile on signup
-- ===========================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, company_name, phone, document)
  VALUES (
    NEW.id,
    COALESCE(NEW.raw_user_meta_data ->> 'full_name', ''),
    COALESCE(NEW.raw_user_meta_data ->> 'company_name', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'phone', NULL),
    COALESCE(NEW.raw_user_meta_data ->> 'document', NULL)
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();
