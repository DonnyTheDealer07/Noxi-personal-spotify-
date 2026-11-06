
import { useEffect, useRef, useState, type CSSProperties } from 'react';
import gsap from 'gsap';
import { createPortal } from 'react-dom';
import {
  ArrowDown,
  Disc3,
  Heart,
  ListMusic,
  Music2,
  Pause,
  Play,
  Repeat,
  Repeat1,
  Shuffle,
  SkipBack,
  SkipForward,
  Sparkles,
  Volume2,
  VolumeX,
  Zap,
  X,
} from 'lucide-react';

import { usePlayer } from '../features/player/PlayerProvider';
import { usePreferences, type Scene } from '../features/preferences/PreferencesProvider';
import { Atmosphere } from './atmosphere/Atmosphere';
import { artistsText, firstImage, formatTime } from '../utils/format';

interface NowPlayingOverlayProps {
  onClose: () => void;
}

export function NowPlayingOverlay({
  onClose,
}: NowPlayingOverlayProps) {
  const {
    snapshot,
    ready,
    busy,
    volume,
    toggle,
    previous,
    next,
    seek,
    changeVolume,
    toggleShuffle,
    cycleRepeat,
  } = usePlayer();

  const [showQueue, setShowQueue] = useState(false);
  const closeRef = useRef<HTMLButtonElement>(null);
  const artRef = useRef<HTMLDivElement>(null);

  const { preferences, update } = usePreferences();
  const track = snapshot?.track;
  const cover = firstImage(track?.album.images);
  const playing = Boolean(track && !snapshot?.isPaused);
  const canControl = Boolean(ready && track && !busy);

  const duration = snapshot?.duration || track?.duration_ms || 0;
  const position = Math.min(snapshot?.position || 0, duration);
  const progress = duration ? (position / duration) * 100 : 0;
  const nextTracks = snapshot?.nextTracks || [];

  useEffect(() => {
    closeRef.current?.focus();

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose();
    };

    document.addEventListener('keydown', onKeyDown);

    return () => document.removeEventListener('keydown', onKeyDown);
  }, [onClose]);


  useEffect(() => {
    if (!artRef.current || preferences.reducedMotion || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
    const animation = gsap.fromTo(artRef.current,
      { opacity: .55, y: 18, scale: .97 },
      { opacity: 1, y: 0, scale: 1, duration: .78, ease: 'power3.out' }
    );
    return () => { animation.kill(); };
  }, [cover, preferences.reducedMotion]);

  return createPortal(
    <div
      className="np-overlay noxi-immersive"
      role="dialog"
      aria-modal="true"
      aria-labelledby="np-title"
    >
      <Atmosphere cover={cover} playing={playing} />

      <div className="np-layout">
        <header className="np-header">
          <div className="np-brand">
            <span className="np-brand-mark">N</span>
            <strong>
              noxi<span>.</span>
            </strong>
          </div>

          <div className="np-header-center">
            <Sparkles size={16} />
            YOUR OWN LITTLE UNIVERSE
          </div>

          <button
            className="np-close"
            type="button"
            ref={closeRef}
            onClick={onClose}
            title="Close now playing"
            aria-label="Close now playing"
          >
            <ArrowDown size={19} />
            <span>Minimize</span>
          </button>
        </header>

        <main className="np-main">
          <div className="np-art-region">
            <div className="np-art-halo" aria-hidden="true" />

            <div className="np-art-frame" ref={artRef}>
              {cover ? (
                <img
                  src={cover}
                  alt={`${track?.album.name || 'Album'} cover`}
                />
              ) : (
                <div className="np-empty-art">
                  <Disc3 size={100} strokeWidth={1} />
                  <span>your universe awaits</span>
                </div>
              )}
            </div>

            <div className="np-art-caption">
              <Sparkles size={14} />
              A LITTLE MAGIC FOR YOUR EARS
            </div>
          </div>

          <section className="np-details" aria-label="Music playback">
            <div className="np-eyebrow">
              <span className="np-live-dot" />
              {playing
                ? 'NOW PLAYING'
                : track
                  ? 'PAUSED IN YOUR ORBIT'
                  : 'YOUR GALAXY PLAYER'}
            </div>

            <h1 id="np-title">
              {track?.name || 'Nothing playing yet'}
            </h1>

            <p className="np-artist">
              {track
                ? artistsText(track.artists)
                : 'Choose something lovely from your library.'}
            </p>

            <p className="np-album">
              {track?.album.name || 'NOXI · Your music, your universe'}
            </p>

            <div className="np-divider" />

            <div className="np-progress">
              <input
                type="range"
                min={0}
                max={Math.max(duration, 1)}
                step={1000}
                value={position}
                disabled={!track || !ready}
                onChange={(event) =>
                  void seek(Number(event.target.value))
                }
                aria-label="Seek through song"
                style={
                  { '--np-progress': `${progress}%` } as CSSProperties
                }
              />

              <div className="np-timestamps">
                <span>{formatTime(position)}</span>
                <span>{formatTime(duration)}</span>
              </div>
            </div>

            <div className="np-controls">
              <button
                type="button"
                className={`np-icon-btn ${
                  snapshot?.shuffle ? 'np-active' : ''
                }`}
                onClick={() => void toggleShuffle()}
                disabled={!canControl}
                aria-label="Shuffle"
                aria-pressed={Boolean(snapshot?.shuffle)}
                title="Shuffle"
              >
                <Shuffle size={21} />
              </button>

              <button
                type="button"
                className="np-icon-btn"
                onClick={() => void previous()}
                disabled={!canControl}
                aria-label="Previous track"
                title="Previous track"
              >
                <SkipBack size={28} fill="currentColor" />
              </button>

              <button
                type="button"
                className="np-main-play"
                onClick={() => void toggle()}
                disabled={!canControl}
                aria-label={playing ? 'Pause' : 'Play'}
                title={playing ? 'Pause' : 'Play'}
              >
                {playing ? (
                  <Pause size={30} fill="currentColor" />
                ) : (
                  <Play size={30} fill="currentColor" />
                )}
              </button>

              <button
                type="button"
                className="np-icon-btn"
                onClick={() => void next()}
                disabled={!canControl}
                aria-label="Next track"
                title="Next track"
              >
                <SkipForward size={28} fill="currentColor" />
              </button>

              <button
                type="button"
                className={`np-icon-btn ${
                  snapshot?.repeat !== 'off' && snapshot?.repeat
                    ? 'np-active'
                    : ''
                }`}
                onClick={() => void cycleRepeat()}
                disabled={!canControl}
                aria-label={`Repeat: ${snapshot?.repeat || 'off'}`}
                title={`Repeat: ${snapshot?.repeat || 'off'}`}
              >
                {snapshot?.repeat === 'track' ? (
                  <Repeat1 size={21} />
                ) : (
                  <Repeat size={21} />
                )}
              </button>
            </div>

            <div className="np-secondary-actions">
              <button
                type="button"
                className={`np-queue-trigger ${
                  showQueue ? 'np-queue-active' : ''
                }`}
                onClick={() => setShowQueue((value) => !value)}
                aria-expanded={showQueue}
                aria-controls="np-queue"
              >
                <ListMusic size={19} />
                <span>Up next</span>
                <span className="np-count">{nextTracks.length}</span>
              </button>

              <div className="np-volume">
                <button
                  type="button"
                  className="np-volume-icon"
                  onClick={() =>
                    void changeVolume(volume === 0 ? 65 : 0)
                  }
                  disabled={!ready}
                  aria-label={volume === 0 ? 'Unmute' : 'Mute'}
                >
                  {volume === 0 ? (
                    <VolumeX size={19} />
                  ) : (
                    <Volume2 size={19} />
                  )}
                </button>

                <input
                  type="range"
                  aria-label="Volume"
                  min={0}
                  max={100}
                  value={volume}
                  onChange={(event) =>
                    void changeVolume(Number(event.target.value))
                  }
                  disabled={!ready}
                  style={
                    { '--np-progress': `${volume}%` } as CSSProperties
                  }
                />

                <span>{volume}%</span>
              </div>
            </div>

            <div className="noxi-scene-switch" role="group" aria-label="Choose ambient scene">
              <span>YOUR ATMOSPHERE</span>
              {(['aurora', 'drift', 'stardust'] as Scene[]).map((scene) => (
                <button type="button" key={scene} aria-pressed={preferences.scene === scene} onClick={() => update('scene', scene)}>
                  {scene === 'aurora' ? '✦ Aurora' : scene === 'drift' ? '≋ Drift' : '✧ Stardust'}
                </button>
              ))}
              <button
                type="button"
                className="noxi-intensity-toggle"
                aria-pressed={preferences.effects === 'vivid'}
                onClick={() => update('effects', preferences.effects === 'vivid' ? 'subtle' : 'vivid')}
                title="Make the GSAP atmosphere calmer or more vivid"
              >
                <Zap size={13} /> {preferences.effects === 'vivid' ? 'Vivid on' : 'Boost glow'}
              </button>
            </div>
            <div className="np-footnote">
              <Heart size={15} />
              made for the music you love
              <span>✦</span>
              <Music2 size={15} />
              powered by Spotify
            </div>
          </section>
        </main>

        <div
          className={`np-queue-panel ${
            showQueue ? 'np-queue-visible' : ''
          }`}
          id="np-queue"
          aria-hidden={!showQueue}
        >
          <div className="np-queue-head">
            <div>
              <span className="np-eyebrow">YOUR SOUNDTRACK</span>
              <h2>Up next</h2>
            </div>

            <button
              type="button"
              onClick={() => setShowQueue(false)}
              aria-label="Close queue"
            >
              <X size={20} />
            </button>
          </div>

          {nextTracks.length ? (
            <div className="np-queue-list">
              {nextTracks.map((item, index) => (
                <div
                  className="np-queue-item"
                  key={`${item.uri}-${index}`}
                >
                  <span className="np-queue-index">
                    {String(index + 1).padStart(2, '0')}
                  </span>

                  {firstImage(item.album.images) ? (
                    <img
                      src={firstImage(item.album.images)}
                      alt=""
                    />
                  ) : (
                    <div className="np-queue-art-empty">
                      <Music2 size={20} />
                    </div>
                  )}

                  <div>
                    <strong>{item.name}</strong>
                    <span>{artistsText(item.artists)}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="np-queue-empty">
              <ListMusic size={36} />
              <p>No upcoming tracks reported by the Spotify player yet.</p>
              <span>Play a playlist to build your queue.</span>
            </div>
          )}

          <p className="np-queue-note">
            Shows tracks available from Spotify's current playback window.
          </p>
        </div>
      </div>
    </div>,
    document.body
  );
}
