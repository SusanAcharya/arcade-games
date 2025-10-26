Arcade Games

This repository contains a collection of web-based retro arcade games built with React, TypeScript, and Vite. Experience classic game mechanics with a modern twist, featuring dynamic animations and sound effects.

Games Included
1. Dice Risk (Dice Shootout)
A turn-based dice combat game where you face off against an opponent. Roll two dice to determine the outcome of your actions.

Battle 1: The standard mode. Attack or heal, build up your special meter, and defeat your opponent.
Battle 2: A more challenging mode where rolling a '1' damages you. Gain heals by matching your roll with a target dice face.
Features: Character selection, special attack meter, dynamic sound effects, retro visual effects, and keyboard controls.
2. Degen Sweeper
A high-stakes version of Minesweeper. Uncover tiles to earn points, but beware of the bombs!

Mechanics: Clear all 12 safe tiles on a 4x4 grid to win the round and get a 5x score multiplier.
Undo Feature: You get one free pass. The first time you hit a bomb, it's revealed, and your turn continues. The second time ends the round.
3. Gang War 21
A card game inspired by Blackjack. The goal is to get a hand value closer to 21 than the dealer without going over.

Gameplay: Choose to "Draw" another card or "Stand" to finalize your hand.
Scoring: Card values are based on their face, with J, Q, and K having higher values. Aces are worth 1 point. The dealer must hit until their hand value is 17 or more.
Features
Modern Tech Stack: Built with React, TypeScript, Vite, and Sass for a fast and type-safe development experience.
Interactive Animations: Utilizes the Rive (@rive-app/react-canvas) library for smooth, state-driven animations, particularly for the dice rolls.
Immersive Audio: A custom useGameSounds hook manages and plays sound effects for actions like dice rolls, damage, healing, and victory/defeat, using the Web Audio API.
Modular Components: A well-organized structure with reusable components for UI elements like modals, buttons, and game containers.
Client-Side Routing: Uses react-router-dom for seamless navigation between the game library and individual games.
Retro Styling: Styled with SCSS to achieve a classic arcade look and feel, complete with CRT scanline effects and pixelated fonts.
