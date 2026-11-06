import { useEffect, useRef } from 'react';
import { ArrowRight, Disc3, Heart, Music2, Play, Plus, Sparkles, Stars } from 'lucide-react';
import { NavLink, useNavigate } from 'react-router-dom';
import gsap from 'gsap';
import { demoAlbums, demoSongs } from '../data/demo';
import { useAuth } from '../features/auth/AuthProvider';
import { useLibrary } from '../features/spotify/useLibrary';
import { usePlayer } from '../features/player/PlayerProvider';
import { PlaylistCard } from '../components/PlaylistCard';
import { RecentOrbit } from '../components/RecentOrbit';
import { TrackRow, type DisplayTrack } from '../components/TrackRow';
import { artistsText, firstImage } from '../utils/format';

export function HomePage() {
  const heroRef = useRef<HTMLDivElement>(null);
  const { status, profile, login } = useAuth();
  const { playlists, liked, error: libraryError, loading } = useLibrary();
  const { ready, playTrack } = usePlayer();
  const navigate = useNavigate();
  const connected = status === 'connected';
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches || document.documentElement.dataset.reducedMotion === 'true') return;
    const ctx = gsap.context(() => { gsap.fromTo('.hero-reveal', { y: 20, opacity: 0 }, { y: 0, opacity: 1, duration: 0.85, stagger: 0.11, ease: 'power3.out' }); }, heroRef);
    return () => ctx.revert();
  }, []);
  const cards = connected ? playlists.slice(0, 6).map((p) => ({ id: p.id, title: p.name, description: p.owner?.display_name ? `By ${p.owner.display_name}` : 'Your Spotify playlist', cover: firstImage(p.images), href: `/playlist/${p.id}`, spotify: true })) : demoAlbums.map((a) => ({ id: a.id, title: a.title, description: a.subtitle, cover: a.cover, href: `/playlist/demo-${a.id}`, spotify: false }));
  const songs: DisplayTrack[] = connected ? liked.slice(0, 5).map((t) => ({ id: t.id, name: t.name, artist: artistsText(t.artists), album: t.album.name, cover: firstImage(t.album.images), duration: t.duration_ms, uri: t.uri, spotifyUrl: t.external_urls?.spotify, spotify: true })) : demoSongs.map((t) => ({ id: t.id, name: t.name, artist: t.artist, album: t.album, cover: t.cover, duration: t.duration }));
  const play = (song: DisplayTrack) => { if (song.uri) void playTrack(song.uri); else void login(); };
  return <div className="page home-page">
    <div className="welcome-line"><span className="welcome-sparkle">✳</span> HEY {connected ? (profile?.display_name?.split(' ')[0] || 'THERE').toUpperCase() : 'STARLIGHT'} <span className="welcome-wave">✦</span></div>
    <section className="hero" ref={heroRef}>
      <div className="hero-snow snow-1"/><div className="hero-snow snow-2"/><div className="hero-snow snow-3"/>
      <div className="hero-content"><div className="hero-kicker hero-reveal"><span className="sparkle-mini"><Stars size={13}/></span> A LITTLE MAGIC FOR YOUR EARS</div>
        <h1 className="hero-reveal">Your music.<br/><em>Your universe.</em></h1>
        <p className="hero-reveal">Your favorite sounds, wrapped in something a little more beautiful. Welcome to your own orbit.</p>
        <div className="hero-actions hero-reveal">{connected ? <button className="hero-primary" onClick={() => navigate('/library')}><Heart size={17} fill="currentColor"/> Explore your library <ArrowRight size={16}/></button> : <button className="hero-primary" onClick={() => void login()}><Play size={16} fill="currentColor"/> Connect your Spotify <ArrowRight size={16}/></button>}<NavLink className="hero-secondary" to="/search">Go exploring <ArrowRight size={17}/></NavLink></div>
      </div>
      <div className="hero-cosmos" aria-hidden="true"><div className="hero-halo halo-a"/><div className="hero-halo halo-b"/><div className="hero-vinyl"><img src="/covers/orbit.svg" alt=""/><span className="vinyl-center"/></div><div className="hero-ring ring-one"/><div className="hero-ring ring-two"/><span className="hero-star star-a">✦</span><span className="hero-star star-b">✧</span><span className="hero-star star-c">✳</span><div className="hero-tag"><Disc3 size={14}/> MUSIC, REIMAGINED</div></div>
    </section>
    <RecentOrbit/>
    <div className="section-heading"><div><div className="eyebrow"><Sparkles size={13}/> CURATED FOR YOUR ORBIT</div><h2>{connected ? 'Your playlists' : 'A little taste of NOXI'}<span className="heading-star">✳</span></h2></div><NavLink to="/library" className="text-link">View all <ArrowRight size={17}/></NavLink></div>
    {libraryError && <p className="inline-alert">Some Spotify library data could not load: {libraryError}</p>}
    {connected && loading ? <div className="loading-panel">Gathering your music from Spotify...</div> : <div className="album-grid">{cards.length ? cards.map((album, i) => <PlaylistCard key={album.id} {...album} index={i}/>) : <div className="empty-inline">No playlists yet. Create one in Spotify and it will show up here.</div>}</div>}
    <div className="home-bottom-grid"><section className="song-section"><div className="section-heading"><div><div className="eyebrow"><Music2 size={13}/> SOUNDS THAT STAY</div><h2>{connected ? 'Your liked songs' : 'Songs for your day'}</h2></div><NavLink to="/library?view=liked" className="text-link">See more <ArrowRight size={17}/></NavLink></div><div className="track-list">{songs.length ? songs.map((song, i) => <TrackRow key={song.id} index={i} track={song} onPlay={play} disabled={connected && !ready}/>) : <div className="empty-inline">Your liked tracks will show up here.</div>}</div></section>
    <section className="bottom-feature"><div className="feature-glare"/><span className="feature-icon"><Plus size={20}/></span><span className="feature-kicker">THE NOXI EXPERIENCE</span><h3>A softer way to<br/><em>turn it up.</em></h3><p>Music first, everything else fades away. Make space for your soundtrack.</p><NavLink to="/settings">Make it yours <ArrowRight size={17}/></NavLink></section></div>
    {!connected && <p className="demo-note"><Sparkles size={14}/> You’re exploring a design preview. The tracks and playlists shown here are fictional. Connect Spotify Premium to see your actual library and play music.</p>}
  </div>;
}
