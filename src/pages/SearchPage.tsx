import { useEffect, useState } from 'react';
import { ArrowRight, Compass, Headphones, Search, Sparkles, X } from 'lucide-react';
import { NavLink, useSearchParams } from 'react-router-dom';
import { demoAlbums, demoSongs } from '../data/demo';
import { spotifyApi } from '../features/spotify/api';
import { useAuth } from '../features/auth/AuthProvider';
import { usePlayer } from '../features/player/PlayerProvider';
import { PlaylistCard } from '../components/PlaylistCard';
import { TrackRow, type DisplayTrack } from '../components/TrackRow';
import { firstImage, artistsText } from '../utils/format';

const moods = [
  { title: 'After dark', query: 'dark ambient', symbol: '☾', description: 'Slow, atmospheric sounds' },
  { title: 'Pink skies', query: 'dream pop', symbol: '✳', description: 'Soft, floating melodies' },
  { title: 'Night drive', query: 'synthwave', symbol: '✦', description: 'Neon-lit energy' },
  { title: 'Need a boost', query: 'electronic dance', symbol: '↗', description: 'Turn the energy up' },
  { title: 'Rainy window', query: 'lofi chill', symbol: '☁', description: 'Stay in your orbit' },
  { title: 'Indie feelings', query: 'indie rock', symbol: '♡', description: 'Heart-on-sleeve songs' },
];

export function SearchPage() {
  const [params, setParams] = useSearchParams();
  const query = params.get('q') || '';
  const [input, setInput] = useState(query);
  const [results, setResults] = useState<DisplayTrack[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status, login } = useAuth();
  const { playTrack, ready } = usePlayer();
  const connected = status === 'connected';

  useEffect(() => { setInput(query); }, [query]);
  useEffect(() => {
    if (!connected || !query.trim()) { setResults([]); setError(null); setLoading(false); return; }
    let alive = true;
    setLoading(true);
    setError(null);
    const timer = window.setTimeout(() => {
      spotifyApi.search(query.trim()).then(data => {
        if (alive) setResults((data.tracks?.items || []).filter(t => t?.uri && t?.album).map(t => ({
          id: t.id, name: t.name, artist: artistsText(t.artists), album: t.album.name,
          cover: firstImage(t.album.images), duration: t.duration_ms, uri: t.uri,
          spotifyUrl: t.external_urls?.spotify, spotify: true,
        })));
      }).catch(err => { if (alive) setError(err instanceof Error ? err.message : 'Search could not complete.'); })
        .finally(() => { if (alive) setLoading(false); });
    }, 300);
    return () => { alive = false; window.clearTimeout(timer); };
  }, [connected, query]);

  const guestSongs: DisplayTrack[] = demoSongs.filter(t => `${t.name} ${t.artist} ${t.album}`.toLowerCase().includes(query.toLowerCase()))
    .map(t => ({ id: t.id, name: t.name, artist: t.artist, album: t.album, cover: t.cover, duration: t.duration }));
  const shown = connected ? results : guestSongs;

  return <main className="page standard-page discovery-page">
    <div className="page-heading"><div className="eyebrow"><Sparkles size={13}/> CURIOUS EARS WELCOME</div><h1>Find your next <em>obsession.</em></h1><p>Every new favorite starts somewhere. Where are we going today?</p></div>
    <form className="search-large" onSubmit={e => { e.preventDefault(); setParams(input.trim() ? { q: input.trim() } : {}); }}>
      <Search size={21}/><input autoFocus aria-label="Search Spotify tracks" value={input} onChange={e => setInput(e.target.value)} placeholder="Artists, songs, moods, moments..."/>
      {input && <button type="button" className="clear-search" onClick={() => { setInput(''); setParams({}); }} aria-label="Clear search"><X size={17}/></button>}
      <button type="submit">Search <ArrowRight size={17}/></button>
    </form>
    <section className="discovery-moods"><div className="section-heading"><div><div className="eyebrow"><Compass size={13}/> EXPLORE A FEELING</div><h2>Start with a <em>mood.</em></h2></div></div>
      <div className="mood-chip-grid">{moods.map((mood, i) => <button key={mood.title} type="button" className={`mood-chip mood-chip-${i}`} onClick={() => setParams({ q: mood.query })} title={`Search Spotify for ${mood.query}`}>
        <span>{mood.symbol}</span><strong>{mood.title}</strong><small>{mood.description}</small><ArrowRight size={16}/>
      </button>)}</div>
      <p className="discovery-hint">Each mood starts a real Spotify track search—not a generated playlist or fake recommendation.</p>
    </section>
    {query.trim() ? <section className="search-results"><div className="section-heading"><div><div className="eyebrow">{connected ? 'SPOTIFY SEARCH' : 'DESIGN PREVIEW'}</div><h2>Results for “{query}”</h2></div></div>
      {loading ? <div className="loading-panel">Finding your next favorite...</div>
        : error ? <div className="inline-alert" role="alert">{error} {error.toLowerCase().includes('scope') && 'Try reconnecting Spotify in Settings.'}</div>
        : shown.length ? <div className="library-songs">{shown.map((t, i) => <TrackRow key={`${t.id}-${i}`} index={i} track={t} onPlay={song => song.uri ? void playTrack(song.uri) : void login()} disabled={connected && !ready}/>)}</div>
        : <div className="empty-state"><Search/><h3>No tracks found</h3><p>Try another song title, artist, or mood.</p></div>}
    </section> : <section className="discover-feature"><Headphones size={24}/><div><strong>Find the music that feels like you.</strong><p>Search for a favorite artist, or let a mood point you somewhere new.</p></div><NavLink to="/library">Your library <ArrowRight size={16}/></NavLink></section>}
    {!connected && <><div className="section-heading"><div><div className="eyebrow">A PREVIEW OF THE NOXI UNIVERSE</div><h2>Made for daydreamers</h2></div></div><div className="album-grid">{demoAlbums.map((a, i) => <PlaylistCard key={a.id} title={a.title} description={a.badge || a.subtitle} cover={a.cover} href={`/playlist/demo-${a.id}`} index={i}/>)}</div><p className="demo-note">Spotify search and playback become available when your Premium account is connected. This preview includes fictional music.</p></>}
  </main>;
}
