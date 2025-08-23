import React, { useState } from "react";
import "./diceShootout.scss";
import GameContainer from "../../components/GameContainer/GameContainer";
import { IMAGES } from "../../constant/images";
import { GiHamburgerMenu } from "react-icons/gi";
import { 
  FaGamepad, 
  FaCog, 
  FaHome, 
  FaFileAlt, 
  FaScroll, 
  FaBars 
} from "react-icons/fa";
import { IoClose } from "react-icons/io5";
import ActionButton from "../../components/Button/ActionButton/ActionButton";
import useGameSounds from "../../hooks/useGameSounds";

// Rive dice
import {
  useRive,
  useStateMachineInput,
  Layout,
  Fit,
  Alignment,
} from "@rive-app/react-canvas";
import Victory from "../../components/GameOver/Victory";
import Defeat from "../../components/GameOver/Defeat";
import InfoButton from "../../components/Button/InfoButtons/InfoButton";
import Modal from '../../components/Modal/Modal';
import SettingsModal from '../../components/Modal/SettingsModal';
import ControlsModal from '../../components/Modal/ControlsModal';

type Props = {};

const MAX_HP = 100;
const HEAL_AMOUNT = 10;
const MAX_HEALS = 3;
const BOT_ACT_DELAY_MS = 2000;
const ROLL_ANIM_MS = 1500; // how long the dice animation runs
const RESULT_HOLD_MS = 1500; // hide dice before switching turns

// Optional: enable Degen Mode (6 crit = 12 dmg, +20 bonus if healed at <=5 and won).
const DEGEN_ENABLED = false;

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}
function rand1to6() {
  return 1 + Math.floor(Math.random() * 6);
}

function rollTwoDice() {
  return [rand1to6(), rand1to6()] as const;
}

function RiveDice({
  rolling,
  onEnd,
  showNumber,
  outcome,
  src = "/dice.riv",
  size = 240,
}: {
  rolling: boolean;
  onEnd?: () => void;
  showNumber: number | null;
  outcome: number | null;
  src?: string;
  size?: number;
}) {
  const { rive, RiveComponent } = useRive({
    src,
    autoplay: false,
    stateMachines: "State Machine 1",
    layout: new Layout({ fit: Fit.Contain, alignment: Alignment.Center }),
  });
  const rollTrigger = useStateMachineInput(
    rive,
    "State Machine 1",
    "roll",
    Number(outcome)
  );

  // Keep the die displaying the last outcome when not rolling
  React.useEffect(() => {
    if (!rive) return;
    try {
      // Set numeric value if available (to hold final face)
      // @ts-ignore
      if (rollTrigger && typeof (rollTrigger as any).value !== "undefined") {
        // @ts-ignore
        (rollTrigger as any).value = Number(outcome ?? 1);
      }
      // Keep machine paused when not rolling so face persists
      if (!rolling) {
        try { rive.pause(); } catch {}
      }
    } catch {}
  }, [rive, rollTrigger, outcome, rolling]);

  React.useEffect(() => {
    if (!rive || !rolling) return;
    try {
      // Ensure outcome is set before triggering animation
      // @ts-ignore
      if (rollTrigger && typeof (rollTrigger as any).value !== "undefined") {
        // @ts-ignore
        (rollTrigger as any).value = Number(outcome ?? 1);
      }
      // Fire trigger if available or play the machine
      // @ts-ignore
      if (rollTrigger && typeof (rollTrigger as any).fire === "function") {
        // @ts-ignore
        (rollTrigger as any).fire();
      } else {
        rive.play();
      }
    } catch {}

    const t = setTimeout(() => {
      try { rive.pause(); } catch {}
      onEnd?.();
    }, ROLL_ANIM_MS);
    return () => clearTimeout(t);
  }, [rolling, rive, rollTrigger, outcome, onEnd]);

  return (
    <div style={{ position: "relative", width: size, height: size }}>
      <div
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: 16,
          // overflow: "hidden",
          // boxShadow: "0 6px 24px rgba(0,0,0,0.35)",
          // background: "rgba(0,0,0,0.2)",
        }}
      >
        <RiveComponent />
      </div>
      {showNumber != null && (
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            fontSize: 96,
            fontWeight: 900,
            color: "white",
            textShadow: "0 2px 10px rgba(0,0,0,0.6)",
            pointerEvents: "none",
          }}
        >
          {showNumber}
        </div>
      )}
    </div>
  );
}

