import React, { useState } from 'react';
import { IMAGES } from '../../constant/images';
import GameContainer from '../../components/GameContainer/GameContainer';
import { GiHamburgerMenu } from 'react-icons/gi';
import { IoMdRefresh } from 'react-icons/io';
import { 
  FaGamepad, 
  FaCog, 
  FaHome, 
  FaFileAlt, 
  FaScroll, 
  FaBars 
} from 'react-icons/fa';
import { IoClose } from 'react-icons/io5';
import useGameSounds from '../../hooks/useGameSounds';
import Modal from '../../components/Modal/Modal';
import SettingsModal from '../../components/Modal/SettingsModal';
import ControlsModal from '../../components/Modal/ControlsModal';
import './degenSweeper.scss';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type Tile = {
  id: number;
  isBomb: boolean;
  revealed: boolean;
  isUndoBomb?: boolean; // Track if this bomb was revealed due to undo
};

const GRID_SIZE = 4;
const TOTAL_TILES = GRID_SIZE * GRID_SIZE; // 16
const BOMB_COUNT = 4;
const SAFE_COUNT = TOTAL_TILES - BOMB_COUNT; // 12
const BASE_SAFE_VALUE = 50;
const DEGEN_MULTIPLIER = 5;

const icons = {
  unflipped: IMAGES.DEGEN_SWEEPER.FLIPPED,
  bomb: IMAGES.DEGEN_SWEEPER.BOMB,
  safe: IMAGES.DEGEN_SWEEPER.SAFE,
};

const createEmptyBoard = (): Tile[] =>
  Array.from({ length: TOTAL_TILES }, (_, i) => ({
    id: i,
    isBomb: false,
    revealed: false,
  }));

const placeBombs = (): Tile[] => {
  const board = createEmptyBoard();
  const indices = new Set<number>();
  while (indices.size < BOMB_COUNT) {
    indices.add(Math.floor(Math.random() * TOTAL_TILES));
  }
  indices.forEach((i) => (board[i].isBomb = true));
  return board;
};

