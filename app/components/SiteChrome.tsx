'use client';

import { DataField } from '@/app/components/canvas/DataField';
import { LenisScroll } from '@/app/components/LenisScroll';
import { LanguageProvider, useLanguage } from '@/lib/LanguageContext';
import { phaseFromProgress, sceneState, tintFromProgress } from '@/lib/scene-state';
import { getProfile } from '@/lib/portfolio';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

// ── Inner chrome (has access to language context) ──
function ChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { lang, setLang, t } = useLanguage();
  const [phase, setPhase] = useState(sceneState.phase);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const isHome = pathname === '/';

  // Only show Home link in the header nav per user request
  const links = [
    { href: '/', label: t.nav.home },
  ];

  // Fetch profile for floating contact bubbles
  useEffect(() => {
    getProfile().then(setProfile);
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved) { 
      setTheme(saved); 
      document.documentElement.classList.toggle('light', saved === 'light'); 
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    document.documentElement.classList.toggle('light', next === 'light');
    try { localStorage.setItem('theme', next); } catch {}
  };

  // Glow / phase sync
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const tint = tintFromProgress(sceneState.progress);
      document.documentElement.style.setProperty('--glow-from', tint.from);
      document.documentElement.style.setProperty('--glow-to', tint.to);
      const next = phaseFromProgress(sceneState.progress);
      setPhase((current) => (current === next ? current : next));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (!isHome) {
      sceneState.target = pathname.includes('experiences') ? 0.6 : pathname.includes('project') ? 0.82 : 0.12;
    }
  }, [isHome, pathname]);

  const phaseLabel =
    phase === 'school' ? t.phase.school :
    phase === 'bank'   ? t.phase.bank   :
    phase === 'finale' ? t.phase.finale : t.phase.intro;

  return (
    <LenisScroll>
      <div className="relative min-h-screen text-slate-100 transition-colors duration-300">
        {/* 3D background */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <DataField />
          {/* Overlay gradients reactive to dark/light CSS variables */}
          <div className="absolute inset-0 bg-gradient-to-b from-[var(--overlay-gradient-start)] via-[var(--overlay-gradient-middle)] to-[var(--overlay-gradient-end)] transition-all duration-300" />
          <div className="scene-wash absolute inset-0" />
        </div>

        {/* Navigation */}
        <header className="fixed inset-x-0 top-0 z-40">
          <nav
            className="mx-auto mt-4 flex max-w-6xl items-center justify-between rounded-full border px-5 py-3 backdrop-blur-xl transition-all duration-300"
            style={{
              background: 'var(--nav-bg)',
              borderColor: 'var(--nav-border)',
            }}
          >
            {/* Brand */}
            <Link href="/" className="text-sm font-semibold tracking-[0.18em] uppercase text-cyan-200">
              Signal
            </Link>

            {/* Nav links (Home only) */}
            <div className="flex items-center gap-6 text-sm" style={{ color: 'var(--foreground-muted)' }}>
              {links.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  style={{ color: pathname === link.href ? 'var(--foreground)' : undefined }}
                  className="hover:text-white transition-colors font-semibold"
                >
                  {link.label}
                </Link>
              ))}
            </div>

            {/* Right controls */}
            <div className="flex items-center gap-2">
              {/* Phase label */}
              <span className="hidden text-[10px] uppercase tracking-[0.22em] text-slate-400 sm:block">
                {phaseLabel}
              </span>

              {/* FR / EN toggle */}
              <button
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="flex h-7 items-center rounded-full border px-2.5 text-[10px] font-bold uppercase tracking-widest transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: 'var(--panel-border)',
                  color: 'var(--foreground-muted)',
                }}
                title="Changer la langue"
              >
                <span style={{ color: lang === 'fr' ? 'var(--accent)' : undefined }}>{lang === 'fr' ? 'FR' : 'EN'}</span>
                <span className="mx-1 opacity-30">|</span>
                <span style={{ color: lang === 'en' ? 'var(--accent)' : undefined }}>{lang === 'fr' ? 'EN' : 'FR'}</span>
              </button>

              {/* Dark / Light toggle */}
              <button
                onClick={toggleTheme}
                title={theme === 'dark' ? 'Mode clair' : 'Mode sombre'}
                className="flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 hover:border-cyan-500/40 hover:text-cyan-400/70 cursor-pointer"
                style={{ borderColor: 'var(--panel-border)', color: 'var(--foreground-muted)' }}
              >
                {theme === 'dark' ? (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M10 2a1 1 0 011 1v1a1 1 0 11-2 0V3a1 1 0 011-1zm4 8a4 4 0 11-8 0 4 4 0 018 0zm-.464 4.95l.707.707a1 1 0 001.414-1.414l-.707-.707a1 1 0 00-1.414 1.414zm2.12-10.607a1 1 0 010 1.414l-.706.707a1 1 0 11-1.414-1.414l.707-.707a1 1 0 011.414 0zM17 11a1 1 0 100-2h-1a1 1 0 100 2h1zm-7 4a1 1 0 011 1v1a1 1 0 11-2 0v-1a1 1 0 011-1zM5.05 6.464A1 1 0 106.465 5.05l-.708-.707a1 1 0 00-1.414 1.414l.707.707zm1.414 8.486l-.707.707a1 1 0 01-1.414-1.414l.707-.707a1 1 0 011.414 1.414zM4 11a1 1 0 100-2H3a1 1 0 000 2h1z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path d="M17.293 13.293A8 8 0 016.707 2.707a8.001 8.001 0 1010.586 10.586z" />
                  </svg>
                )}
              </button>

              {/* Admin gear */}
              {pathname !== '/admin' && (
                <Link
                  href="/admin"
                  title="Tableau de bord administrateur"
                  className="flex h-7 w-7 items-center justify-center rounded-full border transition-all duration-300 hover:border-cyan-500/40 hover:text-cyan-400/70"
                  style={{ borderColor: 'var(--panel-border)', color: 'var(--foreground-muted)' }}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="currentColor" className="h-3.5 w-3.5">
                    <path fillRule="evenodd" d="M8.34 1.804A1 1 0 0 1 9.32 1h1.36a1 1 0 0 1 .98.804l.295 1.473c.497.144.971.342 1.416.587l1.25-.834a1 1 0 0 1 1.21.148l.962.962a1 1 0 0 1 .148 1.21l-.834 1.25c.245.445.443.919.587 1.416l1.473.295a1 1 0 0 1 .804.98v1.36a1 1 0 0 1-.804.98l-1.473.295a6.95 6.95 0 0 1-.587 1.416l.834 1.25a1 1 0 0 1-.148 1.21l-.962.962a1 1 0 0 1-1.21.148l-1.25-.834a6.953 6.953 0 0 1-1.416.587l-.295 1.473a1 1 0 0 1-.98.804H9.32a1 1 0 0 1-.98-.804l-.295-1.473a6.957 6.957 0 0 1-1.416-.587l-1.25.834a1 1 0 0 1-1.21-.148l-.962-.962a1 1 0 0 1-.148-1.21l.834-1.25a6.957 6.957 0 0 1-.587-1.416l-1.473-.295A1 1 0 0 1 1 10.68V9.32a1 1 0 0 1 .804-.98l1.473-.295c.144-.497.342-.971.587-1.416l-.834-1.25a1 1 0 0 1 .148-1.21l.962-.962a1 1 0 0 1 1.21-.148l1.25.834a6.957 6.957 0 0 1 1.416-.587l.295-1.473ZM10 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6Z" clipRule="evenodd" />
                  </svg>
                </Link>
              )}
            </div>
          </nav>
        </header>

        <div className="relative z-10 page-enter">{children}</div>

        {/* Floating Bouncing Contact Bubbles */}
        {profile && (
          <div 
            className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-3 font-sans group"
            onMouseEnter={() => setIsMenuOpen(true)}
            onMouseLeave={() => setIsMenuOpen(false)}
          >
            {/* Expanded bouncing bubbles */}
            <div 
              className={`flex flex-col gap-2.5 items-center transition-all duration-300 origin-bottom mb-1 ${
                isMenuOpen 
                  ? 'scale-100 opacity-100 pointer-events-auto' 
                  : 'scale-75 opacity-0 pointer-events-none'
              }`}
            >
              {/* Email */}
              {profile.email && (
                <a
                  href={`mailto:${profile.email}`}
                  title="Email"
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-slate-950/80 shadow-lg text-white hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bubble-float-1"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  📧
                </a>
              )}
              {/* LinkedIn */}
              {profile.linkedin_url && (
                <a
                  href={profile.linkedin_url}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-slate-950/80 shadow-lg text-white hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bubble-float-2"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  💼
                </a>
              )}
              {/* GitHub */}
              {profile.github_url && (
                <a
                  href={profile.github_url}
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-slate-950/80 shadow-lg text-white hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bubble-float-3"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  💻
                </a>
              )}
              {/* Website contact */}
              {profile.website_url && (
                <a
                  href={profile.website_url}
                  target="_blank"
                  rel="noreferrer"
                  title="Contact Web"
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-slate-950/80 shadow-lg text-white hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bubble-float-4"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  🌐
                </a>
              )}
            </div>

            {/* Main bouncing trigger bubble */}
            <button
              className="flex h-13 w-13 items-center justify-center rounded-full border bg-gradient-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative cursor-pointer"
              style={{ borderColor: 'rgba(34,211,238,0.3)' }}
            >
              <span className="text-xl">💬</span>
              {/* Pulsing notification dot */}
              <span className="absolute -top-0.5 -right-0.5 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-cyan-300"></span>
              </span>
            </button>
          </div>
        )}
      </div>
    </LenisScroll>
  );
}

// ── Outer wrapper with language provider ──
export function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <LanguageProvider>
      <ChromeInner>{children}</ChromeInner>
    </LanguageProvider>
  );
}
