'use client';

import { Points, PointMaterial } from '@react-three/drei';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { useEffect, useRef, useMemo } from 'react';
import * as THREE from 'three';
import { PerspectiveCamera } from 'three';

type DataFlowNetworkProps = {
  particleCount?: number;
  connectionDistance?: number;
  flowSpeed?: number;
  color?: string;
};

type Particle = {
  position: THREE.Vector3;
  velocity: THREE.Vector3;
  basePosition: THREE.Vector3;
};

const DataFlowScene = ({
  particleCount = 200,
  // `connectionDistance` is part of the public props for API stability but is
  // not used yet: particles are rendered as a point cloud without link lines.
  flowSpeed = 0.002,
  color = '#06b6d4',
}: DataFlowNetworkProps) => {
  const pointsRef = useRef<THREE.Points>(null);
  const { camera, size } = useThree();
  
  const particles = useMemo(() => {
    const arr: Particle[] = [];
    for (let i = 0; i < particleCount; i++) {
      const position = new THREE.Vector3(
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 100,
        (Math.random() - 0.5) * 50
      );
      arr.push({
        position,
        velocity: new THREE.Vector3(
          (Math.random() - 0.5) * flowSpeed,
          (Math.random() - 0.5) * flowSpeed,
          (Math.random() - 0.5) * flowSpeed
        ),
        basePosition: position.clone(),
      });
    }
    return arr;
  }, [particleCount, flowSpeed]);

  const positionsArray = useMemo(() => {
    const arr = new Float32Array(particleCount * 3);
    particles.forEach((p, i) => {
      arr[i * 3] = p.position.x;
      arr[i * 3 + 1] = p.position.y;
      arr[i * 3 + 2] = p.position.z;
    });
    return arr;
  }, [particles, particleCount]);

  useEffect(() => {
    if (camera instanceof PerspectiveCamera) {
      camera.position.z = 80;
      camera.aspect = size.width / size.height;
      camera.updateProjectionMatrix();
    }
  }, [camera, size.width, size.height]);

  useFrame(() => {
    if (!pointsRef.current) return;

    particles.forEach((p) => {
      p.position.add(p.velocity);
      p.position.x += Math.sin(Date.now() * 0.001 + p.basePosition.y) * 0.02;
      p.position.y += Math.cos(Date.now() * 0.001 + p.basePosition.x) * 0.02;
      
      const limit = 50;
      if (p.position.x > limit) p.position.x = -limit;
      if (p.position.x < -limit) p.position.x = limit;
      if (p.position.y > limit) p.position.y = -limit;
      if (p.position.y < -limit) p.position.y = limit;
      if (p.position.z > limit) p.position.z = -limit;
      if (p.position.z < -limit) p.position.z = limit;
    });

    const positions = pointsRef.current.geometry.attributes.position.array as Float32Array;
    particles.forEach((p, i) => {
      positions[i * 3] = p.position.x;
      positions[i * 3 + 1] = p.position.y;
      positions[i * 3 + 2] = p.position.z;
    });
    pointsRef.current.geometry.attributes.position.needsUpdate = true;
    pointsRef.current.rotation.y += 0.0005;
    pointsRef.current.rotation.x += 0.0002;
  });

  return (
    <Points ref={pointsRef} positions={positionsArray} stride={3} frustumCulled={false}>
      <PointMaterial
        transparent
        color={color}
        size={0.8}
        sizeAttenuation={true}
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        opacity={0.7}
      />
    </Points>
  );
};

export const DataFlowNetwork = ({
  particleCount = 200,
  connectionDistance = 25,
  flowSpeed = 0.002,
  color = '#06b6d4',
}: DataFlowNetworkProps) => {
  return (
    <div className="absolute inset-0">
      <Canvas camera={{ position: [0, 0, 80], fov: 60 }} className="w-full h-full">
        <DataFlowScene
          particleCount={particleCount}
          connectionDistance={connectionDistance}
          flowSpeed={flowSpeed}
          color={color}
        />
      </Canvas>
    </div>
  );
};
