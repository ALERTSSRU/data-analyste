'use client';

import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import Link from 'next/link';
import { PortfolioProject } from '@/lib/portfolio';

type ProjectCardProps = PortfolioProject & {
  index: number;
};

export const ProjectCard = ({ index, slug, title, category, summary, metrics }: ProjectCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!cardRef.current) return;

    const card = cardRef.current;

    // Animation d'apparition
    gsap.from(card, {
      y: 50,
      opacity: 0,
      duration: 0.8,
      delay: index * 0.15,
      ease: 'power3.out',
    });

    // Hover animation
    const handleMouseEnter = () => {
      gsap.to(card, {
        y: -10,
        boxShadow: '0 20px 60px rgba(0, 217, 255, 0.3)',
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    const handleMouseLeave = () => {
      gsap.to(card, {
        y: 0,
        boxShadow: '0 10px 30px rgba(0, 0, 0, 0.3)',
        duration: 0.4,
        ease: 'power2.out',
      });
    };

    card.addEventListener('mouseenter', handleMouseEnter);
    card.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      card.removeEventListener('mouseenter', handleMouseEnter);
      card.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [index]);

  return (
    <Link href={`/projects/${slug}`}>
      <div
        ref={cardRef}
        className="group relative overflow-hidden rounded-2xl border border-slate-700/50 bg-linear-to-br from-slate-800/40 via-slate-900/60 to-slate-900/40 backdrop-blur-xl p-6 cursor-pointer transition-all"
      >
        {/* Fond dégradé animé */}
        <div className="absolute inset-0 bg-linear-to-tr from-cyan-500/0 via-transparent to-violet-500/0 group-hover:from-cyan-500/10 group-hover:to-violet-500/10 transition-all duration-500" />

        {/* Contenu */}
        <div className="relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-xs font-bold uppercase tracking-widest text-cyan-300 bg-cyan-500/10 px-3 py-1 rounded-full">
              {category}
            </span>
            <span className="text-xs text-slate-400">Case study</span>
          </div>

          <h3 className="text-2xl font-bold text-white mb-2 group-hover:text-cyan-300 transition-colors">
            {title}
          </h3>

          <p className="text-slate-300 text-sm leading-relaxed mb-4">{summary}</p>

          {/* Metrics */}
          {metrics && metrics.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-4">
              {metrics.slice(0, 2).map((metric, i) => (
                <span key={i} className="text-xs font-medium text-emerald-300 bg-emerald-500/10 px-2 py-1 rounded">
                  {metric}
                </span>
              ))}
            </div>
          )}

          <div className="flex items-center gap-2 text-cyan-300 text-sm font-medium group-hover:gap-3 transition-all">
            Explore
            <span className="text-lg">→</span>
          </div>
        </div>

        {/* Glow effect */}
        <div className="absolute inset-0 bg-radial-gradient from-cyan-500/0 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 blur-2xl" />
      </div>
    </Link>
  );
};
