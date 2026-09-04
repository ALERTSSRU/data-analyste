'use client';

import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import { usePathname } from 'next/navigation';
import { useEffect } from 'react';

gsap.registerPlugin(ScrollTrigger);

export function LenisScroll({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const isAdmin = pathname?.startsWith('/admin');

  useEffect(() => {
    if (isAdmin) return; // Completely disable smooth scroll on admin dashboard

    const lenis = new Lenis({
      duration: 1.0,
      lerp: 0.1,
      smoothWheel: true,
      prevent: (node) => {
        // Prevent Lenis from hijacking scroll inside any admin or nested scroll container
        return node.classList.contains('overflow-y-auto') || node.closest('.overflow-y-auto') !== null;
      },
    });

    lenis.on('scroll', ScrollTrigger.update);

    const ticker = (time: number) => {
      lenis.raf(time * 1000);
    };
    gsap.ticker.add(ticker);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(ticker);
      lenis.destroy();
    };
  }, [isAdmin]);

  return <>{children}</>;
}
