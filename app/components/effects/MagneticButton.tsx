'use client';

import { motion, useMotionTemplate, useMotionValue } from 'framer-motion';
import React, { useRef } from 'react';

interface MagneticButtonProps {
  children: React.ReactNode;
  className?: string;
  intensity?: number;
  range?: number;
  duration?: number;
}

/**
 * Composant MagneticButton - Bouton magnétique interactif avec Framer Motion
 * Le bouton suit le mouvement de la souris avec un effet magnétique
 */
export default function MagneticButton({
  children,
  className = '',
  intensity = 0.6,
  range = 80,
  duration = 0.3,
}: MagneticButtonProps) {
  const buttonRef = useRef<HTMLDivElement>(null);
  
  const x = useMotionValue(0);
  const y = useMotionValue(0);
  
  const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!buttonRef.current) return;
    
    const rect = buttonRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;
    
    const deltaX = e.clientX - centerX;
    const deltaY = e.clientY - centerY;
    const distance = Math.sqrt(deltaX * deltaX + deltaY * deltaY);
    
    if (distance < range) {
      const force = Math.max(0, 1 - distance / range);
      const moveX = deltaX * force * intensity;
      const moveY = deltaY * force * intensity;
      
      x.set(moveX);
      y.set(moveY);
    }
  };
  
  const handleMouseLeave = () => {
    x.set(0);
    y.set(0);
  };
  
  return (
    <motion.div
      ref={buttonRef}
      className={`inline-block cursor-pointer ${className}`}
      style={{ x, y }}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      transition={{
        type: 'spring',
        stiffness: 150,
        damping: 15,
        mass: 0.8,
        duration: duration,
      }}
    >
      {children}
    </motion.div>
  );
}
