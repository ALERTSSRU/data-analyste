'use client';

import { phaseFromProgress, sceneState } from '@/lib/scene-state';
import { Line, PointMaterial, Points, Preload } from '@react-three/drei';
import { Canvas, useFrame } from '@react-three/fiber';
import { Bloom, EffectComposer } from '@react-three/postprocessing';
import { useEffect, useMemo, useRef, useState } from 'react';
import * as THREE from 'three';

// ─── PERFORMANCE TIER DETECTION ──────────────
export type PerfTier = 'low' | 'medium' | 'high';

export function detectPerfTier(): PerfTier {
  if (typeof window === 'undefined') return 'high';

  const cores = navigator.hardwareConcurrency || 4;
  const ua = navigator.userAgent.toLowerCase();
  const isMobile = /android|webos|iphone|ipad|ipod|blackberry|iemobile|opera mini/i.test(ua);
  const isOldDevice = /android [1-9]\.|android 10\.|iphone os (10|11|12|13|14)_/i.test(ua);
  const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  if (prefersReduced || isOldDevice || (isMobile && cores <= 4) || cores <= 2) {
    return 'low';
  }
  if (isMobile || cores <= 6) {
    return 'medium';
  }
  return 'high';
}

// ─── EASING ──────────────────────────────────
function easeInOut(t: number) {
  return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2;
}
function smoothEase(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return easeInOut(t);
}
function smoothstep(edge0: number, edge1: number, x: number) {
  const t = THREE.MathUtils.clamp((x - edge0) / (edge1 - edge0), 0, 1);
  return t * t * (3 - 2 * t);
}

// ─── PARTICLE SHAPES ─────────────────────────
function fillSphere(target: Float32Array, radius: number, count: number) {
  for (let i = 0; i < count; i++) {
    const phi   = Math.acos(1 - (2 * (i + 0.5)) / count);
    const theta = Math.PI * (1 + Math.sqrt(5)) * i;
    const j = (Math.random() - 0.5) * 0.25;
    target[i * 3]     = (radius + j) * Math.sin(phi) * Math.cos(theta);
    target[i * 3 + 1] = (radius + j) * Math.sin(phi) * Math.sin(theta);
    target[i * 3 + 2] = (radius + j) * Math.cos(phi);
  }
}
function fillTorusKnot(target: Float32Array, count: number) {
  const p = 3, q = 5;
  for (let i = 0; i < count; i++) {
    const u = (i / count) * Math.PI * 2 * p;
    const r = Math.cos(q * u / p) + 2.4;
    const j = (Math.random() - 0.5) * 0.14;
    target[i * 3]     = r * Math.cos(u) + j;
    target[i * 3 + 1] = r * Math.sin(u) + j;
    target[i * 3 + 2] = -Math.sin(q * u / p) * 1.1 + j;
  }
}
function fillHelixFlow(target: Float32Array, count: number) {
  for (let i = 0; i < count; i++) {
    const strand = i % 3;
    const u      = (i / count) * Math.PI * 14;
    const offset = (strand * Math.PI * 2) / 3;
    const r      = 1.55 + Math.sin(u * 0.4) * 0.18;
    target[i * 3]     = r * Math.cos(u + offset);
    target[i * 3 + 1] = (i / count - 0.5) * 5.2;
    target[i * 3 + 2] = r * Math.sin(u + offset);
  }
}
function fillAligned(target: Float32Array, count: number) {
  const centers: [number, number, number][] = [[-3.4, 0.1, 0], [0, 0, 0], [3.4, -0.1, 0]];
  for (let i = 0; i < count; i++) {
    const [cx, cy, cz] = centers[i % 3];
    const a = Math.random() * Math.PI * 2;
    const r = 0.28 + Math.random() * 0.62;
    target[i * 3]     = cx + Math.cos(a) * r;
    target[i * 3 + 1] = cy + (Math.random() - 0.5) * 0.75;
    target[i * 3 + 2] = cz + Math.sin(a) * r;
  }
}
function lerpBuf(out: Float32Array, a: Float32Array, b: Float32Array, t: number) {
  for (let i = 0; i < out.length; i++) out[i] = a[i] + (b[i] - a[i]) * t;
}

// ─── COLOR CYCLING BY PHASE ──────────────────
function getPhaseColor(progress: number): string {
  if (progress < 0.22) return '#22d3ee'; // Hero: Cyan
  if (progress < 0.48) return '#0ea5e9'; // School: Sky blue
  if (progress < 0.74) return '#34d399'; // Bank: Emerald
  return '#c4b5fd'; // Signal: Violet
}

