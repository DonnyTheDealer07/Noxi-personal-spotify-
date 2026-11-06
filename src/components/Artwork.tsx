import { Music2 } from 'lucide-react';
export function Artwork({ src, alt, className = '', spotify = false }: { src?: string; alt: string; className?: string; spotify?: boolean }) {
  return <div className={`artwork ${spotify ? 'spotify-art' : ''} ${className}`}>{src ? <img src={src} alt={alt} loading="lazy" /> : <div className="artwork-fallback"><Music2 size={30}/></div>}</div>;
}
