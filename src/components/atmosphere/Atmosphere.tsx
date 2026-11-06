import { useEffect, useRef } from 'react';
import gsap from 'gsap';
import { usePreferences } from '../../features/preferences/PreferencesProvider';
import { useAtmosphereAnimation } from '../../hooks/useAtmosphereAnimation';
import { AuroraLayers } from './AuroraLayers';
import { DriftLayers } from './DriftLayers';
import { StardustLayers } from './StardustLayers';
import { AmbientBars } from './AmbientBars';
import { EnergyPulse } from './EnergyPulse';
import '../../styles/atmosphere.css';
import '../../styles/atmosphere-energy.css';

type Props = { cover?: string | null; playing: boolean };

/**
 * Three visually separate backgrounds remain mounted so GSAP can crossfade
 * between them without flashes or resetting Spotify's player state.
 */
export function Atmosphere({ cover, playing }: Props) {
  const root = useRef<HTMLDivElement>(null);
  const coverRef = useRef<HTMLDivElement>(null);
  const { preferences } = usePreferences();

  useAtmosphereAnimation(root, playing);

  useEffect(() => {
    const element = coverRef.current;
    if (!element || !cover) return;
    if (preferences.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
      gsap.set(element, { opacity: 0.18, scale: 1 });
      return;
    }
    const tween = gsap.fromTo(element,
      { opacity: 0, scale: 1.07 },
      { opacity: 0.18, scale: 1, duration: 1.35, ease: 'power2.out', overwrite: true },
    );
    return () => { tween.kill(); };
  }, [cover, preferences.reducedMotion]);

  return <div ref={root}
    className={`noxi-atmosphere noxi-atmosphere--${preferences.effects}`}
    data-scene={preferences.scene}
    aria-hidden="true"
  >
    <div className="noxi-scene noxi-scene--aurora" data-noxi-scene="aurora"><AuroraLayers /></div>
    <div className="noxi-scene noxi-scene--drift" data-noxi-scene="drift"><DriftLayers /></div>
    <div className="noxi-scene noxi-scene--stardust" data-noxi-scene="stardust"><StardustLayers /></div>
    {cover && <div ref={coverRef} className="noxi-ambient-cover" style={{ backgroundImage: `url(${JSON.stringify(cover)})` }} />}
    <EnergyPulse />
    <AmbientBars />
    <div className="noxi-atmosphere-veil" />
  </div>;
}
