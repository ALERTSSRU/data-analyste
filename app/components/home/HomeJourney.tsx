'use client';

import { ProjectCarousel3D } from '@/app/components/ProjectCarousel3D';
import { ScrollReveal } from '@/app/components/ScrollReveal';
import { Trans, useLanguage } from '@/lib/LanguageContext';
import {
    isBankExperience,
    type PortfolioCertification,
    type PortfolioEducation,
    type PortfolioExperience,
    type PortfolioProfile,
    type PortfolioProject,
    type PortfolioSkill,
} from '@/lib/portfolio';
import { sceneState } from '@/lib/scene-state';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

type HomeJourneyProps = {
  profile: PortfolioProfile;
  education: PortfolioEducation[];
  experiences: PortfolioExperience[];
  projects: PortfolioProject[];
  certifications: PortfolioCertification[];
  skills: PortfolioSkill[];
};

export function HomeJourney({
  profile,
  education,
  experiences,
  projects,
  certifications,
  skills,
}: HomeJourneyProps) {
  const { t } = useLanguage();
  const bankRoles = experiences.filter(isBankExperience);
  const otherRoles = experiences.filter((item) => !isBankExperience(item));
  const featuredBank = bankRoles.length ? bankRoles : experiences.slice(0, 1);

  useEffect(() => {
    const update = () => {
      const max = document.documentElement.scrollHeight - window.innerHeight;
      sceneState.target = max > 0 ? window.scrollY / max : 0;
    };

    update();
    window.addEventListener('scroll', update, { passive: true });
    const trigger = ScrollTrigger.create({
      trigger: document.documentElement,
      start: 'top top',
      end: 'bottom bottom',
      onUpdate: (self) => {
        sceneState.target = self.progress;
      },
    });

    return () => {
      window.removeEventListener('scroll', update);
      trigger.kill();
    };
  }, []);

  return (
    <main className="overflow-x-hidden">
      <section className="relative flex min-h-[85vh] items-center px-4 sm:px-6 pt-24 sm:pt-32 pb-12 sm:pb-20">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-4 sm:mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[10px] sm:text-[11px] uppercase tracking-[0.24em] sm:tracking-[0.28em] text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan-300 animate-pulse" />
            <Trans>{profile.role}</Trans>
          </p>
          <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter leading-tight" style={{ color: 'var(--foreground)' }}>
            <Trans>{profile.full_name}</Trans>
          </h1>
          <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-relaxed sm:leading-8" style={{ color: 'var(--foreground-muted)' }}>
            <Trans>{profile.intro}</Trans>
          </p>
          <div className="mt-8 sm:mt-10 flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link
              href="/projects"
              className="rounded-full px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition shadow-md hover:scale-105"
              style={{
                background: 'var(--foreground)',
                color: 'var(--background)',
              }}
            >
              {t.hero.cta_projects}
            </Link>
            <Link
              href="/contact"
              className="rounded-full border px-6 sm:px-7 py-2.5 sm:py-3 text-xs sm:text-sm font-semibold transition hover:scale-105"
              style={{
                borderColor: 'var(--panel-border)',
                color: 'var(--foreground)',
              }}
            >
              {t.hero.cta_contact}
            </Link>
          </div>
        </div>
      </section>

      <section data-scene="school" className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-16 sm:py-24 md:py-32">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{t.sections.school_label}</p>
          <h2 className="mt-3 sm:mt-4 max-w-3xl text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--foreground)' }}>
            {t.sections.school_heading}
          </h2>
        </ScrollReveal>
        <div className="mt-8 sm:mt-12 grid gap-6 md:grid-cols-2">
          {education.map((item) => (
            <ScrollReveal key={`${item.school_name}-${item.degree}`}>
              <article className="glass-panel rounded-3xl border p-6 sm:p-8 shadow-lg" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">{item.period}</p>
                <h3 className="mt-3 text-xl sm:text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                  <Trans>{item.degree}</Trans>
                </h3>
                <p className="mt-2 text-sm sm:text-base font-medium" style={{ color: 'var(--foreground-muted)' }}>
                  <Trans>{item.school_name}</Trans>
                </p>
                {item.field_of_study ? (
                  <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--foreground-faint)' }}>
                    <Trans>{item.field_of_study}</Trans>
                  </p>
                ) : null}
                {item.description ? (
                  <p className="mt-4 text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                    <Trans>{item.description}</Trans>
                  </p>
                ) : null}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section data-scene="bank" className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-16 sm:py-24 md:py-32">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">{t.sections.bank_label}</p>
          <h2 className="mt-3 sm:mt-4 max-w-3xl text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--foreground)' }}>
            {t.sections.bank_heading}
          </h2>
        </ScrollReveal>
        <div className="mt-8 sm:mt-12 space-y-6">
          {featuredBank.map((item) => (
            <ScrollReveal key={`${item.company}-${item.position}`}>
              <article className="glass-panel rounded-3xl border border-emerald-400/20 p-6 sm:p-8 md:p-10 shadow-xl">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-3 sm:gap-4">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300">{item.period}</p>
                    <h3 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>
                      <Trans>{item.position}</Trans>
                    </h3>
                    <p className="mt-1 text-base sm:text-lg font-medium" style={{ color: 'var(--foreground-muted)' }}>
                      <Trans>{item.company}</Trans>
                    </p>
                  </div>
                  {item.is_current ? (
                    <span className="w-fit rounded-full border border-emerald-400/30 px-3.5 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200 shrink-0">
                      {t.common.current}
                    </span>
                  ) : null}
                </div>
                <p className="mt-4 sm:mt-6 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                  <Trans>{item.description}</Trans>
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
        {otherRoles.length ? (
          <div className="mt-6 sm:mt-8 grid gap-4 sm:gap-6 sm:grid-cols-2">
            {otherRoles.map((item) => (
              <article key={`${item.company}-${item.position}`} className="glass-panel rounded-2xl border p-5 sm:p-6" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-xs uppercase tracking-[0.18em]" style={{ color: 'var(--foreground-faint)' }}>{item.period}</p>
                <h3 className="mt-2 text-base sm:text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  <Trans>{item.position}</Trans>
                </h3>
                <p className="mt-1 text-xs sm:text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  <Trans>{item.company}</Trans>
                </p>
              </article>
            ))}
          </div>
        ) : null}
        <div className="mt-8 text-left">
          <Link href="/experiences" className="text-xs sm:text-sm font-semibold text-emerald-400 hover:underline">
            Voir le parcours complet →
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-14 sm:py-20">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{t.sections.arsenal_label}</p>
          <div className="mt-5 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3">
            {skills.slice(0, 18).map((skill) => (
              <span
                key={skill.id ?? skill.name}
                className="rounded-full border px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-medium shadow-xs transition-all hover:border-cyan-400/40"
                style={{
                  background: 'var(--card-bg)',
                  borderColor: 'var(--panel-border)',
                  color: 'var(--foreground)',
                }}
              >
                <Trans>{skill.name}</Trans>
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-16 sm:py-24 md:py-32">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{t.sections.projects_label}</p>
          <h2 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--foreground)' }}>{t.sections.projects_heading}</h2>
        </ScrollReveal>
        <div className="mt-8 sm:mt-12">
          <ProjectCarousel3D projects={projects} />
        </div>
        <div className="mt-8 sm:mt-10 text-center sm:text-left">
          <Link href="/projects" className="text-xs sm:text-sm font-semibold text-cyan-400 hover:underline">
            {t.sections.projects_all}
          </Link>
        </div>
      </section>

      {certifications.length ? (
        <section className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-12 sm:py-16">
          <p className="text-xs uppercase tracking-[0.28em] text-violet-300">{t.sections.certifications_label}</p>
          <div className="mt-6 grid gap-5 sm:gap-6 sm:grid-cols-2 md:grid-cols-3">
            {certifications.slice(0, 3).map((cert) => (
              <article key={cert.title} className="glass-panel rounded-2xl border p-5 sm:p-6 shadow-sm" style={{ borderColor: 'var(--panel-border)' }}>
                <p className="text-[11px] uppercase tracking-[0.18em]" style={{ color: 'var(--foreground-faint)' }}>
                  <Trans>{cert.issuer}</Trans>
                </p>
                <h3 className="mt-2 text-base sm:text-lg font-semibold" style={{ color: 'var(--foreground)' }}>
                  <Trans>{cert.title}</Trans>
                </h3>
                <p className="mt-3 text-xs sm:text-sm" style={{ color: 'var(--foreground-muted)' }}>
                  {cert.date} · {cert.duration}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-left">
            <Link href="/certifications" className="text-xs sm:text-sm font-semibold text-violet-400 hover:underline">
              Voir toutes les certifications →
            </Link>
          </div>
        </section>
      ) : null}

      <section data-scene="finale" className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-20 sm:py-28 md:py-36">
        <ScrollReveal>
          <div className="glass-panel rounded-3xl sm:rounded-4xl border border-violet-400/20 p-8 sm:p-12 md:p-16 text-center shadow-2xl">
            <p className="text-xs uppercase tracking-[0.28em] text-violet-300">{t.sections.finale_label}</p>
            <h2 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-tighter" style={{ color: 'var(--foreground)' }}>
              {t.sections.finale_heading}
            </h2>
            <p className="mx-auto mt-4 sm:mt-6 max-w-2xl text-base sm:text-lg leading-relaxed sm:leading-8" style={{ color: 'var(--foreground-muted)' }}>
              <Trans>{profile.bio}</Trans>
            </p>
            <Link
              href="/contact"
              className="mt-6 sm:mt-8 inline-flex rounded-full bg-linear-to-r from-cyan-400 to-violet-400 px-7 sm:px-8 py-2.5 sm:py-3 text-xs sm:text-sm font-bold text-slate-950 shadow-lg hover:scale-105 transition-transform"
            >
              {t.sections.finale_cta}
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
