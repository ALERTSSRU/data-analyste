'use client';

import { useEffect, useRef } from 'react';
import { LucideIcon } from 'lucide-react';
import gsap from 'gsap';

type StatCardProps = {
  label: string;
  value: string | number;
  change?: string;
  description?: string;
  icon?: LucideIcon;
  accentColor?: string;
  delay?: number;
};

export const StatCard = ({
  label,
  value,
  change,
  description,
  icon: Icon,
  accentColor = 'from-cyan-500 to-blue-500',
  delay = 0,
}: StatCardProps) => {
  const cardRef = useRef<HTMLDivElement>(null);
  const valueRef = useRef<HTMLParagraphElement>(null);

  useEffect(() => {
    if (cardRef.current) {
      gsap.fromTo(
        cardRef.current,
        { opacity: 0, y: 30 },
        {
          opacity: 1,
          y: 0,
          duration: 0.8,
          ease: 'power3.out',
          delay,
        }
      );
    }

    if (valueRef.current && typeof value === 'number') {
      gsap.fromTo(
        valueRef.current,
        { textContent: 0 },
        {
          textContent: value,
          duration: 1.5,
          ease: 'power3.out',
          delay: delay + 0.3,
          snap: { textContent: 1 },
        }
      );
    }
  }, [value, delay]);

  return (
    <div
      ref={cardRef}
      className="group relative rounded-3xl border p-6 transition-all duration-300 hover:scale-[1.02] shadow-xl overflow-hidden glass-panel"
      style={{
        borderColor: 'var(--panel-border)',
        background: 'var(--card-bg)',
      }}
    >
      <div className={`absolute top-0 right-0 w-24 h-24 bg-gradient-to-bl ${accentColor} opacity-10 blur-2xl group-hover:opacity-25 transition`} />

      <div className="flex items-center justify-between">
        {Icon && (
          <div className={`w-10 h-10 rounded-2xl bg-gradient-to-br ${accentColor} flex items-center justify-center text-white shadow-md`}>
            <Icon className="w-5 h-5" />
          </div>
        )}
        {change && (
          <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-full bg-emerald-500/15 text-emerald-400 border border-emerald-500/20">
            {change}
          </span>
        )}
      </div>

      <div className="mt-5">
        <p 
          ref={valueRef}
          className="text-3xl sm:text-4xl font-black tracking-tight font-mono text-cyan-300"
        >
          {typeof value === 'number' ? '0' : value}
        </p>
        <h3 className="mt-1 text-sm font-bold tracking-tight" style={{ color: 'var(--foreground)' }}>
          {label}
        </h3>
        {description && (
          <p className="mt-2 text-xs leading-relaxed" style={{ color: 'var(--foreground-muted)' }}>
            {description}
          </p>
        )}
      </div>
    </div>
  );
};
