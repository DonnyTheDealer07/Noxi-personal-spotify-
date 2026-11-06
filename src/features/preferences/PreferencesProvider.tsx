import gsap from 'gsap';
import { DEFAULT_THEME, isThemeId, type ThemeId } from './themes';
import { createContext, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';

export type Scene = 'aurora' | 'drift' | 'stardust';
export type EffectsLevel = 'subtle' | 'vivid';

export interface NoxiPreferences {
  theme: ThemeId;
  scene: Scene;
  effects: EffectsLevel;
  reducedMotion: boolean;
  compactLibrary: boolean;
}

const STORAGE_KEY = 'noxi.preferences.v1';
const LEGACY_STORAGE_KEYS = ['luma.preferences.v3', 'luma.preferences.v2', 'noxi.preferences.v3', 'noxi.preferences.v2'];
const defaults: NoxiPreferences = {
  theme: DEFAULT_THEME, scene: 'aurora', effects: 'subtle', reducedMotion: false, compactLibrary: false,
};

function readPreferences(): NoxiPreferences {
  try {
    const previous = LEGACY_STORAGE_KEYS.map(key => localStorage.getItem(key)).find(Boolean);
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || previous || '{}') as Partial<NoxiPreferences> & { scene?: string };
    return {
      theme: isThemeId(stored.theme) ? stored.theme : DEFAULT_THEME,
      scene: stored.scene === 'stardust' || stored.scene === 'drift' ? stored.scene : 'aurora',
      effects: stored.effects === 'vivid' ? 'vivid' : 'subtle',
      reducedMotion: typeof stored.reducedMotion === 'boolean' ? stored.reducedMotion : localStorage.getItem('noxi.reducedMotion') === 'true' || localStorage.getItem('luma.reducedMotion') === 'true',
      compactLibrary: stored.compactLibrary === true,
    };
  } catch { return defaults; }
}

type PreferencesValue = {
  preferences: NoxiPreferences;
  update: <K extends keyof NoxiPreferences>(key: K, value: NoxiPreferences[K]) => void;
  reset: () => void;
};
const Context = createContext<PreferencesValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState(readPreferences);
  const didMount = useRef(false);
  useEffect(() => {
    const root = document.documentElement;
    // Theme is separate from atmosphere scene; both persist under the same settings key.
    // Remove the obsolete LUMA/NOXI light-vs-dark flag rather than fighting it.
    root.removeAttribute('data-theme');
    root.dataset.noxiTheme = preferences.theme;
    const tabColor: Record<ThemeId, string> = {
      'marshmallow-galaxy': '#F8F4FF', 'royal-ember': '#17191E',
      'abyssal-bloom': '#080F24', 'punk-inferno': '#FFFAF4',
      'cotton-candy-skies': '#F7FCFF', 'wildwood': '#10291D',
      'sakura-noir': '#08080B',
    };
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', tabColor[preferences.theme]);
    root.style.colorScheme = ['royal-ember', 'abyssal-bloom', 'wildwood', 'sakura-noir'].includes(preferences.theme) ? 'dark' : 'light';
    root.dataset.reducedMotion = String(preferences.reducedMotion);
    root.dataset.effects = preferences.effects;
    root.dataset.compactLibrary = String(preferences.compactLibrary);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(preferences));
  }, [preferences]);

  useEffect(() => {
    if (!didMount.current) { didMount.current = true; return; }
    if (preferences.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    // A tiny entrance settles the new theme without interrupting Spotify playback.
    const targets = document.querySelectorAll('.app-shell, .np-layout');
    if (!targets.length) return;
    const tween = gsap.fromTo(targets, { opacity: 0.78 }, { opacity: 1, duration: 0.46, ease: 'sine.out', overwrite: true });
    return () => { tween.kill(); gsap.set(targets, { clearProps: 'opacity' }); };
  }, [preferences.theme, preferences.reducedMotion]);

  const value = useMemo<PreferencesValue>(() => ({
    preferences,
    update: (key, next) => setPreferences(previous => ({ ...previous, [key]: next })),
    reset: () => setPreferences({ ...defaults }),
  }), [preferences]);
  return <Context.Provider value={value}>{children}</Context.Provider>;
}

export function usePreferences(): PreferencesValue {
  const context = useContext(Context);
  if (!context) throw new Error('usePreferences requires PreferencesProvider');
  return context;
}
