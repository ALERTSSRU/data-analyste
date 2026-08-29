'use client';

import { PointMaterial, Points, Preload } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PerspectiveCamera } from 'three';

type DataNetworkProps = {
  speed?: number;
  scale?: number;
};

const DataNetworkPoints = ({ speed = 0.001, scale = 1.5 }: DataNetworkProps) => {
  const ref = useRef<THREE.Points>(null);
  const { camera } = useThree();

  useEffect(() => {
    const canvas = document.querySelector('canvas');
    if (canvas && camera instanceof PerspectiveCamera) {
      const width = canvas.clientWidth;
      const height = canvas.clientHeight;
      camera.position.z = 75 * scale;
      camera.aspect = width / height;
      camera.updateProjectionMatrix();
    }
  }, [camera, scale]);

  useFrame((state) => {
    if (ref.current) {
      ref.current.rotation.x -= speed / 10;
      ref.current.rotation.y -= speed / 15;
    }
  });

  // Générer des points de données aléatoires
  const particlesCount = 5000;
  const particlesPosition = new Float32Array(particlesCount * 3);

  for (let i = 0; i < particlesCount * 3; i += 3) {
    particlesPosition[i] = (Math.random() - 0.5) * 200 * scale;
    particlesPosition[i + 1] = (Math.random() - 0.5) * 200 * scale;
    particlesPosition[i + 2] = (Math.random() - 0.5) * 200 * scale;
  }

  return (
    <Points ref={ref} positions={particlesPosition} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color="#00d9ff"
        size={0.7}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.6}
      />
    </Points>
  );
};

export const DataNetwork = ({ speed = 0.001, scale = 1.5 }: DataNetworkProps) => {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 75], fov: 75 }} className="w-full h-full">
        <DataNetworkPoints speed={speed} scale={scale} />
        <Preload all />
      </Canvas>
    </div>
  );
};
