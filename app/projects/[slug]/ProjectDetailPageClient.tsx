'use client';

import type { PortfolioProject } from '@/lib/portfolio';
import Link from 'next/link';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function ProjectDetailPageClient({ project }: { project: PortfolioProject }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-32 text-slate-100">
      <Link href="/projects" className="mb-8 inline-flex text-sm text-cyan-300">
        {t.common.back_to_projects}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
            <Trans>{project.category}</Trans>
          </p>
          <h1 className="mt-4 text-4xl font-black tracking-tighter text-white md:text-5xl">
            <Trans>{project.title}</Trans>
          </h1>
          <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
            <Trans>{project.summary}</Trans>
          </p>
          
          {project.image_url ? (
            <img
              src={project.image_url}
              alt={project.title}
              className="mt-8 h-70 w-full rounded-[28px] object-cover border border-white/10"
            />
          ) : (
            <div className="mt-8 h-70 rounded-[28px] border border-white/10 bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.2),transparent_30%),linear-gradient(135deg,#0f172a,#0b1221_70%)]" />
          )}
        </section>

        <aside className="glass-panel rounded-[28px] border border-white/10 p-6">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {t.common.indicators}
          </p>
          <div className="mt-5 space-y-4">
            {(project.metrics?.length ? project.metrics : project.stack ?? []).map((metric) => (
              <div key={metric} className="rounded-2xl border border-white/10 bg-slate-950/60 p-4">
                <p className="text-xl font-bold text-cyan-300">
                  <Trans>{metric}</Trans>
                </p>
              </div>
            ))}
          </div>
        </aside>
      </div>

      <section className="mt-12 grid gap-8 lg:grid-cols-[1fr_0.9fr]">
        <article className="glass-panel rounded-[28px] border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {t.common.context}
          </p>
          <p className="mt-5 text-lg leading-8 text-slate-300">
            <Trans>{project.story || project.description}</Trans>
          </p>
        </article>

        <div className="glass-panel rounded-[28px] border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {t.common.stack}
          </p>
          <div className="mt-5 flex flex-wrap gap-3">
            {(project.stack ?? []).map((item) => (
              <span key={item} className="rounded-full border border-slate-700 bg-slate-950/70 px-3 py-2 text-xs uppercase tracking-[0.14em] text-slate-200">
                <Trans>{item}</Trans>
              </span>
            ))}
          </div>
        </div>
      </section>

      {project.screenshots && project.screenshots.length > 0 && (
        <section className="mt-12 glass-panel rounded-[28px] border border-white/10 p-8">
          <p className="text-xs uppercase tracking-[0.28em] text-slate-400">
            {t.common.screenshots}
          </p>
          <div className="mt-6 grid gap-6 sm:grid-cols-2 md:grid-cols-3">
            {project.screenshots.map((screenshot, idx) => (
              <a
                key={idx}
                href={screenshot}
                target="_blank"
                rel="noreferrer"
                className="group relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900 aspect-video transition hover:border-cyan-400/40"
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
