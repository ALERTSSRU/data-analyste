'use client';

import type { PortfolioProject } from '@/lib/portfolio';
import Link from 'next/link';
import { useCallback, useEffect, useRef, useState } from 'react';

interface ProjectCarousel3DProps {
  projects: PortfolioProject[];
}

export function ProjectCarousel3D({ projects }: ProjectCarousel3DProps) {
  const count = projects.length;
  const [activeIndex, setActiveIndex] = useState(0);
  const [angle, setAngle] = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isPaused, setIsPaused] = useState(false);
  // Track if pointer moved enough to be a drag (not a click)
  const didDragRef     = useRef(false);
  const dragStartX     = useRef(0);
  const dragStartY     = useRef(0);
  const dragBaseAngle  = useRef(0);
  const rafRef         = useRef<number>(0);
  const autoRef        = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeTimeout  = useRef<ReturnType<typeof setTimeout> | null>(null);

  const anglePerCard = count > 0 ? 360 / count : 0;
  const radius       = Math.max(280, count * 72);

  // ── Smooth angle damping ──
  useEffect(() => {
    const animate = () => {
      setAngle((prev) => {
        const diff = targetAngle - prev;
        if (Math.abs(diff) < 0.04) return targetAngle;
        return prev + diff * 0.09;
      });
      rafRef.current = requestAnimationFrame(animate);
    };
    rafRef.current = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetAngle]);

  // ── Auto-rotation (pauses on hover / drag) ──
  const startAuto = useCallback(() => {
    if (autoRef.current) clearInterval(autoRef.current);
    autoRef.current = setInterval(() => {
      setTargetAngle((prev) => prev - 0.30);
    }, 30);
  }, []);

  const stopAuto = useCallback(() => {
    if (autoRef.current) { clearInterval(autoRef.current); autoRef.current = null; }
  }, []);

  useEffect(() => {
    if (!isPaused && !isDragging) { startAuto(); } else { stopAuto(); }
    return stopAuto;
  }, [isPaused, isDragging, startAuto, stopAuto]);

  // Compute active index from angle
  useEffect(() => {
    const normalized = ((-angle % 360) + 360) % 360;
    const idx = Math.round(normalized / anglePerCard) % count;
    setActiveIndex(idx < 0 ? idx + count : idx);
  }, [angle, anglePerCard, count]);

  // ── DRAG: Only activate if user pulls HORIZONTALLY ≥ 10px ──
  const onPointerDown = useCallback((e: React.PointerEvent) => {
    // Only left button (button 0)
    if (e.button !== 0) return;
    dragStartX.current   = e.clientX;
    dragStartY.current   = e.clientY;
    dragBaseAngle.current = targetAngle;
    didDragRef.current   = false;
  }, [targetAngle]);

  const onPointerMove = useCallback((e: React.PointerEvent) => {
    const dx = e.clientX - dragStartX.current;
    const dy = e.clientY - dragStartY.current;

    // Only capture once intent is confirmed as horizontal drag
    if (!didDragRef.current) {
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 10) return;                         // too small – ignore
      if (Math.abs(dy) > Math.abs(dx)) return;       // more vertical than horizontal – let page scroll
      // Confirmed horizontal drag
      didDragRef.current = true;
      setIsDragging(true);
      stopAuto();
      if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    }

    if (didDragRef.current) {
      // Prevent page scroll only during confirmed horizontal drag
      e.stopPropagation();
      setTargetAngle(dragBaseAngle.current + dx * 0.20);
    }
  }, [stopAuto]);

  const onPointerUp = useCallback((e: React.PointerEvent) => {
    if (!didDragRef.current) {
      // Was a tap/click, not drag – nothing to snap
      setIsDragging(false);
      return;
    }
    // Snap to nearest card
    const snapped = Math.round(targetAngle / anglePerCard) * anglePerCard;
    setTargetAngle(snapped);
    setIsDragging(false);
    didDragRef.current = false;
    // Resume auto-rotation after a comfortable delay
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => setIsPaused(false), 2400);
  }, [targetAngle, anglePerCard]);

  const goTo = (idx: number) => {
    stopAuto();
    setTargetAngle(-idx * anglePerCard);
    if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
    resumeTimeout.current = setTimeout(() => setIsPaused(false), 2600);
  };

  if (count === 0) return null;

  return (
    <div className="relative w-full select-none">
      {/* 3D stage – only captures pointer events for horizontal drag */}
      <div
        className="relative mx-auto overflow-visible"
        style={{
          height: 390,
          perspective: '1200px',
          perspectiveOrigin: '50% 45%',
          cursor: isDragging ? 'grabbing' : 'grab',
        }}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={onPointerUp}
        onPointerLeave={onPointerUp}
      >
        {/* Rotating cylinder */}
        <div
          className="absolute inset-0"
          style={{
            transformStyle: 'preserve-3d',
            transform: `rotateY(${angle}deg)`,
          }}
        >
          {projects.map((project, i) => {
            const cardAngle  = i * anglePerCard;
            const isActive   = i === activeIndex;
            const scale      = isActive ? 1.0 : 0.84;
            const brightness = isActive ? 1 : 0.52;

            return (
              <div
                key={project.slug}
                className="absolute"
                style={{
                  width: 270,
                  left: '50%',
                  top: '50%',
                  marginLeft: -135,
                  marginTop: -165,
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => {
                  setIsPaused(false);
                  if (resumeTimeout.current) clearTimeout(resumeTimeout.current);
                }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  draggable={false}
                  onClick={(e) => {
                    // Prevent navigation if the user was dragging
                    if (didDragRef.current) { e.preventDefault(); }
                  }}
                  style={{
                    display: 'block',
                    transform: `scale(${scale})`,
                    filter: `brightness(${brightness})`,
                    transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease',
                    pointerEvents: isDragging ? 'none' : 'auto',
                  }}
                >
                  <div
                    className="rounded-[20px] border overflow-hidden shadow-xl"
                    style={{
                      background: 'var(--card-bg)',
                      borderColor: isActive ? 'rgba(34,211,238,0.28)' : 'var(--panel-border)',
                      boxShadow: isActive
                        ? '0 0 32px rgba(34,211,238,0.14), 0 24px 48px rgba(0,0,0,0.55)'
                        : '0 6px 24px rgba(0,0,0,0.35)',
                      transition: 'box-shadow 0.35s ease, border-color 0.35s ease',
                    }}
                  >
                    {/* Image */}
                    <div className="relative h-36 w-full overflow-hidden">
                      {project.image_url ? (
                        <img
                          src={project.image_url}
                          alt={project.title}
                          draggable={false}
                          className="h-full w-full object-cover"
                          style={{
                            transform: isActive ? 'scale(1.06)' : 'scale(1)',
                            transition: 'transform 0.5s ease',
                          }}
                        />
                      ) : (
                        <div
                          className="h-full w-full"
                          style={{
                            background:
                              'radial-gradient(circle at 30% 30%, rgba(34,211,238,0.18) 0%, transparent 55%), linear-gradient(135deg, #0f172a 0%, #0b1221 100%)',
                          }}
                        />
                      )}
                      <div
                        className="absolute inset-0"
                        style={{ background: 'linear-gradient(to bottom, transparent 40%, var(--card-bg) 100%)' }}
                      />
                      {project.category && (
                        <span
                          className="absolute bottom-2.5 left-3 text-[8px] uppercase tracking-[0.26em] font-semibold px-2 py-0.5 rounded-full"
                          style={{
                            background: 'rgba(34,211,238,0.10)',
                            color: 'var(--accent)',
                            border: '1px solid rgba(34,211,238,0.18)',
                          }}
                        >
                          {project.category}
                        </span>
                      )}
                    </div>

                    {/* Content */}
                    <div className="p-4" style={{ background: 'rgba(0,0,0,0.06)' }}>
                      <h3
                        className="text-base font-bold leading-tight line-clamp-1"
                        style={{ color: 'var(--foreground)' }}
                      >
                        {project.title}
                      </h3>
                      <p
                        className="mt-1.5 text-[11px] leading-relaxed line-clamp-2"
                        style={{ color: 'var(--foreground-muted)' }}
                      >
                        {project.summary}
                      </p>

                      {project.metrics && project.metrics.length > 0 && (
                        <div className="mt-2.5 flex flex-wrap gap-1">
                          {project.metrics.slice(0, 2).map((m) => (
                            <span
                              key={m}
                              className="rounded-full px-2 py-0.5 text-[9px] font-semibold text-emerald-300 bg-emerald-500/10 border border-emerald-500/20"
                            >
                              {m}
                            </span>
                          ))}
                        </div>
                      )}

                      <div
                        className="mt-3.5 flex items-center gap-1 text-[11px] font-semibold transition-colors duration-300"
                        style={{ color: isActive ? 'var(--accent)' : 'var(--foreground-faint)' }}
                      >
                        Voir le projet
                        <svg viewBox="0 0 16 16" fill="none" className="h-3 w-3" stroke="currentColor" strokeWidth={2}>
                          <path d="M3 8h10M9 4l4 4-4 4" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            );
          })}
        </div>
      </div>

      {/* Dot navigator */}
      <div className="mt-4 flex justify-center gap-2">
        {projects.map((_, i) => (
          <button
            key={i}
            onClick={() => goTo(i)}
            className="rounded-full transition-all duration-300"
            style={{
              width:  i === activeIndex ? 20 : 6,
              height: 6,
              background: i === activeIndex ? 'var(--accent)' : 'rgba(148,163,184,0.30)',
            }}
          />
        ))}
      </div>

      <p className="mt-2.5 text-center text-[9px] uppercase tracking-[0.22em]" style={{ color: 'var(--foreground-faint)' }}>
        ← glissez pour explorer →
      </p>
    </div>
  );
}
