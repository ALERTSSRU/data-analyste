import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

export const supabase =
  supabaseUrl && supabaseAnonKey ? createClient(supabaseUrl, supabaseAnonKey) : null;

export type PortfolioProject = {
  id?: string;
  slug: string;
  title: string;
  category: string;
  summary: string;
  description?: string;
  story?: string;
  metrics?: string[];
  stack?: string[];
  image_url?: string | null;
  github_url?: string | null;
  live_url?: string | null;
  is_published?: boolean;
  created_at?: string;
  screenshots?: string[];
};

export type PortfolioExperience = {
  id?: string;
  company: string;
  position: string;
  period: string;
  description: string;
  slug?: string;
  is_current?: boolean;
};

export type PortfolioEducation = {
  id?: string;
  school_name: string;
  degree: string;
  field_of_study?: string | null;
  period: string;
  description?: string | null;
  is_current?: boolean;
};

export type PortfolioCertification = {
  id?: string;
  title: string;
  issuer: string;
  date: string;
  duration: string;
  description: string;
};

export type PortfolioSkill = {
  id?: string;
  name: string;
  category?: string | null;
};

export type PortfolioProfile = {
  full_name: string;
  role: string;
  intro: string;
  bio: string;
  location?: string | null;
  email?: string | null;
  linkedin_url?: string | null;
  github_url?: string | null;
  website_url?: string | null;
};

const fallbackProfile: PortfolioProfile = {
  full_name: 'Alexandre',
  role: 'Data Analyst • Full Stack Developer',
  intro:
    'Je conçois des produits data, des dashboards et des interfaces qui rendent l’information actionnable.',
  bio: 'Analyse, modélisation et delivery full stack, du pipeline jusqu’à l’écran métier.',
  location: 'France',
  email: 'hello@example.com',
  linkedin_url: 'https://www.linkedin.com',
  github_url: 'https://github.com',
  website_url: '#',
};

const fallbackProjects: PortfolioProject[] = [
  {
    slug: 'customer-intelligence-hub',
    title: 'Customer Intelligence Hub',
    category: 'Business Intelligence',
    summary: 'Dashboard centralisé pour transformer des données transactionnelles en insights marketing.',
    description: 'Dashboard centralisé pour transformer des données transactionnelles en insights marketing.',
    story: 'Centralisation de sources clients pour un reporting marketing, sales et produit.',
    metrics: ['+31% conversion', '4 sources unifiées'],
    stack: ['SQL', 'Power BI', 'Python'],
  },
  {
    slug: 'supply-chain-signal',
    title: 'Supply Chain Signal',
    category: 'Operations analytics',
    summary: 'Monitoring des flux, anomalies et performance logistique.',
    description: 'Monitoring des flux, anomalies et performance logistique.',
    story: 'Identifier rapidement les écarts et retards dans la chaîne logistique.',
    metrics: ['-18% pertes', '72h monitoring'],
    stack: ['SQL', 'Python', 'Automation'],
  },
  {
    slug: 'forecast-decision-layer',
    title: 'Forecast Decision Layer',
    category: 'Decision support',
    summary: 'Forecasting couplé à une interface decision-ready.',
    description: 'Forecasting couplé à une interface decision-ready.',
    story: 'Intégrer une logique prédictive dans le pilotage de l’offre.',
    metrics: ['+24% précision', '3 scénarios'],
    stack: ['Data modeling', 'Analytics'],
  },
];

const fallbackExperiences: PortfolioExperience[] = [
  {
    company: 'Banque',
    position: 'Data Analyst',
    period: '2024 — Aujourd’hui',
    description:
      'Reporting, qualité de données et tableaux de bord pour le pilotage d’activité.',
    slug: 'banque-data-analyst',
    is_current: true,
  },
  {
    company: 'Projets indépendants',
    position: 'Data Analyst / Full Stack',
    period: '2023 — 2024',
    description: 'Dashboards, pipelines et interfaces orientées décision.',
    slug: 'projets-independants',
  },
];

const fallbackEducation: PortfolioEducation[] = [
  {
    school_name: 'Université / École',
    degree: 'Licence / Bachelor',
    field_of_study: 'Data & Informatique',
    period: '2021 — 2024',
    description: 'Analyse de données, SQL, statistique et outils d’aide à la décision.',
  },
];

