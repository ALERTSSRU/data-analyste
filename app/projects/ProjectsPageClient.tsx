'use client';

import type { PortfolioProject } from '@/lib/portfolio';
import Link from 'next/link';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function ProjectsPageClient({ projects }: { projects: PortfolioProject[] }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-6 pb-20 pt-24 sm:pt-32">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          {t.sections.projects_label}
        </p>
        <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.06em]" style={{ color: 'var(--foreground)' }}>
          {t.sections.projects_heading}
        </h1>
      </div>

      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {projects.map((project) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group glass-panel rounded-[24px] sm:rounded-[26px] border p-5 sm:p-6 transition hover:scale-[1.02] shadow-lg"
            style={{ borderColor: 'var(--panel-border)' }}
          >
            {project.image_url ? (
              <img
                src={project.image_url}
                alt={project.title}
                className="mb-4 sm:mb-5 h-36 sm:h-44 w-full rounded-2xl object-cover border"
                style={{ borderColor: 'var(--panel-border)' }}
              />
            ) : (
              <div className="mb-4 sm:mb-5 h-36 sm:h-44 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.18),transparent_55%),linear-gradient(135deg,#0f172a,#111827_55%)]" />
            )}
            <span className="text-[10px] uppercase tracking-[0.24em] text-cyan-300">
              <Trans>{project.category}</Trans>
            </span>
            <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              <Trans>{project.title}</Trans>
            </h2>
            <p className="mt-2 sm:mt-3 text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
              <Trans>{project.summary}</Trans>
            </p>
            <div className="mt-5 text-xs sm:text-sm font-semibold text-cyan-400">
              {t.project_card.open} →
            </div>
          </Link>
        ))}
      </div>
    </main>
  );
}
