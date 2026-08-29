export type ScenePhase = 'hero' | 'school' | 'bank' | 'finale';

export const sceneState = {
  target: 0,
  progress: 0,
  phase: 'hero' as ScenePhase,
};

export function phaseFromProgress(progress: number): ScenePhase {
  if (progress < 0.22) return 'hero';
  if (progress < 0.48) return 'school';
  if (progress < 0.74) return 'bank';
  return 'finale';
}

export function tintFromProgress(progress: number) {
  if (progress < 0.22) return { from: 'rgba(14, 165, 233, 0.22)', to: 'rgba(15, 23, 42, 0.08)' };
  if (progress < 0.48) return { from: 'rgba(34, 211, 238, 0.28)', to: 'rgba(56, 189, 248, 0.08)' };
  if (progress < 0.74) return { from: 'rgba(52, 211, 153, 0.26)', to: 'rgba(251, 191, 36, 0.08)' };
  return { from: 'rgba(167, 139, 250, 0.28)', to: 'rgba(34, 211, 238, 0.1)' };
}
