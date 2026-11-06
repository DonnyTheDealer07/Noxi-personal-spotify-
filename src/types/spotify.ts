
export interface SpotifyImage {
  url: string;
  height?: number | null;
  width?: number | null;
}

export interface SpotifyArtist {
  id: string;
  name: string;
  external_urls?: { spotify?: string };
}

export interface SpotifyTrack {
  id: string;
  uri: string;
  name: string;
  duration_ms: number;
  type?: string;
  artists: SpotifyArtist[];
  album: {
    id: string;
    name: string;
    images: SpotifyImage[];
    external_urls?: { spotify?: string };
  };
  external_urls?: { spotify?: string };
}

export interface SpotifyPlaylist {
  id: string;
  uri: string;
  name: string;
  description?: string;
  images: SpotifyImage[];
  owner?: { display_name?: string };
  items?: { total: number };
  tracks?: { total: number };
  external_urls?: { spotify?: string };
}

export interface SpotifyProfile {
  id: string;
  display_name?: string;
  images?: SpotifyImage[];
  external_urls?: { spotify?: string };
}

export interface Page<T> {
  items: T[];
  total: number;
  next: string | null;
}

export interface SavedTrack {
  added_at: string;
  track: SpotifyTrack;
}

export interface PlaylistItem {
  item?: SpotifyTrack | null;
  track?: SpotifyTrack | null;
}

export interface PlayerSnapshot {
  isPaused: boolean;
  position: number;
  duration: number;
  track: SpotifyTrack | null;
  nextTracks: SpotifyTrack[];
  shuffle: boolean;
  repeat: 'off' | 'context' | 'track';
}
