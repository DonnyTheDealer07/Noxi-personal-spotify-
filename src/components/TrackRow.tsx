import { Play, ExternalLink } from 'lucide-react';
import { Artwork } from './Artwork';
import { formatTime } from '../utils/format';
export interface DisplayTrack { id: string; name: string; artist: string; album: string; cover?: string; duration: number; uri?: string; spotifyUrl?: string; spotify?: boolean; playlistPosition?: number }
export function TrackRow({ track, index, onPlay, disabled = false }: { track: DisplayTrack; index: number; onPlay: (track: DisplayTrack) => void; disabled?: boolean }) {
  return <div className="track-row">
    <span className="track-index">{String(index + 1).padStart(2, '0')}</span>
    <Artwork src={track.cover} alt={track.album} spotify={track.spotify}/>
    <div className="track-title"><strong>{track.name}</strong><span>{track.artist}</span></div>
    <span className="track-album">{track.album}</span>
    <span className="track-duration">{formatTime(track.duration)}</span>
    {track.spotifyUrl && <a className="track-external" href={track.spotifyUrl} target="_blank" rel="noreferrer" title="Open song on Spotify" aria-label={`Open ${track.name} on Spotify`}><ExternalLink size={15}/></a>}
    <button className="track-play" disabled={disabled} onClick={() => onPlay(track)} title={disabled ? 'Connect Spotify to play' : `Play ${track.name}`}><Play size={17} fill="currentColor"/></button>
  </div>;
}