// ─── DATA STREAMS ────────────────────────────
function DataStreams({ progressRef, streamCount = 24 }: { progressRef: React.MutableRefObject<number>; streamCount?: number }) {
  const COLS = ['#22d3ee', '#34d399', '#c4b5fd', '#60a5fa', '#f472b6', '#67e8f9', '#a78bfa'];
  const TRAIL_COLS = ['#0ea5e9', '#10b981', '#a78bfa', '#3b82f6']; // Darker trail colors

  const streams = useMemo(() => {
    return Array.from({ length: streamCount }, (_, i) => {
      const angle  = (i / streamCount) * Math.PI * 2;
      const radius = 3.8 + Math.random() * 3.0;
      const ySpan  = (Math.random() - 0.5) * 8;
      const twist  = Math.random() * Math.PI * 3;
      const pts = Array.from({ length: 7 }, (_, k) => {
        const u = (k / 6) * Math.PI * 2 + twist;
        return new THREE.Vector3(
          Math.cos(angle + u * 0.28) * (radius + Math.sin(u) * 1.4),
          ySpan * (k / 6 - 0.5) + Math.sin(u * 1.5) * 0.9,
          Math.sin(angle + u * 0.28) * (radius + Math.cos(u) * 1.4)
        );
      });
      return {
        curve:  new THREE.CatmullRomCurve3(pts, false, 'catmullrom', 0.5),
        speed:  0.035 + Math.random() * 0.10,
        color:  COLS[i % COLS.length],
        trailColor: TRAIL_COLS[i % TRAIL_COLS.length],
        offset: Math.random(),
        width:  1.0 + Math.random() * 1.4,
      };
    });
  }, [streamCount]);

  const lineRefs = useRef<Array<THREE.Line | null>>([]);
  const trailRefs = useRef<Array<THREE.Line | null>>([]);
  const particleRefs = useRef<Array<THREE.Points | null>>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = progressRef.current;
    const pulse = Math.max(
      smoothEase(0.15, 0.25, p) * (1 - smoothstep(0.28, 0.38, p)),
      smoothEase(0.48, 0.58, p) * (1 - smoothstep(0.62, 0.70, p)),
      0.08
    );

    streams.forEach((s, i) => {
      // ─── MAIN STREAM LINE (fast head) ───
      const mesh = lineRefs.current[i];
      if (mesh) {
        const head  = ((t * s.speed + s.offset) % 1.0);
        const tail  = Math.max(0, head - 0.15);
        const STEPS = 22;

        const geo = mesh.geometry as THREE.BufferGeometry;
        const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let k = 0; k <= STEPS; k++) {
          const u = tail + (head - tail) * (k / STEPS);
          const pt = s.curve.getPoint(THREE.MathUtils.clamp(u, 0, 1));
          arr[k * 3] = pt.x; arr[k * 3 + 1] = pt.y; arr[k * 3 + 2] = pt.z;
        }
        posAttr.needsUpdate = true;
        geo.computeBoundingSphere();

        const mat = mesh.material as THREE.LineBasicMaterial;
        mat.opacity = pulse * (0.65 + Math.sin(t * 1.2 + i) * 0.25); // Increased visibility
      }

      // ─── TRAIL LAYER (slow tracer) ───
      const trail = trailRefs.current[i];
      if (trail) {
        const head  = ((t * s.speed * 0.35 + s.offset) % 1.0);
        const tail  = Math.max(0, head - 0.45);
        const STEPS = 22;

        const geo = trail.geometry as THREE.BufferGeometry;
        const posAttr = geo.getAttribute('position') as THREE.BufferAttribute;
        const arr = posAttr.array as Float32Array;

        for (let k = 0; k <= STEPS; k++) {
          const u = tail + (head - tail) * (k / STEPS);
          const pt = s.curve.getPoint(THREE.MathUtils.clamp(u, 0, 1));
          arr[k * 3] = pt.x; arr[k * 3 + 1] = pt.y; arr[k * 3 + 2] = pt.z;
        }
        posAttr.needsUpdate = true;
        geo.computeBoundingSphere();

        const mat = trail.material as THREE.LineBasicMaterial;
        mat.opacity = pulse * (0.25 + Math.sin(t * 0.8 + i) * 0.12); // Subtle trail
      }

      // ─── TRAILING PARTICLES ───
      const particles = particleRefs.current[i];
      if (particles) {
        const head  = ((t * s.speed + s.offset) % 1.0);
        const PARTICLE_COUNT = 12;
        const positions = new Float32Array(PARTICLE_COUNT * 3);

        for (let p = 0; p < PARTICLE_COUNT; p++) {
          const ratio = p / PARTICLE_COUNT;
          const u = THREE.MathUtils.clamp(head - ratio * 0.28, 0, 1);
          const pt = s.curve.getPoint(u);
          positions[p * 3] = pt.x;
          positions[p * 3 + 1] = pt.y;
          positions[p * 3 + 2] = pt.z;
        }

        const posAttr = particles.geometry.getAttribute('position') as THREE.BufferAttribute;
        posAttr.array = positions;
        posAttr.needsUpdate = true;
      }
    });
  });

  return (
    <group>
      {streams.map((s, i) => {
        const initPts = s.curve.getPoints(22);
        const initPos = new Float32Array(initPts.length * 3);
        initPts.forEach((p, k) => { initPos[k * 3] = p.x; initPos[k * 3 + 1] = p.y; initPos[k * 3 + 2] = p.z; });

        // Main stream line
        if (!lineRefs.current[i]) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(initPos.slice(), 3));
          const mat = new THREE.LineBasicMaterial({
            color: s.color, transparent: true, opacity: 0.15,
            blending: THREE.AdditiveBlending, depthWrite: false, linewidth: 2,
          });
          lineRefs.current[i] = new THREE.Line(geo, mat);
        }

        // Trail layer
        if (!trailRefs.current[i]) {
          const geo = new THREE.BufferGeometry();
          geo.setAttribute('position', new THREE.BufferAttribute(initPos.slice(), 3));
          const mat = new THREE.LineBasicMaterial({
            color: s.trailColor, transparent: true, opacity: 0.06,
            blending: THREE.AdditiveBlending, depthWrite: false, linewidth: 1,
          });
          trailRefs.current[i] = new THREE.Line(geo, mat);
        }

        // Trailing particles
        if (!particleRefs.current[i]) {
          const pGeo = new THREE.BufferGeometry();
          pGeo.setAttribute('position', new THREE.BufferAttribute(new Float32Array(12 * 3), 3));
          const pMat = new THREE.PointsMaterial({
            color: s.color, transparent: true, opacity: 0.45, size: 0.08,
            blending: THREE.AdditiveBlending, depthWrite: false, sizeAttenuation: true,
          });
          particleRefs.current[i] = new THREE.Points(pGeo, pMat);
        }

        return (
          <group key={i}>
            <primitive object={lineRefs.current[i]!} />
            <primitive object={trailRefs.current[i]!} />
            <primitive object={particleRefs.current[i]!} />
          </group>
        );
      })}
    </group>
  );
}

