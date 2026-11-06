import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState, type ReactNode } from 'react';
import { useAuth } from '../auth/AuthProvider';
import { spotifyApi } from './api';
import type { SpotifyPlaylist, SpotifyTrack } from '../../types/spotify';

export interface LibraryValue {
  playlists: SpotifyPlaylist[];
  liked: SpotifyTrack[];
  recent: SpotifyTrack[];
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}
const LibraryContext = createContext<LibraryValue | null>(null);

export function LibraryProvider({ children }: { children: ReactNode }) {
  const { status } = useAuth();
  const [playlists, setPlaylists] = useState<SpotifyPlaylist[]>([]);
  const [liked, setLiked] = useState<SpotifyTrack[]>([]);
  const [recent, setRecent] = useState<SpotifyTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const generation = useRef(0);

  const refresh = useCallback(async () => {
    if (status !== 'connected') return;
    const requestId = ++generation.current;
    setLoading(true);
    const [playlistResult, likedResult, recentResult] = await Promise.allSettled([
      spotifyApi.playlists(), spotifyApi.liked(), spotifyApi.recentlyPlayed(),
    ]);
    if (requestId !== generation.current) return;
    if (playlistResult.status === 'fulfilled') setPlaylists(playlistResult.value.items.filter(Boolean));
    if (likedResult.status === 'fulfilled') setLiked(likedResult.value.items.map(item => item.track).filter(Boolean));
    if (recentResult.status === 'fulfilled') {
      const unique = new Map<string, SpotifyTrack>();
      for (const entry of recentResult.value.items) {
        if (entry.track?.uri && !unique.has(entry.track.uri)) unique.set(entry.track.uri, entry.track);
      }
      setRecent([...unique.values()]);
    }
    const essentialFailures = [playlistResult, likedResult].filter(
      (result): result is PromiseRejectedResult => result.status === 'rejected'
    );
    setError(essentialFailures.length ? essentialFailures.map(result =>
      result.reason instanceof Error ? result.reason.message : 'Some Spotify library items are unavailable.'
    ).join(' · ') : null);
    setLoading(false);
  }, [status]);

  useEffect(() => {
    if (status === 'connected') { void refresh(); }
    else { generation.current++; setPlaylists([]); setLiked([]); setRecent([]); setError(null); setLoading(false); }
  }, [status, refresh]);

  const value = useMemo(() => ({ playlists, liked, recent, loading, error, refresh }),
    [playlists, liked, recent, loading, error, refresh]);
  return <LibraryContext.Provider value={value}>{children}</LibraryContext.Provider>;
}
export function useLibrary(): LibraryValue {
  const value = useContext(LibraryContext);
  if (!value) throw new Error('useLibrary requires LibraryProvider');
  return value;
}
