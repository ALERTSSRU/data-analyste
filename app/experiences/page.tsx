import { getExperiences } from '@/lib/portfolio';

export default async function ExperiencesPage() {
  const experiences = await getExperiences();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-32 text-slate-100">
      <div className="mb-10">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Experience</p>
        <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white md:text-5xl">A journey between data and product.</h1>
      </div>

      <div className="space-y-6">
        {experiences.map((exp) => (
          <article key={`${exp.company}-${exp.position}`} className="glass-panel rounded-[26px] border border-white/10 p-6 md:p-8">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <p className="text-xs uppercase tracking-[0.25em] text-cyan-300">{exp.period}</p>
                <h2 className="mt-3 text-2xl font-semibold text-white">{exp.position}</h2>
                <p className="mt-2 text-lg text-slate-300">{exp.company}</p>
              </div>
              <div className="h-12 w-12 rounded-xl bg-linear-to-br from-cyan-500/20 to-emerald-500/20 ring-1 ring-cyan-400/30" />
            </div>

            <p className="mt-5 max-w-3xl text-base leading-7 text-slate-300">{exp.description}</p>
          </article>
        ))}
      </div>
    </main>
  );
}
