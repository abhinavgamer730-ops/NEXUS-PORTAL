// Grid Pop 100! 🐾⚡ - Core Game Logic & State Management
import { ALL_LEVELS } from './levels.js';
import confetti from 'canvas-confetti';

// =============================================================================
// 1. WEB AUDIO API SYNTHESIZER (Cartoon Sound Engine)
// =============================================================================

class CartoonSoundEngine {
  constructor() {
    this.audioCtx = null;
    this.muted = false;
  }

  init() {
    if (!this.audioCtx && typeof window !== 'undefined') {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) {
        this.audioCtx = new AudioContext();
      }
    }
    if (this.audioCtx && this.audioCtx.state === 'suspended') {
      this.audioCtx.resume();
    }
  }

  toggleMute() {
    this.muted = !this.muted;
    return this.muted;
  }

  playPop(freq = 440) {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();

      osc.type = 'sine';
      osc.frequency.setValueAtTime(freq, this.audioCtx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(freq * 2.2, this.audioCtx.currentTime + 0.08);

      gain.gain.setValueAtTime(0.3, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.08);

      osc.connect(gain);
      gain.connect(this.audioCtx.destination);

      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.08);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  playFanfare() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const now = this.audioCtx.currentTime;
      const notes = [523.25, 659.25, 783.99, 1046.50]; // C5, E5, G5, C6
      
      notes.forEach((freq, i) => {
        const osc = this.audioCtx.createOscillator();
        const gain = this.audioCtx.createGain();

        osc.type = 'triangle';
        osc.frequency.setValueAtTime(freq, now + i * 0.09);

        gain.gain.setValueAtTime(0.25, now + i * 0.09);
        gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.09 + 0.25);

        osc.connect(gain);
        gain.connect(this.audioCtx.destination);

        osc.start(now + i * 0.09);
        osc.stop(now + i * 0.09 + 0.25);
      });
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }

  playClick() {
    if (this.muted) return;
    this.init();
    if (!this.audioCtx) return;

    try {
      const osc = this.audioCtx.createOscillator();
      const gain = this.audioCtx.createGain();
      osc.type = 'square';
      osc.frequency.setValueAtTime(300, this.audioCtx.currentTime);
      gain.gain.setValueAtTime(0.15, this.audioCtx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.01, this.audioCtx.currentTime + 0.05);
      osc.connect(gain);
      gain.connect(this.audioCtx.destination);
      osc.start();
      osc.stop(this.audioCtx.currentTime + 0.05);
    } catch (e) {
      console.warn('Audio play error', e);
    }
  }
}

const sounds = new CartoonSoundEngine();

// =============================================================================
// 2. LOCAL STORAGE SAVE SYSTEM (With Fallback & Error Handling)
// =============================================================================

const SAVE_KEY = 'logic_puzzle_save_v1';

function loadSaveData() {
  const defaultSave = {
    highestLevelUnlocked: 1,
    completedLevels: {}
  };

  try {
    const raw = localStorage.getItem(SAVE_KEY);
    if (!raw) return defaultSave;
    const parsed = JSON.parse(raw);
    return {
      highestLevelUnlocked: Math.max(1, Math.min(100, Number(parsed.highestLevelUnlocked) || 1)),
      completedLevels: parsed.completedLevels || {}
    };
  } catch (e) {
    console.warn('LocalStorage error or unavailable, using in-memory state:', e);
    return defaultSave;
  }
}

function saveSaveData(data) {
  try {
    localStorage.setItem(SAVE_KEY, JSON.stringify(data));
  } catch (e) {
    console.warn('LocalStorage save failed:', e);
  }
}

// =============================================================================
// 3. CORE GAME STATE & VARIABLES
// =============================================================================

let saveData = loadSaveData();
let currentLevelIndex = 0; // 0 to 99
let activeMatrix = [];
let moveCount = 0;
let isLevelCompleted = false;

// DOM Elements
const screenMenu = document.getElementById('screen-menu');
const screenLevels = document.getElementById('screen-levels');
const screenGame = document.getElementById('screen-game');

const btnPlay = document.getElementById('btn-play');
const btnLevelSelect = document.getElementById('btn-level-select');
const btnHowToPlay = document.getElementById('btn-how-to-play');

const btnBackToMenuFromLevels = document.getElementById('btn-back-to-menu-from-levels');
const btnBackToLevelsFromGame = document.getElementById('btn-back-to-levels-from-game');

const levelGridContainer = document.getElementById('level-grid-container');
const levelProgressBadge = document.getElementById('level-progress-badge');

const puzzleBoard = document.getElementById('puzzle-board');
const hudLevelNum = document.getElementById('hud-level-num');
const hudMovesCount = document.getElementById('hud-moves-count');
const hudTargetMoves = document.getElementById('hud-target-moves');

