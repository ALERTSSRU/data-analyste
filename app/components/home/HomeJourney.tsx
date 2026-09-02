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
      <section className="relative flex min-h-screen items-center px-6 pt-28">
        <div className="mx-auto max-w-5xl text-center">
          <p className="mb-6 inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-3 py-1 text-[11px] uppercase tracking-[0.28em] text-cyan-200">
            <span className="h-2 w-2 rounded-full bg-cyan-300" />
            <Trans>{profile.role}</Trans>
          </p>
          <h1 className="text-5xl font-black tracking-tighter text-white md:text-7xl">
            <Trans>{profile.full_name}</Trans>
          </h1>
          <p className="mx-auto mt-6 max-w-2xl text-lg leading-8 text-slate-300">
            <Trans>{profile.intro}</Trans>
          </p>
          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <Link
              href="/projects"
              className="rounded-full bg-white px-7 py-3 text-sm font-semibold text-slate-950 transition hover:bg-cyan-100"
            >
              {t.hero.cta_projects}
            </Link>
            <Link
              href="/contact"
              className="rounded-full border border-white/20 px-7 py-3 text-sm font-semibold text-white hover:border-cyan-300"
            >
              {t.hero.cta_contact}
            </Link>
          </div>
        </div>
      </section>

      <section data-scene="school" className="relative mx-auto max-w-6xl px-6 py-28">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{t.sections.school_label}</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tighter text-white md:text-5xl">
            {t.sections.school_heading}
          </h2>
        </ScrollReveal>
        <div className="mt-12 grid gap-5 md:grid-cols-2">
          {education.map((item) => (
            <ScrollReveal key={`${item.school_name}-${item.degree}`}>
              <article className="glass-panel rounded-3xl border border-white/10 p-7">
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300">{item.period}</p>
                <h3 className="mt-3 text-2xl font-semibold text-white">
                  <Trans>{item.degree}</Trans>
                </h3>
                <p className="mt-2 text-slate-300">
                  <Trans>{item.school_name}</Trans>
                </p>
                {item.field_of_study ? (
                  <p className="mt-1 text-sm text-slate-400">
                    <Trans>{item.field_of_study}</Trans>
                  </p>
                ) : null}
                {item.description ? (
                  <p className="mt-4 leading-7 text-slate-300">
                    <Trans>{item.description}</Trans>
                  </p>
                ) : null}
              </article>
            </ScrollReveal>
          ))}
        </div>
      </section>

      <section data-scene="bank" className="relative mx-auto max-w-6xl px-6 py-28">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-emerald-300">{t.sections.bank_label}</p>
          <h2 className="mt-4 max-w-3xl text-4xl font-black tracking-tighter text-white md:text-5xl">
            {t.sections.bank_heading}
          </h2>
        </ScrollReveal>
        <div className="mt-12 space-y-5">
          {featuredBank.map((item) => (
            <ScrollReveal key={`${item.company}-${item.position}`}>
              <article className="glass-panel rounded-3xl border border-emerald-400/20 p-7 md:p-8">
                <div className="flex flex-col justify-between gap-4 md:flex-row md:items-end">
                  <div>
                    <p className="text-[11px] uppercase tracking-[0.22em] text-emerald-300">{item.period}</p>
                    <h3 className="mt-3 text-2xl font-semibold text-white">
                      <Trans>{item.position}</Trans>
                    </h3>
                    <p className="mt-1 text-lg text-slate-300">
                      <Trans>{item.company}</Trans>
                    </p>
                  </div>
                  {item.is_current ? (
                    <span className="w-fit rounded-full border border-emerald-400/30 px-3 py-1 text-xs uppercase tracking-[0.18em] text-emerald-200">
                      {t.common.current}
                    </span>
                  ) : null}
                </div>
                <p className="mt-5 max-w-3xl leading-7 text-slate-300">
                  <Trans>{item.description}</Trans>
                </p>
              </article>
            </ScrollReveal>
          ))}
        </div>
        {otherRoles.length ? (
          <div className="mt-8 grid gap-4 md:grid-cols-2">
            {otherRoles.map((item) => (
              <article key={`${item.company}-${item.position}`} className="rounded-2xl border border-white/10 bg-slate-950/35 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">{item.period}</p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  <Trans>{item.position}</Trans>
                </h3>
                <p className="text-slate-400">
                  <Trans>{item.company}</Trans>
                </p>
              </article>
            ))}
          </div>
        ) : null}
        <div className="mt-8 text-left">
          <Link href="/experiences" className="text-sm font-semibold text-emerald-300 hover:underline">
            Voir le parcours complet →
          </Link>
        </div>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-20">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{t.sections.arsenal_label}</p>
          <div className="mt-6 flex flex-wrap gap-2">
            {skills.slice(0, 18).map((skill) => (
              <span
                key={skill.id ?? skill.name}
                className="rounded-full border border-white/10 bg-slate-950/40 px-4 py-2 text-sm text-slate-200"
              >
                <Trans>{skill.name}</Trans>
              </span>
            ))}
          </div>
        </ScrollReveal>
      </section>

      <section className="relative mx-auto max-w-6xl px-6 py-28">
        <ScrollReveal>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">{t.sections.projects_label}</p>
          <h2 className="mt-4 text-4xl font-black tracking-tighter text-white md:text-5xl">{t.sections.projects_heading}</h2>
        </ScrollReveal>
        <div className="mt-12">
          <ProjectCarousel3D projects={projects} />
        </div>
        <div className="mt-10">
          <Link href="/projects" className="text-sm font-semibold text-cyan-300">
            {t.sections.projects_all}
          </Link>
        </div>
      </section>

      {certifications.length ? (
        <section className="relative mx-auto max-w-6xl px-6 py-16">
          <p className="text-xs uppercase tracking-[0.28em] text-violet-300">{t.sections.certifications_label}</p>
          <div className="mt-6 grid gap-4 md:grid-cols-3">
            {certifications.slice(0, 3).map((cert) => (
              <article key={cert.title} className="glass-panel rounded-2xl border border-white/10 p-5">
                <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400">
                  <Trans>{cert.issuer}</Trans>
                </p>
                <h3 className="mt-2 text-lg font-semibold text-white">
                  <Trans>{cert.title}</Trans>
                </h3>
                <p className="mt-3 text-sm text-slate-400">
                  {cert.date} · {cert.duration}
                </p>
              </article>
            ))}
          </div>
          <div className="mt-8 text-left">
            <Link href="/certifications" className="text-sm font-semibold text-violet-300 hover:underline">
              Voir toutes les certifications →
            </Link>
          </div>
        </section>
      ) : null}

      <section data-scene="finale" className="relative mx-auto max-w-6xl px-6 py-32">
        <ScrollReveal>
          <div className="glass-panel rounded-4xl border border-violet-400/20 p-10 text-center md:p-16">
            <p className="text-xs uppercase tracking-[0.28em] text-violet-300">{t.sections.finale_label}</p>
            <h2 className="mt-4 text-4xl font-black tracking-tighter text-white md:text-5xl">
              {t.sections.finale_heading}
            </h2>
            <p className="mx-auto mt-5 max-w-2xl text-lg leading-8 text-slate-300">
              <Trans>{profile.bio}</Trans>
            </p>
            <Link
              href="/contact"
              className="mt-8 inline-flex rounded-full bg-linear-to-r from-cyan-300 to-violet-300 px-8 py-3 text-sm font-semibold text-slate-950"
            >
              {t.sections.finale_cta}
            </Link>
          </div>
        </ScrollReveal>
      </section>
    </main>
  );
}
