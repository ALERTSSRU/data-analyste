'use client';

import type { PortfolioProfile } from '@/lib/portfolio';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function ContactPageClient({ profile }: { profile: PortfolioProfile }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-5xl px-6 pb-20 pt-32 text-slate-100">
      <div className="glass-panel rounded-[28px] border border-cyan-400/25 bg-linear-to-r from-cyan-500/10 via-slate-900/40 to-emerald-500/10 p-8 md:p-10">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          Contact
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
          {t.contact.title}
        </h1>
        <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-300">
          {t.contact.subtitle}
        </p>

        <div className="mt-8 flex flex-wrap gap-4">
          <a href={`mailto:${profile.email ?? 'hello@example.com'}`} className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-slate-200">
            {profile.email ?? 'hello@example.com'}
          </a>
          <a href={profile.linkedin_url ?? 'https://www.linkedin.com'} target="_blank" rel="noreferrer" className="rounded-full border border-slate-600 bg-slate-950/60 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
            LinkedIn
          </a>
          <a href={profile.github_url ?? 'https://github.com'} target="_blank" rel="noreferrer" className="rounded-full border border-slate-600 bg-slate-950/60 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500">
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
