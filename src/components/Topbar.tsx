import { ArrowLeft, ArrowRight, Search, Sparkles, UserRound } from 'lucide-react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useState } from 'react';
import { useAuth } from '../features/auth/AuthProvider';

export function Topbar() {
  const navigate = useNavigate();
  const location = useLocation();
  const { profile, status, login } = useAuth();
  const [query, setQuery] = useState('');
  const title = location.pathname === '/' ? 'Your little corner of the galaxy' : location.pathname.startsWith('/search') ? 'Explore the universe' : location.pathname.includes('settings') ? 'Your space, your rules' : 'All of your favorites';
  return (
    <header className="topbar">
      <div className="top-left">
        <div className="history-controls">
          <button type="button" title="Go back" aria-label="Go back" onClick={() => navigate(-1)}><ArrowLeft size={17}/></button>
          <button type="button" title="Go forward" aria-label="Go forward" onClick={() => navigate(1)}><ArrowRight size={17}/></button>
        </div>
        <span className="top-context"><Sparkles size={15}/> {title}</span>
      </div>
      <div className="top-actions">
        <form className="top-search" onSubmit={event => { event.preventDefault(); navigate(`/search?q=${encodeURIComponent(query.trim())}`); }}>
          <Search size={18}/>
          <input aria-label="Search music" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search for something lovely..."/>
          <kbd>↵</kbd>
        </form>
        {status === 'connected'
          ? <button className="top-profile" type="button" title="Account settings" onClick={() => navigate('/settings')}>
              {profile?.images?.[0] ? <img src={profile.images[0].url} alt="Your Spotify profile"/> : <UserRound size={19}/>}
              <span>{profile?.display_name || 'My account'}</span>
            </button>
          : <button className="connect-btn top-connect" type="button" onClick={() => void login()}><span>Connect Spotify</span><ArrowRight size={16}/></button>}
      </div>
    </header>
  );
}
