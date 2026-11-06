import { ArrowUpRight, Check, CircleHelp, Headphones, LogOut, RotateCcw, Settings2, Sparkles, UserRound, WandSparkles } from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { usePreferences, type EffectsLevel, type Scene } from '../features/preferences/PreferencesProvider';
import { THEMES } from '../features/preferences/themes';

const scenes: { value: Scene; title: string; description: string }[] = [
  { value: 'aurora', title: 'Aurora', description: 'Silky lavender and blush light' },
  { value: 'drift', title: 'Drift', description: 'Slow floating beams and haze' },
  { value: 'stardust', title: 'Stardust', description: 'Quiet sparkling particles' },
];

export function SettingsPage() {
  const { status, profile, configured, login, reauthorize, logout } = useAuth();
  const { preferences, update, reset } = usePreferences();
  const activeTheme = THEMES.find(theme => theme.id === preferences.theme) ?? THEMES[0];
  return (
    <main className="page standard-page settings-page">
      <div className="page-heading"><div className="eyebrow"><Sparkles size={13}/> FINISHING TOUCHES</div><h1>Make it <em>yours.</em></h1><p>Seven color universes. One beautiful music player.</p></div>
      <div className="preferences-intro">
        <div className="preferences-intro-icon"><WandSparkles size={27}/></div>
        <div><span className="eyebrow">YOUR CURRENT UNIVERSE</span><h2>{activeTheme.name}</h2><p>Pick a color palette below. Every screen, button and fullscreen atmosphere follows your choice.</p></div>
      </div>
      <section className="settings-panel noxi-theme-panel" aria-labelledby="noxi-theme-heading">
        <div className="settings-panel-head"><WandSparkles size={22}/><div><h2 id="noxi-theme-heading">Your color universe</h2><p>Choose any theme. NOXI remembers it automatically, even after a refresh.</p></div></div>
        <div className="noxi-theme-grid" role="group" aria-label="Choose NOXI color theme">
          {THEMES.map(theme => (
            <button
              type="button"
              key={theme.id}
              className={`noxi-theme-card ${preferences.theme === theme.id ? 'is-selected' : ''}`}
              onClick={() => update('theme', theme.id)}
              aria-pressed={preferences.theme === theme.id}
              aria-label={`${theme.name}: ${theme.subtitle}`}
            >
              <span className="noxi-theme-preview" style={{ background: theme.colors[0] }}>
                <span className="noxi-preview-halo" style={{ background: `radial-gradient(circle, ${theme.colors[1]}aa, transparent 75%)` }}/>
                <span className="noxi-preview-halo noxi-preview-halo-two" style={{ background: `radial-gradient(circle, ${theme.colors[2]}b0, transparent 75%)` }}/>
                <span className="noxi-preview-player" style={{ background: theme.dark ? '#ffffff14' : '#ffffffad' }}>
                  <span className="noxi-preview-disc" style={{ background: `linear-gradient(135deg, ${theme.colors[1]}, ${theme.colors[2]})` }}/>
                  <span className="noxi-preview-lines"><i style={{ background: theme.dark ? '#fff9' : '#212125b5' }}/><i style={{ background: theme.dark ? '#fff5' : '#21212555' }}/></span>
                  <span className="noxi-preview-play" style={{ background: theme.colors[2] }}/>
                </span>
                <span className="noxi-preview-swatches">{theme.colors.map((color, i) => <i key={i} style={{ background: color }}/>)}</span>
                {preferences.theme === theme.id && <span className="noxi-theme-check" aria-label="Selected"><Check size={14}/></span>}
              </span>
              <span className="noxi-theme-copy"><strong>{theme.name}</strong><small>{theme.subtitle}</small></span>
            </button>
          ))}
        </div>
      </section>
      <div className="settings-grid settings-grid-upgraded">
        <section className="settings-panel settings-panel-wide">
          <div className="settings-panel-head"><Sparkles size={21}/><div><h2>Fullscreen atmosphere</h2><p>Aurora, Drift and Stardust adapt to {activeTheme.name}. Ambient pulses are decorative, not actual audio analysis.</p></div></div>
          <h3 className="setting-subtitle">Choose a scene</h3>
          <div className="scene-choice-grid">
            {scenes.map(scene => <button type="button" key={scene.value} className={`scene-choice scene-choice-${scene.value} ${preferences.scene === scene.value ? 'selected' : ''}`} onClick={() => update('scene', scene.value)} aria-pressed={preferences.scene === scene.value}>
              <span className="scene-orbit"/><strong>{scene.title}</strong><small>{scene.description}</small>
            </button>)}
          </div>
          <div className="setting-row"><div><strong>Atmosphere intensity</strong><p>Keep things peaceful or bring out the color.</p></div><div className="settings-segments settings-segments-small" role="group" aria-label="Atmosphere intensity">
            {([['subtle', 'Subtle'], ['vivid', 'Vivid']] as [EffectsLevel, string][]).map(([value, label]) => <button type="button" key={value} className={preferences.effects === value ? 'selected' : ''} aria-pressed={preferences.effects === value} onClick={() => update('effects', value)}>{label}</button>)}
          </div></div>
          <div className="setting-row"><div><strong>Reduce motion</strong><p>Disable decorative motion throughout NOXI.</p></div><label className="switch"><input type="checkbox" checked={preferences.reducedMotion} onChange={event => update('reducedMotion', event.target.checked)}/><span/></label></div>
          <div className="setting-row"><div><strong>Compact library</strong><p>Fit more playlists on the screen.</p></div><label className="switch"><input type="checkbox" checked={preferences.compactLibrary} onChange={event => update('compactLibrary', event.target.checked)}/><span/></label></div>
        </section>
        <section className="settings-panel">
          <div className="settings-panel-head"><UserRound size={22}/><div><h2>Spotify connection</h2><p>Your listening account and permissions.</p></div></div>
          <div className="account-state"><span className={`account-dot ${status === 'connected' ? 'online' : ''}`}/><strong>{status === 'connected' ? profile?.display_name || 'Connected account' : 'Not connected'}</strong><span>{status === 'connected' ? 'Account connected' : configured ? 'Ready to connect' : 'Client ID needed'}</span></div>
          {status === 'connected' ? <div className="spotify-actions"><button type="button" className="settings-action" onClick={() => void reauthorize()}><Sparkles size={16}/> Renew permissions</button><button type="button" className="settings-action danger" onClick={logout}><LogOut size={16}/> Disconnect</button></div> : <button className="settings-action" type="button" onClick={() => void login()}><Headphones size={17}/> Connect Spotify Premium</button>}
          <p className="settings-help">{configured ? 'Spotify can restrict API features for development apps. Renew permissions if an endpoint reports missing scopes.' : 'Add your Spotify Client ID to .env. See the README for setup.'}</p>
          <a className="settings-doc" href="https://developer.spotify.com/dashboard" target="_blank" rel="noreferrer">Spotify Developer Dashboard <ArrowUpRight size={15}/></a>
        </section>
        <section className="settings-panel">
          <div className="settings-panel-head"><Settings2 size={22}/><div><h2>Good to know</h2><p>Made for an uncomplicated listening experience.</p></div></div>
          <div className="settings-info"><CircleHelp size={17}/><span>Ambient animations are not synchronized to protected Spotify audio. The artwork, track state and playback controls still come from your real Spotify session.</span></div>
          <div className="settings-info"><Sparkles size={17}/><span>Appearance preferences are saved in this browser only.</span></div>
          <button className="settings-action settings-reset" type="button" onClick={reset}><RotateCcw size={16}/> Reset appearance</button>
        </section>
      </div>
      <div className="settings-note"><Sparkles size={20}/><div><strong>Seven universes. Three atmosphere scenes each.</strong><p>Open Now Playing to see {activeTheme.name} in Aurora, Drift and Stardust.</p></div></div>
    </main>
  );
}
