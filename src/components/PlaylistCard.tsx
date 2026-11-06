import { ArrowUpRight, Play } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Artwork } from './Artwork';

export function PlaylistCard({ title, description, cover, href, spotify = false, index = 0 }: { title: string; description: string; cover?: string; href: string; spotify?: boolean; index?: number }) {
  const navigate = useNavigate();
  return <article className="playlist-card" style={{ animationDelay: `${index * 70}ms` }}>
    <button className="playlist-card-link" onClick={() => navigate(href)} aria-label={`Open ${title}`}><Artwork src={cover} alt={title} spotify={spotify}/><span className="card-play-indicator"><Play size={18} fill="currentColor"/></span></button>
    <div className="playlist-card-bottom"><div><h3>{title}</h3><p>{description}</p></div><button className="card-arrow" onClick={() => navigate(href)} title={`Open ${title}`}><ArrowUpRight size={18}/></button></div>
  </article>;
}
