'use client';

import type { PortfolioMetric } from '@/lib/portfolio';
import { Activity, BarChart3, Database, HardDrive, Zap } from 'lucide-react';

interface DataAnalyticsMetricsProps {
  customMetrics?: PortfolioMetric[];
  counts?: {
    projects: number;
    experiences: number;
    skills: number;
    certifications: number;
  };
}

export function DataAnalyticsMetrics({ customMetrics, counts }: DataAnalyticsMetricsProps) {
  const pCount = counts?.projects ?? 0;
  const eCount = counts?.experiences ?? 0;
  const sCount = counts?.skills ?? 0;
  const cCount = counts?.certifications ?? 0;
  // Real metrics computed from database counts as default baseline
  const defaultRealMetrics = [
    {
      label: 'Projets Data Livrés',
      value: `${pCount || 0}`,
      change: '100% Fonctionnels',
      icon: Database,
      accent: 'from-cyan-500 to-blue-500',
      description: 'Dashboards BI, modélisation SQL et pipelines de données en production',
    },
    {
      label: 'Expériences & Postes',
      value: `${eCount || 0}`,
      change: 'Parcours Pro',
      icon: HardDrive,
      accent: 'from-emerald-500 to-teal-500',
      description: 'Banque, finance et projets indépendants d’analyse décisionnelle',
    },
    {
      label: 'Arsenal Technologique',
      value: `${sCount || 0}`,
      change: 'Outils maîtrisés',
      icon: Zap,
      accent: 'from-amber-500 to-orange-500',
      description: 'SQL, Python, PowerBI, Supabase, ETL et delivery Full Stack',
    },
    {
      label: 'Certifications Validées',
      value: `${cCount || 0}`,
      change: 'Spécialisations',
      icon: Activity,
      accent: 'from-violet-500 to-purple-500',
      description: 'KPIs, Data Analysis Professional Track et validation métier',
    },
  ];

  // If admin has created custom metrics in DB, render those instead
  const displayMetrics =
    customMetrics && customMetrics.length > 0
      ? customMetrics.map((cm, idx) => ({
          label: cm.label,
          value: cm.value,
          change: cm.change || 'Métrique réelle',
          icon: idx % 4 === 0 ? Database : idx % 4 === 1 ? HardDrive : idx % 4 === 2 ? Zap : Activity,
          accent:
            idx % 4 === 0
              ? 'from-cyan-500 to-blue-500'
              : idx % 4 === 1
              ? 'from-emerald-500 to-teal-500'
              : idx % 4 === 2
              ? 'from-amber-500 to-orange-500'
              : 'from-violet-500 to-purple-500',
          description: cm.description || 'Donnée réelle d’analyse métier',
        }))
      : defaultRealMetrics;

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
              <span>Indicateurs & Données Réelles</span>
            </span>
            <h2 className="mt-3 text-2xl sm:text-4xl font-black tracking-tight" style={{ color: 'var(--foreground)' }}>
              Métriques d'Impact Portfolio
            </h2>
          </div>
          <div className="px-3.5 py-1.5 rounded-full border border-cyan-400/30 bg-cyan-500/10 text-cyan-200 text-xs font-mono font-semibold flex items-center gap-2 w-fit">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            <span>Données Synchronisées en Direct</span>
          </div>
        </div>

        {/* 4 KPI Grid Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          {displayMetrics.map((m, idx) => {
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