const DiceShootout = (props: Props) => {
  // Core state
  const [playerHP, setPlayerHP] = React.useState<number>(MAX_HP);
  const [botHP, setBotHP] = React.useState<number>(MAX_HP);
  const [playerHeals, setPlayerHeals] = React.useState<number>(MAX_HEALS);
  const [botHeals, setBotHeals] = React.useState<number>(MAX_HEALS);
  const [turn, setTurn] = React.useState<"player" | "bot" | "over">("player");
  const [rolling, setRolling] = React.useState<boolean>(false);
  const [lastRoll, setLastRoll] = React.useState<number | null>(null);
  const [lastRoll2, setLastRoll2] = React.useState<number | null>(null);
  const [lastAction, setLastAction] = React.useState<"attack" | "heal" | null>(
    null
  );
  const [lastPlayerAction, setLastPlayerAction] = React.useState<
    "attack" | "heal" | null
  >(null);

  const [showDice, setShowDice] = React.useState<boolean>(true);
  const [revealing, setRevealing] = React.useState<boolean>(false);

  // Optional scoring with Degen clutch bonus
  const [playerPts, setPlayerPts] = React.useState<number>(0);
  const [botPts, setBotPts] = React.useState<number>(0);
  const [playerClutchHeal, setPlayerClutchHeal] =
    React.useState<boolean>(false);
  const [botClutchHeal, setBotClutchHeal] = React.useState<boolean>(false);

  // Small UI badges (+/-) near avatars


  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [controlsOpen, setControlsOpen] = useState(false);

  // FX state
  const [shake, setShake] = React.useState<boolean>(false);
  const [playerHitFx, setPlayerHitFx] = React.useState<boolean>(false);
  const [botHitFx, setBotHitFx] = React.useState<boolean>(false);
  const [playerHealFx, setPlayerHealFx] = React.useState<boolean>(false);
  const [botHealFx, setBotHealFx] = React.useState<boolean>(false);
  const [playerLowWarned, setPlayerLowWarned] = React.useState<boolean>(false);
  const [botLowWarned, setBotLowWarned] = React.useState<boolean>(false);
  const [playerHitTilt, setPlayerHitTilt] = useState(false);
  const [botHitTilt, setBotHitTilt] = useState(false);

  // Sounds
  const {
    playDiceRoll,
    playDamageDone,
    playDamageTaken,
    playHealDone,
    playHealTaken,
    playSidebarOpen,
    playVictory,
    playDefeat,
    playLowHP,
    playGameOver,
  } = useGameSounds();

  // Helpers to display bars
  const playerHPWidth = `${(playerHP / MAX_HP) * 100}%`;
  const botHPWidth = `${(botHP / MAX_HP) * 100}%`;

  const endGame = React.useCallback(
    (winner: "player" | "bot") => {
      setTurn("over");
      if (winner === "player") {
        let add = 25;
        if (DEGEN_ENABLED && playerClutchHeal) add += 20;
        setPlayerPts((p) => p + add);
      } else {
        let add = 25;
        if (DEGEN_ENABLED && botClutchHeal) add += 20;
        setBotPts((p) => p + add);
      }
      // Heavy shake + KO + game over sting
      setShake(true);
      setTimeout(() => setShake(false), 700);
              playDefeat();
      setTimeout(() => playGameOver(), 350);
    },
    [playerClutchHeal, botClutchHeal]
  );

  // Attack and Heal
  const doAttack = React.useCallback(
    async (who: "player" | "bot") => {
      if (rolling || turn !== who || revealing) return;

      const [r1, r2] = rollTwoDice();
      const base = r1 + r2;
      const damage = base;

      // Start dice: show + rolling phase
      setShowDice(true);
      setRevealing(false);
      setRolling(true);
      setLastRoll(r1);
      setLastRoll2(r2);
      setLastAction("attack");
      if (who === "player") setLastPlayerAction("attack");

      playDiceRoll();
      setShake(true);
      setTimeout(() => setShake(false), 420);

      // Show hit marker 500ms before roll animation ends
      const earlyMs = Math.max(0, ROLL_ANIM_MS - 500);
      setTimeout(() => {
        if (who === "player") {
          setBotHitFx(true);
          setTimeout(() => setBotHitFx(false), 600);
        } else {
          setPlayerHitFx(true);
          setTimeout(() => setPlayerHitFx(false), 600);
        }
      }, earlyMs);

      // After dice animation, reveal number and apply damage
      setTimeout(() => {
        setRolling(false);
        setRevealing(false);
        setShowDice(false);

        if (who === "player") {
          setBotHP((hp) => {
            const newHP = clamp(hp - damage, 0, MAX_HP);
            playDamageDone();
            playDamageTaken();
            setBotHitFx(true);
            setShake(true);
            // Add retro damage number
            addRetroNumber(damage, 'damage', 'bot');
            // Trigger avatar tilt animation
            triggerAvatarHitTilt('bot');
            setTimeout(() => setShake(false), 420);
            setTimeout(() => setBotHitFx(false), 600);
            if (newHP <= 10 && !botLowWarned && newHP > 0) {
              playLowHP();
              setBotLowWarned(true);
            }
            if (newHP <= 0) endGame("player");
            return newHP;
          });
        } else {
          setPlayerHP((hp) => {
            const newHP = clamp(hp - damage, 0, MAX_HP);
            playDamageDone();
            playDamageTaken();
            setPlayerHitFx(true);
            setShake(true);
            // Add retro damage number
            addRetroNumber(damage, 'damage', 'player');
            // Trigger avatar tilt animation
            triggerAvatarHitTilt('player');
            setTimeout(() => setShake(false), 420);
            setTimeout(() => setPlayerHitFx(false), 600);
            if (newHP <= 10 && !playerLowWarned && newHP > 0) {
              playLowHP();
              setPlayerLowWarned(true);
            }
            if (newHP <= 0) endGame("bot");
            return newHP;
          });
        }

        // Wait, then proceed to next turn and show dice again (unless game over)
        setTimeout(() => {
          setRevealing(false);
          setShowDice(true);
          setTurn((t) =>
            t === "over" ? "over" : who === "player" ? "bot" : "player"
          );
        }, RESULT_HOLD_MS);
      }, ROLL_ANIM_MS);
    },
    [rolling, turn, endGame, revealing, playDiceRoll, playDamageDone, playDamageTaken, playLowHP, botLowWarned, playerLowWarned]
  );

  const doHeal = React.useCallback(
    async (who: "player" | "bot") => {
      if (rolling || turn !== who || revealing) return;

      // Roll dice for heal amount
      const [r1, r2] = rollTwoDice();
      // You can customize heal amount based on roll, e.g.:
      // const healAmount = roll * 2; // or just roll
      const healAmount = r1 + r2;

      // Validate ability to heal before starting animation
      if (who === "player") {
        if (playerHeals <= 0 || playerHP >= MAX_HP) return;
      } else {
        if (botHeals <= 0 || botHP >= MAX_HP) return;
      }

      setLastRoll(r1);
      setLastRoll2(r2);
      setLastAction("heal");
      if (who === "player") setLastPlayerAction("heal");

      // Start dice animation for heal as well
      setShowDice(true);
      setRevealing(false);
      setRolling(true);


      playDiceRoll();
      setShake(true);
      setTimeout(() => setShake(false), 360);

      // After dice animation, apply the heal and hold the view
      setTimeout(() => {
        setRolling(false);
        setRevealing(false);
        setShowDice(false);

        if (who === "player") {
          setPlayerHeals((h) => Math.max(0, h - 1));
          setPlayerHP((hp) => {
            if (hp <= 5 && DEGEN_ENABLED) setPlayerClutchHeal(true);
            const healed = Math.min(MAX_HP, hp + healAmount);
            const healValue = healed - hp;
            // Add retro heal number
            addRetroNumber(healValue, 'heal', 'player');
            playHealDone();
            setPlayerHealFx(true);
            setTimeout(() => setPlayerHealFx(false), 700);
            if (healed > 10) setPlayerLowWarned(false);
            return healed;
          });
        } else {
          setBotHeals((h) => Math.max(0, h - 1));
          setBotHP((hp) => {
            if (hp <= 5 && DEGEN_ENABLED) setBotClutchHeal(true);
            const healed = Math.min(MAX_HP, hp + healAmount);
            const healValue = healed - hp;
            // Add retro heal number
            addRetroNumber(healValue, 'heal', 'bot');
            playHealDone();
            setBotHealFx(true);
            setTimeout(() => setBotHealFx(false), 700);
            if (healed > 10) setBotLowWarned(false);
            return healed;
          });
        }

        // Wait, then switch turn and show dice again
        setTimeout(() => {
          setRevealing(false);
          setShowDice(true);
          setTurn((t) =>
            t === "over" ? "over" : who === "player" ? "bot" : "player"
          );
        }, RESULT_HOLD_MS);
      }, ROLL_ANIM_MS);
    },
    [rolling, revealing, turn, playerHeals, botHeals, playerHP, botHP, playDiceRoll, playHealDone]
  );



  // Bot decision logic (bot can only heal if player healed last)
  const botDecide = React.useCallback((): "attack" | "heal" => {
    // Gate bot healing: only allowed immediately following a player heal
    if (lastPlayerAction !== "heal") return "attack";

    // If allowed, still respect basic constraints
    if (botHeals <= 0 || botHP >= MAX_HP) return "attack";

    // Simple HP-based preference once gating condition is met
    if (botHP <= 25) return "heal";
    if (botHP <= 50) return Math.random() < 0.4 ? "heal" : "attack";
    return "attack";
  }, [lastPlayerAction, botHeals, botHP]);

  // Drive bot turn
  React.useEffect(() => {
    if (turn !== "bot" || rolling || revealing) return;
    const t = setTimeout(() => {
      const choice = botDecide();
      if (choice === "heal") {
        if (botHeals > 0 && botHP < MAX_HP) doHeal("bot");
        else doAttack("bot");
      } else {
        doAttack("bot");
      }
    }, BOT_ACT_DELAY_MS);
    return () => clearTimeout(t);
  }, [turn, rolling, revealing, botDecide, doAttack, doHeal, botHeals, botHP]);

  const reset = React.useCallback(() => {
    setPlayerHP(MAX_HP);
    setBotHP(MAX_HP);
    setPlayerHeals(MAX_HEALS);
    setBotHeals(MAX_HEALS);
    setTurn("player");
    setRolling(false);
    setLastRoll(null);
    setLastRoll2(null);
    setLastAction(null);

    setPlayerClutchHeal(false);
    setBotClutchHeal(false);
    setShowDice(true);
    setRevealing(false);
    setShake(false);
    setPlayerHitFx(false);
    setBotHitFx(false);
    setPlayerHealFx(false);
    setBotHealFx(false);
    setPlayerLowWarned(false);
    setBotLowWarned(false);
  }, []);

  // One-time user interaction unlock for AudioContext (Safari/iOS policies)
  React.useEffect(() => {
    const unlock = async () => {
      // Audio context is now handled automatically by the useGameSounds hook
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
    window.addEventListener("pointerdown", unlock, { once: true });
    window.addEventListener("keydown", unlock, { once: true });
    window.addEventListener("touchstart", unlock, { once: true });
    return () => {
      window.removeEventListener("pointerdown", unlock);
      window.removeEventListener("keydown", unlock);
      window.removeEventListener("touchstart", unlock);
    };
  }, []);

  const playerTurn = turn === "player";
  const over = turn === "over";
  const canPlayerHeal = playerHeals > 0 && playerHP < MAX_HP;
  const playerDisabled = !playerTurn || rolling || revealing || over;

  const openSidebar = React.useCallback(() => {
    setSidebarOpen(true);
    playSidebarOpen();
  }, [playSidebarOpen]);

  const openSettings = React.useCallback(() => {
    setSidebarOpen(false);
    setSettingsOpen(true);
  }, []);

  const openControls = React.useCallback(() => {
    setSidebarOpen(false);
    setControlsOpen(true);
  }, []);

  const [retroNumbers, setRetroNumbers] = useState<Array<{
    id: number;
    value: string;
    type: 'damage' | 'heal';
    x: number;
    y: number;
    target: 'player' | 'bot';
  }>>([]);
  const [nextNumberId, setNextNumberId] = useState(0);

  const addRetroNumber = React.useCallback((value: number, type: 'damage' | 'heal', target: 'player' | 'bot') => {
    const id = nextNumberId;
    setNextNumberId(prev => prev + 1);
    
    // Position based on target
    let x, y;
    if (target === 'player') {
      x = 50; // Left side for player
      y = 20; // Above the HP span
    } else {
      x = 300; // Right side for bot
      y = 20; // Above the HP span
    }
    
    setRetroNumbers(prev => [...prev, {
      id,
      value: type === 'damage' ? `-${value}` : `+${value}`,
      type,
      x,
      y,
      target
    }]);

    // Remove the number after animation completes
    setTimeout(() => {
      setRetroNumbers(prev => prev.filter(num => num.id !== id));
    }, 800);
  }, [nextNumberId]);

  const triggerAvatarHitTilt = React.useCallback((target: 'player' | 'bot') => {
    if (target === 'player') {
      setPlayerHitTilt(true);
      setTimeout(() => setPlayerHitTilt(false), 400);
    } else {
      setBotHitTilt(true);
      setTimeout(() => setBotHitTilt(false), 400);
    }
  }, []);

  return (
    <div className="dice-shootout-container">
      <GameContainer
        title="DICE RISK"
        bg={IMAGES.DEFAULT_ARCADE_BG}
        arcadeWidth="100%"
        headerRight={
          <div style={{ display: "flex", gap: 28 }}>
            <div style={{ color: "#9b9b9b", fontFamily: "Jersey 10", fontSize: 28 }}>Tickets {3}</div>
            <div style={{ color: "#9b9b9b", fontFamily: "Jersey 10", fontSize: 28 }}>Points {playerPts}</div>
          </div>
        }
      >
        <div className={`dice-shootout-wrapper ${shake ? "shake" : ""} ${sidebarOpen ? "blurred" : ""}`} style={{ position: "relative" }}>
          <div className="flex items-start justify-between">
            <button
              onClick={openSidebar}
              className="menu-btn"
              aria-label="menu"
            >
              <GiHamburgerMenu size={20} />
            </button>

            <div
              className="dice-shootout-playerB"
              style={{ position: "relative" }}
            >
              {/* Retro damage/heal numbers for bot only */}
              {retroNumbers
                .filter(num => num.target === 'bot')
                .map((num) => (
                  <div
                    key={num.id}
                    className={num.type === 'damage' ? 'retro-damage-number' : 'retro-heal-number'}
                    style={{
                      left: num.x,
                      top: num.y,
                    }}
                  >
                    {num.value}
                  </div>
                ))}

              <div className="dice-shootout-playerB-hp">
                <span>HP: {botHP}</span>
                <div className="dice-shootout-playerB-hp-bar">
                  <div
                    className={`dice-shootout-playerB-hp-bar-progress ${botHP <= 10 && botHP > 0 ? "low" : ""}`}
                    style={{
                      width: botHPWidth,
                      height: "100%",
                      transition: "width 260ms ease",
                    }}
                  />
                </div>
              </div>

              <div className={`dice-shootout-playerB-avatar`}>
                <img className={`${botHitFx ? "hit" : ""} ${botHealFx ? "heal" : ""} ${turn === "bot" ? "active-turn" : ""} ${botHitTilt ? "avatar-hit-tilt" : ""}`} src={IMAGES.PLAYER_B_AVATAR} alt="Enemy avatar" />
              </div>
            </div>
          </div>

          <div
            className="dice-game-content"
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              position: "relative",
            }}
          >
            <div className="dice-persistent" style={{ opacity: showDice ? 1 : 0 }}>
              <div className={`dice-pair ${rolling ? "rolling" : ""}`}>
                <RiveDice
                  key={`die1-${rolling ? "rolling" : "idle"}-${lastRoll ?? "na"}`}
                  rolling={rolling}
                  onEnd={() => {}}
                  showNumber={null}
                  outcome={lastRoll}
                  size={280}
                />
                <RiveDice
                  key={`die2-${rolling ? "rolling" : "idle"}-${lastRoll2 ?? "na"}`}
                  rolling={rolling}
                  onEnd={() => {}}
                  showNumber={null}
                  outcome={lastRoll2}
                  size={280}
                />
              </div>
              {!rolling && showDice && (
                <div className="turn-cue">
                  {turn === "player" ? "Your turn" : turn === "bot" ? "Opponent's turn" : ""}
                </div>
              )}
            </div>
            {false && turn !== "over" && !showDice && null}
          </div>

          <div className="flex items-end justify-between">
            <div
              className="dice-shootout-playerA"
              style={{ position: "relative" }}
            >
              {/* Retro damage/heal numbers for player only */}
              {retroNumbers
                .filter(num => num.target === 'player')
                .map((num) => (
                  <div
                    key={num.id}
                    className={num.type === 'damage' ? 'retro-damage-number' : 'retro-heal-number'}
                    style={{
                      left: num.x,
                      top: num.y,
                    }}
                  >
                    {num.value}
                  </div>
                ))}

              <div className={`dice-shootout-playerA-avatar`}>
                <img className={`${playerHitFx ? "hit" : ""} ${playerHealFx ? "heal" : ""} ${turn === "player" ? "active-turn" : ""} ${playerHitTilt ? "avatar-hit-tilt" : ""}`} src={IMAGES.PLAYER_A_AVATAR} alt="Player avatar" />
              </div>

              <div className="dice-shootout-playerA-hp">
                <span>HP: {playerHP}</span>
                <div className="dice-shootout-playerA-hp-bar">
                  <div
                    className={`dice-shootout-playerA-hp-bar-progress ${playerHP <= 10 && playerHP > 0 ? "low" : ""}`}
                    style={{
                      width: playerHPWidth,
                      height: "100%",
                      transition: "width 260ms ease",
                    }}
                  />
                </div>
              </div>
            </div>

            <div className="dice-shootout-actions">
              <div className="action-button-container">
                <ActionButton
                  className="attack"
                  handleClick={() => doAttack("player")}
                  // disabled={playerDisabled}
                >
                  <img src={IMAGES.ATTACK_BTN_ICON} alt="Attack" />
                </ActionButton>
                <div className="action-button-label">Attack</div>
              </div>

              <div className="action-button-container">
                <ActionButton
                  className="heal"
                  handleClick={() => doHeal("player")}
                  disabled={!canPlayerHeal}
                >
                  <img src={IMAGES.HEAL_BTN_ICON} alt="Heal" />
                </ActionButton>
                <div className="action-button-label">Heal ({playerHeals})</div>
              </div>
            </div>
          </div>
        </div>

        {botHP === 0 && <Victory />}
        {playerHP === 0 && <Defeat />}

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

export default DiceShootout;
