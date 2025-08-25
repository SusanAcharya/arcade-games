import { useCallback, useRef, useState } from "react";

// Import sound files
import diceRollSound from "../assets/sound/diceroll.mp3";
import damageSound from "../assets/sound/dmg.mp3";
import healSound from "../assets/sound/healed.mp3";
import sidebarOpenSound from "../assets/sound/sidebaropen.wav";
import victorySound from "../assets/sound/victorysound.mp3";
import defeatSound from "../assets/sound/defeatsound.mp3";
import cardFlipSound from "../assets/sound/cardflip.mp3";
import fightSound from "../assets/sound/fight.mp3";
import audienceCheerSound from "../assets/sound/audience_cheer.mp3";
import audienceBooSound from "../assets/sound/audience_booing.mp3";
import diceBattleMusic from "../assets/sound/battle/dice_battle.mp3";

const useGameSounds = () => {
  const audioContextRef = useRef<AudioContext | null>(null);
  const audioCache = useRef<Map<string, AudioBuffer>>(new Map());
  const backgroundMusicRef = useRef<HTMLAudioElement | null>(null);
  const [isMusicMuted, setIsMusicMuted] = useState(false);

  const ensureAudio = useCallback(async () => {
    if (!audioContextRef.current) {
      audioContextRef.current = new AudioContext();
    }
    if (audioContextRef.current.state === "suspended") {
      await audioContextRef.current.resume();
    }
  }, []);

  const loadSound = useCallback(async (url: string): Promise<AudioBuffer> => {
    if (audioCache.current.has(url)) {
      return audioCache.current.get(url)!;
    }

    try {
      const response = await fetch(url);
      const arrayBuffer = await response.arrayBuffer();
      const audioBuffer = await audioContextRef.current!.decodeAudioData(arrayBuffer);
      audioCache.current.set(url, audioBuffer);
      return audioBuffer;
    } catch (error) {
      console.error("Failed to load sound:", url, error);
      throw error;
    }
  }, []);

  const playSound = useCallback(async (url: string, volume: number = 0.7) => {
    try {
      await ensureAudio();
      const audioBuffer = await loadSound(url);
      
      const source = audioContextRef.current!.createBufferSource();
      const gainNode = audioContextRef.current!.createGain();
      
      source.buffer = audioBuffer;
      gainNode.gain.value = volume;
      
      source.connect(gainNode);
      gainNode.connect(audioContextRef.current!.destination);
      
      source.start(0);
    } catch (error) {
      console.error("Failed to play sound:", url, error);
    }
  }, [ensureAudio, loadSound]);

  const playDiceRoll = useCallback(() => {
    playSound(diceRollSound, 0.8);
  }, [playSound]);

  const playDamageDone = useCallback(() => {
    playSound(damageSound, 0.3);
  }, [playSound]);

  const playDamageTaken = useCallback(() => {
    playSound(damageSound, 0.3);
  }, [playSound]);

  const playHealDone = useCallback(() => {
    playSound(healSound, 0.8);
  }, [playSound]);

  const playHealTaken = useCallback(() => {
    playSound(healSound, 0.8);
  }, [playSound]);

  const playSidebarOpen = useCallback(() => {
    playSound(sidebarOpenSound, 0.7);
  }, [playSound]);

  const playVictory = useCallback(() => {
    playSound(victorySound, 0.8);
  }, [playSound]);

  const playDefeat = useCallback(() => {
    playSound(defeatSound, 0.8);
  }, [playSound]);

  const playLowHP = useCallback(() => {
    // Use damage sound for low HP warning
    playSound(damageSound, 0.6);
  }, [playSound]);

  const playGameOver = useCallback(() => {
    // Use defeat sound for game over
    playSound(defeatSound, 0.8);
  }, [playSound]);

  const playTileClick = useCallback(() => {
    playSound(cardFlipSound, 0.9);
  }, [playSound]);

  const playTileReveal = useCallback(() => {
    playSound(cardFlipSound, 0.9);
  }, [playSound]);

  const playBombReveal = useCallback(() => {
    playSound(damageSound, 0.3);
  }, [playSound]);

  const playFight = useCallback(() => {
    playSound(fightSound, 0.8);
  }, [playSound]);

  const playAudienceCheer = useCallback(() => {
    playSound(audienceCheerSound, 0.8);
  }, [playSound]);

  const playAudienceBoo = useCallback(() => {
    playSound(audienceBooSound, 0.8);
  }, [playSound]);

  const playBackgroundMusic = useCallback(() => {
    return new Promise<void>((resolve, reject) => {
      try {
        // Stop any existing background music
        if (backgroundMusicRef.current) {
          backgroundMusicRef.current.pause();
          backgroundMusicRef.current = null;
        }

        // Create new audio element for background music
        const audio = new Audio(diceBattleMusic);
        audio.loop = true;
        audio.volume = isMusicMuted ? 0.0 : 0.2; // Muted or small volume
        audio.preload = 'auto';
        
        // Store reference
        backgroundMusicRef.current = audio;
        
        // Play the music
        audio.play().then(() => {
          resolve();
        }).catch(error => {
          console.error("Failed to play background music:", error);
          reject(error);
        });
      } catch (error) {
        console.error("Failed to setup background music:", error);
        reject(error);
      }
    });
  }, [isMusicMuted]);

  const toggleMusicMute = useCallback(() => {
    setIsMusicMuted(prev => {
      const newMuted = !prev;
      
      // Update current music volume if playing
      if (backgroundMusicRef.current) {
        backgroundMusicRef.current.volume = newMuted ? 0.0 : 0.3;
      }
      
      return newMuted;
    });
  }, []);

  const stopBackgroundMusic = useCallback(() => {
    if (backgroundMusicRef.current) {
      backgroundMusicRef.current.pause();
      backgroundMusicRef.current = null;
    }
  }, []);

  const isMusicPlaying = useCallback(() => {
    return backgroundMusicRef.current && !backgroundMusicRef.current.paused;
  }, []);

  return {
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
    playTileClick,
    playTileReveal,
    playBombReveal,
    playFight,
    playAudienceCheer,
    playAudienceBoo,
    playBackgroundMusic,
    stopBackgroundMusic,
    toggleMusicMute,
    isMusicMuted,
    isMusicPlaying,
  };
};

export default useGameSounds;


