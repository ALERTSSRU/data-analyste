-- =========================================================
-- Portfolio Data Analysis - Supabase schema (source of truth)
-- Compatible with the application code in lib/portfolio.ts
-- and the admin payloads in app/admin/page.tsx.
--
-- This file is idempotent: it can be re-run on an existing
-- project to apply migrations (missing columns, policies,
-- storage bucket, indexes, triggers).
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
  status_label_en text,
  bio text,
  bio_en text,
  email text,
  phone text,
  location text,
  linkedin_url text,
  github_url text,
  website_url text
);

alter table public.profiles add column if not exists status_label_en text;

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
  -- Short summary shown on cards (mapped to PortfolioProject.summary)
  description text not null,
  -- Long form case study shown as "Contexte" (mapped to PortfolioProject.story)
  content text,
  -- Card filter / dashboard grouping (mapped to PortfolioProject.category)
  category text,
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
  -- Comma separated stack written by the admin (mapped to PortfolioProject.stack)
  tech_details jsonb default '[]'::jsonb,
  -- Key indicators / results (mapped to PortfolioProject.metrics)
  metrics jsonb default '[]'::jsonb,
  screenshots jsonb default '[]'::jsonb
);

-- Migration for databases created before `category` / `metrics` existed.
alter table public.projects add column if not exists category text;
alter table public.projects add column if not exists metrics jsonb default '[]'::jsonb;

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
-- 8. METRICS - KPIs for Data Analytics Dashboard
-- =========================================================
create table if not exists public.metrics (
  id uuid primary key default uuid_generate_v4(),
  label text not null,
  value text not null,
  change text,
  description text,
  icon_type text default 'database',
  sort_order integer default 0,
  is_featured boolean not null default true,
  created_at timestamptz not null default timezone('utc'::text, now())
);

alter table public.metrics enable row level security;

-- =========================================================
-- 9. UPDATED_AT TRIGGER
-- =========================================================
create or replace function public.set_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = timezone('utc'::text, now());
  return new;
end;
$$;

drop trigger if exists trg_projects_updated_at on public.projects;
create trigger trg_projects_updated_at
  before update on public.projects
  for each row execute function public.set_updated_at();

-- =========================================================
-- 10. INDEXES
-- =========================================================
create index if not exists idx_projects_slug on public.projects(slug);
create index if not exists idx_projects_category on public.projects(category);
create index if not exists idx_projects_published on public.projects(is_published);
create index if not exists idx_experiences_slug on public.experiences(slug);
create index if not exists idx_experiences_start_date on public.experiences(start_date desc);
create index if not exists idx_skills_category on public.skills(category_id);
create index if not exists idx_project_skills_skill on public.project_skills(skill_id);
create index if not exists idx_project_tech_project on public.project_tech(project_id);
create index if not exists idx_certifications_featured on public.certifications(is_featured);
create index if not exists idx_certifications_issue_date on public.certifications(issue_date);
create index if not exists idx_metrics_featured on public.metrics(is_featured);
create index if not exists idx_metrics_sort on public.metrics(sort_order);

-- =========================================================
-- 11. GRANTS
-- Supabase grants these by default; kept explicit so the file
-- also works on a bare PostgreSQL instance.
-- =========================================================
grant usage on schema public to anon, authenticated;

grant select on
  public.profiles,
  public.categories,
  public.skills,
  public.projects,
  public.project_skills,
  public.tech_catalog,
  public.project_tech,
  public.experiences,
  public.education,
  public.certifications,
  public.certification_skills,
  public.training_platforms,
  public.metrics
to anon, authenticated;

grant insert, update, delete on
  public.profiles,
  public.categories,
  public.skills,
  public.projects,
  public.project_skills,
  public.tech_catalog,
  public.project_tech,
  public.experiences,
  public.education,
  public.certifications,
  public.certification_skills,
  public.training_platforms,
  public.metrics
to authenticated;

-- =========================================================
-- 12. ROW LEVEL SECURITY POLICIES
-- Public visitors can read the published portfolio.
-- Only authenticated admins can write.
-- =========================================================

-- ---- Public read -------------------------------------------------
drop policy if exists "Public read profiles" on public.profiles;
create policy "Public read profiles"
  on public.profiles for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read categories" on public.categories;
