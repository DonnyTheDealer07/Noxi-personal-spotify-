import { ArrowUpRight, Headphones, Music2, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { Artwork } from './Artwork';
import { usePlayer } from '../features/player/PlayerProvider';
import { useAuth } from '../features/auth/AuthProvider';
import { firstImage, artistsText } from '../utils/format';
export function MoodPanel() {
  const { snapshot } = usePlayer(); const { status } = useAuth();
  const cover = snapshot?.track ? firstImage(snapshot.track.album.images) : '/covers/orbit.svg';
  return <aside className="mood-panel">
    <div className="mood-heading"><span><Sparkles size={17}/> YOUR ATMOSPHERE</span><span className="mood-halo">✳</span></div>
    <div className="mood-visual"><div className="mood-orbit orbit-one"/><div className="mood-orbit orbit-two"/><Artwork src={cover} alt={snapshot?.track?.album.name || "Noxi Pink Orbit cover"} spotify={Boolean(snapshot?.track)}/><div className="mood-floating-star">✦</div></div>
    <div className="mood-now-label"><span className="tiny-pulse"/> {snapshot?.track ? 'NOW PLAYING' : 'UP NEXT IN YOUR UNIVERSE'}</div>
    <h3>{snapshot?.track?.name || 'Good things are coming.'}</h3><p>{snapshot?.track ? artistsText(snapshot.track.artists) : 'Find your next favorite sound and make this space yours.'}</p>
    <div className="mood-hr"/>
    <div className="mood-quote"><span>✳</span><p>Music sounds better when the whole world feels like yours.</p></div>
    {status === 'connected' && snapshot?.track ? <a className="mood-discover" href={`https://open.spotify.com/track/${snapshot.track.id}`} target="_blank" rel="noreferrer">View on Spotify <ArrowUpRight size={16}/></a> : <NavLink className="mood-discover" to="/search">Go discover <ArrowUpRight size={16}/></NavLink>}
    <div className="mood-footer"><Headphones size={17}/><span>Headphones recommended</span><Music2 size={15}/></div>
  </aside>;
}
