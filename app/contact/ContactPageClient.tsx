'use client';

import type { PortfolioProfile } from '@/lib/portfolio';
import { ensureExternalUrl } from '@/lib/portfolio';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function ContactPageClient({ profile }: { profile: PortfolioProfile }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-5xl px-4 sm:px-8 md:px-10 pb-16 sm:pb-24 pt-24 sm:pt-32">
      <div className="glass-panel rounded-[22px] sm:rounded-[28px] border border-cyan-400/25 p-5 sm:p-8 md:p-10 shadow-xl">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          Contact
        </p>
        <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.06em]" style={{ color: 'var(--foreground)' }}>
          {t.contact.title}
        </h1>
        <p className="mt-4 sm:mt-5 max-w-2xl text-base sm:text-lg leading-relaxed sm:leading-8" style={{ color: 'var(--foreground-muted)' }}>
          {t.contact.subtitle}
        </p>

        <div className="mt-6 sm:mt-8 flex flex-wrap gap-3 sm:gap-4">
          <a
            href={`mailto:${profile.email ?? 'hello@example.com'}`}
            className="rounded-full px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition shadow-md hover:scale-105"
            style={{
              background: 'var(--foreground)',
              color: 'var(--background)',
            }}
          >
            {profile.email ?? 'hello@example.com'}
          </a>
          <a
            href={ensureExternalUrl(profile.linkedin_url ?? 'https://www.linkedin.com')}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition hover:scale-105"
            style={{
              borderColor: 'var(--panel-border)',
              color: 'var(--foreground)',
              background: 'var(--card-bg)',
            }}
          >
            LinkedIn
          </a>
          <a
            href={ensureExternalUrl(profile.github_url ?? 'https://github.com')}
            target="_blank"
            rel="noreferrer"
            className="rounded-full border px-5 sm:px-6 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition hover:scale-105"
            style={{
              borderColor: 'var(--panel-border)',
              color: 'var(--foreground)',
              background: 'var(--card-bg)',
            }}
          >
            GitHub
          </a>
        </div>
      </div>
    </main>
  );
}
