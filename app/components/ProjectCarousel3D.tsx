'use client';

import type { PortfolioProject } from '@/lib/portfolio';
import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';

interface ProjectCarousel3DProps {
  projects: PortfolioProject[];
}

export function ProjectCarousel3D({ projects }: ProjectCarousel3DProps) {
  const count        = projects.length;
  const [angle, setAngle]           = useState(0);
  const [targetAngle, setTargetAngle] = useState(0);
  const [activeIndex, setActiveIndex] = useState(0);
  const [isPaused, setIsPaused]       = useState(false);

  // Internal refs — never cause re-renders
  const rafRef          = useRef<number>(0);
  const autoTimerRef    = useRef<ReturnType<typeof setInterval> | null>(null);
  const resumeRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const stageRef        = useRef<HTMLDivElement>(null);

  const dragActiveRef   = useRef(false); // true ONLY when confirmed horizontal drag
  const startXRef       = useRef(0);
  const startYRef       = useRef(0);
  const baseAngleRef    = useRef(0);
  const movedRef        = useRef(false); // whether pointer moved enough to block click

  const [screenWidth, setScreenWidth] = useState(1024);

  useEffect(() => {
    const handleResize = () => setScreenWidth(window.innerWidth);
    handleResize();
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const isMobile = screenWidth < 640;
  const isTablet = screenWidth >= 640 && screenWidth < 1024;

  const cardWidth   = isMobile ? 220 : isTablet ? 250 : 270;
  const stageHeight = isMobile ? 330 : 390;
  const anglePerCard = count > 0 ? 360 / count : 0;
  const radius       = isMobile
    ? Math.max(180, count * 50)
    : isTablet
    ? Math.max(230, count * 60)
    : Math.max(280, count * 72);

  // ── Smooth damping ──
  useEffect(() => {
    const loop = () => {
      setAngle((prev) => {
        const d = targetAngle - prev;
        return Math.abs(d) < 0.04 ? targetAngle : prev + d * 0.09;
      });
      rafRef.current = requestAnimationFrame(loop);
    };
    rafRef.current = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(rafRef.current);
  }, [targetAngle]);

  // ── Active index ──
  useEffect(() => {
    const n = ((-angle % 360) + 360) % 360;
    const i = Math.round(n / anglePerCard) % count;
    setActiveIndex(i < 0 ? i + count : i);
  }, [angle, anglePerCard, count]);

  // ── Auto-rotation helpers ──
  const startAuto = () => {
    stopAuto();
    autoTimerRef.current = setInterval(() => {
      setTargetAngle((p) => p - 0.28);
    }, 30);
  };
  const stopAuto = () => {
    if (autoTimerRef.current) { clearInterval(autoTimerRef.current); autoTimerRef.current = null; }
  };
  const scheduleResume = (ms = 2400) => {
    if (resumeRef.current) clearTimeout(resumeRef.current);
    resumeRef.current = setTimeout(() => setIsPaused(false), ms);
  };

  useEffect(() => {
    if (!isPaused) startAuto(); else stopAuto();
    return stopAuto;
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPaused]);

  // ── Native-friendly pointer handlers ──
  // Strategy: attach raw listeners to the stage element so we can call
  // preventDefault ONLY after confirming a horizontal drag — browsers
  // require this to happen in a non-passive listener attached via addEventListener.
  useEffect(() => {
    const el = stageRef.current;
    if (!el) return;

    const onDown = (e: PointerEvent) => {
      if (e.button !== 0) return; // left button only
      startXRef.current    = e.clientX;
      startYRef.current    = e.clientY;
      baseAngleRef.current = targetAngle; // captured via closure — see note*
      dragActiveRef.current = false;
      movedRef.current      = false;
    };

    const onMove = (e: PointerEvent) => {
      if (e.buttons !== 1) return; // only while left button held
      const dx = e.clientX - startXRef.current;
      const dy = e.clientY - startYRef.current;

      if (!dragActiveRef.current) {
        const dist = Math.hypot(dx, dy);
        if (dist < 8) return;
        // Vertical dominant → let page scroll, don't drag carousel
        if (Math.abs(dy) > Math.abs(dx)) return;
        // Confirmed horizontal drag
        dragActiveRef.current = true;
        movedRef.current      = true;
        stopAuto();
        if (resumeRef.current) clearTimeout(resumeRef.current);
      }

      if (dragActiveRef.current) {
        // Only prevent scroll after confirmed horizontal drag
        e.preventDefault();
        setTargetAngle(baseAngleRef.current + dx * 0.20);
      }
    };

    const onUp = () => {
      if (dragActiveRef.current) {
        // Snap to nearest slot
        setTargetAngle((prev) => Math.round(prev / anglePerCard) * anglePerCard);
        scheduleResume();
      }
      dragActiveRef.current = false;
      // movedRef stays true briefly so click handlers can check it
      setTimeout(() => { movedRef.current = false; }, 50);
    };

    // { passive: false } is required so we can call e.preventDefault() on horizontal drag
    el.addEventListener('pointerdown', onDown);
    el.addEventListener('pointermove', onMove, { passive: false });
    el.addEventListener('pointerup',   onUp);
    el.addEventListener('pointerleave', onUp);

    return () => {
      el.removeEventListener('pointerdown', onDown);
      el.removeEventListener('pointermove', onMove);
      el.removeEventListener('pointerup',   onUp);
      el.removeEventListener('pointerleave', onUp);
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [anglePerCard]); // *targetAngle is read via a separate ref below

  // Keep baseAngleRef in sync with targetAngle so the closure always has latest value
  const targetAngleRef = useRef(targetAngle);
  useEffect(() => {
    targetAngleRef.current = targetAngle;
    // Also patch baseAngle when NOT dragging so next drag starts fresh
    if (!dragActiveRef.current) baseAngleRef.current = targetAngle;
  }, [targetAngle]);

  const goTo = (idx: number) => {
    stopAuto();
    setTargetAngle(-idx * anglePerCard);
    scheduleResume(2600);
  };

  if (count === 0) return null;

  return (
    <div className="relative w-full select-none">
      {/* 
        touch-action: pan-y — tells browser:
          "Handle vertical scroll natively; let JS handle horizontal gestures."
        This is the KEY fix that allows page scroll to always work.
      */}
      <div
        ref={stageRef}
        className="relative mx-auto overflow-visible"
        style={{
          height: stageHeight,
          perspective: isMobile ? '800px' : '1200px',
          perspectiveOrigin: '50% 45%',
          touchAction: 'pan-y',
          cursor: 'grab',
        }}
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
            const cardAngle = i * anglePerCard;
            const isActive  = i === activeIndex;
            const scale      = isActive ? 1.0 : 0.84;
            const brightness = isActive ? 1   : 0.52;

            return (
              <div
                key={project.slug}
                className="absolute"
                style={{
                  width: cardWidth,
                  left: '50%',
                  top: '50%',
                  marginLeft: -cardWidth / 2,
                  marginTop:  -165,
                  transformStyle: 'preserve-3d',
                  transform: `rotateY(${cardAngle}deg) translateZ(${radius}px)`,
                }}
                onMouseEnter={() => setIsPaused(true)}
                onMouseLeave={() => { setIsPaused(false); if (resumeRef.current) clearTimeout(resumeRef.current); }}
              >
                <Link
                  href={`/projects/${project.slug}`}
                  draggable={false}
                  onClick={(e) => {
                    // Block navigation if the user was actually dragging
                    if (movedRef.current) e.preventDefault();
                  }}
                  style={{
                    display: 'block',
                    transform: `scale(${scale})`,
                    filter: `brightness(${brightness})`,
                    transition: 'transform 0.4s cubic-bezier(0.34,1.56,0.64,1), filter 0.3s ease',
                    pointerEvents: dragActiveRef.current ? 'none' : 'auto',
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
                    <div className="p-4" style={{ background: 'rgba(0,0,0,0.05)' }}>
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
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{
              width:  i === activeIndex ? 20 : 6,
              height: 6,
              background: i === activeIndex ? 'var(--accent)' : 'rgba(148,163,184,0.30)',
            }}
          />
        ))}
      </div>

      <p
        className="mt-2.5 text-center text-[9px] uppercase tracking-[0.22em]"
        style={{ color: 'var(--foreground-faint)' }}
      >
        ← glissez pour explorer →
      </p>
    </div>
  );
}
