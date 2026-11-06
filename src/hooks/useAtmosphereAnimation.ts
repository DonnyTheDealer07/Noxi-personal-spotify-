import { useEffect, useLayoutEffect, useRef, type RefObject } from 'react';
import gsap from 'gsap';
import { usePreferences, type Scene } from '../features/preferences/PreferencesProvider';

const scenes: Scene[] = ['aurora', 'drift', 'stardust'];
type Motions = Record<Scene, gsap.core.Animation[]>;

/**
 * GSAP exclusively owns the scene transitions and animated element transforms.
 * Playback affects animation speed, never Spotify audio capture or processing.
 */
export function useAtmosphereAnimation(root: RefObject<HTMLDivElement | null>, playing: boolean) {
  const { preferences } = usePreferences();
  const { scene, effects, reducedMotion } = preferences;
  const motion = useRef<Motions>({ aurora: [], drift: [], stardust: [] });
  const rhythm = useRef<gsap.core.Animation[]>([]);
  const firstScene = useRef(true);
  const browserReducedMotion = typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const reduce = reducedMotion || browserReducedMotion;

  // Scene transitions are independent from movement timelines. Crucially,
  // changing a button now crossfades COMPLETELY DIFFERENT scene compositions.
  useLayoutEffect(() => {
    if (!root.current) return;
    const elements = Array.from(root.current.querySelectorAll<HTMLElement>('[data-noxi-scene]'));
    gsap.killTweensOf(elements);
    if (firstScene.current || reduce) {
      elements.forEach(el => gsap.set(el, { opacity: el.dataset.noxiScene === scene ? 1 : 0 }));
      firstScene.current = false;
      return;
    }
    elements.forEach(el => {
      gsap.to(el, {
        opacity: el.dataset.noxiScene === scene ? 1 : 0,
        duration: 1.05,
        ease: 'power2.inOut',
        overwrite: 'auto',
      });
    });
    return () => { gsap.killTweensOf(elements); };
  }, [root, scene, reduce]);

  useEffect(() => {
    if (!root.current || reduce) return;
    const vivid = effects === 'vivid';
    const ctx = gsap.context(() => {
      const aurora = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
      aurora.to('.noxi-aurora-ribbon--one', { xPercent: 13, yPercent: -28, rotation: -4, scale: vivid ? 1.22 : 1.12, duration: 11, ease: 'sine.inOut' }, 0);
      aurora.to('.noxi-aurora-ribbon--two', { xPercent: -12, yPercent: 24, rotation: 8, scale: 1.16, duration: 14, ease: 'sine.inOut' }, 0);
      aurora.to('.noxi-aurora-ribbon--three', { xPercent: 10, yPercent: -20, rotation: -5, duration: 17, ease: 'sine.inOut' }, 0);
      aurora.to('.noxi-aurora-bloom', { xPercent: 10, yPercent: -6, scale: vivid ? 1.27 : 1.12, duration: 13, ease: 'sine.inOut' }, 0);
      motion.current.aurora = [aurora];

      const drift = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
      drift.to('.noxi-drift-cloud--a', { xPercent: 27, yPercent: -20, rotation: 8, scale: 1.2, duration: 19, ease: 'sine.inOut' }, 0);
      drift.to('.noxi-drift-cloud--b', { xPercent: -25, yPercent: 17, scale: 1.18, duration: 16, ease: 'sine.inOut' }, 0);
      drift.to('.noxi-drift-cloud--c', { xPercent: 20, yPercent: -19, rotation: -8, duration: 23, ease: 'sine.inOut' }, 0);
      drift.to('.noxi-drift-cloud--d', { xPercent: -14, yPercent: 18, scale: 1.15, duration: 22, ease: 'sine.inOut' }, 0);
      drift.to('.noxi-drift-light--a', { xPercent: 18, yPercent: 18, rotation: -6, duration: 24, ease: 'sine.inOut' }, 0);
      drift.to('.noxi-drift-light--b', { xPercent: -17, yPercent: -14, rotation: 9, duration: 20, ease: 'sine.inOut' }, 0);
      motion.current.drift = [drift];

      const stardust = gsap.timeline({ repeat: -1, yoyo: true, paused: true });
      stardust.to('.noxi-stardust-cloud--a', { xPercent: 12, yPercent: -18, scale: 1.17, duration: 17, ease: 'sine.inOut' }, 0);
      stardust.to('.noxi-stardust-cloud--b', { xPercent: -18, yPercent: 12, rotation: 8, duration: 21, ease: 'sine.inOut' }, 0);
      stardust.to('.noxi-stardust-glimmer--a', { xPercent: 13, opacity: .9, duration: 10, ease: 'sine.inOut' }, 0);
      stardust.to('.noxi-stardust-glimmer--b', { xPercent: -14, opacity: .67, duration: 13, ease: 'sine.inOut' }, 0);
      motion.current.stardust = [stardust];

      gsap.utils.toArray<HTMLElement>('.noxi-speck').forEach((el, index) => {
        const a = gsap.fromTo(el,
          { opacity: .25, scale: .7, y: 5 },
          {
            opacity: (index % 4 === 0) ? .98 : .68,
            scale: 1.25,
            y: -7 - (index % 4) * 3,
            duration: Number(el.dataset.duration) || 5,
            delay: Number(el.dataset.delay) || 0,
            repeat: -1, yoyo: true, ease: 'sine.inOut', paused: true,
          });
        motion.current.stardust.push(a);
      });

      // Rhythmic decorative motion: deliberately independent from Spotify
      // audio (the SDK exposes playback state, not audio frequency data).
      const bars = gsap.utils.toArray<HTMLElement>('.noxi-ambient-bars i');
      const barTweens = bars.map((el, index) => gsap.fromTo(el,
        { scaleY: .17 + (index % 4) * .05, opacity: .4 },
        {
          scaleY: 1.1 + ((index * 7) % 11) / 13,
          opacity: .92,
          duration: .32 + (index % 7) * .075,
          delay: -(index % 9) * .09,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          paused: true,
        }
      ));

      const energyGlows = gsap.utils.toArray<HTMLElement>('.noxi-energy-glow');
      const glowTweens = energyGlows.map((el, index) => gsap.fromTo(el,
        { scale: .91, opacity: .37 },
        {
          scale: vivid ? 1.19 : 1.12,
          opacity: vivid ? .94 : .75,
          duration: .47 + index * .14,
          delay: -index * .19,
          repeat: -1,
          yoyo: true,
          ease: 'sine.inOut',
          paused: true,
        }
      ));

      const flares = gsap.utils.toArray<HTMLElement>('.noxi-energy-flare');
      const flareTweens = flares.map((el, index) => gsap.fromTo(el,
        { opacity: .28, scaleX: .88, y: 12 },
        {
          opacity: vivid ? .76 : .6,
          scaleX: 1.1,
          y: -12,
          repeat: -1,
          yoyo: true,
          duration: 2.9 + index * 1.15,
          ease: 'sine.inOut',
          paused: true,
        }
      ));
      rhythm.current = [...barTweens, ...glowTweens, ...flareTweens];
    }, root);
    return () => {
      ctx.revert();
      motion.current = { aurora: [], drift: [], stardust: [] };
      rhythm.current = [];
    };
  }, [root, effects, reduce]);

  useEffect(() => {
    for (const tween of rhythm.current) {
      tween.paused(reduce);
      if (!reduce) tween.timeScale(playing ? 1 : .12);
    }
    for (const key of scenes) {
      for (const tween of motion.current[key]) {
        tween.paused(key !== scene || reduce);
        if (key === scene && !reduce) tween.timeScale(playing ? 1 : .28);
      }
    }
  }, [scene, playing, effects, reduce]);
}
