import React, { useState } from 'react';
import { FaCopy } from 'react-icons/fa';
import { IMAGES } from '../../constant/images';
import Modal from './Modal';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SettingsModal: React.FC<SettingsModalProps> = ({ isOpen, onClose }) => {
  const [lobbyMusicVolume, setLobbyMusicVolume] = useState(75);
  const [sfxEnabled, setSfxEnabled] = useState(true);
  const [walletAddress] = useState('0xffdg....98005');

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setLobbyMusicVolume(parseInt(e.target.value));
  };

  const handleCopyWallet = () => {
    navigator.clipboard.writeText(walletAddress);
    // You could add a toast notification here
  };

  const toggleSfx = () => {
    setSfxEnabled(!sfxEnabled);
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Settings">
      <div className="settings-content">
        {/* Wallet Address */}
        <div className="settings-item">
          <span className="settings-label">Wallet Address</span>
          <div style={{ display: 'flex', alignItems: 'center' }}>
            <span className="settings-value">{walletAddress}</span>
            <FaCopy className="copy-icon" onClick={handleCopyWallet} />
          </div>
        </div>

        {/* Lobby Music */}
        <div className="settings-item">
          <span className="settings-label">Lobby Music</span>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <div className="volume-slider">
              <img src={IMAGES.AUDIO_BAR} alt="Audio bar" className="audio-bar-bg" />
              <div 
                className="volume-fill" 
                style={{ width: `${lobbyMusicVolume}%` }}
              />
              <img 
                src={IMAGES.AUDIO_CONTROLLER} 
                alt="Audio controller" 
                className="audio-controller"
                style={{ left: `${lobbyMusicVolume}%` }}
              />
              <input
                type="range"
                min="0"
                max="100"
                value={lobbyMusicVolume}
                onChange={handleVolumeChange}
                className="volume-input"
              />
            </div>
            <span className="volume-percentage">{lobbyMusicVolume}%</span>
          </div>
        </div>

        {/* SFX */}
        <div className="settings-item">
          <span className="settings-label">Sfx</span>
          <div className="toggle-buttons">
            <div className="toggle-btn-container">
              <img
                src={IMAGES.ON_BUTTON}
                alt="ON"
                className={`toggle-btn-img ${sfxEnabled ? 'active' : 'inactive'}`}
                onClick={toggleSfx}
              />
            </div>
            <div className="toggle-btn-container">
              <img
                src={IMAGES.OFF_BUTTON}
                alt="OFF"
                className={`toggle-btn-img ${!sfxEnabled ? 'active' : 'inactive'}`}
                onClick={toggleSfx}
              />
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default SettingsModal;
