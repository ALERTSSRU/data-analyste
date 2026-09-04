import { getExperiences } from '@/lib/portfolio';

export default async function ExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 md:px-10 pb-24 pt-28 sm:pt-36">
      <div className="mb-8 sm:mb-12">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300 font-semibold">Experience</p>
        <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl md:text-5xl font-black tracking-[-0.06em]" style={{ color: 'var(--foreground)' }}>
          A journey between data and product.
        </h1>
      </div>

      <div className="space-y-6 sm:space-y-8">
        {experiences.map((exp) => (
          <article key={`${exp.company}-${exp.position}`} className="glass-panel rounded-[24px] sm:rounded-[28px] border p-6 sm:p-8 md:p-10 shadow-lg" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex flex-col gap-3 sm:gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-[11px] uppercase tracking-[0.22em] text-cyan-300 font-semibold">{exp.period}</p>
                <h2 className="mt-2 sm:mt-3 text-xl sm:text-2xl font-semibold" style={{ color: 'var(--foreground)' }}>{exp.position}</h2>
                <p className="mt-1 text-base sm:text-lg font-medium" style={{ color: 'var(--foreground-muted)' }}>{exp.company}</p>
              </div>
              <div className="h-10 w-10 sm:h-12 sm:w-12 rounded-xl bg-linear-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-cyan-400/30 shrink-0" />
            </div>

            <p className="mt-4 sm:mt-6 max-w-3xl text-xs sm:text-sm md:text-base leading-relaxed sm:leading-7" style={{ color: 'var(--foreground-muted)' }}>{exp.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
