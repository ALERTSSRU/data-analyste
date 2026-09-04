'use client';

import type { PortfolioProject } from '@/lib/portfolio';
import Link from 'next/link';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function ProjectDetailPageClient({ project }: { project: PortfolioProject }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 pt-24 sm:pt-32">
      <Link href="/projects" className="mb-6 sm:mb-8 inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-cyan-400 hover:underline">
        ← {t.common.back_to_projects}
      </Link>

      <div className="grid gap-6 sm:gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
            <Trans>{project.category}</Trans>
          </p>
          <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--foreground)' }}>
            <Trans>{project.title}</Trans>
          </h1>
          <p className="mt-4 sm:mt-6 max-w-xl text-base sm:text-lg leading-relaxed sm:leading-8" style={{ color: 'var(--foreground-muted)' }}>
            <Trans>{project.summary}</Trans>
          </p>
          
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="mt-6 sm:mt-8 h-48 sm:h-70 w-full rounded-[22px] sm:rounded-[28px] object-cover border shadow-lg"
              style={{ borderColor: 'var(--panel-border)' }}
            />
          ) : (
            <div className="mt-6 sm:mt-8 h-48 sm:h-70 rounded-[22px] sm:rounded-[28px] border bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.2),transparent_55%),linear-gradient(135deg,#0f172a,#0b1221_70%)]" style={{ borderColor: 'var(--panel-border)' }} />
          )}
        </section>

        <aside className="glass-panel rounded-[22px] sm:rounded-[28px] border p-5 sm:p-6 shadow-lg" style={{ borderColor: 'var(--panel-border)' }}>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: 'var(--foreground-faint)' }}>
            {t.common.indicators}
          </p>
          <div className="mt-4 sm:mt-5 space-y-3 sm:space-y-4">
            {(project.metrics?.length ? project.metrics : project.stack ?? []).map((metric) => (
              <div key={metric} className="rounded-2xl border p-3.5 sm:p-4" style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)' }}>
                <p className="text-lg sm:text-xl font-bold text-cyan-400">
                  <Trans>{metric}</Trans>
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-8 sm:mt-12 grid gap-6 sm:gap-8 lg:grid-cols-[1fr_0.9fr]">
        <article className="glass-panel rounded-[22px] sm:rounded-[28px] border p-6 sm:p-8 shadow-lg" style={{ borderColor: 'var(--panel-border)' }}>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: 'var(--foreground-faint)' }}>
            {t.common.context}
          </p>
          <p className="mt-4 sm:mt-5 text-base sm:text-lg leading-relaxed sm:leading-8" style={{ color: 'var(--foreground-muted)' }}>
            <Trans>{project.story || project.description}</Trans>
          </p>
        </article>

        <div className="glass-panel rounded-[22px] sm:rounded-[28px] border p-6 sm:p-8 shadow-lg" style={{ borderColor: 'var(--panel-border)' }}>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: 'var(--foreground-faint)' }}>
            {t.common.stack}
          </p>
          <div className="mt-4 sm:mt-5 flex flex-wrap gap-2 sm:gap-3">
            {(project.stack ?? []).map((item) => (
              <span key={item} className="rounded-full border px-3 py-1.5 text-xs uppercase tracking-[0.14em]" style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}>
                <Trans>{item}</Trans>
              </span>
            ))}
          </div>
        </div>
      </section>

      {project.screenshots && project.screenshots.length > 0 && (
        <section className="mt-8 sm:mt-12 glass-panel rounded-[22px] sm:rounded-[28px] border p-6 sm:p-8 shadow-lg" style={{ borderColor: 'var(--panel-border)' }}>
          <p className="text-xs uppercase tracking-[0.28em]" style={{ color: 'var(--foreground-faint)' }}>
            {t.common.screenshots}
          </p>
          <div className="mt-5 sm:mt-6 grid gap-4 sm:gap-6 grid-cols-1 sm:grid-cols-2 md:grid-cols-3">
            {project.screenshots.map((screenshot, idx) => (
              <a
                key={idx}
                href={screenshot}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-2xl border aspect-video transition hover:scale-[1.02]"
                style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)' }}
              >
                <img
                  src={screenshot}
                  alt={`Capture d'écran ${idx + 1}`}
                  className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              </a>
            ))}
          </div>
        </section>
      )}
    </main>
  );
}
