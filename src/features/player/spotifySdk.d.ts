
interface SpotifySdkTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  artists: { name: string }[];
  album: {
    name: string;
    images: { url: string }[];
  };
}

interface SpotifySdkState {
  paused: boolean;
  position: number;
  duration: number;
  track_window: {
    current_track: SpotifySdkTrack;
    next_tracks?: SpotifySdkTrack[];
  };
  shuffle?: boolean;
  repeat_mode?: 0 | 1 | 2;
}

interface SpotifySdkPlayer {
  addListener(
    event: string,
    cb: (arg: any) => void
  ): void;

  connect(): Promise<boolean>;
  disconnect(): void;
  activateElement(): Promise<void>;
  togglePlay(): Promise<void>;
  nextTrack(): Promise<void>;
  previousTrack(): Promise<void>;
  seek(position: number): Promise<void>;
  setVolume(volume: number): Promise<void>;
  getCurrentState(): Promise<SpotifySdkState | null>;
}

interface SpotifySdkNamespace {
  Player: new (options: {
    name: string;
    getOAuthToken: (cb: (token: string) => void) => void;
    volume: number;
  }) => SpotifySdkPlayer;
}

interface Window {
  Spotify?: SpotifySdkNamespace;
  onSpotifyWebPlaybackSDKReady?: () => void;
}
