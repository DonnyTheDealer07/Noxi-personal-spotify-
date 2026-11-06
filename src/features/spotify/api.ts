
import { getSpotifyAccessToken } from '../auth/spotifyAuth';
import type {
  Page,
  PlaylistItem,
  SavedTrack,
  SpotifyPlaylist,
  SpotifyProfile,
  SpotifyTrack,
} from '../../types/spotify';

const API_BASE = 'https://api.spotify.com/v1';

export async function spotifyRequest<T = void>(
  path: string,
  options: RequestInit = {}
): Promise<T> {
  // Pagination uses Spotify-provided absolute next links; only trust the Spotify API host.
  const relativePath = path.startsWith(API_BASE) ? path.slice(API_BASE.length) : path;
  if (!relativePath.startsWith('/') || relativePath.startsWith('//')) throw new Error('Unsupported Spotify API address.');
  const token = await getSpotifyAccessToken();

  const response = await fetch(`${API_BASE}${relativePath}`, {
    ...options,
    headers: {
      Authorization: `Bearer ${token}`,
      ...(options.body
        ? { 'Content-Type': 'application/json' }
        : {}),
      ...options.headers,
    },
  });

  if (response.status === 204) {
    return undefined as T;
  }

  if (!response.ok) {
    const data = (await response.json().catch(() => ({}))) as {
      error?: {
        message?: string;
        reason?: string;
      };
    };

    const reason =
      data.error?.reason === 'QUOTA_EXCEEDED'
        ? 'Developer API quota exceeded. Try again later.'
        : data.error?.message;

    if (response.status === 401) {
      throw new Error('Spotify authorization expired. Reconnect from Settings.');
    }
    if (response.status === 403 && /scope/i.test(reason || '')) {
      throw new Error('Spotify permissions need updating. Reconnect your account from Settings.');
    }
    throw new Error(reason || `Spotify returned HTTP ${response.status}.`);
  }

  return response.json() as Promise<T>;
}

/** Read all pages, not only Spotify's first 30 liked tracks. */
async function allPages<T>(start: string, maxPages = 100): Promise<Page<T>> {
  const items: T[] = [];
  const visited = new Set<string>();
  let next: string | null = start;
  let total = 0;
  while (next && !visited.has(next) && visited.size < maxPages) {
    visited.add(next);
    const page: Page<T> = await spotifyRequest<Page<T>>(next);
    items.push(...(page.items || []));
    total = page.total ?? items.length;
    next = page.next;
  }
  return { items, total, next };
}

export const spotifyApi = {
  profile: () =>
    spotifyRequest<SpotifyProfile>('/me'),

  playlists: () =>
    allPages<SpotifyPlaylist>('/me/playlists?limit=50'),

  recentlyPlayed: () =>
    spotifyRequest<{ items: { track: SpotifyTrack; played_at: string }[] }>(
      '/me/player/recently-played?limit=15'
    ),

  liked: () =>
    allPages<SavedTrack>('/me/tracks?limit=50'),

  playlistItems: (id: string) =>
    allPages<PlaylistItem>(`/playlists/${encodeURIComponent(id)}/items?limit=50`),

  search: (query: string) =>
    spotifyRequest<{ tracks: Page<SpotifyTrack> }>(
      `/search?type=track&limit=10&q=${encodeURIComponent(query)}`
    ),

  setShuffle: (
    enabled: boolean,
    deviceId: string
  ) =>
    spotifyRequest(
      `/me/player/shuffle?state=${enabled}&device_id=${encodeURIComponent(deviceId)}`,
      { method: 'PUT' }
    ),

  setRepeat: (
    mode: 'off' | 'context' | 'track',
    deviceId: string
  ) =>
    spotifyRequest(
      `/me/player/repeat?state=${mode}&device_id=${encodeURIComponent(deviceId)}`,
      { method: 'PUT' }
    ),

  transfer: (deviceId: string) =>
    spotifyRequest('/me/player', {
      method: 'PUT',
      body: JSON.stringify({
        device_ids: [deviceId],
        play: false,
      }),
    }),

  playTrack: (
    deviceId: string,
    uri: string
  ) =>
    spotifyRequest(
      `/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          uris: [uri],
        }),
      }
    ),

  playContext: (
    deviceId: string,
    uri: string
  ) =>
    spotifyRequest(
      `/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ context_uri: uri }),
      }
    ),

  /** Start at one track INSIDE a playlist. Spotify keeps the full playlist
   *  context, so next/previous use the correct neighboring tracks. */
  playPlaylistTrack: (
    deviceId: string,
    playlistUri: string,
    trackUri: string,
    position?: number
  ) =>
    spotifyRequest(
      `/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({
          context_uri: playlistUri,
          offset: Number.isInteger(position) && position! >= 0
            ? { position }
            : { uri: trackUri },
          position_ms: 0,
        }),
      }
    ),

  /** Liked Songs is not a public Spotify playlist context. Start a real
   *  ordered queue from the selected saved song rather than a single URI. */
  playTrackSequence: (deviceId: string, uris: string[]) =>
    spotifyRequest(
      `/me/player/play?device_id=${encodeURIComponent(deviceId)}`,
      {
        method: 'PUT',
        body: JSON.stringify({ uris }),
      }
    ),
};
