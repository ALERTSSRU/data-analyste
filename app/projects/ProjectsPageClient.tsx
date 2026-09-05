'use client';

import type { PortfolioProject } from '@/lib/portfolio';
import Link from 'next/link';
import { useLanguage, Trans } from '@/lib/LanguageContext';
import { useMemo, useState } from 'react';

export function ProjectsPageClient({ projects }: { projects: PortfolioProject[] }) {
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState<string>('all');

  // Extract unique categories from projects
  const categories = useMemo(() => {
    const cats = new Set<string>();
    projects.forEach((p) => {
      if (p.category) cats.add(p.category);
    });
    return ['all', ...Array.from(cats)];
  }, [projects]);

  const filtered = useMemo(() => {
    if (activeFilter === 'all') return projects;
    return projects.filter((p) => p.category === activeFilter);
  }, [projects, activeFilter]);

  return (
    <main className="mx-auto max-w-7xl px-4 sm:px-8 md:px-10 pb-24 pt-28 sm:pt-36">
      <div className="mb-8 sm:mb-12">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          {t.sections.projects_label}
        </p>
        <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.06em]" style={{ color: 'var(--foreground)' }}>
          {t.sections.projects_heading}
        </h1>
      </div>

      {/* Category filter pills */}
      {categories.length > 2 && (
        <div className="mb-8 flex flex-wrap gap-2 sm:gap-3">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveFilter(cat)}
              className="rounded-full px-4 sm:px-5 py-1.5 sm:py-2 text-[11px] sm:text-xs font-semibold uppercase tracking-wider transition-all duration-300"
              style={{
                background: activeFilter === cat
                  ? 'linear-gradient(135deg, rgba(34,211,238,0.35), rgba(6,182,212,0.25))'
                  : 'var(--card-bg)',
                border: `1px solid ${activeFilter === cat ? 'rgba(34,211,238,0.6)' : 'var(--panel-border)'}`,
                color: activeFilter === cat ? '#22d3ee' : 'var(--foreground-muted)',
                boxShadow: activeFilter === cat ? '0 0 18px rgba(34,211,238,0.15)' : 'none',
                transform: activeFilter === cat ? 'scale(1.05)' : 'scale(1)',
              }}
            >
              {cat === 'all' ? 'Tous' : <Trans>{cat}</Trans>}
            </button>
          ))}
        </div>
      )}

      <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filtered.map((project, idx) => (
          <Link
            key={project.slug}
            href={`/projects/${project.slug}`}
            className="group glass-panel rounded-[24px] sm:rounded-[28px] border p-6 sm:p-7 transition-all duration-500 hover:scale-[1.02] shadow-lg flex flex-col justify-between"
            style={{
              borderColor: 'var(--panel-border)',
              animationDelay: `${idx * 60}ms`,
              opacity: 1,
            }}
          >
            <div>
              {project.image_url ? (
                <img
                  src={project.image_url}
                  alt={project.title}
                  className="mb-5 h-44 sm:h-48 w-full rounded-2xl object-cover border"
                  style={{ borderColor: 'var(--panel-border)' }}
                />
              ) : (
                <div className="mb-5 h-44 sm:h-48 rounded-2xl bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.18),transparent_55%),linear-gradient(135deg,#0f172a,#111827_55%)]" />
              )}
              <span className="text-[10px] uppercase tracking-[0.24em] text-cyan-300 font-semibold">
                <Trans>{project.category}</Trans>
              </span>
              <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                <Trans>{project.title}</Trans>
              </h2>
              <p className="mt-2 sm:mt-3 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                <Trans>{project.summary}</Trans>
              </p>
            </div>
            <div className="mt-6 text-xs sm:text-sm font-semibold text-cyan-400">
              {t.project_card.open} →
            </div>
          </Link>
        ))}
      </div>

      {filtered.length === 0 && (
        <div className="text-center py-16" style={{ color: 'var(--foreground-muted)' }}>
          <p className="text-lg">Aucun projet dans cette catégorie.</p>
        </div>
      )}
    </main>
  );
}