const fallbackCertifications: PortfolioCertification[] = [
  {
    title: 'Data Analysis Professional Track',
    issuer: 'Coursera',
    date: '2024',
    duration: '6 semaines',
    description: 'KPI, dashboarding et interprétation métier.',
  },
];

const fallbackSkills: PortfolioSkill[] = [
  { name: 'SQL' },
  { name: 'Python' },
  { name: 'Power BI' },
  { name: 'ETL' },
  { name: 'Next.js' },
  { name: 'Supabase' },
];

function asTextList(value: unknown): string[] {
  if (!Array.isArray(value)) return [];
  return value
    .map((entry) => {
      if (typeof entry === 'string') return entry;
      if (entry && typeof entry === 'object') {
        const record = entry as Record<string, unknown>;
        return String(record.name ?? record.label ?? record.value ?? '');
      }
      return String(entry);
    })
    .filter(Boolean);
}

function formatPeriod(start?: string | null, end?: string | null, isCurrent?: boolean) {
  if (!start && !end) return '';
  if (isCurrent || !end) return `${start ?? ''} — Aujourd’hui`.replace(/^ —/, '').trim();
  return `${start} — ${end}`;
}

/** Sanitize slug: strip full URLs accidentally stored as slugs */
function sanitizeSlug(raw: string | undefined | null, fallbackTitle?: string): string {
  if (!raw) {
    return (fallbackTitle ?? 'projet')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
  // If it looks like a URL, extract only the hostname as the slug
  if (/^https?:\/\//i.test(raw)) {
    try {
      const url = new URL(raw);
      // use hostname without TLD or the last pathname segment
      const host = url.hostname.replace(/\.(vercel\.app|com|fr|io|net|org)$/, '').replace(/\./g, '-');
      return host || 'projet';
    } catch {
      return 'projet';
    }
  }
  // Clean any stray characters
  return raw.replace(/[^a-z0-9-_]/gi, '-').toLowerCase().replace(/^-+|-+$/g, '');
}

function mapProject(item: Record<string, any>): PortfolioProject {
  const nestedSkills = (item.project_skills ?? [])
    .map((row: any) => row?.skills?.name)
    .filter(Boolean) as string[];
  const nestedTech = (item.project_tech ?? [])
    .map((row: any) => row?.tech_catalog?.name || row?.category_label)
    .filter(Boolean) as string[];
  const details = asTextList(item.tech_details);
  const stack = [...new Set([...nestedSkills, ...nestedTech, ...details])];
  const category =
    item.project_tech?.[0]?.category_label ||
    item.project_skills?.[0]?.skills?.categories?.name ||
    stack[0] ||
    'Projet';

  return {
    id: item.id,
    slug: sanitizeSlug(item.slug, item.title),
    title: item.title,
    category,
    summary: item.description || item.content || item.title,
    description: item.description || item.content || item.title,
    story: item.content || item.description || item.title,
    metrics: details,
    stack,
    image_url: item.image_url,
    github_url: item.github_url,
    live_url: item.live_url,
    is_published: item.is_published,
    created_at: item.created_at,
    screenshots: Array.isArray(item.screenshots) ? item.screenshots : [],
  };
}

const projectSelect = `
  *,
  project_skills (
    skills (
      name,
      categories ( name )
    )
  ),
  project_tech (
    category_label,
    tech_catalog ( name )
  )
`;

export async function getProfile(): Promise<PortfolioProfile> {
  if (!supabase) return fallbackProfile;

  try {
    const { data, error } = await supabase.from('profiles').select('*').limit(1).maybeSingle();
    if (error || !data) return fallbackProfile;

    return {
      full_name: data.full_name || fallbackProfile.full_name,
      role: data.status_label || fallbackProfile.role,
      intro: data.motto || data.bio || fallbackProfile.intro,
      bio: data.bio || data.motto || fallbackProfile.bio,
      location: data.location,
      email: data.email || fallbackProfile.email,
      linkedin_url: data.linkedin_url || fallbackProfile.linkedin_url,
      github_url: data.github_url || fallbackProfile.github_url,
      website_url: data.website_url || fallbackProfile.website_url,
    };
  } catch {
    return fallbackProfile;
  }
}

export async function getProjects(): Promise<PortfolioProject[]> {
  if (!supabase) return fallbackProjects;

  try {
    const nested = await supabase
      .from('projects')
      .select(projectSelect)
      .eq('is_published', true)
      .order('created_at', { ascending: false });

    const query = nested.error
      ? await supabase.from('projects').select('*').eq('is_published', true).order('created_at', { ascending: false })
      : nested;

    if (query.error || !query.data || query.data.length === 0) return fallbackProjects;
    return query.data.map((item) => mapProject(item));
  } catch {
    return fallbackProjects;
  }
}

export async function getProjectBySlug(slug: string): Promise<PortfolioProject | null> {
  const cleanTarget = slug.toLowerCase().trim();
  if (!supabase) return fallbackProjects.find((item) => sanitizeSlug(item.slug, item.title) === cleanTarget) || null;

  try {
    // 1. Try exact match first
    const nested = await supabase.from('projects').select(projectSelect).eq('slug', cleanTarget).maybeSingle();
    if (nested.data) return mapProject(nested.data);

    // 2. Try exact match fallback query
    const fallbackQ = await supabase.from('projects').select('*').eq('slug', cleanTarget).maybeSingle();
    if (fallbackQ.data) return mapProject(fallbackQ.data);

    // 3. Fallback: load all projects and match in JS using sanitizeSlug helper
    // (This handles legacy slugs stored as full URLs in the DB)
    const { data: allData } = await supabase.from('projects').select(projectSelect);
    if (allData) {
      const matched = allData.find((item) => sanitizeSlug(item.slug, item.title) === cleanTarget);
      if (matched) return mapProject(matched);
    }

    const { data: allFallbackData } = await supabase.from('projects').select('*');
    if (allFallbackData) {
      const matched = allFallbackData.find((item) => sanitizeSlug(item.slug, item.title) === cleanTarget);
      if (matched) return mapProject(matched);
    }
  } catch (err) {
    console.error('Error in getProjectBySlug:', err);
  }

  return fallbackProjects.find((item) => sanitizeSlug(item.slug, item.title) === cleanTarget) || null;
}

export async function getExperiences(): Promise<PortfolioExperience[]> {
  if (!supabase) return fallbackExperiences;

  try {
    const { data, error } = await supabase.from('experiences').select('*').order('start_date', { ascending: false });
    if (error || !data || data.length === 0) return fallbackExperiences;

    return data.map((item) => ({
      id: item.id,
      company: item.company,
      position: item.position,
      period: formatPeriod(item.start_date, item.end_date, item.is_current),
      description: item.description || item.content || '',
      slug: item.slug,
      is_current: !!item.is_current,
    }));
  } catch {
    return fallbackExperiences;
  }
}

export async function getEducation(): Promise<PortfolioEducation[]> {
  if (!supabase) return fallbackEducation;

  try {
    const { data, error } = await supabase.from('education').select('*').order('start_date', { ascending: false });
    if (error || !data || data.length === 0) return fallbackEducation;

    return data.map((item) => ({
      id: item.id,
      school_name: item.school_name,
      degree: item.degree,
      field_of_study: item.field_of_study,
      period: formatPeriod(item.start_date, item.end_date, item.is_current),
      description: item.description,
      is_current: !!item.is_current,
    }));
  } catch {
    return fallbackEducation;
  }
}

export async function getCertifications(): Promise<PortfolioCertification[]> {
  if (!supabase) return fallbackCertifications;

  try {
    const { data, error } = await supabase.from('certifications').select('*').order('issue_date', { ascending: false });
    if (error || !data || data.length === 0) return fallbackCertifications;

    return data.map((item) => ({
      id: item.id,
      title: item.title,
      issuer: item.issuer || item.platform_name || 'Certification',
      date: item.issue_date || 'N/A',
      duration: item.duration_label || '—',
      description: item.description || '',
    }));
  } catch {
    return fallbackCertifications;
  }
}

export async function getSkills(): Promise<PortfolioSkill[]> {
  if (!supabase) return fallbackSkills;

  try {
    const { data, error } = await supabase.from('skills').select('id, name').order('name', { ascending: true });

    if (error || !data || data.length === 0) return fallbackSkills;

    return data.map((item) => ({
      id: item.id,
      name: item.name,
    }));
  } catch {
    return fallbackSkills;
  }
}

export function isBankExperience(experience: PortfolioExperience) {
  return /banque|bank|crédit|credit|finance/i.test(`${experience.company} ${experience.position}`);
}
