import { Album, ArrowUpRight, Compass, Heart, Home, Library, ListMusic, Settings2, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { useLibrary } from '../features/spotify/useLibrary';
import { Logo } from './Logo';
import { demoAlbums } from '../data/demo';
import { Artwork } from './Artwork';
import { firstImage } from '../utils/format';

const primary = [{ to: '/', title: 'Home', Icon: Home }, { to: '/search', title: 'Discover', Icon: Compass }, { to: '/library', title: 'Your library', Icon: Library }];
export function Sidebar() {
  const { status } = useAuth();
  const { playlists } = useLibrary();
  return <aside className="sidebar">
    <NavLink to="/" className="sidebar-logo"><Logo/></NavLink>
    <div className="side-group-caption">YOUR SPACE</div>
    <nav className="side-primary" aria-label="Main navigation">{primary.map(({ to, title, Icon }) => <NavLink end={to === '/'} key={to} to={to} className={({ isActive }) => `side-link ${isActive ? 'active' : ''}`}><Icon size={19} strokeWidth={1.9}/><span>{title}</span>{title === 'Discover' && <span className="side-spark"><Sparkles size={12}/></span>}</NavLink>)}</nav>
    <div className="side-divider"/>
    <div className="side-section-head"><span>YOUR COLLECTION</span><ListMusic size={16}/></div>
    <NavLink className="collection-link" to="/library?view=liked"><span className="liked-icon"><Heart size={16} fill="white" color="white"/></span><span>Liked songs</span></NavLink>
    <div className="side-playlists">
      {status === 'connected' ? playlists.slice(0, 5).map((playlist) => <NavLink key={playlist.id} className="side-mini-card" title={playlist.name} to={`/playlist/${playlist.id}`}><Artwork src={firstImage(playlist.images)} alt={playlist.name} spotify/><span>{playlist.name}</span></NavLink>) : demoAlbums.slice(0, 4).map((album) => <NavLink key={album.id} className="side-mini-card" title={album.title} to={`/playlist/demo-${album.id}`}><Artwork src={album.cover} alt={album.title}/><span>{album.title}</span></NavLink>)}
    </div>
    <div className="sidebar-bottom">
      <div className="sidebar-upgrade"><span className="upgrade-star"><Sparkles size={17}/></span><strong>Made for your ears.</strong><p>All your favorite sounds in a space that feels like you.</p><NavLink to="/settings">Make it yours <ArrowUpRight size={14}/></NavLink></div>
      <NavLink to="/settings" className="sidebar-settings"><Settings2 size={18}/><span>Settings</span></NavLink>
      <div className="sidebar-footer"><Album size={13}/><span>Independent player · Powered by Spotify</span></div>
    </div>
  </aside>;
}
