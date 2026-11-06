import { ArrowRight, Clock3, Play, Sparkles } from 'lucide-react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthProvider';
import { useLibrary } from '../features/spotify/useLibrary';
import { usePlayer } from '../features/player/PlayerProvider';
import { artistsText, firstImage } from '../utils/format';

/** Shows only genuinely available Spotify history; it never invents recommendations. */
export function RecentOrbit() {
  const { status } = useAuth();
  const { recent } = useLibrary();
  const { ready, playTrack } = usePlayer();
  if (status !== 'connected' || recent.length === 0) return null;

  return <section className="recent-orbit">
    <div className="section-heading"><div><div className="eyebrow"><Clock3 size={13}/> YOUR RECENT ROTATIONS</div><h2>Pick up where you <em>left off.</em></h2></div><NavLink className="text-link" to="/library?view=liked">Your collection <ArrowRight size={16}/></NavLink></div>
    <div className="recent-orbit-grid">{recent.slice(0, 5).map((track, index) => (
      <button className="recent-orbit-card" key={`${track.uri}-${index}`} type="button" disabled={!ready} onClick={() => void playTrack(track.uri)} title={`Play ${track.name}`}>
        <span className="recent-orbit-art">{firstImage(track.album.images) ? <img src={firstImage(track.album.images)} alt="" loading="lazy"/> : <span className="recent-orbit-placeholder"><Sparkles size={30}/></span>}<span className="recent-orbit-play"><Play size={17} fill="currentColor"/></span></span>
        <strong>{track.name}</strong><small>{artistsText(track.artists)}</small>
      </button>
    ))}</div>
  </section>;
}