create policy "Public read categories"
  on public.categories for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read skills" on public.skills;
create policy "Public read skills"
  on public.skills for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read published projects" on public.projects;
create policy "Public read published projects"
  on public.projects for select
  to anon, authenticated
  using (is_published or auth.role() = 'authenticated');

drop policy if exists "Public read project skills" on public.project_skills;
create policy "Public read project skills"
  on public.project_skills for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read tech catalog" on public.tech_catalog;
create policy "Public read tech catalog"
  on public.tech_catalog for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read project tech" on public.project_tech;
create policy "Public read project tech"
  on public.project_tech for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read experiences" on public.experiences;
create policy "Public read experiences"
  on public.experiences for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read education" on public.education;
create policy "Public read education"
  on public.education for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read certifications" on public.certifications;
create policy "Public read certifications"
  on public.certifications for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read certification skills" on public.certification_skills;
create policy "Public read certification skills"
  on public.certification_skills for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read training platforms" on public.training_platforms;
create policy "Public read training platforms"
  on public.training_platforms for select
  to anon, authenticated
  using (true);

drop policy if exists "Public read metrics" on public.metrics;
create policy "Public read metrics"
  on public.metrics for select
  to anon, authenticated
  using (true);

-- ---- Admin write -------------------------------------------------
drop policy if exists "Admin write profiles" on public.profiles;
create policy "Admin write profiles"
  on public.profiles for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write categories" on public.categories;
create policy "Admin write categories"
  on public.categories for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write skills" on public.skills;
create policy "Admin write skills"
  on public.skills for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write projects" on public.projects;
create policy "Admin write projects"
  on public.projects for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write project skills" on public.project_skills;
create policy "Admin write project skills"
  on public.project_skills for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write tech catalog" on public.tech_catalog;
create policy "Admin write tech catalog"
  on public.tech_catalog for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write project tech" on public.project_tech;
create policy "Admin write project tech"
  on public.project_tech for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write experiences" on public.experiences;
create policy "Admin write experiences"
  on public.experiences for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write education" on public.education;
create policy "Admin write education"
  on public.education for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write certifications" on public.certifications;
create policy "Admin write certifications"
  on public.certifications for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write certification skills" on public.certification_skills;
create policy "Admin write certification skills"
  on public.certification_skills for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write training platforms" on public.training_platforms;
create policy "Admin write training platforms"
  on public.training_platforms for all
  to authenticated
  using (true) with check (true);

drop policy if exists "Admin write metrics" on public.metrics;
create policy "Admin write metrics"
  on public.metrics for all
  to authenticated
  using (true) with check (true);

-- =========================================================
-- 13. STORAGE - media bucket used by lib/upload.ts
-- =========================================================
insert into storage.buckets (id, name, public)
values ('portfolio-media', 'portfolio-media', true)
on conflict (id) do nothing;

drop policy if exists "Public read portfolio-media" on storage.objects;
create policy "Public read portfolio-media"
  on storage.objects for select
  to anon, authenticated
  using (bucket_id = 'portfolio-media');

drop policy if exists "Admin upload portfolio-media" on storage.objects;
create policy "Admin upload portfolio-media"
  on storage.objects for insert
  to authenticated
  with check (bucket_id = 'portfolio-media');

drop policy if exists "Admin update portfolio-media" on storage.objects;
create policy "Admin update portfolio-media"
  on storage.objects for update
  to authenticated
  using (bucket_id = 'portfolio-media') with check (bucket_id = 'portfolio-media');

drop policy if exists "Admin delete portfolio-media" on storage.objects;
create policy "Admin delete portfolio-media"
  on storage.objects for delete
  to authenticated
  using (bucket_id = 'portfolio-media');

-- =========================================================
-- 14. FIRST ADMIN PROFILE
-- After creating the admin user in Authentication > Users, run:
--
--   insert into public.profiles (id, full_name, status_label, email)
--   select id, 'Your Name', 'Data Analyst • Full Stack Developer', email
--   from auth.users
--   where email = 'you@example.com'
--   on conflict (id) do nothing;
-- =========================================================

-- =========================================================
-- END
-- =========================================================
