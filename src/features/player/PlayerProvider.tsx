
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';

import { useAuth } from '../auth/AuthProvider';
import { getSpotifyAccessToken } from '../auth/spotifyAuth';
import { spotifyApi } from '../spotify/api';

import type {
  PlayerSnapshot,
  SpotifyTrack,
} from '../../types/spotify';

interface PlayerValue {
  ready: boolean;
  busy: boolean;
  error: string | null;
  snapshot: PlayerSnapshot | null;
  volume: number;

  playTrack: (uri: string) => Promise<void>;
  playPlaylist: (uri: string) => Promise<void>;
  playPlaylistTrack: (playlistUri: string, trackUri: string, position?: number) => Promise<void>;
  playSavedTrack: (trackUri: string, orderedUris: string[]) => Promise<void>;

  toggle: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;

  seek: (ms: number) => Promise<void>;

  toggleShuffle: () => Promise<void>;
  cycleRepeat: () => Promise<void>;

  changeVolume: (value: number) => Promise<void>;
  clearError: () => void;
}

const PlayerContext = createContext<PlayerValue | null>(null);

function asTrack(track: SpotifySdkTrack): SpotifyTrack {
  return {
    id: track.id,
    uri: track.uri,
    name: track.name,
    duration_ms: track.duration_ms,

    artists: track.artists.map((artist) => ({
      id: '',
      name: artist.name,
    })),

    album: {
      id: '',
      name: track.album.name,
      images: track.album.images,
    },
  };
}

