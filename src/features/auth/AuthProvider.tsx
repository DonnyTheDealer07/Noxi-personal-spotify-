import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { clearSpotifySession, consumeSpotifyCallback, getSpotifyAccessToken, hasSpotifySession, needsSpotifyReauthorization, spotifyConfigured, startSpotifyLogin } from './spotifyAuth';
import { spotifyApi } from '../spotify/api';
import type { SpotifyProfile } from '../../types/spotify';

type AuthStatus = 'loading' | 'guest' | 'connected';
interface AuthValue {
  status: AuthStatus; profile: SpotifyProfile | null; error: string | null; configured: boolean;
  login: () => Promise<void>; reauthorize: () => Promise<void>; logout: () => void; clearError: () => void;
}
const AuthContext = createContext<AuthValue | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [profile, setProfile] = useState<SpotifyProfile | null>(null);
  const [error, setError] = useState<string | null>(null);
  useEffect(() => {
    let active = true;
    const init = async () => {
      try {
        await consumeSpotifyCallback();
        if (!hasSpotifySession()) { if (active) setStatus('guest'); return; }
        if (needsSpotifyReauthorization()) {
          clearSpotifySession();
          if (active) {
            setStatus('guest');
            setError('NOXI needs updated Spotify permissions. Select Connect Spotify to authorize the new player.');
          }
          return;
        }
        await getSpotifyAccessToken();
        const me = await spotifyApi.profile();
        if (active) { setProfile(me); setStatus('connected'); }
      } catch (err) {
        if (active) {
          clearSpotifySession(); setStatus('guest');
          setError(err instanceof Error ? err.message : 'Spotify could not connect.');
        }
      }
    };
    void init();
    return () => { active = false; };
  }, []);
  const login = useCallback(async () => { try { setError(null); await startSpotifyLogin(); } catch (err) { setError(err instanceof Error ? err.message : 'Could not start Spotify login.'); } }, []);
  const reauthorize = useCallback(async () => { try { setError(null); await startSpotifyLogin(true); } catch (err) { setError(err instanceof Error ? err.message : 'Could not renew Spotify permissions.'); } }, []);
  const logout = useCallback(() => { clearSpotifySession(); setStatus('guest'); setProfile(null); setError(null); }, []);
  const clearError = useCallback(() => setError(null), []);
  const value = useMemo(() => ({ status, profile, error, configured: spotifyConfigured(), login, reauthorize, logout, clearError }), [status, profile, error, login, reauthorize, logout, clearError]);
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}
export function useAuth(): AuthValue {
  const value = useContext(AuthContext);
  if (!value) throw new Error('useAuth must be called inside AuthProvider');
  return value;
}
