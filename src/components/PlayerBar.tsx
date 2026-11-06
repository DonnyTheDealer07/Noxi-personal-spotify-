
import { useCallback, useState } from 'react';
import {
  Headphones, Maximize2, Pause, Play,
  SkipBack, SkipForward, Volume2, VolumeX, Waves,
} from 'lucide-react';
import { useAuth } from '../features/auth/AuthProvider';
import { usePlayer } from '../features/player/PlayerProvider';
import { Artwork } from './Artwork';
import { NowPlayingOverlay } from './NowPlayingOverlay';
import { artistsText, firstImage, formatTime } from '../utils/format';
import '../styles/now-playing.css';

export function PlayerBar() {
  const { status, login } = useAuth();
  const {
    snapshot, ready, busy, volume,
    toggle, previous, next, seek, changeVolume,
  } = usePlayer();

  const [showNowPlaying, setShowNowPlaying] = useState(false);
  const closeNowPlaying = useCallback(
    () => setShowNowPlaying(false), []
  );

  const live = status === 'connected' && Boolean(snapshot?.track);
  const track = snapshot?.track;

  return (
    <>
      <div className="player-wrap">
        <div className="player-bar">
          <div className="playing-info">
            <button
              type="button"
              className="np-open-now"
              onClick={() => setShowNowPlaying(true)}
              title="Open cinematic player"
              aria-label="Open cinematic now playing"
            >
              <Artwork
                src={
                  track
                    ? firstImage(track.album.images)
                    : '/covers/velvet.svg'
                }
                alt={track?.name || 'Noxi preview artwork'}
                spotify={Boolean(track)}
              />

              <div className="playing-info-text">
                <strong>{track?.name || 'Nothing playing yet'}</strong>
                <span>
                  {track
                    ? artistsText(track.artists)
                    : status === 'connected'
                      ? ready
                        ? 'Choose a song to begin'
                        : 'Preparing your player...'
                      : 'Connect Spotify to listen'}
                </span>
              </div>
            </button>

            {track && (
              <span className="playing-badge" title="Playing from Spotify">
                <Waves size={15} />
              </span>
            )}
          </div>

          <div className="player-center">
            <div className="player-buttons">
              <button
                onClick={() => void previous()}
                disabled={!live || busy}
                title="Previous track"
              >
                <SkipBack size={19} fill="currentColor" />
              </button>

              <button
                className="player-main-btn"
                onClick={() =>
                  status !== 'connected'
                    ? void login()
                    : void toggle()
                }
                disabled={status === 'connected' && (!live || busy)}
                title={
                  status !== 'connected'
                    ? 'Connect Spotify'
                    : snapshot?.isPaused
                      ? 'Play'
                      : 'Pause'
                }
              >
                {live && !snapshot?.isPaused ? (
                  <Pause size={19} fill="currentColor" />
                ) : (
                  <Play size={19} fill="currentColor" />
                )}
              </button>

              <button
                onClick={() => void next()}
                disabled={!live || busy}
                title="Next track"
              >
                <SkipForward size={19} fill="currentColor" />
              </button>
            </div>

            <div className="player-progress">
              <span>{formatTime(snapshot?.position || 0)}</span>

              <input
                aria-label="Song progress"
                type="range"
                min="0"
                max={Math.max(snapshot?.duration || 1, 1)}
                value={Math.min(
                  snapshot?.position || 0,
                  snapshot?.duration || 1
                )}
                onChange={(e) => void seek(Number(e.target.value))}
                disabled={!live}
              />

              <span>{formatTime(snapshot?.duration || 0)}</span>
            </div>
          </div>

          <div className="player-right">
            <span className="output-device">
              <Headphones size={16} />
              <span>{live ? 'NOXI player' : 'Ready for music'}</span>
            </span>

            <button
              className="volume-icon"
              title="Toggle mute"
              onClick={() =>
                void changeVolume(volume === 0 ? 65 : 0)
              }
              disabled={status !== 'connected'}
            >
              {volume === 0 ? (
                <VolumeX size={18} />
              ) : (
                <Volume2 size={18} />
              )}
            </button>

            <input
              aria-label="Volume"
              type="range"
              min="0"
              max="100"
              value={volume}
              onChange={(e) =>
                void changeVolume(Number(e.target.value))
              }
              disabled={status !== 'connected'}
            />
          </div>

          <button
            type="button"
            className="np-expand-dock"
            onClick={() => setShowNowPlaying(true)}
            title="Open cinematic player"
            aria-label="Open cinematic now playing"
          >
            <Maximize2 size={18} />
          </button>
        </div>
      </div>

      {showNowPlaying && (
        <NowPlayingOverlay onClose={closeNowPlaying} />
      )}
    </>
  );
}
