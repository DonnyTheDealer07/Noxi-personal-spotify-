const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID?.trim() || '';
const REDIRECT_URI = import.meta.env.VITE_SPOTIFY_REDIRECT_URI?.trim() || 'http://127.0.0.1:5173/callback';
const TOKEN_KEY = 'noxi.spotify.session';
const LEGACY_TOKEN_KEY = 'luma.spotify.session';
const VERIFIER_KEY = 'noxi.spotify.pkce.verifier';
const STATE_KEY = 'noxi.spotify.pkce.state';
const SCOPES = [
  'user-read-private', 'user-read-email', 'user-read-recently-played', 'user-read-playback-state', 'user-modify-playback-state',
  'user-read-currently-playing', 'streaming', 'playlist-read-private',
  'playlist-read-collaborative', 'user-library-read',
];

export interface TokenSession { access_token: string; refresh_token: string; expires_at: number; scope?: string }
interface TokenResponse { access_token: string; refresh_token?: string; expires_in: number; scope?: string }
let refreshPromise: Promise<string> | null = null;

export function spotifyConfigured(): boolean { return CLIENT_ID.length > 0; }
function randomText(length: number): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  const bytes = crypto.getRandomValues(new Uint8Array(length));
  return [...bytes].map((b) => chars[b % chars.length]).join('');
}
function base64Url(bytes: ArrayBuffer): string {
  return btoa(String.fromCharCode(...new Uint8Array(bytes))).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}
export async function startSpotifyLogin(forcePrompt = false): Promise<void> {
  if (!CLIENT_ID) throw new Error('Add VITE_SPOTIFY_CLIENT_ID to your .env file first. See the README.');
  const verifier = randomText(96);
  const state = randomText(24);
  const challenge = base64Url(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(verifier)));
  sessionStorage.setItem(VERIFIER_KEY, verifier);
  sessionStorage.setItem(STATE_KEY, state);
  const params = new URLSearchParams({
    client_id: CLIENT_ID, response_type: 'code', redirect_uri: REDIRECT_URI,
    scope: SCOPES.join(' '), code_challenge_method: 'S256', code_challenge: challenge,
    state, show_dialog: forcePrompt ? 'true' : 'false',
  });
  window.location.assign(`https://accounts.spotify.com/authorize?${params}`);
}
function readSession(): TokenSession | null {
  try {
    const raw = sessionStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(LEGACY_TOKEN_KEY);
    if (raw && !sessionStorage.getItem(TOKEN_KEY)) sessionStorage.setItem(TOKEN_KEY, raw);
    return raw ? JSON.parse(raw) as TokenSession : null;
  }
  catch { return null; }
}
function writeSession(token: TokenSession): void { sessionStorage.setItem(TOKEN_KEY, JSON.stringify(token)); }
export function hasSpotifySession(): boolean { return Boolean(readSession()); }
/** Existing pre-upgrade tokens cannot gain new OAuth scopes through refreshing. */
export function needsSpotifyReauthorization(): boolean {
  const session = readSession();
  if (!session) return false;
  const granted = new Set((session.scope || '').split(/\s+/).filter(Boolean));
  return SCOPES.some((scope) => !granted.has(scope));
}
export function grantedSpotifyScopes(): string[] {
  return (readSession()?.scope || '').split(/\s+/).filter(Boolean);
}
export function clearSpotifySession(): void {
  sessionStorage.removeItem(TOKEN_KEY);
  sessionStorage.removeItem(LEGACY_TOKEN_KEY);
}
async function exchangeToken(body: URLSearchParams): Promise<TokenResponse> {
  const response = await fetch('https://accounts.spotify.com/api/token', {
    method: 'POST', headers: { 'Content-Type': 'application/x-www-form-urlencoded' }, body,
  });
  if (!response.ok) {
    const data = await response.json().catch(() => ({})) as { error_description?: string; error?: string };
    throw new Error(data.error_description || `Spotify authentication failed (${response.status}).`);
  }
  return response.json() as Promise<TokenResponse>;
}
export async function consumeSpotifyCallback(): Promise<boolean> {
  if (window.location.pathname !== '/callback') return false;
  const query = new URLSearchParams(window.location.search);
  const error = query.get('error');
  const code = query.get('code');
  const returnedState = query.get('state');
  const expectedState = sessionStorage.getItem(STATE_KEY);
  const verifier = sessionStorage.getItem(VERIFIER_KEY);
  window.history.replaceState({}, '', '/');
  sessionStorage.removeItem(STATE_KEY);
  sessionStorage.removeItem(VERIFIER_KEY);
  if (error) throw new Error(`Spotify authorization was declined (${error}).`);
  if (!code || !verifier || !expectedState || expectedState !== returnedState) {
    throw new Error('Spotify sign-in could not be verified. Please try connecting again.');
  }
  const data = await exchangeToken(new URLSearchParams({
    grant_type: 'authorization_code', code, redirect_uri: REDIRECT_URI,
    client_id: CLIENT_ID, code_verifier: verifier,
  }));
  writeSession({
    access_token: data.access_token, refresh_token: data.refresh_token || '',
    expires_at: Date.now() + data.expires_in * 1000, scope: data.scope || SCOPES.join(' '),
  });
  return true;
}
export async function getSpotifyAccessToken(): Promise<string> {
  const stored = readSession();
  if (!stored) throw new Error('Please connect your Spotify Premium account.');
  if (Date.now() < stored.expires_at - 60_000) return stored.access_token;
  if (!stored.refresh_token) { clearSpotifySession(); throw new Error('Your Spotify session expired. Please sign in again.'); }
  if (!refreshPromise) {
    refreshPromise = (async () => {
      try {
        const refreshed = await exchangeToken(new URLSearchParams({
          grant_type: 'refresh_token', client_id: CLIENT_ID, refresh_token: stored.refresh_token,
        }));
        writeSession({
          access_token: refreshed.access_token,
          refresh_token: refreshed.refresh_token || stored.refresh_token,
          expires_at: Date.now() + refreshed.expires_in * 1000, scope: refreshed.scope || stored.scope,
        });
        return refreshed.access_token;
      } catch (err) {
        clearSpotifySession();
        throw err;
      }
    })().finally(() => { refreshPromise = null; });
  }
  return refreshPromise;
}
