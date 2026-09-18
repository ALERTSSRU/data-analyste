'use client';

import React, { useRef, useEffect } from 'react';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

gsap.registerPlugin(ScrollTrigger);

type Direction = 'up' | 'down' | 'left' | 'right' | 'scale' | 'rotate';

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  direction?: Direction;
  distance?: number;
  easing?: string;
  threshold?: number;
  scaleFrom?: number;
  rotateFrom?: number;
  stagger?: number;
}

export const ScrollReveal = ({
  children,
  delay = 0,
  duration = 0.8,
  direction = 'up',
  distance = 60,
  easing = 'power3.out',
  threshold = 0.15,
  scaleFrom = 0.9,
  rotateFrom = 0,
  stagger = 0,
}: ScrollRevealProps) => {
  const ref = useRef<HTMLDivElement>(null);
  const childRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!ref.current || !childRef.current) return;

    // Determine initial state based on direction
    let initialY = 0;
    let initialX = 0;
    let initialScale = scaleFrom;
    let initialRotate = rotateFrom;

    switch (direction) {
      case 'up':
        initialY = distance;
        break;
      case 'down':
        initialY = -distance;
        break;
      case 'left':
        initialX = distance;
        break;
      case 'right':
        initialX = -distance;
        break;
    }

    // Premium easing presets
    const easings: Record<string, string> = {
      'power1.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'power2.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'power3.out': 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
      'power4.out': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'back.out(1.7)': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'elastic.out(1, 0.5)': 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
      'expo.out': 'cubic-bezier(0.19, 1, 0.22, 1)',
      'circ.out': 'cubic-bezier(0, 0.55, 0.45, 1)',
      'quint.out': 'cubic-bezier(0.23, 1, 0.32, 1)',
    };

    const getEasing = (name: string) => {
      return easings[name] || 'cubic-bezier(0.25, 0.46, 0.45, 0.94)';
    };

    const ctx = gsap.context(() => {
      gsap.fromTo(
        childRef.current,
        {
          y: initialY,
          x: initialX,
          scale: initialScale,
          rotation: initialRotate,
          opacity: 0,
          filter: 'blur(10px)',
        },
        {
          y: 0,
          x: 0,
          scale: 1,
          rotation: 0,
          opacity: 1,
          filter: 'blur(0px)',
          duration,
          delay,
          ease: easing,
          scrollTrigger: {
            trigger: ref.current,
            start: `top ${1 - threshold * 100}%`,
            end: `bottom ${threshold * 100}%`,
            toggleActions: 'play none none reverse',
            markers: false,
            scrub: false,
          },
        }
      );
    });

    return () => ctx.revert();
  }, [delay, duration, direction, distance, easing, threshold, scaleFrom, rotateFrom]);

  // Handle stagger for multiple children
  const wrappedChildren = stagger > 0 
    ? React.Children.map(children, (child, index) => (
        <div 
          key={index} 
          style={{ transitionDelay: `${index * stagger}ms` }}
        >
          {child}
        </div>
      ))
    : children;

  return (
    <div ref={ref} className="will-change-transform">
      <div ref={childRef} className="h-full w-full">
        {wrappedChildren}
      </div>
    </div>
  );
};

// Convenience variants for common animations
export const RevealUp = (props: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal direction="up" {...props} />
);

export const RevealDown = (props: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal direction="down" {...props} />
);

export const RevealLeft = (props: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal direction="left" {...props} />
);

export const RevealRight = (props: Omit<ScrollRevealProps, 'direction'>) => (
  <ScrollReveal direction="right" {...props} />
);

export const RevealScale = (props: Omit<ScrollRevealProps, 'direction' | 'distance'>) => (
  <ScrollReveal direction="scale" distance={0} {...props} />
);

export const RevealRotate = (props: Omit<ScrollRevealProps, 'direction' | 'distance'>) => (
  <ScrollReveal direction="rotate" distance={0} {...props} />
);

