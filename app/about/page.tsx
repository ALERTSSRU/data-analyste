import { getProfile } from '@/lib/portfolio';

const strengths = ['SQL', 'Python', 'Dashboarding', 'ETL', 'Supabase', 'Next.js'];

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <main className="mx-auto max-w-6xl px-6 pb-20 pt-32 text-slate-100">
      <div className="grid gap-10 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div className="rounded-[30px] border border-slate-800 bg-slate-900/70 p-8">
          <div className="mb-6 h-32 w-32 rounded-[26px] bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.22),transparent_25%),linear-gradient(135deg,#0f172a,#111827_80%)] ring-1 ring-cyan-400/30" />
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Profile</p>
          <h1 className="mt-4 text-4xl font-black tracking-[-0.06em] text-white">{profile.full_name}</h1>
          <p className="mt-3 text-lg text-slate-300">{profile.role}</p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">About</p>
          <h2 className="mt-4 text-3xl font-bold text-white md:text-4xl">Turning complex data into clear decisions.</h2>
          <p className="mt-6 text-lg leading-8 text-slate-300">{profile.intro}</p>

          <div className="mt-6 space-y-4">
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-base leading-7 text-slate-200">
              I combine analytical thinking with product delivery, from data modeling to user-facing interfaces.
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-base leading-7 text-slate-200">
              My work sits at the intersection of SQL, reporting, automation, and end-user experience.
            </div>
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 p-4 text-base leading-7 text-slate-200">
              I care about clarity, quality, and practical business impact.
            </div>
          </div>
        </div>
      </div>

      <section className="mt-16">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-300">Core strengths</p>
        <div className="mt-6 flex flex-wrap gap-3">
          {strengths.map((skill) => (
            <span key={skill} className="rounded-full border border-slate-700 bg-slate-900/70 px-4 py-2 text-sm font-medium tracking-[0.08em] text-slate-100 uppercase">
              {skill}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}
