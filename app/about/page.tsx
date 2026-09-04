import { getProfile } from '@/lib/portfolio';

const strengths = ['SQL', 'Python', 'Dashboarding', 'ETL', 'Supabase', 'Next.js'];

export default async function AboutPage() {
  const profile = await getProfile();

  return (
    <main className="mx-auto max-w-6xl px-4 sm:px-8 md:px-10 pb-16 sm:pb-24 pt-24 sm:pt-32">
      <div className="grid gap-8 lg:gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
        <div 
          className="glass-panel rounded-[22px] sm:rounded-[28px] border p-6 sm:p-8 shadow-xl"
          style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)' }}
        >
          <div className="mb-6 h-24 w-24 sm:h-32 sm:w-32 rounded-[22px] sm:rounded-[26px] bg-[radial-gradient(circle_at_30%_30%,rgba(34,211,238,0.22),transparent_25%),linear-gradient(135deg,#0f172a,#111827_80%)] ring-1 ring-cyan-400/30" />
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-400 font-semibold">Profile</p>
          <h1 className="mt-3 sm:mt-4 text-3xl sm:text-4xl font-black tracking-[-0.06em]" style={{ color: 'var(--foreground)' }}>
            {profile.full_name}
          </h1>
          <p className="mt-2 text-base sm:text-lg font-medium" style={{ color: 'var(--foreground-muted)' }}>
            {profile.role}
          </p>
        </div>

        <div>
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-400 font-semibold">About</p>
          <h2 className="mt-3 text-2xl sm:text-3xl md:text-4xl font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
            Turning complex data into clear decisions.
          </h2>
          <p className="mt-4 sm:mt-6 text-base sm:text-lg leading-relaxed sm:leading-8" style={{ color: 'var(--foreground-muted)' }}>
            {profile.intro}
          </p>

          <div className="mt-6 space-y-3 sm:space-y-4">
            <div 
              className="rounded-2xl border p-4 text-sm sm:text-base leading-relaxed"
              style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
            >
              I combine analytical thinking with product delivery, from data modeling to user-facing interfaces.
            </div>
            <div 
              className="rounded-2xl border p-4 text-sm sm:text-base leading-relaxed"
              style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
            >
              My work sits at the intersection of SQL, reporting, automation, and end-user experience.
            </div>
            <div 
              className="rounded-2xl border p-4 text-sm sm:text-base leading-relaxed"
              style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
            >
              I care about clarity, quality, and practical business impact.
            </div>
          </div>
        </div>
      </div>

      <section className="mt-12 sm:mt-16">
        <p className="text-xs uppercase tracking-[0.28em] text-cyan-400 font-semibold">Core strengths</p>
        <div className="mt-4 sm:mt-6 flex flex-wrap gap-2.5 sm:gap-3">
          {strengths.map((skill) => (
            <span 
              key={skill} 
              className="rounded-full border px-3.5 sm:px-4 py-1.5 sm:py-2 text-xs sm:text-sm font-semibold tracking-[0.08em] uppercase transition hover:scale-105"
              style={{ borderColor: 'var(--panel-border)', background: 'var(--card-bg)', color: 'var(--foreground)' }}
            >
              {skill}
            </span>
          ))}
        </div>
      </section>
    </main>
  );
}

