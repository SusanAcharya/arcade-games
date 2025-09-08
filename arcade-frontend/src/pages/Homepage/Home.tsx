import React from 'react'
import './home.scss'
import { PATHS } from '../../path/paths'
import { useNavigate } from 'react-router-dom'
import { IMAGES } from '../../constant/images'
import { AuthProvider, useAuth } from '../../context/AuthContext'
import LoginModal from '../../components/Auth/LoginModal'
import LeaderboardModal from '../../components/Leaderboard/LeaderboardModal'
import SettingsModal from '../../components/Modal/SettingsModal'
import ControlsModal from '../../components/Modal/ControlsModal'
import attacker1Gif from '../../assets/animations/attacker1.gif'
import attacker2Gif from '../../assets/animations/attacker2.gif'
import attacker1Still from '../../assets/animations/attacker1-still.png'
import attacker2Still from '../../assets/animations/attacker2-still.png'

type Props = {}

const HomeContent = (props: Props) => {
    const navigate = useNavigate();
    const { user, logout } = useAuth();
    const [loginOpen, setLoginOpen] = React.useState(false);
    const [settingsOpen, setSettingsOpen] = React.useState(false);
    const [controlsOpen, setControlsOpen] = React.useState(false);
    const [leaderboardOpen, setLeaderboardOpen] = React.useState(false);
    const openLeaderboard = React.useCallback(() => setLeaderboardOpen(true), []);
  return (
    <div className="home-container">
        <nav className="home-left-menu">
          {user && (
            <div className="home-menu-item logged-in-info">Logged in as: <b>{user.username}</b></div>
          )}
          <button className="home-menu-item" onClick={() => navigate(PATHS.LIBRARY)}>Play Now</button>
          <button className="home-menu-item" onClick={openLeaderboard}>Leaderboard</button>
          <button className="home-menu-item" onClick={() => setControlsOpen(true)}>Arcade Guide</button>
          <button className="home-menu-item" onClick={() => setSettingsOpen(true)}>Settings</button>
        </nav>
        <div className="home-container-content"></div>
        <div className="home-auth-fixed">
            <button
              onClick={() => {
                if (user) logout(); else setLoginOpen(true);
              }}
              className='play-now-btn'
            >
              <img src={IMAGES.PLAY_NOW_BTN} alt={user ? 'Logout' : 'Login'} />
              <span>{user ? 'Logout' : 'Login'}</span>
            </button>
        </div>
        <div className='home-social-column'>
            <a href="https://www.youtube.com/@gangstaverse" target="_blank" rel="noopener noreferrer" aria-label="YouTube">
              <img src={IMAGES.SOCIAL.YOUTUBE} alt="YouTube" />
            </a>
            <a href="https://x.com/GangstaVerse" target="_blank" rel="noopener noreferrer" aria-label="Twitter/X">
              <img src={IMAGES.SOCIAL.TWITTER} alt="Twitter/X" />
            </a>
            <a href="https://discord.gg/Kw76QbpPCz" target="_blank" rel="noopener noreferrer" aria-label="Discord">
              <img src={IMAGES.SOCIAL.DISCORD} alt="Discord" />
            </a>
        </div>
        {/* Hover fighters bottom right cluster */}
        <div className="corner-fighter right r2">
          <img className="still" src={attacker1Still} alt="fighter still" />
          <img className="gif" src={attacker1Gif} alt="fighter animated" />
        </div>
        <div className="corner-fighter right r1">
          <img className="still" src={attacker2Still} alt="fighter still" />
          <img className="gif" src={attacker2Gif} alt="fighter animated" />
        </div>
        <LoginModal isOpen={loginOpen} onClose={() => setLoginOpen(false)} />
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <ControlsModal isOpen={controlsOpen} onClose={() => setControlsOpen(false)} />
        <LeaderboardModal isOpen={leaderboardOpen} onClose={() => setLeaderboardOpen(false)} />
    </div>
  )
}

const Home = (props: Props) => (
  <AuthProvider>
    <HomeContent {...props} />
  </AuthProvider>
);

export default Home