// ─── FLOATING GLYPHS ─────────────────────────
function FloatingGlyphs({ progressRef, glyphCount = 35 }: { progressRef: React.MutableRefObject<number>; glyphCount?: number }) {
  const LABELS = [
    'SELECT *', 'GROUP BY', 'AVG(score)', 'JOIN ON', 'WHERE id=',
    '01001101', '0xFF3A', 'NULL', 'ETL', 'PIPELINE',
    'R²=0.97', 'p < 0.05', 'σ=1.24', 'μ=0.92', 'n=10⁶',
    'BigQuery', 'Apache Spark', 'Kafka', 'dbt', 'Airflow',
    'TensorFlow', '∂f/∂x', 'λ=0.01', 'Δσ', 'KPI', 'ROI',
  ];
  // Color palette per phase
  const PHASE_COLS = {
    hero: ['#22d3ee', '#60a5fa', '#0ea5e9', '#38bdf8'],
    school: ['#0ea5e9', '#38bdf8', '#22d3ee', '#60a5fa'],
    bank: ['#34d399', '#10b981', '#6ee7b7', '#13b0b9'],
    signal: ['#c4b5fd', '#a78bfa', '#f0abfc', '#e879f9'],
  };

  const glyphs = useMemo(() => Array.from({ length: glyphCount }, (_, i) => ({
    pos: new THREE.Vector3((Math.random() - 0.5) * 22, (Math.random() - 0.5) * 13, -3 - Math.random() * 9),
    speed: 0.035 + Math.random() * 0.07,
    phase: Math.random() * Math.PI * 2,
    label: LABELS[i % LABELS.length],
  })), [glyphCount]); // eslint-disable-line react-hooks/exhaustive-deps

  const sprites = useMemo(() => glyphs.map((g, i) => {
    const canvas = document.createElement('canvas');
    canvas.width = 320; canvas.height = 64;
    const ctx = canvas.getContext('2d')!;
    ctx.font = 'bold 27px "Courier New",monospace';
    ctx.globalAlpha = 0.95;

    // Start with hero color
    ctx.fillStyle = PHASE_COLS.hero[i % PHASE_COLS.hero.length];
    ctx.fillText(g.label, 6, 44);

    const tex = new THREE.CanvasTexture(canvas);
    tex.needsUpdate = true;
    return tex;
  }), [glyphs]); // eslint-disable-line react-hooks/exhaustive-deps

  const meshRefs = useRef<THREE.Mesh[]>([]);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime;
    const p = progressRef.current;

    // Determine phase colors
    let currentColors: string[];
    if (p < 0.22) currentColors = PHASE_COLS.hero;
    else if (p < 0.48) currentColors = PHASE_COLS.school;
    else if (p < 0.74) currentColors = PHASE_COLS.bank;
    else currentColors = PHASE_COLS.signal;

    glyphs.forEach((g, i) => {
      const m = meshRefs.current[i];
      if (!m) return;

      g.pos.y -= g.speed * 0.006;
      if (g.pos.y < -8) { g.pos.y = 8; g.pos.x = (Math.random() - 0.5) * 22; }

      // Enhanced motion - more visible drift
      m.position.set(
        g.pos.x + Math.sin(t * 0.3 + g.phase) * 0.28,
        g.pos.y,
        g.pos.z + Math.cos(t * 0.25 + g.phase) * 0.15
      );

      // Much higher base opacity for better visibility
      const baseOpacity = 0.18 + Math.abs(Math.sin(t * 0.22 + g.phase)) * 0.22;
      const pulseFactor = 0.8 + Math.sin(t * 0.5 + i * 0.3) * 0.2; // Added subtle pulse
      (m.material as THREE.MeshBasicMaterial).opacity = baseOpacity * pulseFactor;
    });
  });

  return (
    <group>
      {glyphs.map((g, i) => (
        <mesh key={i} ref={(el) => { if (el) meshRefs.current[i] = el; }} position={g.pos}>
          <planeGeometry args={[2.8, 0.62]} />
          <meshBasicMaterial map={sprites[i]} transparent opacity={0.22}
            depthWrite={false} blending={THREE.AdditiveBlending} />
        </mesh>
      ))}
    </group>
  );
}