export function PlayerProvider({
  children,
}: {
  children: ReactNode;
}) {
  const { status } = useAuth();

  const playerRef = useRef<SpotifySdkPlayer | null>(null);
  const deviceRef = useRef<string | null>(null);

  const [ready, setReady] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [volume, setVolume] = useState(65);

  const [snapshot, setSnapshot] =
    useState<PlayerSnapshot | null>(null);

  // Initialize Spotify browser player
  useEffect(() => {
    if (status !== 'connected') {
      playerRef.current?.disconnect();
      playerRef.current = null;
      deviceRef.current = null;

      setReady(false);
      setSnapshot(null);
      return;
    }

    let active = true;

    function setup() {
      if (
        !active ||
        !window.Spotify ||
        playerRef.current
      ) {
        return;
      }

      const player = new window.Spotify.Player({
        name: 'NOXI · Galaxy Player',

        getOAuthToken: (callback) => {
          void getSpotifyAccessToken()
            .then(callback)
            .catch(() => {
              setError(
                'Spotify session expired. Reconnect your account.'
              );
            });
        },

        volume: 0.65,
      });

      playerRef.current = player;

      player.addListener(
        'ready',
        ({ device_id }: { device_id: string }) => {
          deviceRef.current = device_id;
          setReady(true);
        }
      );

      player.addListener('not_ready', () => {
        deviceRef.current = null;
        setReady(false);
      });

      player.addListener(
        'initialization_error',
        ({ message }: { message: string }) => {
          setError(message);
        }
      );

      player.addListener(
        'authentication_error',
        ({ message }: { message: string }) => {
          setError(message);
        }
      );

      player.addListener(
        'account_error',
        ({ message }: { message: string }) => {
          setError(message);
        }
      );

      player.addListener(
        'playback_error',
        ({ message }: { message: string }) => {
          setError(message);
        }
      );

      // Sync Spotify playback state with NOXI
      player.addListener(
        'player_state_changed',
        (state: SpotifySdkState | null) => {
          if (!state) return;

          setSnapshot({
            isPaused: state.paused,
            position: state.position,
            duration: state.duration,

            track: state.track_window?.current_track
              ? asTrack(state.track_window.current_track)
              : null,

            nextTracks: (
              state.track_window?.next_tracks || []
            ).map(asTrack),

            shuffle: Boolean(state.shuffle),

            repeat:
              state.repeat_mode === 2
                ? 'track'
                : state.repeat_mode === 1
                  ? 'context'
                  : 'off',
          });
        }
      );

      void player.connect().then((connected) => {
        if (!connected && active) {
          setError(
            'Could not start the Spotify browser player.'
          );
        }
      });
    }

    if (window.Spotify) {
      setup();
    } else {
      window.onSpotifyWebPlaybackSDKReady = setup;

      if (
        !document.querySelector(
          'script[data-spotify-sdk]'
        )
      ) {
        const script = document.createElement('script');

        script.src =
          'https://sdk.scdn.co/spotify-player.js';

        script.async = true;
        script.dataset.spotifySdk = 'true';

        script.onerror = () => {
          setError(
            'The Spotify playback SDK could not load.'
          );
        };

        document.body.appendChild(script);
      }
    }

    return () => {
      active = false;

      playerRef.current?.disconnect();
      playerRef.current = null;
      deviceRef.current = null;

      window.onSpotifyWebPlaybackSDKReady = undefined;
    };
  }, [status]);

  // Update progress every second
  useEffect(() => {
    if (!snapshot || snapshot.isPaused) return;

    const timer = window.setInterval(() => {
      setSnapshot((current) => {
        if (!current || current.isPaused) {
          return current;
        }

        return {
          ...current,
          position: Math.min(
            current.position + 1000,
            current.duration
          ),
        };
      });
    }, 1000);

    return () => window.clearInterval(timer);
  }, [snapshot?.isPaused, snapshot?.track?.uri]);

  // Common error and loading handler
  const run = useCallback(
    async (action: () => Promise<void>) => {
      setBusy(true);
      setError(null);

      try {
        await action();
      } catch (err) {
        setError(
          err instanceof Error
            ? err.message
            : 'Spotify playback failed.'
        );
      } finally {
        setBusy(false);
      }
    },
    []
  );

  // Activate the browser player
  const activateAndTransfer = useCallback(async () => {
    const player = playerRef.current;
    const device = deviceRef.current;

    if (!player || !device) {
      throw new Error(
        'The Spotify player is starting. Try again in a moment.'
      );
    }

    await player.activateElement();
    await spotifyApi.transfer(device);

    return device;
  }, []);

  // Play a single track
  const playTrack = useCallback(
    async (uri: string) => {
      await run(async () => {
        const device = await activateAndTransfer();
        await spotifyApi.playTrack(device, uri);
      });
    },
    [run, activateAndTransfer]
  );

  // Play an entire playlist
  const playPlaylist = useCallback(
    async (uri: string) => {
      await run(async () => {
        const device = await activateAndTransfer();
        await spotifyApi.playContext(device, uri);
      });
    },
    [run, activateAndTransfer]
  );

  // Playing a song from a playlist must preserve its Spotify context.
  // Single-song playback would break Next / Previous after that song.
  const playPlaylistTrack = useCallback(
    async (playlistUri: string, trackUri: string, position?: number) => {
      await run(async () => {
        const device = await activateAndTransfer();
        await spotifyApi.playPlaylistTrack(device, playlistUri, trackUri, position);
      });
    },
    [run, activateAndTransfer]
  );

  // For Liked Songs, Spotify has no normal playlist context. Supply the
  // following saved songs as a sequence, so Next works in the visible order.
  const playSavedTrack = useCallback(
    async (trackUri: string, orderedUris: string[]) => {
      await run(async () => {
        const device = await activateAndTransfer();
        const index = orderedUris.indexOf(trackUri);
        if (index < 0) {
          await spotifyApi.playTrack(device, trackUri);
          return;
        }
        // Cap a request to 100 tracks. Only real Spotify track URIs are used.
        const following = orderedUris.slice(index, index + 100)
          .filter((uri) => /^spotify:track:[A-Za-z0-9]+$/.test(uri));
        if (following.length === 0) {
          throw new Error('No playable Spotify tracks are available.');
        }
        await spotifyApi.playTrackSequence(device, following);
      });
    },
    [run, activateAndTransfer]
  );

  // Play / pause
  const toggle = useCallback(async () => {
    await run(async () => {
      if (!playerRef.current || !snapshot?.track) {
        throw new Error(
          'Choose a song from your Spotify library first.'
        );
      }

      await playerRef.current.togglePlay();
    });
  }, [run, snapshot?.track]);

  // Next track
  const next = useCallback(async () => {
    await run(async () => {
      if (!playerRef.current || !snapshot?.track) {
        throw new Error('Choose a song first.');
      }

      await playerRef.current.nextTrack();
    });
  }, [run, snapshot?.track]);

  // Previous track
  const previous = useCallback(async () => {
    await run(async () => {
      if (!playerRef.current || !snapshot?.track) {
        throw new Error('Choose a song first.');
      }

      await playerRef.current.previousTrack();
    });
  }, [run, snapshot?.track]);

  // Seek to a position
  const seek = useCallback(
    async (ms: number) => {
      await run(async () => {
        if (playerRef.current && snapshot?.track) {
          await playerRef.current.seek(ms);
        }
      });
    },
    [run, snapshot?.track]
  );

  // Enable / disable shuffle
  const toggleShuffle = useCallback(async () => {
    await run(async () => {
      const device = deviceRef.current;

      if (!device || !snapshot?.track) {
        throw new Error('Choose a song first.');
      }

      const desired = !snapshot.shuffle;

      await spotifyApi.setShuffle(desired, device);

      setSnapshot((current) =>
        current
          ? { ...current, shuffle: desired }
          : current
      );
    });
  }, [run, snapshot]);

  // Repeat: off -> context -> track -> off
  const cycleRepeat = useCallback(async () => {
    await run(async () => {
      const device = deviceRef.current;

      if (!device || !snapshot?.track) {
        throw new Error('Choose a song first.');
      }

      const nextMode =
        snapshot.repeat === 'off'
          ? 'context'
          : snapshot.repeat === 'context'
            ? 'track'
            : 'off';

      await spotifyApi.setRepeat(nextMode, device);

      setSnapshot((current) =>
        current
          ? { ...current, repeat: nextMode }
          : current
      );
    });
  }, [run, snapshot]);

  // Volume
  const changeVolume = useCallback(
    async (value: number) => {
      setVolume(value);

      if (playerRef.current) {
        try {
          await playerRef.current.setVolume(value / 100);
        } catch {
          setError('Could not update volume.');
        }
      }
    },
    []
  );

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const value = useMemo<PlayerValue>(
    () => ({
      ready,
      busy,
      error,
      snapshot,
      volume,

      playTrack,
      playPlaylist,
      playPlaylistTrack,
      playSavedTrack,
      toggle,
      next,
      previous,
      seek,

      toggleShuffle,
      cycleRepeat,

      changeVolume,
      clearError,
    }),
    [
      ready,
      busy,
      error,
      snapshot,
      volume,
      playTrack,
      playPlaylist,
      playPlaylistTrack,
      playSavedTrack,
      toggle,
      next,
      previous,
      seek,
      toggleShuffle,
      cycleRepeat,
      changeVolume,
      clearError,
    ]
  );

  return (
    <PlayerContext.Provider value={value}>
      {children}
    </PlayerContext.Provider>
  );
}

export function usePlayer(): PlayerValue {
  const value = useContext(PlayerContext);

  if (!value) {
    throw new Error(
      'usePlayer must be called inside PlayerProvider'
    );
  }

  return value;
}
