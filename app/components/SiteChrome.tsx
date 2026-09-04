'use client';

import { DataField } from '@/app/components/canvas/DataField';
import { LenisScroll } from '@/app/components/LenisScroll';
import { LanguageProvider, useLanguage } from '@/lib/LanguageContext';
import { getProfile, ensureExternalUrl } from '@/lib/portfolio';
import { phaseFromProgress, sceneState, tintFromProgress } from '@/lib/scene-state';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useState } from 'react';

gsap.registerPlugin(ScrollTrigger);

function ContactGlyph({ children, className = 'h-4 w-4' }: { children: React.ReactNode; className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className={className} aria-hidden="true">
      {children}
    </svg>
  );
}

function EmailIcon() {
  return (
    <ContactGlyph>
      <rect x="3" y="5" width="18" height="14" rx="2.5" />
      <path d="M3.5 7.5L12 13l8.5-5.5" />
    </ContactGlyph>
  );
}

function LinkedInIcon() {
  return (
    <ContactGlyph>
      <path d="M7.5 9.5v7" />
      <path d="M7.5 6.5h.01" />
      <path d="M11.5 16.5v-4.2c0-1.5 1.2-2.8 2.8-2.8s2.7 1.3 2.7 2.8v4.2" />
      <path d="M11.5 9.5v7" />
    </ContactGlyph>
  );
}

function GitHubIcon() {
  return (
    <ContactGlyph>
      <path d="M9 18.5c-3.7 1.2-3.7-1.8-5-2.1" />
      <path d="M15 20.5v-2.7a3.3 3.3 0 0 0-.9-2.5c3-.3 6.1-1.5 6.1-6.8a5.2 5.2 0 0 0-1.4-3.6 4.7 4.7 0 0 0-.1-3.4s-1.1-.4-3.7 1.4a12.9 12.9 0 0 0-6.7 0C6.5 2.8 5.4 3.2 5.4 3.2a4.7 4.7 0 0 0-.1 3.4A5.2 5.2 0 0 0 3.9 10.2c0 5.3 3.1 6.5 6.1 6.8a3.3 3.3 0 0 0-.9 2.5v2.7" />
    </ContactGlyph>
  );
}

function GlobeIcon() {
  return (
    <ContactGlyph>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M3.5 12h17" />
      <path d="M12 3.5c2.5 2.4 3.8 5.2 3.8 8.5S14.5 18.1 12 20.5c-2.5-2.4-3.8-5.2-3.8-8.5S9.5 5.9 12 3.5Z" />
    </ContactGlyph>
  );
}

function ChatIcon() {
  return (
    <ContactGlyph className="h-5 w-5">
      <path d="M7 17.5 4 19.5v-12a2.5 2.5 0 0 1 2.5-2.5h11A2.5 2.5 0 0 1 20 7.5v8A2.5 2.5 0 0 1 17.5 18H7Z" />
      <path d="M8 10h8" />
      <path d="M8 13h5" />
    </ContactGlyph>
  );
}

