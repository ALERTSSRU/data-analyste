'use client';

import { Activity, BarChart3, Database, HardDrive, Zap } from 'lucide-react';

export function DataAnalyticsMetrics() {
  const metrics = [
    {
      label: 'Précision des Données',
      value: '99.8%',
      change: '+4.2% ce mois',
      icon: Database,
      accent: 'from-cyan-500 to-blue-500',
      description: 'Tests de qualité & validation automatisée des pipelines ETL',
    },
    {
      label: 'Volumétrie Traitée',
      value: '12M+',
      change: 'Lignes unifiées',
      icon: HardDrive,
      accent: 'from-emerald-500 to-teal-500',
      description: 'Entrepôts de données SQL & agrégation multi-sources',
    },
    {
      label: 'Temps de Réponse SQL',
      value: '< 15ms',
      change: 'Indexation optimale',
      icon: Zap,
      accent: 'from-amber-500 to-orange-500',
      description: 'Requêtes optimisées & modélisation dimensionnelle',
    },
    {
      label: 'Disponibilité Pipelines',
      value: '100%',
      change: 'Monitoring actif',
      icon: Activity,
      accent: 'from-violet-500 to-purple-500',
      description: 'Alertes automatisées & monitoring de performance en continu',
    },
  ];

  const skillBars = [
    { name: 'SQL & Modélisation de Données (PostgreSQL, Snowflake)', level: 98, color: 'bg-cyan-400' },
    { name: 'Python & Data Analysis (Pandas, NumPy, Scikit)', level: 94, color: 'bg-blue-400' },
    { name: 'Dashboarding & Business Intelligence (Power BI, Tableau)', level: 96, color: 'bg-emerald-400' },
    { name: 'Pipelines & Automation ETL (Supabase, Airflow, dbt)', level: 92, color: 'bg-violet-400' },
  ];

  return (
    <section className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-12 sm:py-20">
      <div className="space-y-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-2 text-xs uppercase tracking-[0.28em] text-cyan-300 font-mono font-bold">
              <BarChart3 className="w-4 h-4 text-cyan-400" />
              <span>Indicateurs de Performance Data</span>
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
              Métriques & Analyse d'Impact
            </h2>
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs font-mono font-semibold flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Moteur d'Analyse Actif</span>
          </div>
        </div>

        {/* 4 KPI Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {metrics.map((m, idx) => {
            const IconComp = m.icon;
            return (
              <div
                key={idx}
                className="group relative rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.02] shadow-xl overflow-hidden glass-panel"
                style={{
                  borderColor: 'var(--panel-border)',
                  background: 'var(--card-bg)',
                }}
              >
                {/* Glow accent */}
                <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${m.accent} opacity-10 blur-2xl group-hover:opacity-25 transition`} />

                <div className="flex items-center justify-between">
                  <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${m.accent} flex items-center justify-center text-white shadow-md`}>
                    <IconComp className="w-5 h-5" />
                  </div>
                  <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
                    {m.change}
                  </span>
                </div>

                <div className="mt-5">
                  <p className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-cyan-300">{m.value}</p>
                  <h3 className="mt-1 text-sm font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
                    {m.label}
                  </h3>
                  <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
                    {m.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>

        {/* Technical Domain Competency Gauges */}
        <div className="glass-panel rounded-3xl border p-6 sm:p-8 shadow-xl" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="flex items-center justify-between mb-6">
            <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono">
              Niveaux de Maîtrise Technique & Pipeline
            </h3>
            <span className="text-xs font-mono text-slate-400">Score Moyen: 95%</span>
          </div>

          <div className="space-y-5">
            {skillBars.map((bar, idx) => (
              <div key={idx} className="space-y-2">
                <div className="flex items-center justify-between text-xs font-semibold" style={{ color: 'var(--foreground)' }}>
                  <span>{bar.name}</span>
                  <span className="font-mono text-cyan-300 font-bold">{bar.level}%</span>
                </div>
                <div className="h-2.5 w-full rounded-full bg-slate-800/80 overflow-hidden border border-slate-700/40">
                  <div
                    className={`h-full rounded-full ${bar.color} transition-all duration-1000 shadow-sm`}
                    style={{ width: `${bar.level}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