const btnRestartLevel = document.getElementById('btn-restart-level');
const btnHint = document.getElementById('btn-hint');

const modalWin = document.getElementById('modal-win');
const winModalStars = document.getElementById('win-modal-stars');
const winModalText = document.getElementById('win-modal-text');
const btnNextLevel = document.getElementById('btn-next-level');
const btnWinToLevels = document.getElementById('btn-win-to-levels');

const modalHelp = document.getElementById('modal-help');
const btnCloseHelp = document.getElementById('btn-close-help');

const btnSoundToggle = document.getElementById('btn-sound-toggle');
const btnResetData = document.getElementById('btn-reset-data');
const navBrand = document.getElementById('nav-brand');

// =============================================================================
// 4. SCREEN VIEW SWITCHER
// =============================================================================

function showScreen(screenName) {
  screenMenu.classList.remove('active');
  screenLevels.classList.remove('active');
  screenGame.classList.remove('active');

  if (screenName === 'menu') {
    screenMenu.classList.add('active');
    updatePlayButtonLabel();
  } else if (screenName === 'levels') {
    screenLevels.classList.add('active');
    renderLevelGrid();
  } else if (screenName === 'game') {
    screenGame.classList.add('active');
  }
}

function updatePlayButtonLabel() {
  if (saveData.highestLevelUnlocked > 1) {
    btnPlay.innerHTML = `▶️ RESUME LEVEL ${saveData.highestLevelUnlocked}`;
  } else {
    btnPlay.innerHTML = `▶️ PLAY LEVEL 1`;
  }
}

// =============================================================================
// 5. LEVEL SELECT GRID RENDERER
// =============================================================================

function renderLevelGrid() {
  levelProgressBadge.textContent = `🏆 UNLOCKED: ${saveData.highestLevelUnlocked} / 100`;
  levelGridContainer.innerHTML = '';

  ALL_LEVELS.forEach((levelObj) => {
    const lvlNum = levelObj.id;
    const isUnlocked = lvlNum <= saveData.highestLevelUnlocked;
    const isCurrent = lvlNum === saveData.highestLevelUnlocked;
    const levelData = saveData.completedLevels[lvlNum];

    const btn = document.createElement('button');
    btn.className = 'level-btn';

    if (isUnlocked) {
      btn.classList.add('unlocked', levelObj.theme);
      if (isCurrent) btn.classList.add('current');

      let starsHtml = '';
      if (levelData && levelData.stars) {
        starsHtml = `<div class="level-stars">${'⭐'.repeat(levelData.stars)}</div>`;
      }

      btn.innerHTML = `
        <div>${lvlNum}</div>
        ${starsHtml}
      `;

      btn.addEventListener('click', () => {
        sounds.playClick();
        loadLevel(lvlNum - 1);
        showScreen('game');
      });
    } else {
      btn.classList.add('locked');
      btn.innerHTML = `
        <div class="lock-icon">🔒</div>
        <div style="font-size: 0.75rem; opacity: 0.8;">${lvlNum}</div>
      `;
    }

    levelGridContainer.appendChild(btn);
  });
}

// =============================================================================
// 6. GAME BOARD LOGIC & TILE TOGGLING
// =============================================================================

function loadLevel(index) {
  currentLevelIndex = Math.max(0, Math.min(99, index));
  const levelObj = ALL_LEVELS[currentLevelIndex];

  // Deep clone initial matrix
  activeMatrix = levelObj.matrix.map(row => [...row]);
  moveCount = 0;
  isLevelCompleted = false;

  // Update HUD
  hudLevelNum.textContent = `LEVEL ${levelObj.id}`;
  hudMovesCount.textContent = '0';
  hudTargetMoves.textContent = levelObj.targetMoves;

  // Render Grid
  renderBoard(levelObj);
}

function renderBoard(levelObj) {
  puzzleBoard.innerHTML = '';
  puzzleBoard.setAttribute('data-cols', levelObj.cols);

  const rows = levelObj.rows;
  const cols = levelObj.cols;

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      const tileBtn = document.createElement('button');
      tileBtn.className = 'tile-btn';
      
      const isOn = activeMatrix[r][c] === 1;
      if (isOn) {
        tileBtn.classList.add('on', `theme-${levelObj.theme}`);
        tileBtn.innerHTML = '✨';
      } else {
        tileBtn.classList.add('off');
        tileBtn.innerHTML = '•';
      }

      tileBtn.addEventListener('click', () => handleTileClick(r, c));
      puzzleBoard.appendChild(tileBtn);
    }
  }
}

