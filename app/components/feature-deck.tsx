'use client';

import Link from 'next/link';
import { useEffect, useMemo, useState } from 'react';

type Feature = {
  slug: string;
  title: string;
  kicker: string;
  summary: string;
  tag: string;
  accent: string;
};

const features: Feature[] = [
  {
    slug: 'customer-intelligence-hub',
    title: 'Customer Intelligence Hub',
    kicker: 'Data product',
    summary:
      'Dashboard centralisé pour transformer des données transactionnelles en insights marketing et décisions opérationnelles.',
    tag: 'BI / SQL / KPI',
    accent: 'from-cyan-400/80 via-sky-500/80 to-emerald-400/80',
  },
  {
    slug: 'supply-chain-signal',
    title: 'Supply Chain Signal',
    kicker: 'Operational analytics',
    summary:
      'Monitoring des flux, anomalies et performance logistique avec alerting et pilotage temps réel.',
    tag: 'ETL / Monitoring / Ops',
    accent: 'from-violet-500/80 via-indigo-500/80 to-cyan-400/80',
  },
  {
    slug: 'forecast-decision-layer',
    title: 'Forecast Decision Layer',
    kicker: 'Decision support',
    summary:
      'Modélisation forecasting couplée à une interface decision-ready pour guider les équipes produit et commercial.',
    tag: 'Predictive / UX / Data',
    accent: 'from-emerald-500/80 via-teal-500/80 to-cyan-400/80',
  },
  {
    slug: 'data-ops-automation',
    title: 'Data Ops Automation',
    kicker: 'Automation',
    summary:
      'Automatisation de tâches, pipelines et validations de qualité sur des volumes de données métiers complexes.',
    tag: 'Python / Pipeline / QA',
    accent: 'from-amber-400/80 via-orange-500/80 to-pink-500/80',
  },
];

export function FeatureDeck() {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  useEffect(() => {
    if (isPaused) return;

    const timer = window.setInterval(() => {
      setActiveIndex((current) => (current + 1) % features.length);
    }, 2600);

    return () => window.clearInterval(timer);
  }, [isPaused]);

  const visible = useMemo(() => {
    const ordered = features.map((feature, index) => {
      const offset = (index - activeIndex + features.length) % features.length;
      return { ...feature, offset };
    });

    return ordered.sort((a, b) => a.offset - b.offset).slice(0, 3);
  }, [activeIndex]);

  return (
    <div
      className="relative h-[430px] w-full"
      onMouseEnter={() => setIsPaused(true)}
      onMouseLeave={() => setIsPaused(false)}
    >
      {visible.map((feature) => {
        const offset = feature.offset;
        const depth = offset === 0 ? 'z-30 scale-100' : offset === 1 ? 'z-20 scale-[0.96]' : 'z-10 scale-[0.92]';

        return (
          <Link
            key={feature.slug}
            href={`/projects/${feature.slug}`}
            className={`group absolute left-1/2 top-1/2 flex h-[300px] w-[76%] max-w-[520px] -translate-x-1/2 -translate-y-1/2 flex-col justify-between overflow-hidden rounded-[28px] border border-slate-700/80 bg-slate-950/80 p-6 shadow-2xl transition-all duration-500 ${depth}`}
            style={{
              transform: `translate(-50%, -50%) translateX(${offset * 16}px) translateY(${offset * 20}px) rotate(${offset * 2.6}deg)`,
              opacity: offset > 2 ? 0 : 1,
            }}
          >
            <div className={`absolute inset-0 bg-gradient-to-br ${feature.accent} opacity-90`} />
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.22),transparent_30%)]" />

            <div className="relative z-10 flex items-center justify-between">
              <span className="rounded-full border border-white/25 bg-slate-950/30 px-2.5 py-1 text-[10px] uppercase tracking-[0.25em] text-white/80">
                {feature.kicker}
              </span>
              <span className="text-xs font-medium text-white/70">{feature.tag}</span>
            </div>

            <div className="relative z-10">
              <h3 className="text-2xl font-black tracking-[-0.05em] text-white md:text-3xl">{feature.title}</h3>
              <p className="mt-4 max-w-md text-base leading-7 text-slate-100/90">{feature.summary}</p>
            </div>

            <div className="relative z-10 flex items-center justify-between border-t border-white/15 pt-4 text-sm text-white/80">
              <span>Open case study</span>
              <span aria-hidden="true">→</span>
            </div>
          </Link>
        );
      })}
    </div>
  );
}
