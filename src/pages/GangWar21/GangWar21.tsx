import React, { useState, useCallback } from 'react';
import { IMAGES } from '../../constant/images';
import GameContainer from '../../components/GameContainer/GameContainer';
import { GiHamburgerMenu } from 'react-icons/gi';
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
import './gangWar21.scss';

type Card = {
  id: number;
  suit: 'hearts' | 'diamonds' | 'clubs' | 'spades';
  value: number;
  face: string;
  isHidden: boolean;
};

type GameState = 'playing' | 'player-turn' | 'dealer-turn' | 'game-over';

const GangWar21: React.FC = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);
  const [gameState, setGameState] = useState<GameState>('playing');
  const [playerHand, setPlayerHand] = useState<Card[]>([]);
  const [dealerHand, setDealerHand] = useState<Card[]>([]);
  const [deck, setDeck] = useState<Card[]>([]);
  const [playerScore, setPlayerScore] = useState(0);
  const [dealerScore, setDealerScore] = useState(0);
  const [gameResult, setGameResult] = useState<string>('');
  const [playerPoints, setPlayerPoints] = useState(100);
  const [botPoints, setBotPoints] = useState(100);

  // Animation states
  const [dealing, setDealing] = useState(false);
  const [playerHitAnim, setPlayerHitAnim] = useState(false);
  const [dealerHitAnim, setDealerHitAnim] = useState(false);
  const [gameResultAnim, setGameResultAnim] = useState(false);
  const [shake, setShake] = useState(false);
  const [cardGlow, setCardGlow] = useState(false);
  const [scoreFlash, setScoreFlash] = useState(false);

  // Sound effects
  const { playTileClick, playTileReveal, playBombReveal, playDiceRoll, playDamageDone, playVictory, playDefeat } = useGameSounds();

  const openSidebar = useCallback(() => {
    setSidebarOpen(true);
  }, []);

  const openSettings = useCallback(() => {
    setSidebarOpen(false);
    setSettingsOpen(true);
  }, []);

  const openControls = useCallback(() => {
    setSidebarOpen(false);
    setControlsOpen(true);
  }, []);

  // Initialize deck
  const initializeDeck = useCallback(() => {
    const suits: Card['suit'][] = ['hearts', 'diamonds', 'clubs', 'spades'];
    const faces = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];
    const values = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10, 11, 12, 13];
    
    const newDeck: Card[] = [];
    suits.forEach(suit => {
      faces.forEach((face, index) => {
        newDeck.push({
          id: Math.random(),
          suit,
          value: values[index],
          face,
          isHidden: false
        });
      });
    });
    
    // Shuffle deck
    for (let i = newDeck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newDeck[i], newDeck[j]] = [newDeck[j], newDeck[i]];
    }
    
    setDeck(newDeck);
  }, []);

  // Calculate hand value
  const calculateHandValue = useCallback((hand: Card[]) => {
    let value = 0;
    
    hand.forEach(card => {
      if (card.face === 'A') {
        value += 1; // A = 1
      } else if (card.face === 'K') {
        value += 13; // K = 13
      } else if (card.face === 'Q') {
        value += 12; // Q = 12
      } else if (card.face === 'J') {
        value += 11; // J = 11
      } else {
        value += card.value; // 2-10 = face value
      }
    });
    
    return value;
  }, []);

  // Get card image based on suit and face
  const getCardImage = useCallback((suit: string, face: string) => {
    const suitKey = suit.toUpperCase() as keyof typeof IMAGES.CARDS;
    let faceKey: string;
    
    switch (face) {
      case 'A': faceKey = 'ACE'; break;
      case 'K': faceKey = 'KING'; break;
      case 'Q': faceKey = 'QUEEN'; break;
      case 'J': faceKey = 'JACK'; break;
      case '10': faceKey = 'TEN'; break;
      case '9': faceKey = 'NINE'; break;
      case '8': faceKey = 'EIGHT'; break;
      case '7': faceKey = 'SEVEN'; break;
      case '6': faceKey = 'SIX'; break;
      case '5': faceKey = 'FIVE'; break;
      case '4': faceKey = 'FOUR'; break;
      case '3': faceKey = 'THREE'; break;
      case '2': faceKey = 'TWO'; break;
      default: faceKey = 'ACE';
    }
    
    return IMAGES.CARDS[suitKey][faceKey as keyof typeof IMAGES.CARDS[typeof suitKey]];
  }, []);

  // Deal initial cards
  const dealInitialCards = useCallback(() => {
    if (deck.length < 2) return;
    
    setDealing(true);
    setCardGlow(true);
    playTileClick(); // Deal sound
    
    setTimeout(() => {
      const newPlayerHand = [deck[0]];
      const newDealerHand = [
        { ...deck[1], isHidden: false }
      ];
      
      setPlayerHand(newPlayerHand);
      setDealerHand(newDealerHand);
      setDeck(deck.slice(2));
      
      const playerValue = calculateHandValue(newPlayerHand);
      const dealerValue = calculateHandValue(newDealerHand);
      
      setPlayerScore(playerValue);
      setDealerScore(dealerValue);
      setGameState('player-turn');
      setDealing(false);
      setCardGlow(false);
      
      // Success sound for game start
      setTimeout(() => {
        playVictory();
      }, 200);
    }, 600);
  }, [deck, calculateHandValue, playTileClick, playVictory]);

  // Player hits
  const playerHit = useCallback(() => {
    if (gameState !== 'player-turn' || deck.length === 0) return;
    
    setPlayerHitAnim(true);
    setCardGlow(true);
    playTileReveal(); // Card reveal sound
    
    setTimeout(() => {
      const newCard = deck[0];
      const newPlayerHand = [...playerHand, newCard];
      const newValue = calculateHandValue(newPlayerHand);
      
      setPlayerHand(newPlayerHand);
      setPlayerScore(newValue);
      setDeck(deck.slice(1));
      setPlayerHitAnim(false);
      setCardGlow(false);
      
      if (newValue > 21) {
        // Player busts - dramatic effect
        setShake(true);
        setScoreFlash(true);
        playDefeat();
        
        setTimeout(() => {
          setShake(false);
          setScoreFlash(false);
        }, 600);
        
        setGameState('game-over');
        setGameResult('BUST! Dealer wins');
        setBotPoints(prev => prev + 25);
      }
    }, 300);
  }, [gameState, deck, playerHand, calculateHandValue, playTileReveal, playDefeat]);

  // Resolve game
  const resolveGame = useCallback((finalDealerValue: number) => {
    setGameResultAnim(true);
    setScoreFlash(true);
    
    setTimeout(() => {
      if (playerScore > finalDealerValue) {
        playVictory();
        setGameResult('YOU WIN!');
        setPlayerPoints(prev => prev + 25);
      } else if (finalDealerValue > playerScore) {
        playDefeat();
        setGameResult('DEALER WINS');
        setBotPoints(prev => prev + 25);
      } else {
        playTileClick();
        setGameResult('TIE! No points awarded');
      }
      
      setGameState('game-over');
      setScoreFlash(false);
      
      setTimeout(() => {
        setGameResultAnim(false);
      }, 2500);
    }, 300);
  }, [playerScore, playVictory, playDefeat, playTileClick]);

  // Dealer plays
  const dealerPlay = useCallback((currentDealerHand: Card[], currentDealerValue: number) => {
    if (currentDealerValue >= 17) {
      // Dealer stands
      resolveGame(currentDealerValue);
      return;
    }
    
    // Dealer hits
    if (deck.length === 0) return;
    
    setDealerHitAnim(true);
    setCardGlow(true);
    playTileReveal(); // Dealer card reveal sound
    
    setTimeout(() => {
      const newCard = deck[0];
      const newDealerHand = [...currentDealerHand, newCard];
      const newValue = calculateHandValue(newDealerHand);
      
      setDealerHand(newDealerHand);
      setDealerScore(newValue);
      setDeck(deck.slice(1));
      setDealerHitAnim(false);
      setCardGlow(false);
      
      if (newValue > 21) {
        // Dealer busts - dramatic effect
        setShake(true);
        setScoreFlash(true);
        playVictory();
        
        setTimeout(() => {
          setShake(false);
          setScoreFlash(false);
        }, 600);
        
        setGameState('game-over');
        setGameResult('Dealer BUSTS! You win');
        setPlayerPoints(prev => prev + 25);
      } else if (newValue >= 17) {
        // Dealer stands
        resolveGame(newValue);
      } else {
        // Dealer hits again
        setTimeout(() => {
          dealerPlay(newDealerHand, newValue);
        }, 1000);
      }
    }, 300);
  }, [deck, calculateHandValue, resolveGame, playTileReveal, playVictory]);

  // Player stands
  const playerStand = useCallback(() => {
    if (gameState !== 'player-turn') return;
    
    setGameState('dealer-turn');
    
    // Reveal dealer's hidden card (if any)
    const revealedDealerHand = dealerHand.map(card => ({ ...card, isHidden: false }));
    setDealerHand(revealedDealerHand);
    
    const dealerValue = calculateHandValue(revealedDealerHand);
    setDealerScore(dealerValue);
    
    // Dealer plays
    setTimeout(() => {
      dealerPlay(revealedDealerHand, dealerValue);
    }, 1000);
  }, [gameState, dealerHand, calculateHandValue, dealerPlay]);

  // Start new game
  const startNewGame = useCallback(() => {
    setPlayerHand([]);
    setDealerHand([]);
    setPlayerScore(0);
    setDealerScore(0);
    setGameResult('');
    setGameState('playing');
    initializeDeck();
  }, [initializeDeck]);

  // Initialize game
  React.useEffect(() => {
    initializeDeck();
  }, [initializeDeck]);

  // Auto-deal when ready
  React.useEffect(() => {
    if (gameState === 'playing' && deck.length >= 2) {
      dealInitialCards();
    }
  }, [gameState, deck.length, dealInitialCards]);

  return (
    <div className="gang-war-21-container">
      <GameContainer
        title="GANG WAR 21"
        bg={IMAGES.GW21_BG}
        arcadeWidth="100%"
        headerRight={
          <div style={{ display: "flex", gap: 28 }}>
            <div style={{ color: "#9b9b9b", fontFamily: "Jersey 10", fontSize: 28 }}>Tickets {3}</div>
            <div style={{ color: "#9b9b9b", fontFamily: "Jersey 10", fontSize: 28 }}>Points {playerPoints}</div>
          </div>
        }
      >
        <div className={`gang-war-21-wrapper ${sidebarOpen ? "blurred" : ""} ${shake ? "shake" : ""}`} style={{ position: 'relative' }}>
          <div className="flex items-start justify-between">
            <button 
              onClick={openSidebar}
              className="menu-btn" 
              aria-label="menu"
            >
              <GiHamburgerMenu size={20} />
            </button>

            <div className={`gw21-banked-display ${scoreFlash ? 'score-flash' : ''}`}>
              <span>BANKED:</span>
              <strong>{playerPoints}</strong>
            </div>
          </div>

          {/* Game Area */}
          <div className="game-area">
            {/* Dealer Area */}
            <div className="dealer-area">
              <div className={`dealer-cards ${dealing ? 'dealing' : ''} ${dealerHitAnim ? 'dealer-hit' : ''} ${cardGlow ? 'card-glow' : ''}`}>
                {dealerHand.map((card, index) => (
                  <div key={card.id} className={`card ${card.isHidden ? 'hidden' : ''} ${dealing ? 'dealing' : ''} ${cardGlow ? 'glow' : ''}`}>
                    {card.isHidden ? (
                      <div className="card-back">
                        <img 
                          src={IMAGES.CARD_BACK} 
                          alt="Card back" 
                          className="card-back-image"
                        />
                      </div>
                    ) : (
                      <div className="card-front">
                        <img 
                          src={getCardImage(card.suit, card.face)} 
                          alt={`${card.face} of ${card.suit}`} 
                          className="card-image"
                        />
                      </div>
                    )}
                  </div>
                ))}
              </div>
              <div className={`dealer-score ${scoreFlash ? 'score-flash' : ''}`}>OPPONENT TOTAL: {dealerScore}</div>
            </div>

            {/* Player Area */}
            <div className="player-area">
              <div className={`player-score ${scoreFlash ? 'score-flash' : ''}`}>YOUR TOTAL: {playerScore}</div>
              <div className={`player-cards ${dealing ? 'dealing' : ''} ${playerHitAnim ? 'player-hit' : ''} ${cardGlow ? 'card-glow' : ''}`}>
                {playerHand.map((card) => (
                  <div key={card.id} className={`card ${dealing ? 'dealing' : ''} ${cardGlow ? 'glow' : ''}`}>
                    <div className="card-front">
                      <img 
                        src={getCardImage(card.suit, card.face)} 
                        alt={`${card.face} of ${card.suit}`} 
                        className="card-image"
                      />
                    </div>
                  </div>
                ))}
              </div>
              
              {/* Action Buttons */}
              {gameState === 'player-turn' && (
                <div className="action-buttons">
                  <button 
                    className={`action-btn stand ${playerHitAnim ? 'pulse' : ''}`}
                    onClick={playerStand}
                  >
                    <img src={IMAGES.BUTTON_ICON_PURPLE} alt="Stand" className="btn-icon" />
                  </button>
                  <button 
                    className={`action-btn draw ${playerHitAnim ? 'pulse' : ''}`}
                    onClick={playerHit}
                  >
                    <img src={IMAGES.BUTTON_ICON_GREEN} alt="Draw" className="btn-icon" />
                  </button>
                </div>
              )}

              {/* Game Result */}
              {gameResult && (
                <div className={`game-result ${gameResultAnim ? 'result-anim' : ''}`}>
                  {gameResult}
                </div>
              )}

              {/* New Game Button */}
              {gameState === 'game-over' && (
                <button className="new-game-btn" onClick={startNewGame}>
                  New Game
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

export default GangWar21;
