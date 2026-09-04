'use client';

import type { PortfolioCertification } from '@/lib/portfolio';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function CertificationsPageClient({ certifications }: { certifications: PortfolioCertification[] }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-6 pb-20 pt-24 sm:pt-32">
      <div className="mb-8 sm:mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          {t.sections.certifications_label}
        </p>
        <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.06em]" style={{ color: 'var(--foreground)' }}>
          Proof of learning, applied to business problems.
        </h1>
      </div>

      <div className="grid gap-5 sm:gap-6 grid-cols-1 sm:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <article key={cert.title} className="glass-panel rounded-[24px] sm:rounded-[26px] border p-5 sm:p-6 shadow-lg" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="mb-4 flex h-10 w-10 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-cyan-400/30">
              <span className="text-base sm:text-lg text-cyan-400">✓</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em]" style={{ color: 'var(--foreground-faint)' }}>
              <Trans>{cert.issuer}</Trans>
            </p>
            <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
              <Trans>{cert.title}</Trans>
            </h2>
            <div className="mt-3 flex items-center justify-between text-xs sm:text-sm font-medium" style={{ color: 'var(--foreground-muted)' }}>
              <span>{cert.date}</span>
              <span>{cert.duration}</span>
            </div>
            {cert.description && (
              <p className="mt-4 text-xs sm:text-sm leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                <Trans>{cert.description}</Trans>
              </p>
            )}
          </article>
        ))}
      </div>
    </main>
  );
}
