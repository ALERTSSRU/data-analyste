'use client';

import { DataFlowNetwork } from '@/app/components/data-viz/DataFlowNetwork';
import { BarChartAnimated } from '@/app/components/data-viz/BarChartAnimated';
import { StatCard } from '@/app/components/data-viz/StatCard';
import { Database, HardDrive, Zap, Activity, TrendingUp, Layers, Code, Award } from 'lucide-react';
import Link from 'next/link';
import type { PortfolioProfile, PortfolioProject, PortfolioExperience, PortfolioSkill, PortfolioCertification } from '@/lib/portfolio';

type AnalyticsDashboardClientProps = {
  profile: PortfolioProfile;
  projects: PortfolioProject[];
  experiences: PortfolioExperience[];
  skills: PortfolioSkill[];
  certifications: PortfolioCertification[];
};

export function AnalyticsDashboardClient({
  profile,
  projects,
  experiences,
  skills,
  certifications,
}: AnalyticsDashboardClientProps) {
  // Group projects by category
  const projectCategories = projects.reduce((acc, proj) => {
    acc[proj.category] = (acc[proj.category] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const barData = Object.entries(projectCategories).map(([label, value], idx) => ({
    label,
    value,
    color: ['#06b6d4', '#10b981', '#8b5cf6', '#f59e0b', '#ef4444'][idx % 5],
  }));

  // Skill distribution by tech stack
  const skillCategories = skills.reduce((acc, skill) => {
    const cat = skill.category || 'General';
    acc[cat] = (acc[cat] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const skillBarData = Object.entries(skillCategories).slice(0, 6).map(([label, value], idx) => ({
    label,
    value,
    color: ['#0ea5e9', '#22c55e', '#a855f7', '#eab308', '#ec4899', '#14b8a6'][idx % 6],
  }));

  return (
    <main className="min-h-screen pb-20">
      {/* Hero Section with Animated Background */}
      <section className="relative h-[60vh] min-h-[500px] overflow-hidden">
        <DataFlowNetwork particleCount={250} connectionDistance={20} flowSpeed={0.003} color="#06b6d4" />
        
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="text-center z-10 px-4">
            <div className="inline-flex items-center gap-2 rounded-full border border-cyan-400/25 bg-cyan-500/10 px-4 py-2 text-xs uppercase tracking-[0.28em] text-cyan-200 mb-6 backdrop-blur-sm">
              <span className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse" />
              <span>Dashboard Analytics</span>
            </div>
            
            <h1 className="text-4xl sm:text-6xl md:text-7xl font-black tracking-tighter mb-4" style={{ color: 'var(--foreground)' }}>
              {profile.full_name}
            </h1>
            
            <p className="text-lg sm:text-xl max-w-2xl mx-auto mb-8" style={{ color: 'var(--foreground-muted)' }}>
              {profile.role}
            </p>
            
            <div className="flex flex-wrap justify-center gap-4">
              <Link
                href="/projects"
                className="rounded-full px-6 py-3 text-sm font-semibold transition shadow-md hover:scale-105"
                style={{ background: 'var(--foreground)', color: 'var(--background)' }}
              >
                Voir les Projets
              </Link>
              
              <Link
                href="/contact"
                className="rounded-full border px-6 py-3 text-sm font-semibold transition hover:scale-105"
                style={{ borderColor: 'var(--panel-border)', color: 'var(--foreground)' }}
              >
                Contact
              </Link>
            </div>
          </div>
        </div>
        
        {/* Gradient overlay at bottom */}
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
      </section>

      {/* KPI Cards Section */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 -mt-20 z-20">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-5">
          <StatCard
            label="Projets Data"
            value={projects.length}
            change={`${projects.filter(p => p.is_published).length} publiés`}
            description="Dashboards, pipelines et analyses en production"
            icon={Database}
            accentColor="from-cyan-500 to-blue-500"
            delay={0}
          />
          
          <StatCard
            label="Expériences Pro"
            value={experiences.length}
            change="Parcours complet"
            description="Secteurs banque, finance et consulting data"
            icon={HardDrive}
            accentColor="from-emerald-500 to-teal-500"
            delay={0.1}
          />
          
          <StatCard
            label="Compétences Tech"
            value={skills.length}
            change="Stack complète"
            description="SQL, Python, BI, Full Stack Development"
            icon={Zap}
            accentColor="from-amber-500 to-orange-500"
            delay={0.2}
          />
          
          <StatCard
            label="Certifications"
            value={certifications.length}
            change="Validées"
            description="Formations continues et spécialisations"
            icon={Award}
            accentColor="from-violet-500 to-purple-500"
            delay={0.3}
          />
        </div>
      </section>

      {/* Charts Section */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-16 sm:py-24">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Projects by Category Chart */}
          <div className="glass-panel rounded-3xl border p-6 sm:p-8 shadow-xl" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-cyan-500 to-blue-500 flex items-center justify-center">
                  <Layers className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-cyan-400 font-mono">
                    Répartition des Projets
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    Par catégorie et domaine d&apos;expertise
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                {projects.length} total
              </span>
            </div>
            
            <BarChartAnimated 
              data={barData} 
              height={280} 
              showValues={true}
            />
          </div>

          {/* Skills Distribution Chart */}
          <div className="glass-panel rounded-3xl border p-6 sm:p-8 shadow-xl" style={{ borderColor: 'var(--panel-border)' }}>
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 flex items-center justify-center">
                  <Code className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-emerald-400 font-mono">
                    Arsenal Technologique
                  </h3>
                  <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>
                    Distribution des compétences techniques
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono px-3 py-1 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                {skills.length} outils
              </span>
            </div>
            
            <BarChartAnimated 
              data={skillBarData.length ? skillBarData : [{ label: 'Data', value: 5, color: '#06b6d4' }]} 
              height={280} 
              showValues={true}
            />
          </div>
        </div>
      </section>

      {/* Detailed Metrics Section */}
      <section className="relative mx-auto max-w-6xl px-4 sm:px-8 md:px-10 py-12">
        <div className="glass-panel rounded-3xl border p-6 sm:p-8 md:p-10 shadow-xl" style={{ borderColor: 'var(--panel-border)' }}>
          <div className="flex items-center gap-3 mb-8">
            <TrendingUp className="w-6 h-6 text-violet-400" />
            <h2 className="text-xl sm:text-2xl font-bold" style={{ color: 'var(--foreground)' }}>
              Métriques Détaillées du Portfolio
            </h2>
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Taux de Complétion</p>
              <p className="text-3xl font-black text-cyan-400 font-mono">100%</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Projets livrés avec succès</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Technologies Maîtrisées</p>
              <p className="text-3xl font-black text-emerald-400 font-mono">{skills.length}+</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Outils et frameworks</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Années d&apos;Expérience</p>
              <p className="text-3xl font-black text-violet-400 font-mono">
                {experiences.length > 0 ? experiences.length : '2'}+
              </p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Parcours professionnel</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Secteurs d&apos;Activité</p>
              <p className="text-3xl font-black text-amber-400 font-mono">
                {new Set(experiences.map(e => e.company)).size}
              </p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Domaines d&apos;expertise</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Certifications Actives</p>
              <p className="text-3xl font-black text-pink-400 font-mono">{certifications.length}</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Formations validées</p>
            </div>
            
            <div className="space-y-2">
              <p className="text-xs uppercase tracking-wider font-mono text-slate-400">Disponibilité</p>
              <p className="text-3xl font-black text-green-400 font-mono">Oui</p>
              <p className="text-xs" style={{ color: 'var(--foreground-muted)' }}>Nouveaux projets</p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="relative mx-auto max-w-4xl px-4 sm:px-8 md:px-10 py-20 text-center">
        <div className="glass-panel rounded-3xl border border-violet-400/20 p-8 sm:p-12 md:p-16 shadow-2xl">
          <Activity className="w-12 h-12 mx-auto text-violet-400 mb-6" />
          
          <h2 className="text-2xl sm:text-3xl md:text-4xl font-black tracking-tight mb-4" style={{ color: 'var(--foreground)' }}>
            Prêt à Collaborer ?
          </h2>
          
          <p className="max-w-xl mx-auto mb-8" style={{ color: 'var(--foreground-muted)' }}>
            Transformons vos données en insights actionnables et vos idées en produits concrets.
          </p>
          
          <Link
            href="/contact"
            className="inline-flex rounded-full bg-gradient-to-r from-cyan-400 to-violet-400 px-8 py-3 text-sm font-bold text-slate-950 shadow-lg hover:scale-105 transition-transform"
          >
            Démarrer un Projet
          </Link>
        </div>
      </section>
    </main>
  );
}
