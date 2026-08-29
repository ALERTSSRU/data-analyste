'use client';

import type { PortfolioProject } from '@/lib/portfolio';
import Link from 'next/link';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function ProjectsPageClient({ projects }: { projects: PortfolioProject[] }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-7xl px-6 pb-20 pt-32 text-slate-100">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          {t.sections.projects_label}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
          {t.sections.projects_heading}
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group glass-panel rounded-[26px] border border-white/10 p-6 transition hover:border-cyan-400/40"
          >
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="mb-5 h-40 w-full rounded-2xl object-cover border border-white/10"
              />
            ) : (
              <div className="mb-5 h-40 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.18),transparent_25%),linear-gradient(135deg,#0f172a,#111827_55%)]" />
            )}
            <span className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">
              <Trans>{project.category}</Trans>
            </span>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              <Trans>{project.title}</Trans>
            </h2>
            <p className="mt-3 text-base leading-7 text-slate-300">
              <Trans>{project.summary}</Trans>
            </p>
            <div className="mt-6 text-sm font-medium text-cyan-300">
              {t.project_card.open} →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
