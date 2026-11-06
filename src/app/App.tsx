import { useEffect } from 'react';
import { AlertCircle, X } from 'lucide-react';
import { Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import { PreferencesProvider } from '../features/preferences/PreferencesProvider';
import { Sidebar } from '../components/Sidebar';
import { Topbar } from '../components/Topbar';
import { PlayerBar } from '../components/PlayerBar';
import { MoodPanel } from '../components/MoodPanel';
import { AuthProvider, useAuth } from '../features/auth/AuthProvider';
import { LibraryProvider } from '../features/spotify/useLibrary';
import { PlayerProvider, usePlayer } from '../features/player/PlayerProvider';
import { HomePage } from '../pages/HomePage';
import { LibraryPage } from '../pages/LibraryPage';
import { SearchPage } from '../pages/SearchPage';
import { PlaylistPage } from '../pages/PlaylistPage';
import { SettingsPage } from '../pages/SettingsPage';

function CallbackPage() {
  const navigate = useNavigate(); const { status } = useAuth();
  useEffect(() => { if (status !== 'loading') navigate('/', { replace: true }); }, [navigate, status]);
  return <div className="loading-panel">Connecting to your Spotify universe...</div>;
}
function ErrorNotice() {
  const auth = useAuth(); const player = usePlayer();
  const message = auth.error || player.error;
  if (!message) return null;
  return <div className="global-error" role="alert"><AlertCircle size={19}/><span>{message}</span><button title="Dismiss" onClick={() => { auth.clearError(); player.clearError(); }}><X size={18}/></button></div>;
}
function Shell() {
  return <div className="app-shell"><Sidebar/><div className="main-layout"><Topbar/><div className="content-area"><div className="scroll-page"><Routes>
    <Route path="/" element={<HomePage/>}/><Route path="/search" element={<SearchPage/>}/><Route path="/library" element={<LibraryPage/>}/><Route path="/playlist/:id" element={<PlaylistPage/>}/><Route path="/settings" element={<SettingsPage/>}/><Route path="/callback" element={<CallbackPage/>}/><Route path="*" element={<Navigate to="/" replace/>}/>
  </Routes></div><MoodPanel/></div><PlayerBar/></div><ErrorNotice/></div>;
}
export function App() { return <PreferencesProvider><AuthProvider><LibraryProvider><PlayerProvider><Shell/></PlayerProvider></LibraryProvider></AuthProvider></PreferencesProvider>; }
