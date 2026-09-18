'use client';

import { useRef, useEffect } from 'react';
import { useFrame, useThree } from '@react-three/fiber';
import * as THREE from 'three';

interface GradientOrbProps {
  position?: [number, number, number];
  scale?: number;
  color1?: string;
  color2?: string;
  speed?: number;
  intensity?: number;
}

export function GradientOrb({
  position = [0, 0, 0],
  scale = 1,
  color1 = '#22d3ee',
  color2 = '#7c3aed',
  speed = 0.5,
  intensity = 0.8,
}: GradientOrbProps) {
  return (
    <GradientOrbImpl
      position={position}
      scale={scale}
      color1={color1}
      color2={color2}
      speed={speed}
      intensity={intensity}
    />
  );
}

function GradientOrbImpl({
  position = [0, 0, 0],
  scale = 1,
  color1 = '#22d3ee',
  color2 = '#7c3aed',
  speed = 0.5,
  intensity = 0.8,
}: GradientOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<THREE.ShaderMaterial>(null);
  const timeRef = useRef(0);

  const uniforms = useRef({
    uTime: { value: 0 },
    uColor1: { value: new THREE.Color(color1) },
    uColor2: { value: new THREE.Color(color2) },
    uIntensity: { value: intensity },
  });

  useEffect(() => {
    if (materialRef.current) {
      materialRef.current.uniforms.uColor1.value = new THREE.Color(color1);
      materialRef.current.uniforms.uColor2.value = new THREE.Color(color2);
      materialRef.current.uniforms.uIntensity.value = intensity;
    }
  }, [color1, color2, intensity]);

  useFrame((_, delta) => {
    timeRef.current += delta * speed;
    if (materialRef.current) {
      materialRef.current.uniforms.uTime.value = timeRef.current;
    }
    if (meshRef.current) {
      meshRef.current.rotation.y = Math.sin(timeRef.current * 0.3) * 0.1;
      meshRef.current.rotation.z = Math.cos(timeRef.current * 0.2) * 0.05;
    }
  });

  return (
    <mesh ref={meshRef} position={position} scale={scale}>
      <sphereGeometry args={[1, 64, 64]} />
      <shaderMaterial
        ref={materialRef}
        transparent
        depthWrite={false}
        blending={THREE.AdditiveBlending}
        uniforms={uniforms.current}
        vertexShader={`
          varying vec3 vPosition;
          varying vec2 vUv;
          void main() {
            vPosition = position;
            vUv = uv;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
          }
        `}
        fragmentShader={`
          uniform float uTime;
          uniform vec3 uColor1;
          uniform vec3 uColor2;
          uniform float uIntensity;
          varying vec3 vPosition;
          varying vec2 vUv;

          // Simplex noise function
          vec3 permute(vec3 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
          vec4 permute(vec4 x) { return mod(((x*34.0)+1.0)*x, 289.0); }
          vec4 taylorInvSqrt(vec4 r) { return 1.79284291400159 - 0.85373472095314 * r; }
          float snoise(vec3 v) {
            const vec2 C = vec2(1.0/6.0, 1.0/3.0);
            const vec4 D = vec4(0.0, 0.5, 1.0, 2.0);
            vec3 i  = floor(v + dot(v, C.yyy));
            vec3 x0 = v - i + dot(i, C.xxx);
            vec3 g = step(x0.yzx, x0.xyz);
            vec3 l = 1.0 - g;
            vec3 i1 = min(g.xyz, l.zxy);
            vec3 i2 = max(g.xyz, l.zxy);
            vec3 x1 = x0 - i1 + C.xxx;
            vec3 x2 = x0 - i2 + C.yyy;
            vec3 x3 = x0 - D.yyy;
            i = mod(i, 289.0);
            vec4 p = permute(permute(permute(
                  i.z + vec4(0.0, i1.z, i2.z, 1.0))
                + i.y + vec4(0.0, i1.y, i2.y, 1.0))
                + i.x + vec4(0.0, i1.x, i2.x, 1.0));
            float n_ = 0.142857142857;
            vec3 ns = n_ * D.wyz - D.xzx;
            vec4 j = p - 49.0 * floor(p * ns.z * ns.z);
            vec4 x_ = floor(j * ns.z);
            vec4 y_ = floor(j - 7.0 * x_);
            vec4 x = x_ *ns.x + ns.yyyy;
            vec4 y = y_ *ns.x + ns.yyyy;
            vec4 h = 1.0 - abs(x) - abs(y);
            vec4 b0 = vec4(x.xy, y.xy);
            vec4 b1 = vec4(x.zw, y.zw);
            vec4 s0 = floor(b0)*2.0 + 1.0;
            vec4 s1 = floor(b1)*2.0 + 1.0;
            vec4 sh = -step(h, vec4(0.0));
            vec4 a0 = b0.xzyw + s0.xzyw*sh.xxyy;
            vec4 a1 = b1.xzyw + s1.xzyw*sh.zzww;
            vec3 p0 = vec3(a0.xy, h.x);
            vec3 p1 = vec3(a0.zw, h.y);
            vec3 p2 = vec3(a1.xy, h.z);
            vec3 p3 = vec3(a1.zw, h.w);
            vec4 norm = taylorInvSqrt(vec4(dot(p0,p0), dot(p1,p1), dot(p2, p2), dot(p3,p3)));
            p0 *= norm.x;
            p1 *= norm.y;
            p2 *= norm.z;
            p3 *= norm.w;
            vec4 m = max(0.6 - vec4(dot(x0,x0), dot(x1,x1), dot(x2,x2), dot(x3,x3)), 0.0);
            m = m * m;
            return 42.0 * dot(m*m, vec4(dot(p0,x0), dot(p1,x1), dot(p2,x2), dot(p3,x3)));
          }

          void main() {
            vec3 normal = normalize(vPosition);
            float noiseVal = snoise(normal * 2.0 + uTime * 0.3);
            
            // Create gradient based on position and noise
            float gradientMix = smoothstep(-1.0, 1.0, normal.y + noiseVal * 0.5);
            vec3 finalColor = mix(uColor1, uColor2, gradientMix);
            
            // Add pulsing glow effect
            float pulse = sin(uTime * 2.0) * 0.1 + 0.9;
            float alpha = (0.3 + noiseVal * 0.2) * uIntensity * pulse;
            
            // Fade edges for soft orb appearance
            float edgeFade = smoothstep(1.0, 0.7, length(vUv - 0.5));
            alpha *= edgeFade;
            
            gl_FragColor = vec4(finalColor, alpha);
          }
        `}
      />
    </mesh>
  );
}
