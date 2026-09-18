'use client';

import { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

interface ParticleFieldProps {
  count?: number;
  speed?: number;
  size?: number;
  color?: string;
  interactRadius?: number;
}

export function ParticleField({
  count = 500,
  speed = 0.02,
  size = 0.02,
  color = '#22d3ee',
  interactRadius = 3,
}: ParticleFieldProps) {
  const pointsRef = useRef<THREE.Points>(null);
  const mouseRef = useRef(new THREE.Vector2(999, 999));

  const particles = useMemo(() => {
    const positions = new Float32Array(count * 3);
    const velocities = new Float32Array(count * 3);
    const originalPositions = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const x = (Math.random() - 0.5) * 15;
      const y = (Math.random() - 0.5) * 10;
      const z = (Math.random() - 0.5) * 8 - 4;
      positions[i * 3] = x;
      positions[i * 3 + 1] = y;
      positions[i * 3 + 2] = z;
      originalPositions[i * 3] = x;
      originalPositions[i * 3 + 1] = y;
      originalPositions[i * 3 + 2] = z;
      velocities[i * 3] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 1] = (Math.random() - 0.5) * speed;
      velocities[i * 3 + 2] = (Math.random() - 0.5) * speed;
    }

    return { positions, velocities, originalPositions };
  }, [count, speed]);

  useFrame((state) => {
    if (!pointsRef.current) return;

    const time = state.clock.elapsedTime;
    const positions = pointsRef.current.geometry.getAttribute('position') as THREE.BufferAttribute;
    const arr = positions.array as Float32Array;

    // Update mouse position in world coordinates
    const mouseWorldX = (mouseRef.current.x / window.innerWidth) * 20 - 10;
    const mouseWorldY = -(mouseRef.current.y / window.innerHeight) * 12 + 6;

    for (let i = 0; i < count; i++) {
      const idx = i * 3;
      
      // Base movement
      arr[idx] += particles.velocities[idx];
      arr[idx + 1] += particles.velocities[idx + 1];
      arr[idx + 2] += particles.velocities[idx + 2];

      // Mouse interaction - gentle repulsion
      const dx = arr[idx] - mouseWorldX;
      const dy = arr[idx + 1] - mouseWorldY;
      const dist = Math.sqrt(dx * dx + dy * dy);

      if (dist < interactRadius) {
        const force = (interactRadius - dist) / interactRadius;
        const angle = Math.atan2(dy, dx);
        arr[idx] += Math.cos(angle) * force * 0.08;
        arr[idx + 1] += Math.sin(angle) * force * 0.08;
      }

      // Gentle wave motion
      arr[idx + 1] += Math.sin(time * 0.5 + arr[idx] * 0.3) * 0.003;
      arr[idx] += Math.cos(time * 0.3 + arr[idx + 1] * 0.2) * 0.002;

      // Boundary wrapping with soft edges
      const wrapLimit = 7;
      const softEdge = 2;
      
      if (arr[idx] > wrapLimit + softEdge) {
        arr[idx] = -wrapLimit - softEdge;
      } else if (arr[idx] < -wrapLimit - softEdge) {
        arr[idx] = wrapLimit + softEdge;
      }
      
      if (arr[idx + 1] > wrapLimit + softEdge) {
        arr[idx + 1] = -wrapLimit - softEdge;
      } else if (arr[idx + 1] < -wrapLimit - softEdge) {
        arr[idx + 1] = wrapLimit + softEdge;
      }

      // Subtle depth oscillation
      arr[idx + 2] = particles.originalPositions[idx + 2] + Math.sin(time * 0.4 + i * 0.1) * 0.5;
    }

    positions.needsUpdate = true;
    pointsRef.current.rotation.y = Math.sin(time * 0.05) * 0.05;
  });

  const handleMouseMove = (e: MouseEvent) => {
    mouseRef.current.set(e.clientX, e.clientY);
  };

  if (typeof window !== 'undefined') {
    window.addEventListener('mousemove', handleMouseMove);
  }

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[particles.positions, 3]}
          count={count}
          array={particles.positions}
          itemSize={3}
        />
      </bufferGeometry>
      <pointsMaterial
        size={size}
        color={color}
        transparent
        opacity={0.6}
        blending={THREE.AdditiveBlending}
        depthWrite={false}
        sizeAttenuation={true}
      />
    </points>
  );
}
