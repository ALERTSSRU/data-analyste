'use client';

import type { PortfolioCertification } from '@/lib/portfolio';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function CertificationsPageClient({ certifications }: { certifications: PortfolioCertification[] }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 md:px-10 pb-24 pt-28 sm:pt-36">
      <div className="mb-8 sm:mb-12">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300 font-semibold">
          {t.sections.certifications_label}
        </p>
        <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.06em]" style={{ color: 'var(--foreground)' }}>
          Proof of learning, applied to business problems.
        </h1>
      </div>

      <div className="grid gap-6 sm:gap-8 grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {certifications.map((cert) => (
          <article key={cert.title} className="glass-panel rounded-[24px] sm:rounded-[28px] border p-6 sm:p-7 shadow-lg flex flex-col justify-between" style={{ borderColor: 'var(--panel-border)' }}>
            <div>
              <div className="mb-4 flex h-11 w-11 sm:h-12 sm:w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-cyan-400/30">
                <span className="text-base sm:text-lg text-cyan-400">✓</span>
              </div>
              <p className="text-[10px] uppercase tracking-[0.24em] font-semibold" style={{ color: 'var(--foreground-faint)' }}>
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
            </div>
          </article>
        ))}
      </div>
    </main>
  );
}