const DegenSweeper: React.FC = () => {
  const { user } = useAuth();
  const [board, setBoard] = React.useState<Tile[]>(() => placeBombs());
  const [safeReveals, setSafeReveals] = React.useState<number>(0);
  const [undoUsed, setUndoUsed] = React.useState<boolean>(false);
  const [showUndoToast, setShowUndoToast] = React.useState<boolean>(false);
  const [roundOver, setRoundOver] = React.useState<boolean>(false);
  const [wonRound, setWonRound] = React.useState<boolean>(false);
  const [revealBombsOnLose, setRevealBombsOnLose] = React.useState<boolean>(false);
  const [clickedBombId, setClickedBombId] = React.useState<number | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  // Ticket state left in, but ignored
  const [gamesLeft, setGamesLeft] = React.useState<number>(3);

  // Overall points (only awarded upon successful sweep)
  const [points, setPoints] = React.useState<number>(0);

  const banked = safeReveals * BASE_SAFE_VALUE;

  // Sound effects
  const { playTileClick, playTileReveal, playBombReveal } = useGameSounds();

  const openSidebar = React.useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const openSettings = React.useCallback(() => {
    setSidebarOpen(false);
    setSettingsOpen(true);
  }, []);

  const openControls = React.useCallback(() => {
    setSidebarOpen(false);
    setControlsOpen(true);
  }, []);

  const startNewRound = React.useCallback(() => {
    setBoard(placeBombs());
    setSafeReveals(0);
    setUndoUsed(false);
    setShowUndoToast(false);
    setRevealBombsOnLose(false);
    setRoundOver(false);
    setWonRound(false);
    setClickedBombId(null);
  }, []);

  const finishRound = React.useCallback(
    async (didWin: boolean) => {
      setRoundOver(true);
      setWonRound(didWin);
      // tickets disabled (no decrement)

      if (didWin && user) {
        // Award fixed 50 points and refresh from server for header consistency
        try {
          await api.recordWin('degen-sweeper', 50);
          const { data } = await api.myPoints();
          if (data?.total_points != null) setPoints(data.total_points);
        } catch {}
      }
    },
    [banked, user]
  );

  // On mount, sync server points if logged in
  React.useEffect(() => {
    (async () => {
      if (!user) return;
      const { data } = await api.myPoints();
      if (data?.total_points != null) setPoints(data.total_points);
    })();
  }, [user]);

  const handleTileClick = (idx: number) => {
    if (roundOver) return;

    // Play tile click sound
    playTileClick();

    setBoard((prev) => {
      const tile = prev[idx];
      if (tile.revealed) return prev;

      // Bomb logic
      if (tile.isBomb) {
        if (!undoUsed) {
          // Auto-Undo: reveal the bomb but mark it as undo bomb, mark undo used, toast
          setUndoUsed(true);
          setShowUndoToast(true);
          setClickedBombId(idx);
          playBombReveal();
          setTimeout(() => setShowUndoToast(false), 2000);
          
          return prev.map(t => 
            t.id === idx 
              ? { ...t, revealed: true, isUndoBomb: true }
              : t
          );
        } else {
          // No undo left - game over
          setRevealBombsOnLose(true);
          finishRound(false);
          playBombReveal();
          return prev;
        }
      } else {
        // Safe tile - reveal and play sound
        playTileReveal();
        const newBoard = prev.map(t => 
          t.id === idx ? { ...t, revealed: true } : t
        );
        
        // Check if round is won
        const newSafeReveals = newBoard.filter(t => t.revealed && !t.isBomb).length;
        setSafeReveals(newSafeReveals);
        
        if (newSafeReveals === SAFE_COUNT) {
          finishRound(true);
        }
        
        return newBoard;
      }
    });
  };

  const handleNextGame = React.useCallback(() => {
    startNewRound();
  }, [startNewRound]);

  const addTicket = React.useCallback(() => {
    setGamesLeft(3);
  }, []);

  // Reveal all bombs when game is over
  React.useEffect(() => {
    if (roundOver && !wonRound) {
      setBoard((prev) =>
        prev.map((tile) => (tile.isBomb ? { ...tile, revealed: true } : tile))
      );
    }
  }, [roundOver, wonRound]);

  const renderTileContent = (tile: Tile) => {
    if (tile.revealed) {
      if (tile.isBomb) {
        return (
          <img 
            className={`tile-icon ${tile.isUndoBomb ? 'undo-bomb' : ''}`} 
            src={icons.bomb} 
            alt="bomb" 
          />
        );
      }
      return (
        <>
          <img className="tile-icon" src={icons.safe} alt="safe" />
          <span className="tile-safe-text">+50</span>
        </>
      );
    }
    return <img className="tile-icon" src={icons.unflipped} alt="unflipped" />;
  };

  return (
    <div className="degen-sweeper-container">
      <GameContainer 
        arcadeWidth="100%" 
        title="DEGEN SWEEPER" 
        bg={IMAGES.DEGEN_ARCADE_BG}
        headerRight={
          <div style={{ display: "flex", gap: 28 }}>
            <div style={{ color: "#9b9b9b", fontFamily: "Jersey 10", fontSize: 28 }}>Tickets {gamesLeft}</div>
            <div style={{ color: "#9b9b9b", fontFamily: "Jersey 10", fontSize: 28 }}>Points {points}</div>
          </div>
        }
      >
        <div className={`degen-sweeper-wrapper ${sidebarOpen ? "blurred" : ""}`} style={{ position: 'relative' }}>
          <div className="flex items-start justify-between">
            <button 
              onClick={openSidebar}
              className="menu-btn" 
              aria-label="menu"
            >
              <GiHamburgerMenu size={20} />
            </button>

            <div className="ds-banked-display">
              <span>BANKED:</span>
              <strong>{banked}</strong>
            </div>
          </div>

          <div className="ds-board">
            {[0, 1, 2, 3].map((r) => (
              <div key={r} className="ds-row">
                {board.slice(r * GRID_SIZE, r * GRID_SIZE + GRID_SIZE).map((tile) => {
                  const disabled = roundOver;
                  const classes = [
                    'ds-tile',
                    tile.revealed ? 'revealed' : 'hidden',
                    tile.revealed && tile.isBomb ? 'bomb' : '',
                    tile.isUndoBomb ? 'undo-bomb' : '',
                    disabled ? 'disabled' : '',
                  ]
                    .filter(Boolean)
                    .join(' ');

                  return (
                    <button
                      key={tile.id}
                      className={classes}
                      onClick={() => handleTileClick(tile.id)}
                      disabled={disabled || tile.revealed}
                    >
                      {renderTileContent(tile)}
                    </button>
                  );
                })}
              </div>
            ))}
          </div>

          <div className="ds-footer">
            <div className="ds-actions">
              {roundOver ? (
                <>
                  <div className={`ds-result ${wonRound ? 'win' : 'lose'}`}>
                    {wonRound ? (
                      <>
                        <span>SWEEP!</span>
                        <strong>+{banked * DEGEN_MULTIPLIER}</strong>
                      </>
                    ) : (
                      <>
                        <span>BOOM!</span>
                        <strong>+0</strong>
                      </>
                    )}
                  </div>
                  <button className="ds-btn primary" onClick={handleNextGame}>
                    Next Game
                  </button>
                </>
              ) : (
                <div className="ds-undo-display">
                  <div className="ds-undo-button">
                    <img src={IMAGES.BUTTON_FRAME} alt="Button frame" className="undo-frame" />
                    <img src={IMAGES.UNDO_ICON} alt="Undo" className="undo-icon" />
                  </div>
                  <div className="ds-undo-text">
                    <span>UNDO ({undoUsed ? '0' : '1'})</span>
                  </div>
                </div>
              )}

              {gamesLeft <= 0 && (
                <button className="ds-btn ticket" onClick={addTicket}>
                  Add Ticket (+3 Games)
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Sidebar Overlay */}
        {sidebarOpen && (
          <div className="sidebar-overlay" onClick={() => setSidebarOpen(false)}>
            <div className="sidebar" onClick={(e) => e.stopPropagation()}>
              <div className="sidebar-icon" style={{ color: '#8B5CF6' }} data-label="Controls" onClick={openControls}>
                <FaGamepad />
              </div>
              <div className="sidebar-icon" style={{ color: '#F59E0B' }} data-label="Settings" onClick={openSettings}>
                <FaCog />
              </div>
              <div className="sidebar-icon" style={{ color: '#06B6D4' }} data-label="Home">
                <FaHome />
              </div>
              <div className="sidebar-icon" style={{ color: '#06B6D4' }} data-label="Guide">
                <FaFileAlt />
              </div>
              <div className="sidebar-icon" style={{ color: '#EC4899' }} data-label="Rules">
                <FaScroll />
              </div>
              <div className="sidebar-icon" style={{ color: '#9CA3AF' }} data-label="Menu">
                <FaBars />
              </div>
            </div>
            
            {/* Close button outside sidebar */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="sidebar-close-btn"
              aria-label="close menu"
            >
              <IoClose size={20} />
            </button>
          </div>
        )}

        {/* Modals */}
        <SettingsModal isOpen={settingsOpen} onClose={() => setSettingsOpen(false)} />
        <ControlsModal isOpen={controlsOpen} onClose={() => setControlsOpen(false)} />

      </GameContainer>
    </div>
  );
};

export default DegenSweeper;