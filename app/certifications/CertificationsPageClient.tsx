'use client';

import type { PortfolioCertification } from '@/lib/portfolio';
import { useLanguage, Trans } from '@/lib/LanguageContext';

export function CertificationsPageClient({ certifications }: { certifications: PortfolioCertification[] }) {
  const { t } = useLanguage();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-32 text-slate-100">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">
          {t.sections.certifications_label}
        </p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">
          Proof of learning, applied to business problems.
        </h1>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        {certifications.map((cert) => (
          <article key={cert.title} className="glass-panel rounded-[26px] border border-white/10 p-6">
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-linear-to-br from-cyan-500/20 to-violet-500/20 ring-1 ring-cyan-400/30">
              <span className="text-lg">✓</span>
            </div>
            <p className="text-[10px] uppercase tracking-[0.24em] text-slate-400">
              <Trans>{cert.issuer}</Trans>
            </p>
            <h2 className="mt-4 text-2xl font-semibold text-white">
              <Trans>{cert.title}</Trans>
            </h2>
            <div className="mt-4 flex items-center justify-between text-sm text-slate-300">
              <span>{cert.date}</span>
              <span>{cert.duration}</span>
            </div>
            <p className="mt-5 text-base leading-7 text-slate-300">
              <Trans>{cert.description}</Trans>
            </p>
          </article>
        ))}
      </div>
    </main>
  );
}
