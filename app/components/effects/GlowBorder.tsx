'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import React, { useRef } from 'react';

interface GlowBorderProps {
  children: React.ReactNode;
  className?: string;
  glowColor?: string;
  borderWidth?: number;
  glowIntensity?: number;
  duration?: number;
}

/**
 * Composant GlowBorder - Bordure lumineuse interactive avec Framer Motion
 * Crée un effet de bordure glow qui suit le mouvement de la souris
 */
export default function GlowBorder({
  children,
  className = '',
  glowColor = 'rgba(99, 102, 241, 0.5)',
  borderWidth = 1,
  glowIntensity = 1,
  duration = 0.3,
}: GlowBorderProps) {
  const ref = useRef<HTMLDivElement>(null);
  
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);
  
  const glowX = useMotionTemplate`${mouseX}px`;
  const glowY = useMotionTemplate`${mouseY}px`;
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!ref.current) return;
    
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    mouseX.set(x);
    mouseY.set(y);
  };
  
  const handleMouseLeave = () => {
    mouseX.set(-100);
    mouseY.set(-100);
  };
  
  return (
    <div
      ref={ref}
      className={`relative overflow-hidden rounded-xl ${className}`}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      style={{
        '--glow-color': glowColor,
        '--border-width': `${borderWidth}px`,
        '--glow-intensity': glowIntensity,
      } as React.CSSProperties}
    >
      {/* Gradient glow qui suit la souris */}
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: useMotionTemplate`radial-gradient(
            ${150 * glowIntensity}px circle at ${glowX} ${glowY},
            var(--glow-color),
            transparent 80%
          )`,
          opacity: useMotionTemplate`${glowIntensity * 0.6}`,
          transition: `opacity ${duration}s ease-out`,
        }}
      />
      
      {/* Border glow effect */}
      <motion.div
        className="absolute inset-0 pointer-events-none rounded-xl"
        style={{
          boxShadow: useMotionTemplate`
            inset 0 0 ${20 * glowIntensity}px ${borderWidth}px var(--glow-color)
          `,
          opacity: 0.6,
          transition: `box-shadow ${duration}s ease-out`,
        }}
      />
      
      {/* Contenu */}
      <div className="relative z-10">
        {children}
      </div>
    </div>
  );
}
