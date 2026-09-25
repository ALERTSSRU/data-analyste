/**
 * Admin form → Supabase payload mapping.
 *
 * The admin dashboard forms are generic (one modal for every table), so the
 * mapping from raw form fields to real database columns lives here instead of
 * being scattered inside the page component. Every property produced below
 * MUST exist in `supabase/schema.sql` — that file is the source of truth.
 *
 * Why this module exists: the previous inline mapping posted columns that do
 * not exist (`period`, `date`, `duration`, `category` on skills…), which made
 * every insert/update fail with a PostgREST "column does not exist" error.
 */

export const CRUD_TABLES = [
  'projects',
  'experiences',
  'education',
  'skills',
  'certifications',
  'metrics',
] as const;

export type CrudTable = (typeof CRUD_TABLES)[number];

export type AdminPayload = Record<string, unknown>;

export type AdminMediaState = {
  /** Main cover image URL (uploaded or pasted) for projects. */
  imageUrl?: string;
  /** Gallery URLs for projects. */
  screenshots?: string[];
};

export function isCrudTable(tab: string): tab is CrudTable {
  return (CRUD_TABLES as readonly string[]).includes(tab);
}

/** URL-safe slug: strips accents, punctuation and collapses separators. */
export function slugify(value: string): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 72);
}

function readString(form: FormData, key: string): string {
  const value = form.get(key);
  return typeof value === 'string' ? value.trim() : '';
}

function optional(form: FormData, key: string): string | null {
  const value = readString(form, key);
  return value === '' ? null : value;
}

function required(form: FormData, key: string, label: string): string {
  const value = readString(form, key);
  if (!value) throw new Error(`${label} est obligatoire.`);
  return value;
}

function isChecked(form: FormData, key: string): boolean {
  const value = form.get(key);
  return value === 'on' || value === 'true';
}

/** "a, b, c" → ['a','b','c'] */
function readList(form: FormData, key: string): string[] {
  return readString(form, key)
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean);
}

function ensureUniqueSlug(form: FormData, key: string, fallbackSource: string): string {
  const slug = slugify(readString(form, key) || fallbackSource);
  // A unique slug is enforced by the database; keep a stable suffix fallback
  // so a fully non-latin title can never insert an empty slug.
  return slug || `item-${Date.now()}`;
}

/** `certifications.issue_date` is a real `date` column: it needs ISO input. */
function readIsoDate(form: FormData, key: string, label: string): string | null {
  const value = readString(form, key);
  if (!value) return null;
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  if (/^\d{4}-\d{2}$/.test(value)) return `${value}-01`;
  if (/^\d{4}$/.test(value)) return `${value}-01-01`;
  throw new Error(`${label} invalide : format attendu AAAA-MM-JJ.`);
}

/**
 * Builds the exact payload accepted by the target Supabase table.
 * Throws an `Error` with a user facing message when a required field is missing.
 */
export function buildAdminPayload(
  table: CrudTable,
  form: FormData,
  media: AdminMediaState = {}
): AdminPayload {
  switch (table) {
    case 'projects':
      return {
        title: required(form, 'title', 'Le titre du projet'),
        slug: ensureUniqueSlug(form, 'slug', readString(form, 'title')),
        category: optional(form, 'category'),
        // `summary` is the short text shown on project cards, `content` the full
        // case study rendered as "Contexte" on the detail page.
        description:
          readString(form, 'summary') || readString(form, 'description') || required(form, 'title', 'Le titre du projet'),
        content: optional(form, 'content'),
        tech_details: readList(form, 'tech_details'),
        metrics: readList(form, 'metrics'),
        github_url: optional(form, 'github_url'),
        live_url: optional(form, 'live_url'),
        image_url: media.imageUrl?.trim() || null,
        screenshots: (media.screenshots ?? []).filter((url) => url && url.trim() !== ''),
        is_published: isChecked(form, 'is_published'),
      };

    case 'experiences':
      return {
        company: required(form, 'company', "L'entreprise"),
        position: required(form, 'position', 'Le poste'),
        slug: ensureUniqueSlug(
          form,
          'slug',
          `${readString(form, 'company')}-${readString(form, 'position')}`
        ),
        start_date: required(form, 'start_date', 'La date de début'),
        end_date: optional(form, 'end_date'),
        is_current: isChecked(form, 'is_current'),
        description: optional(form, 'description'),
      };

    case 'education':
      return {
        school_name: required(form, 'school_name', "L'établissement"),
        degree: required(form, 'degree', 'Le diplôme'),
        field_of_study: optional(form, 'field_of_study'),
        start_date: required(form, 'start_date', 'La date de début'),
        end_date: optional(form, 'end_date'),
        is_current: isChecked(form, 'is_current'),
        description: optional(form, 'description'),
      };

    case 'skills':
      return {
        name: required(form, 'name', 'Le nom de la compétence'),
        category_id: optional(form, 'category_id'),
      };

    case 'certifications':
      return {
        title: required(form, 'title', 'Le titre de la certification'),
        issuer: required(form, 'issuer', "L'organisme émetteur"),
        platform_name: optional(form, 'platform_name'),
        issue_date: readIsoDate(form, 'issue_date', "La date d'obtention"),
        duration_label: optional(form, 'duration_label'),
        credential_url: optional(form, 'credential_url'),
        description: optional(form, 'description'),
        is_featured: isChecked(form, 'is_featured'),
      };

    case 'metrics':
      return {
        label: required(form, 'label', 'L’intitulé de la métrique'),
        value: required(form, 'value', 'La valeur de la métrique'),
        change: optional(form, 'change'),
        description: optional(form, 'description'),
        icon_type: readString(form, 'icon_type') || 'database',
        sort_order: Number.parseInt(readString(form, 'sort_order'), 10) || 0,
      };
  }
}

/** Comma separated list → display string, used to prefill the edit form. */
export function listToInput(value: unknown): string {
  if (!Array.isArray(value)) return '';
  return value
    .map((entry) => (typeof entry === 'string' ? entry : ''))
    .filter(Boolean)
    .join(', ');
}