// ── Inner chrome (has access to language context) ──
function ChromeInner({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');
  const { lang, setLang, t } = useLanguage();
  const [phase, setPhase] = useState(sceneState.phase);
  const [theme, setTheme] = useState<'dark' | 'light'>('dark');
  const [profile, setProfile] = useState<any>(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHydrated, setIsHydrated] = useState(false);
  const isHome = pathname === '/';

  // Completely bypass public header and overlays on Admin panel
  if (isAdmin) {
    return <div className="min-h-screen bg-[#060913] text-slate-100">{children}</div>;
  }

  // Only show Home link in the header nav per user request
  const links = [
    { href: '/', label: t.nav.home },
  ];

  // Fetch profile for floating contact bubbles
  useEffect(() => {
    if (typeof window !== 'undefined') {
      getProfile().then(setProfile);
    }
  }, []);

  // Mark as hydrated to prevent mismatches
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  // Apply theme class to <html>
  useEffect(() => {
    if (!isHydrated) return;
    const saved = localStorage.getItem('theme') as 'dark' | 'light' | null;
    if (saved && saved !== theme) {
      setTheme(saved);
    }
    document.documentElement.classList.toggle('light', saved === 'light' || (saved === null && theme === 'light'));
  }, [isHydrated, theme]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? 'light' : 'dark';
    setTheme(next);
    try { localStorage.setItem('theme', next); } catch {}
    // Force Lenis / ScrollTrigger to recalculate scroll dimensions after theme CSS changes
    if (typeof window !== 'undefined') {
      requestAnimationFrame(() => {
        window.dispatchEvent(new Event('resize'));
      });
    }
  };

  // Glow / phase sync
  useEffect(() => {
    let frame = 0;
    const tick = () => {
      const tint = tintFromProgress(sceneState.progress);
      if (typeof document !== 'undefined') {
        document.documentElement.style.setProperty('--glow-from', tint.from);
        document.documentElement.style.setProperty('--glow-to', tint.to);
      }
      const next = phaseFromProgress(sceneState.progress);
      setPhase((current) => (current === next ? current : next));
      frame = requestAnimationFrame(tick);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, []);

  useEffect(() => {
    if (typeof window !== 'undefined' && !isHome) {
      sceneState.target = pathname.includes('experiences') ? 0.6 : pathname.includes('project') ? 0.82 : 0.12;
    }
  }, [isHome, pathname]);

  const phaseLabel =
    phase === 'school' ? t.phase.school :
    phase === 'bank'   ? t.phase.bank   :
    phase === 'finale' ? t.phase.finale : t.phase.intro;

  return (
    <LenisScroll>
      <div className="relative min-h-screen transition-colors duration-300" style={{ color: 'var(--foreground)' }}>
        {/* 3D background */}
        <div className="pointer-events-none fixed inset-0 z-0">
          <DataField />
          {/* Overlay gradients reactive to dark/light CSS variables */}
          <div className="absolute inset-0 bg-linear-to-b from-(--overlay-gradient-start) via-(--overlay-gradient-middle) to-(--overlay-gradient-end) transition-all duration-300" />
          <div className="scene-wash absolute inset-0" />
        </div>

        {/* Navigation */}
        <header className="fixed inset-x-0 top-0 z-40 px-2.5 sm:px-4 md:px-6">
          <nav
            className="mx-auto mt-2.5 sm:mt-4 flex max-w-6xl items-center justify-between rounded-full border px-3 sm:px-5 py-2 sm:py-2.5 md:py-3 backdrop-blur-xl transition-all duration-300 shadow-md"
            style={{
              background: 'var(--nav-bg)',
              borderColor: 'var(--nav-border)',
            }}
          >
            {/* Brand */}
            <Link href="/" className="text-xs sm:text-sm font-semibold tracking-[0.16em] sm:tracking-[0.18em] uppercase text-cyan-200 shrink-0">
              Signal
            </Link>

            {/* Nav links (Home only) */}
            <div className="flex items-center gap-4 sm:gap-6 text-xs sm:text-sm" style={{ color: 'var(--foreground-muted)' }}>
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
            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              {/* Phase label */}
              {isHydrated && (
                <span className="hidden text-[10px] uppercase tracking-[0.22em] text-slate-400 md:block">
                  {phaseLabel}
                </span>
              )}

              {/* FR / EN toggle */}
              <button
                onClick={() => setLang(lang === 'fr' ? 'en' : 'fr')}
                className="flex h-7 items-center rounded-full border px-2 sm:px-2.5 text-[9px] sm:text-[10px] font-bold uppercase tracking-wider transition-all duration-300 cursor-pointer"
                style={{
                  borderColor: 'var(--panel-border)',
                  color: 'var(--foreground-muted)',
                }}
                title="Changer la langue"
              >
                <span style={{ color: lang === 'fr' ? 'var(--accent)' : undefined }}>{lang === 'fr' ? 'FR' : 'EN'}</span>
                <span className="mx-0.5 sm:mx-1 opacity-30">|</span>
                <span style={{ color: lang === 'en' ? 'var(--accent)' : undefined }}>{lang === 'fr' ? 'EN' : 'FR'}</span>
              </button>

              {/* Dark / Light toggle */}
              {isHydrated && (
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
              )}

              {/* Admin gear */}
              {isHydrated && pathname !== '/admin' && (
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
        {isHydrated && profile && (
          <div
            className="fixed bottom-4 right-4 sm:bottom-6 sm:right-6 z-50 flex flex-col items-end gap-3 font-sans group"
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
                  <EmailIcon />
                </a>
              )}
              {/* LinkedIn */}
              {profile.linkedin_url && (
                <a
                  href={ensureExternalUrl(profile.linkedin_url)}
                  target="_blank"
                  rel="noreferrer"
                  title="LinkedIn"
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-slate-950/80 shadow-lg text-white hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bubble-float-2"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  <LinkedInIcon />
                </a>
              )}
              {/* GitHub */}
              {profile.github_url && (
                <a
                  href={ensureExternalUrl(profile.github_url)}
                  target="_blank"
                  rel="noreferrer"
                  title="GitHub"
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-slate-950/80 shadow-lg text-white hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bubble-float-3"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  <GitHubIcon />
                </a>
              )}
              {/* Website contact */}
              {profile.website_url && (
                <a
                  href={ensureExternalUrl(profile.website_url)}
                  target="_blank"
                  rel="noreferrer"
                  title="Contact Web"
                  className="flex h-11 w-11 items-center justify-center rounded-full border bg-slate-950/80 shadow-lg text-white hover:border-cyan-400 hover:text-cyan-300 transition-all duration-300 bubble-float-4"
                  style={{ borderColor: 'var(--panel-border)' }}
                >
                  <GlobeIcon />
                </a>
              )}
            </div>

            {/* Main bouncing trigger bubble */}
            <button
              onClick={() => setIsMenuOpen((prev) => !prev)}
              aria-label="Toggle contact menu"
              className="flex h-12 w-12 sm:h-13 sm:w-13 items-center justify-center rounded-full border bg-linear-to-r from-cyan-400 to-sky-500 text-slate-950 shadow-2xl hover:scale-105 active:scale-95 transition-all duration-300 relative cursor-pointer"
              style={{ borderColor: 'rgba(34,211,238,0.3)' }}
            >
              <ChatIcon />
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