// ─────────────────────────────────────────────
// SINGLE MONOLITHIC SCENE ORCHESTRATOR
// ─────────────────────────────────────────────
function DataMorph({ tier = 'high' }: { tier?: PerfTier }) {
  const count = tier === 'low' ? 450 : tier === 'medium' ? 800 : 1200;
  const streamCount = tier === 'low' ? 8 : tier === 'medium' ? 16 : 24;
  const glyphCount = tier === 'low' ? 12 : tier === 'medium' ? 22 : 35;

  const progressRef = useRef(0);
  const lastP = useRef(-1);

  // ── Particle system ──
  const pointsRef = useRef<THREE.Points>(null);
  const outerGroup = useRef<THREE.Group>(null);

  // ── Model groups ──
  const schoolGroup  = useRef<THREE.Group>(null);
  const bankGroup    = useRef<THREE.Group>(null);
  const signalGroup  = useRef<THREE.Group>(null);

  // ── School mesh refs ──
  const sShell  = useRef<THREE.Mesh>(null);
  const sDodec  = useRef<THREE.Mesh>(null);
  const sRing1  = useRef<THREE.Mesh>(null);
  const sRing2  = useRef<THREE.Mesh>(null);
  const sRing3  = useRef<THREE.Mesh>(null);
  const sCore   = useRef<THREE.Mesh>(null);
  const sOrbit  = useRef<THREE.Mesh>(null);

  // ── Bank (torus knot) refs ──
  const bKnot1  = useRef<THREE.Mesh>(null);
  const bKnot2  = useRef<THREE.Mesh>(null);
  const bHalo   = useRef<THREE.Mesh>(null);
  const bCore   = useRef<THREE.Mesh>(null);

  // ── Signal (octahedron) refs ──
  const qOct1   = useRef<THREE.Mesh>(null);
  const qOct2   = useRef<THREE.Mesh>(null);
  const qCore   = useRef<THREE.Mesh>(null);
  const qRing1  = useRef<THREE.Mesh>(null);
  const qRing2  = useRef<THREE.Mesh>(null);
  const qPulsar = useRef<THREE.Mesh>(null);

  // Finale connection line
  const lineRef  = useRef<any>(null);

  // Colors
  const colorNow = useMemo(() => new THREE.Color('#22d3ee'), []);
  const colA = useMemo(() => new THREE.Color('#22d3ee'), []);
  const colB = useMemo(() => new THREE.Color('#34d399'), []);
  const colC = useMemo(() => new THREE.Color('#c4b5fd'), []);

  const buffers = useMemo(() => {
    const sphere  = new Float32Array(count * 3);
    const knot    = new Float32Array(count * 3);
    const helix   = new Float32Array(count * 3);
    const aligned = new Float32Array(count * 3);
    const current = new Float32Array(count * 3);
    fillSphere(sphere, 3.5, count);
    fillTorusKnot(knot, count);
    fillHelixFlow(helix, count);
    fillAligned(aligned, count);
    current.set(sphere);
    return { sphere, knot, helix, aligned, current };
  }, [count]);

  const geometry = useMemo(() => {
    const geo = new THREE.BufferGeometry();
    geo.setAttribute('position', new THREE.BufferAttribute(buffers.current, 3));
    return geo;
  }, [buffers]);

  const linePoints = useMemo(() => [
    new THREE.Vector3(-3.4, 0.1, 0),
    new THREE.Vector3(0, 0, 0),
    new THREE.Vector3(3.4, -0.1, 0),
  ], []);

  // ── Smoothed visibility ──
  const vis = useRef({
    sLit: 1.0, sScale: 1.0,
    bLit: 0.0, bScale: 0.001,
    qLit: 0.0, qScale: 0.001,
  });

  const applyGroupVisibility = (
    group: THREE.Group | null,
    lit: number,
    scale: number
  ) => {
    if (!group) return;
    group.scale.setScalar(Math.max(0.001, scale));
    group.traverse((child) => {
      if (child instanceof THREE.Mesh) {
        const m = child.material as any;
        if (!m) return;
        if ('emissiveIntensity' in m) m.emissiveIntensity = lit * (child.userData.emBase ?? 0.5);
        if ('opacity' in m) m.opacity = Math.max(0.001, (child.userData.opBase ?? 0.22) * lit);
      }
    });
  };

  useFrame((state, delta) => {
    // ── Progress smoothing ──
    sceneState.progress += (sceneState.target - sceneState.progress) * 0.055;
    const p = sceneState.progress;
    progressRef.current = p;
    sceneState.phase = phaseFromProgress(p);

    const t = state.clock.elapsedTime;

    // ── GPU Performance Optimization: only calculate morph and write to GPU if user actually scrolls! ──
    const isScrolling = Math.abs(p - lastP.current) > 0.0005;

    if (isScrolling) {
      lastP.current = p;
      const s2k = smoothEase(0.18, 0.48, p);
      const k2h = smoothEase(0.52, 0.70, p);
      const h2a = smoothEase(0.76, 0.92, p);

      if (s2k < 1.0)      lerpBuf(buffers.current, buffers.sphere, buffers.knot,   s2k);
      else if (k2h < 1.0) lerpBuf(buffers.current, buffers.knot,   buffers.helix,  k2h);
      else                 lerpBuf(buffers.current, buffers.helix,  buffers.aligned, h2a);

      // Add a progressive vortex swirl midpoint perturbation during shape morphing
      const morphProgress = s2k < 1.0 ? s2k : k2h < 1.0 ? k2h : h2a < 1.0 ? h2a : 0;
      const vortexIntensity = Math.sin(morphProgress * Math.PI) * 0.85; // peaks at 50% morph

      const attr = geometry.getAttribute('position') as THREE.BufferAttribute;
      const arr  = attr.array as Float32Array;

      for (let i = 0; i < count; i++) {
        const idx = i * 3;
        // Apply smooth spiral displacement
        const angle = i * 0.06 + t * 0.8;
        const disp = vortexIntensity * (0.4 + Math.sin(i * 0.2) * 0.3);
        arr[idx]   = buffers.current[idx] + Math.cos(angle) * disp;
        arr[idx+1] = buffers.current[idx+1] + (Math.sin(i) * 0.1 * vortexIntensity);
        arr[idx+2] = buffers.current[idx+2] + Math.sin(angle) * disp;
      }
      attr.needsUpdate = true;
    }

    // ── Smooth GPU-driven rotation on the particle group (0% CPU cost, 0 GPU uploads) ──
    if (pointsRef.current) {
      pointsRef.current.rotation.y = t * 0.055;
      pointsRef.current.rotation.x = Math.sin(t * 0.3) * 0.05;
      pointsRef.current.rotation.z = Math.cos(t * 0.2) * 0.04;
    }

    // ── Particle color ──
    if (p < 0.40)      colorNow.lerpColors(colA, colB, smoothEase(0.18, 0.40, p));
    else if (p < 0.65) colorNow.lerpColors(colB, colC, smoothEase(0.52, 0.65, p));
    else               colorNow.copy(colC);

    const ptMat = pointsRef.current?.material as THREE.PointsMaterial | undefined;
    if (ptMat) { ptMat.color.copy(colorNow); }

    // ── Compute visibility for each model ──
    const v = vis.current;
    if (p < 0.18) {
      v.sLit = 1; v.sScale = 1; v.bLit = 0; v.bScale = 0.001; v.qLit = 0; v.qScale = 0.001;
    } else if (p < 0.52) {
      const f = smoothEase(0.18, 0.52, p);
      v.sLit = 1 - f; v.sScale = THREE.MathUtils.lerp(1, 0.001, f);
      v.bLit = f;     v.bScale = THREE.MathUtils.lerp(0.001, 1, f);
      v.qLit = 0;     v.qScale = 0.001;
    } else if (p < 0.76) {
      const f = smoothEase(0.52, 0.76, p);
      v.sLit = 0; v.sScale = 0.001;
      v.bLit = 1 - f; v.bScale = THREE.MathUtils.lerp(1, 0.001, f);
      v.qLit = f;     v.qScale = THREE.MathUtils.lerp(0.001, 1, f);
    } else {
      // ── FINALE: all three models fade in and scale up with zero abrupt jumps ──
      const f = smoothEase(0.72, 0.94, p); // Widened easing window for smoother entry
      
      // Smooth cubic scaling & opacity for School (left)
      v.sLit   = THREE.MathUtils.damp(v.sLit, f, 3, delta);
      v.sScale = THREE.MathUtils.damp(v.sScale, THREE.MathUtils.lerp(0.001, 1.0, f), 3, delta);

      // Smooth cubic scaling & opacity for Bank (center)
      v.bLit   = THREE.MathUtils.damp(v.bLit, f, 3, delta);
      v.bScale = THREE.MathUtils.damp(v.bScale, THREE.MathUtils.lerp(0.001, 1.0, f), 3, delta);

      // Signal (right) maintains full presence and settles to scale 1.0
      v.qLit   = THREE.MathUtils.damp(v.qLit, 1.0, 3, delta);
      v.qScale = THREE.MathUtils.damp(v.qScale, 1.0, 3, delta);
    }

    // ── Apply visibility ──
    applyGroupVisibility(schoolGroup.current, v.sLit, v.sScale);
    applyGroupVisibility(bankGroup.current,   v.bLit, v.bScale);
    applyGroupVisibility(signalGroup.current, v.qLit, v.qScale);

    // ── Group X offset ──
    const isMobile = state.size.width < 768;
    let targetX = 0;
    if (!isMobile && p >= 0.18 && p < 0.74) {
      const enter = smoothEase(0.18, 0.27, p);
      const leave = smoothEase(0.68, 0.74, p);
      targetX = 2.0 * enter * (1 - leave);
    }
    if (outerGroup.current) {
      outerGroup.current.position.x = THREE.MathUtils.damp(outerGroup.current.position.x, targetX, 3, delta);
    }

    // ── Finale positions with smooth damping ──
    const alignX = p >= 0.72 ? smoothEase(0.72, 0.94, p) : 0;

    // ── School model animation ──
    if (schoolGroup.current) {
      schoolGroup.current.rotation.y += delta * 0.20;
      schoolGroup.current.rotation.x = Math.sin(t * 0.17) * 0.09;
      const targetSchoolX = THREE.MathUtils.lerp(0, -3.4, alignX);
      schoolGroup.current.position.x = THREE.MathUtils.damp(schoolGroup.current.position.x, targetSchoolX, 4, delta);
      schoolGroup.current.position.y = 0.1 + Math.sin(t * 0.32) * 0.055;
    }
    if (sRing1.current) sRing1.current.rotation.z += delta * 0.52;
    if (sRing2.current) sRing2.current.rotation.x += delta * 0.36;
    if (sRing3.current) { sRing3.current.rotation.y += delta * 0.26; sRing3.current.rotation.z -= delta * 0.19; }
    if (sCore.current) {
      const s = 0.24 + Math.sin(t * 2.7) * 0.08;
      sCore.current.scale.setScalar(s);
      (sCore.current.material as THREE.MeshBasicMaterial).opacity = (0.4 + Math.sin(t * 2.7) * 0.25) * v.sLit;
    }
    if (sOrbit.current) {
      sOrbit.current.position.set(
        Math.cos(t * 1.5) * 2.2,
        Math.sin(t * 2.1) * 0.5,
        Math.sin(t * 1.5) * 2.2
      );
      sOrbit.current.rotation.x += delta * 2;
      sOrbit.current.rotation.y += delta * 2;
      (sOrbit.current.material as THREE.MeshBasicMaterial).opacity = 0.8 * v.sLit;
    }

    // ── Bank model animation ──
    if (bankGroup.current) {
      bankGroup.current.rotation.y += delta * 0.14;
      bankGroup.current.rotation.z  = Math.sin(t * 0.19) * 0.07;
      const targetBankX = THREE.MathUtils.lerp(0, 0, alignX);
      bankGroup.current.position.x = THREE.MathUtils.damp(bankGroup.current.position.x, targetBankX, 4, delta);
      bankGroup.current.position.y  = Math.sin(t * 0.38 + 1) * 0.045;
    }
    if (bKnot1.current) {
      bKnot1.current.rotation.x += delta * 0.11;
      const m = bKnot1.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = (0.5 + Math.sin(t * 1.45) * 0.28) * v.bLit;
    }
    if (bKnot2.current) {
      bKnot2.current.rotation.x -= delta * 0.21;
      bKnot2.current.rotation.y += delta * 0.33;
      const m = bKnot2.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = (0.7 + Math.sin(t * 1.9 + 1) * 0.3) * v.bLit;
    }
    if (bHalo.current) {
      bHalo.current.rotation.z += delta * 0.07;
      (bHalo.current.material as THREE.MeshBasicMaterial).opacity = (0.14 + Math.sin(t * 0.7) * 0.06) * v.bLit;
    }
    if (bCore.current) {
      const s = 0.35 + Math.sin(t * 4.0) * 0.05;
      bCore.current.scale.setScalar(s);
      (bCore.current.material as THREE.MeshBasicMaterial).opacity = (0.5 + Math.sin(t * 4.0) * 0.3) * v.bLit;
    }

    // ── Signal model animation ──
    if (signalGroup.current) {
      signalGroup.current.rotation.y += delta * 0.19;
      signalGroup.current.rotation.x += delta * 0.11;
      const targetSignalX = THREE.MathUtils.lerp(0, 3.4, alignX);
      signalGroup.current.position.x = THREE.MathUtils.damp(signalGroup.current.position.x, targetSignalX, 4, delta);
      signalGroup.current.position.y = -0.1 + Math.sin(t * 0.42 + 2) * 0.055;
    }
    if (qOct1.current) {
      qOct1.current.rotation.y += delta * 0.34;
      const m = qOct1.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = (0.55 + Math.sin(t * 1.7) * 0.28) * v.qLit;
    }
    if (qOct2.current) {
      qOct2.current.rotation.x -= delta * 0.27;
      qOct2.current.rotation.z += delta * 0.18;
      const m = qOct2.current.material as THREE.MeshStandardMaterial;
      m.emissiveIntensity = (0.85 + Math.sin(t * 2.3 + 1) * 0.38) * v.qLit;
    }
    if (qCore.current) {
      qCore.current.scale.setScalar(0.20 + Math.sin(t * 3.2) * 0.07);
      (qCore.current.material as THREE.MeshBasicMaterial).opacity = (0.55 + Math.sin(t * 3.2) * 0.28) * v.qLit;
    }
    if (qRing1.current) {
      const c1 = (t * 0.65) % 1.0;
      qRing1.current.scale.setScalar(0.8 + c1 * 1.3);
      (qRing1.current.material as THREE.MeshBasicMaterial).opacity = (1 - c1) * 0.48 * v.qLit;
    }
    if (qRing2.current) {
      const c2 = (t * 0.65 + 0.5) % 1.0;
      qRing2.current.scale.setScalar(0.8 + c2 * 1.1);
      (qRing2.current.material as THREE.MeshBasicMaterial).opacity = (1 - c2) * 0.32 * v.qLit;
    }
    if (qPulsar.current) {
      qPulsar.current.rotation.y -= delta * 0.5;
      qPulsar.current.scale.y = 1.0 + Math.sin(t * 5.0) * 0.2;
      (qPulsar.current.material as THREE.MeshBasicMaterial).opacity = (0.3 + Math.sin(t * 5.0) * 0.2) * v.qLit;
    }

    // ── Finale connection line ──
    const h2a = smoothEase(0.76, 0.92, p);
    if (lineRef.current) {
      const lm = lineRef.current.material as THREE.LineBasicMaterial;
      lm.transparent = true;
      lm.opacity = h2a * 0.9;
      lm.color.copy(colorNow);
    }

    // ── Camera ──
    state.camera.position.x = THREE.MathUtils.damp(state.camera.position.x, Math.sin(p * Math.PI) * 0.55, 2, delta);
    state.camera.position.y = THREE.MathUtils.damp(state.camera.position.y, 0.1 - p * 0.12, 2, delta);
    state.camera.lookAt(0, 0, 0);
  });

  return (
    <group ref={outerGroup}>
      {/* Particle cloud */}
      <Points ref={pointsRef} geometry={geometry} frustumCulled={false}>
        <PointMaterial transparent color="#22d3ee" size={0.035} sizeAttenuation
          depthWrite={false} blending={THREE.AdditiveBlending} opacity={0.88} />
      </Points>

      {/* Data streams */}
      <DataStreams progressRef={progressRef} streamCount={streamCount} />

      {/* Floating analytics glyphs */}
      <FloatingGlyphs progressRef={progressRef} glyphCount={glyphCount} />

      {/* ── MODEL 1: Neural Constellation Sphere ── */}
      <group ref={schoolGroup}>
        <mesh ref={sShell} userData={{ emBase: 0.5, opBase: 0.20 }}>
          <icosahedronGeometry args={[1.45, 2]} />
          <meshStandardMaterial color="#67e8f9" emissive="#22d3ee" emissiveIntensity={0.5}
            transparent opacity={0.20} wireframe side={THREE.DoubleSide} />
        </mesh>
        <mesh ref={sDodec} userData={{ emBase: 0.4, opBase: 0.13 }}>
          <dodecahedronGeometry args={[1.0, 0]} />
          <meshStandardMaterial color="#06b6d4" emissive="#0e7490" emissiveIntensity={0.4}
            transparent opacity={0.13} wireframe />
        </mesh>
        <mesh ref={sRing1} rotation={[Math.PI / 2, 0, 0]} userData={{ opBase: 0.52 }}>
          <torusGeometry args={[1.72, 0.015, 8, 90]} />
          <meshBasicMaterial color="#22d3ee" transparent opacity={0.52} />
        </mesh>
        <mesh ref={sRing2} rotation={[1.05, 0.3, 0]} userData={{ opBase: 0.38 }}>
          <torusGeometry args={[1.56, 0.010, 8, 90]} />
          <meshBasicMaterial color="#38bdf8" transparent opacity={0.38} />
        </mesh>
        <mesh ref={sRing3} rotation={[0, 0, Math.PI / 2]} userData={{ opBase: 0.26 }}>
          <torusGeometry args={[1.88, 0.008, 8, 90]} />
          <meshBasicMaterial color="#7dd3fc" transparent opacity={0.26} />
        </mesh>
        <mesh ref={sCore}>
          <sphereGeometry args={[0.22, 16, 16]} />
          <meshBasicMaterial color="#e0f2fe" transparent opacity={0.85} />
        </mesh>
        <mesh ref={sOrbit}>
          <octahedronGeometry args={[0.15, 0]} />
          <meshBasicMaterial color="#ffffff" transparent opacity={0.9} />
        </mesh>
      </group>

      {/* ── MODEL 2: Data Pipeline Torus Knot ── */}
      <group ref={bankGroup}>
        <mesh ref={bKnot1} userData={{ emBase: 0.5, opBase: 0.20 }}>
          <torusKnotGeometry args={[0.92, 0.22, 200, 18, 3, 5]} />
          <meshStandardMaterial color="#6ee7b7" emissive="#10b981" emissiveIntensity={0.5}
            transparent opacity={0.20} wireframe />
        </mesh>
        <mesh ref={bKnot2} userData={{ emBase: 0.8, opBase: 0.30 }}>
          <torusKnotGeometry args={[0.52, 0.13, 130, 12, 2, 3]} />
          <meshStandardMaterial color="#34d399" emissive="#059669" emissiveIntensity={0.8}
            transparent opacity={0.30} wireframe />
        </mesh>
        <mesh ref={bHalo} rotation={[Math.PI / 2, 0, 0]} userData={{ opBase: 0.14 }}>
          <torusGeometry args={[2.05, 0.022, 6, 110]} />
          <meshBasicMaterial color="#6ee7b7" transparent opacity={0.14} />
        </mesh>
        <mesh ref={bCore}>
          <icosahedronGeometry args={[0.3, 1]} />
          <meshBasicMaterial color="#a7f3d0" transparent opacity={0.7} wireframe />
        </mesh>
      </group>

      {/* ── MODEL 3: Quantum Signal Octahedron ── */}
      <group ref={signalGroup}>
        <mesh ref={qOct1} userData={{ emBase: 0.55, opBase: 0.20 }}>
          <octahedronGeometry args={[1.32, 1]} />
          <meshStandardMaterial color="#ddd6fe" emissive="#a78bfa" emissiveIntensity={0.55}
            transparent opacity={0.20} wireframe />
        </mesh>
        <mesh ref={qOct2} rotation={[Math.PI / 4, Math.PI / 4, 0]} userData={{ emBase: 1.0, opBase: 0.32 }}>
          <octahedronGeometry args={[0.75, 0]} />
          <meshStandardMaterial color="#f0abfc" emissive="#e879f9" emissiveIntensity={1.0}
            transparent opacity={0.32} wireframe />
        </mesh>
        <mesh ref={qRing1} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.42, 0.020, 8, 64]} />
          <meshBasicMaterial color="#c4b5fd" transparent opacity={0} />
        </mesh>
        <mesh ref={qRing2} rotation={[Math.PI / 2, 0, 0]}>
          <torusGeometry args={[1.82, 0.013, 8, 64]} />
          <meshBasicMaterial color="#a78bfa" transparent opacity={0} />
        </mesh>
        <mesh ref={qCore}>
          <icosahedronGeometry args={[0.22, 0]} />
          <meshBasicMaterial color="#f0e6ff" transparent opacity={0.55} />
        </mesh>
        <mesh ref={qPulsar}>
          <cylinderGeometry args={[0.05, 0.05, 4, 8]} />
          <meshBasicMaterial color="#ddd6fe" transparent opacity={0.4} blending={THREE.AdditiveBlending} depthWrite={false} />
        </mesh>
      </group>

      {/* Finale connection line */}
      <Line ref={lineRef} points={linePoints} color="#c4b5fd" transparent opacity={0} lineWidth={1.8} />
    </group>
  );
}

