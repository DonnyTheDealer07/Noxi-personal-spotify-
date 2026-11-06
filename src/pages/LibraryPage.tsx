import { useMemo, useState } from 'react';
import { ArrowDownAZ, Heart, Library, Music2, Search, Sparkles } from 'lucide-react';
import { useSearchParams } from 'react-router-dom';
import { demoAlbums, demoSongs } from '../data/demo';
import { useAuth } from '../features/auth/AuthProvider';
import { useLibrary } from '../features/spotify/useLibrary';
import { usePlayer } from '../features/player/PlayerProvider';
import { PlaylistCard } from '../components/PlaylistCard';
import { TrackRow, type DisplayTrack } from '../components/TrackRow';
import { firstImage, artistsText } from '../utils/format';

type Sort = 'default' | 'name' | 'artist';

export function LibraryPage() {
  const [params, setParams] = useSearchParams();
  const [filter, setFilter] = useState('');
  const [sort, setSort] = useState<Sort>('default');
  const view = params.get('view') === 'liked' ? 'liked' : 'playlists';
  const { status, login } = useAuth();
  const { playlists, liked, loading, error } = useLibrary();
  const { ready, playSavedTrack } = usePlayer();
  const connected = status === 'connected';
  const songs: DisplayTrack[] = useMemo(() => connected
    ? liked.filter(Boolean).map(t => ({ id: t.id, name: t.name, artist: artistsText(t.artists), album: t.album.name, cover: firstImage(t.album.images), duration: t.duration_ms, uri: t.uri, spotifyUrl: t.external_urls?.spotify, spotify: true }))
    : demoSongs.map(t => ({ id: t.id, name: t.name, artist: t.artist, album: t.album, cover: t.cover, duration: t.duration })), [connected, liked]);
  const cards = useMemo(() => connected
    ? playlists.filter(Boolean).map(p => ({ id: p.id, title: p.name, description: p.owner?.display_name ? `By ${p.owner.display_name}` : 'Your Spotify playlist', cover: firstImage(p.images), href: `/playlist/${p.id}`, spotify: true }))
    : demoAlbums.map(a => ({ id: a.id, title: a.title, description: a.subtitle, cover: a.cover, href: `/playlist/demo-${a.id}`, spotify: false })), [connected, playlists]);
  const visibleCards = useMemo(() => cards.filter(card => `${card.title} ${card.description}`.toLowerCase().includes(filter.toLowerCase())).sort((a,b) => sort === 'name' ? a.title.localeCompare(b.title) : 0), [cards, filter, sort]);
  const visibleSongs = useMemo(() => songs.filter(song => `${song.name} ${song.artist} ${song.album}`.toLowerCase().includes(filter.toLowerCase())).sort((a,b) => sort === 'name' ? a.name.localeCompare(b.name) : sort === 'artist' ? a.artist.localeCompare(b.artist) : 0), [songs, filter, sort]);
  return <main className="page standard-page library-page">
    <div className="page-heading"><div className="eyebrow"><Sparkles size={13}/> YOUR PERSONAL UNIVERSE</div><h1>Everything you <em>love.</em></h1><p>Your favorites, easy to find and always close.</p></div>
    <div className="library-toolbar"><div className="view-tabs"><button type="button" className={view === 'playlists' ? 'selected' : ''} onClick={() => { setFilter(''); setSort('default'); setParams({ view: 'playlists' }); }}><Library size={16}/> Playlists <small>{cards.length}</small></button><button type="button" className={view === 'liked' ? 'selected' : ''} onClick={() => { setFilter(''); setSort('default'); setParams({ view: 'liked' }); }}><Heart size={16}/> Liked songs <small>{songs.length}</small></button></div>
      <div className="library-tools"><label className="library-filter"><Search size={17}/><input value={filter} onChange={e => setFilter(e.target.value)} placeholder={`Filter ${view === 'liked' ? 'songs' : 'playlists'}...`} aria-label={`Filter ${view === 'liked' ? 'songs' : 'playlists'}`}/></label><label className="library-sort"><ArrowDownAZ size={17}/><select aria-label="Sort library" value={sort} onChange={e => setSort(e.target.value as Sort)}><option value="default">Your order</option><option value="name">Name A–Z</option>{view === 'liked' && <option value="artist">Artist A–Z</option>}</select></label></div>
    </div>
    {error && <p className="inline-alert">{error}</p>}
    {loading ? <div className="loading-panel">Gathering your music...</div> : view === 'playlists'
      ? <div className="album-grid library-grid">{visibleCards.length ? visibleCards.map((card, i) => <PlaylistCard key={card.id} {...card} index={i}/>) : <div className="empty-state"><Music2/><h3>{filter ? 'No matching playlists' : 'Your collection is waiting.'}</h3><p>{filter ? 'Try another search.' : 'Save a playlist in Spotify to see it here.'}</p></div>}</div>
      : <div className="library-songs"><div className="track-heading"><span>#</span><span>TITLE</span><span>ALBUM</span><span>TIME</span></div>{visibleSongs.length ? visibleSongs.map((song, i) => <TrackRow key={`${song.id}-${i}`} track={song} index={i} onPlay={s => s.uri ? void playSavedTrack(s.uri, visibleSongs.map(song => song.uri).filter((uri): uri is string => Boolean(uri))) : void login()} disabled={connected && !ready}/>) : <div className="empty-state"><Heart/><h3>{filter ? 'No songs match your search' : 'No liked songs just yet.'}</h3><p>{filter ? 'Try changing the filter.' : 'Like songs in Spotify and they will appear here.'}</p></div>}</div>}
    {!connected && <p className="demo-note">This library uses fictional preview content. Connect Spotify to browse your real playlists and saved songs.</p>}
  </main>;
}
