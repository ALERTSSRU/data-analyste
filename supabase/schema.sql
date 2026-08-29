-- =========================================================
-- Portfolio Data Analysis - Supabase schema
-- Compatible with the project architecture described in
-- PORTFOLIO_SPEC_DATA_ANALYSIS.md
-- =========================================================

create extension if not exists "uuid-ossp";

-- =========================================================
-- 1. PROFILE
-- =========================================================
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  avatar_url text,
  created_at timestamptz not null default timezone('utc'::text, now()),
  motto text,
  motto_en text,
  status_label text,
  bio text,
  bio_en text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  website_url text,
  samurai1_url text,
  samurai2_url text
);

alter table public.profiles enable row level security;

-- =========================================================
-- 2. CATEGORIES / SKILLS
-- =========================================================
create table if not exists public.categories (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  slug text not null unique,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.categories enable row level security;

create table if not exists public.skills (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  name_en text,
  icon_url text,
  category_id uuid references public.categories(id) on delete set null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.skills enable row level security;

-- =========================================================
-- 3. PROJECTS + TECHNOLOGIES
-- =========================================================
create table if not exists public.projects (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  slug text not null unique,
  description text not null,
  content text,
  image_url text,
  github_url text,
  live_url text,
  is_published boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  updated_at timestamptz not null default timezone('utc'::text, now()),
  title_en text,
  description_en text,
  content_en text,
  collaborators jsonb default '[]'::jsonb,
  tech_details jsonb default '[]'::jsonb,
  screenshots jsonb default '[]'::jsonb
);

alter table public.projects enable row level security;

create table if not exists public.project_skills (
  project_id uuid not null references public.projects(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (project_id, skill_id)
);

alter table public.project_skills enable row level security;

create table if not exists public.tech_catalog (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  icon_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.tech_catalog enable row level security;

create table if not exists public.project_tech (
  id uuid primary key default uuid_generate_v4(),
  project_id uuid references public.projects(id) on delete cascade,
  tech_id uuid references public.tech_catalog(id) on delete cascade,
  category_label text not null,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.project_tech enable row level security;

-- =========================================================
-- 4. EXPERIENCES
-- =========================================================
create table if not exists public.experiences (
  id uuid primary key default uuid_generate_v4(),
  company text not null,
  position text not null,
  start_date text not null,
  end_date text,
  description text,
  is_current boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now()),
  position_en text,
  description_en text,
  company_en text,
  slug text not null unique,
  content text,
  content_en text
);

alter table public.experiences enable row level security;

-- =========================================================
-- 5. EDUCATION
-- =========================================================
create table if not exists public.education (
  id uuid primary key default uuid_generate_v4(),
  school_name text not null,
  degree text not null,
  field_of_study text,
  start_date text not null,
  end_date text,
  description text,
  is_current boolean default false,
  school_name_en text,
  degree_en text,
  field_of_study_en text,
  description_en text,
  created_at timestamptz default timezone('utc'::text, now())
);

alter table public.education enable row level security;

-- =========================================================
-- 6. CERTIFICATIONS / FORMATIONS
-- This is the improvement added to reflect professional
-- credentials, bootcamps, online courses, and proof of skills.
-- =========================================================
create table if not exists public.certifications (
  id uuid primary key default uuid_generate_v4(),
  title text not null,
  issuer text not null,
  platform_name text,
  issue_date date,
  expiry_date date,
  duration_label text,
  credential_id text,
  credential_url text,
  certificate_image_url text,
  description text,
  description_en text,
  is_featured boolean not null default false,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.certifications enable row level security;

create table if not exists public.certification_skills (
  certification_id uuid not null references public.certifications(id) on delete cascade,
  skill_id uuid not null references public.skills(id) on delete cascade,
  primary key (certification_id, skill_id)
);

alter table public.certification_skills enable row level security;

-- =========================================================
-- 7. OPTIONAL PLATFORM CATALOG
-- Useful if you want to reuse training providers/platforms.
-- =========================================================
create table if not exists public.training_platforms (
  id uuid primary key default uuid_generate_v4(),
  name text not null unique,
  logo_url text,
  website_url text,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.training_platforms enable row level security;

-- =========================================================
-- 8. INDEXES
-- =========================================================
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_experiences_slug on public.experiences(slug);
create index if not exists idx_skills_category on public.skills(category_id);
create index if not exists idx_project_skills_skill on public.project_skills(skill_id);
create index if not exists idx_project_tech_project on public.project_tech(project_id);
create index if not exists idx_certifications_featured on public.certifications(is_featured);
create index if not exists idx_certifications_issue_date on public.certifications(issue_date);

-- =========================================================
-- 9. SAMPLE SECURITY EXAMPLE
-- For admin access, the service role or authenticated users can be
-- granted access through policies in Supabase.
-- =========================================================

-- Example starter policies:
-- create policy "Allow authenticated users to read profiles"
-- on public.profiles for select
-- using (true);
--
-- create policy "Allow authenticated users to manage projects"
-- on public.projects for all
-- using (auth.role() = 'authenticated')
-- with check (auth.role() = 'authenticated');

-- =========================================================
-- END
-- =========================================================