function handleTileClick(r, c) {
  if (isLevelCompleted) return;

  sounds.playPop(400 + Math.random() * 200);
  moveCount++;
  hudMovesCount.textContent = moveCount;

  const levelObj = ALL_LEVELS[currentLevelIndex];
  const rows = levelObj.rows;
  const cols = levelObj.cols;

  // Toggle clicked tile and its 4 adjacent neighbors
  const neighbors = [
    [r, c],
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1]
  ];

  neighbors.forEach(([nr, nc]) => {
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      activeMatrix[nr][nc] = activeMatrix[nr][nc] === 1 ? 0 : 1;
    }
  });

  renderBoard(levelObj);
  checkWinCondition();
}

function checkWinCondition() {
  const levelObj = ALL_LEVELS[currentLevelIndex];
  let activeCount = 0;

  for (let r = 0; r < levelObj.rows; r++) {
    for (let c = 0; c < levelObj.cols; c++) {
      if (activeMatrix[r][c] === 1) activeCount++;
    }
  }

  // All lights cleared! Level Complete!
  if (activeCount === 0) {
    isLevelCompleted = true;
    sounds.playFanfare();

    // Star calculation
    let stars = 1;
    if (moveCount <= levelObj.targetMoves) {
      stars = 3;
    } else if (moveCount <= levelObj.targetMoves + 3) {
      stars = 2;
    }

    // Update Save State
    const lvlNum = levelObj.id;
    const existing = saveData.completedLevels[lvlNum];
    const prevBest = existing ? existing.bestMoves : Infinity;

    saveData.completedLevels[lvlNum] = {
      stars: Math.max(stars, existing ? existing.stars : 0),
      bestMoves: Math.min(moveCount, prevBest)
    };

    // Unlock next level
    if (lvlNum === saveData.highestLevelUnlocked && lvlNum < 100) {
      saveData.highestLevelUnlocked = lvlNum + 1;
    }

    saveSaveData(saveData);

    // Trigger Confetti
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });

    // Show Win Modal
    winModalStars.textContent = '⭐'.repeat(stars);
    winModalText.textContent = `Awesome! You cleared Level ${lvlNum} in ${moveCount} ${moveCount === 1 ? 'move' : 'moves'}!`;
    
    if (lvlNum === 100) {
      btnNextLevel.style.display = 'none';
      winModalText.textContent = `🏆 CONGRATULATIONS! YOU HAVE COMPLETED ALL 100 LEVELS OF GRID POP! 🥳✨`;
    } else {
      btnNextLevel.style.display = 'inline-flex';
    }

    modalWin.classList.add('active');
  }
}

// =============================================================================
// 7. EVENT LISTENERS & NAVIGATION BINDINGS
// =============================================================================

// Nav Logo
navBrand.addEventListener('click', () => {
  sounds.playClick();
  showScreen('menu');
});

// Sound Toggle
btnSoundToggle.addEventListener('click', () => {
  const isMuted = sounds.toggleMute();
  btnSoundToggle.textContent = isMuted ? '🔇' : '🔊';
});

// Reset Progress
btnResetData.addEventListener('click', () => {
  if (confirm('Reset all 100-level progress and local storage saves?')) {
    sounds.playClick();
    saveData = { highestLevelUnlocked: 1, completedLevels: {} };
    saveSaveData(saveData);
    showScreen('menu');
    alert('Progress reset! Level 1 unlocked.');
  }
});

// Main Menu buttons
btnPlay.addEventListener('click', () => {
  sounds.playClick();
  loadLevel(saveData.highestLevelUnlocked - 1);
  showScreen('game');
});

btnLevelSelect.addEventListener('click', () => {
  sounds.playClick();
  showScreen('levels');
});

btnHowToPlay.addEventListener('click', () => {
  sounds.playClick();
  modalHelp.classList.add('active');
});

btnCloseHelp.addEventListener('click', () => {
  sounds.playClick();
  modalHelp.classList.remove('active');
});

// Level Select back button
btnBackToMenuFromLevels.addEventListener('click', () => {
  sounds.playClick();
  showScreen('menu');
});

// Game Board back button
btnBackToLevelsFromGame.addEventListener('click', () => {
  sounds.playClick();
  showScreen('levels');
});

// Restart Level
btnRestartLevel.addEventListener('click', () => {
  sounds.playClick();
  loadLevel(currentLevelIndex);
});

// Hint Button
btnHint.addEventListener('click', () => {
  sounds.playPop(600);
  alert(`💡 Hint for Level ${currentLevelIndex + 1}: Try to solve from the top row downward! Target moves: ${ALL_LEVELS[currentLevelIndex].targetMoves}`);
});

// Win Modal Next Level
btnNextLevel.addEventListener('click', () => {
  sounds.playClick();
  modalWin.classList.remove('active');
  if (currentLevelIndex < 99) {
    loadLevel(currentLevelIndex + 1);
  }
});

// Win Modal Level Select
btnWinToLevels.addEventListener('click', () => {
  sounds.playClick();
  modalWin.classList.remove('active');
  showScreen('levels');
});

// Initialize Main Menu
showScreen('menu');