// ─── EXPORTED CANVAS ─────────────────────────
export function DataField() {
  const [tier, setTier] = useState<PerfTier>('high');

  useEffect(() => {
    setTier(detectPerfTier());
  }, []);

  const dpr: [number, number] = tier === 'low' ? [1, 1] : tier === 'medium' ? [1, 1.25] : [1, 1.5];
  const enableBloom = tier !== 'low';
  const bloomIntensity = tier === 'medium' ? 0.8 : 1.4;

  return (
    <div className="pointer-events-none absolute inset-0">
      <Canvas
        camera={{ position: [0, 0.2, 9.5], fov: 50 }}
        dpr={dpr}
        gl={{ antialias: tier !== 'low', alpha: true, powerPreference: 'high-performance' }}
        style={{ pointerEvents: 'none' }}
      >
        <ambientLight intensity={0.22} />
        <pointLight position={[5, 4, 7]}  intensity={26} color="#67e8f9" />
        <pointLight position={[-5, -3, 4]} intensity={20} color="#34d399" />
        <pointLight position={[0, 6, 2]}  intensity={14} color="#c4b5fd" />
        <DataMorph />
        <EffectComposer>
          <Bloom luminanceThreshold={0.10} intensity={1.4} mipmapBlur radius={0.65} />
        </EffectComposer>
        <Preload all />
      </Canvas>
    </div>
  );
}
