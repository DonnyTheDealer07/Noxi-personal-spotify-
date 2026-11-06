import { useEffect, useState } from 'react';
import { ArrowLeft, ArrowUpRight, Headphones, Info, Music2, Play, Sparkles } from 'lucide-react';
import { useNavigate, useParams } from 'react-router-dom';
import { demoAlbums, demoSongs } from '../data/demo';
import { Artwork } from '../components/Artwork';
import { TrackRow, type DisplayTrack } from '../components/TrackRow';
import { useAuth } from '../features/auth/AuthProvider';
import { useLibrary } from '../features/spotify/useLibrary';
import { usePlayer } from '../features/player/PlayerProvider';
import { spotifyApi } from '../features/spotify/api';
import { firstImage, artistsText } from '../utils/format';
export function PlaylistPage() {
  const { id = '' } = useParams(); const navigate = useNavigate();
  const { status, login } = useAuth(); const { playlists } = useLibrary();
  const { playPlaylist, playPlaylistTrack, ready } = usePlayer();
  const connected = status === 'connected' && !id.startsWith('demo-');
  const demo = demoAlbums.find(a => `demo-${a.id}` === id) || demoAlbums[0];
  const playlist = playlists.find(p => p.id === id);
  const [songs, setSongs] = useState<DisplayTrack[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  useEffect(() => {
    if (!connected) { setSongs([]); setError(null); return; }
    let alive = true; setLoading(true); setError(null);
    spotifyApi.playlistItems(id).then(data => { if (alive) setSongs(data.items.map((row, playlistPosition) => ({ track: row.item || row.track, playlistPosition })).filter((entry): entry is { track: NonNullable<typeof entry.track>; playlistPosition: number } => Boolean(entry.track && entry.track.type !== 'episode' && entry.track.uri)).map(({ track: t, playlistPosition }) => ({ id: t.id, name: t.name, artist: artistsText(t.artists), album: t.album.name, cover: firstImage(t.album.images), duration: t.duration_ms, uri: t.uri, spotifyUrl: t.external_urls?.spotify, spotify: true, playlistPosition }))); })
      .catch(err => { if (alive) setError(err instanceof Error ? err.message : 'Could not load this playlist.'); }).finally(() => { if (alive) setLoading(false); });
    return () => { alive = false; };
  }, [id, connected]);
  const previewSongs: DisplayTrack[] = demoSongs.map(t => ({ id: t.id, name: t.name, artist: t.artist, album: t.album, cover: t.cover, duration: t.duration }));
  const tracks = connected ? songs : previewSongs;
  const title = connected ? (playlist?.name || 'Spotify playlist') : demo.title;
  const cover = connected ? firstImage(playlist?.images) : demo.cover;
  return <main className="page standard-page playlist-page"><button className="back-link" onClick={() => navigate(-1)}><ArrowLeft size={17}/> Back to your universe</button>
    <div className="playlist-hero"><Artwork src={cover} alt={title} spotify={connected}/><div className="playlist-hero-content"><div className="eyebrow"><Sparkles size={13}/> {connected ? 'YOUR SPOTIFY PLAYLIST' : 'NOXI DESIGN PREVIEW'}</div><h1>{title}</h1>{connected && <div className="playlist-mini-stats"><Headphones size={14}/>{playlist?.owner?.display_name && <span>Curated by {playlist.owner.display_name}</span>}{(playlist?.items?.total ?? playlist?.tracks?.total) != null && <span>· {playlist?.items?.total ?? playlist?.tracks?.total} tracks</span>}</div>}<p>{connected ? (playlist?.description?.replace(/<[^>]*>/g, '') || 'Your collection, your soundtrack.') : demo.subtitle}</p><div className="playlist-hero-actions">{connected ? <button className="hero-primary" disabled={!ready} onClick={() => void playPlaylist(playlist?.uri || `spotify:playlist:${id}`)}><Play size={15} fill="currentColor"/> Play playlist</button> : <button className="hero-primary" onClick={() => void login()}><Music2 size={17}/> Connect to listen</button>}{connected && playlist?.external_urls?.spotify && <a className="external-spotify" target="_blank" rel="noreferrer" href={playlist.external_urls.spotify}>Open on Spotify <ArrowUpRight size={16}/></a>}</div></div></div>
    <div className="section-heading"><div><div className="eyebrow">THE SOUNDTRACK</div><h2>Inside this playlist</h2></div></div>
    {error && <div className="playlist-track-notice" role="status"><Info size={21}/><div><strong>Track list unavailable</strong><p>{error} Spotify may restrict tracks from playlists you do not own or collaborate on. You can still try playing this playlist directly.</p></div></div>}
    {loading ? <div className="loading-panel">Loading playlist tracks...</div> : tracks.length ? <div className="library-songs">{tracks.map((song, i) => <TrackRow key={`${song.id}-${i}`} track={song} index={i} disabled={connected && !ready} onPlay={s => s.uri ? void playPlaylistTrack(playlist?.uri || `spotify:playlist:${id}`, s.uri, s.playlistPosition) : void login()}/>)}</div> : <div className="empty-state"><Music2/><h3>No tracks available</h3><p>Spotify may restrict tracks in playlists you don't own. The play button above may still work.</p></div>}
    {connected && songs.length > 0 && <p className="playlist-order-note">Select any song to keep playing in this playlist. Next and Previous follow Spotify's playlist order when Shuffle is off.</p>}
    {!connected && <p className="demo-note">This is a design-preview playlist with fictional tracks. Connect Spotify to play your real music.</p>}
  </main>;
}
