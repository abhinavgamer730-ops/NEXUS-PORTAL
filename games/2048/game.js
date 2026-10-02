/**
 * 2048 Puzzle Game Engine
 * Features: Touch Swipe Detection, Undo Move, High Score, Audio Synth, Confetti Win
 */

(function () {
  'use strict';

  const SIZE = 4;
  let grid = [];
  let score = 0;
  let bestScore = 0;
  let previousState = null;
  let won = false;
  let keepPlaying = false;
  let soundEnabled = true;

  // DOM Elements
  const tileContainer = document.getElementById('tile-container');
  const currentScoreEl = document.getElementById('current-score');
  const bestScoreEl = document.getElementById('best-score');
  const scoreAdditionEl = document.getElementById('score-addition');
  const gameOverlay = document.getElementById('game-overlay');
  const overlayIcon = document.getElementById('overlay-icon');
  const overlayTitle = document.getElementById('overlay-title');
  const overlayMsg = document.getElementById('overlay-msg');
  const btnKeepGoing = document.getElementById('btn-keep-going');
  const btnTryAgain = document.getElementById('btn-try-again');
  const btnRestart = document.getElementById('btn-restart');
  const btnUndo = document.getElementById('btn-undo');
  const btnSound = document.getElementById('sound-toggle-btn');
  const boardGrid = document.getElementById('board-grid');
  const dpadBtns = document.querySelectorAll('.dpad-btn');

  // Web Audio Synthesizer
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    const ctx = getAudioContext();
    if (!ctx) return;

    try {
      const now = ctx.currentTime;
      if (type === 'slide') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(120, now + 0.08);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'merge') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(330, now);
        osc.frequency.exponentialRampToValueAtTime(550, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'win') {
        [440, 554.37, 659.25, 880].forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + idx * 0.1);
          gain.gain.setValueAtTime(0.3, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.26);
        });
      } else if (type === 'gameover') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(280, now);
        osc.frequency.linearRampToValueAtTime(100, now + 0.35);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.36);
      }
    } catch (e) {}
  }

  // Load High Score
  function loadBestScore() {
    try {
      bestScore = parseInt(localStorage.getItem('nexus_2048_best') || '0', 10);
    } catch (e) {
      bestScore = 0;
    }
    bestScoreEl.textContent = bestScore;
  }

  function saveBestScore() {
    try {
      localStorage.setItem('nexus_2048_best', bestScore.toString());
    } catch (e) {}
  }

  // Initialize Game
  function initGame() {
    grid = [];
    for (let r = 0; r < SIZE; r++) {
      grid[r] = [];
      for (let c = 0; c < SIZE; c++) {
        grid[r][c] = 0;
      }
    }
    score = 0;
    won = false;
    keepPlaying = false;
    previousState = null;
    hideOverlay();
    updateScoreUI(0);
    
    // Spawn 2 initial tiles
    addRandomTile();
    addRandomTile();
    renderBoard();
  }

  // Add a Random Tile (90% chance of 2, 10% chance of 4)
  function addRandomTile() {
    const emptyCells = [];
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) {
          emptyCells.push({ r, c });
        }
      }
    }
    if (emptyCells.length > 0) {
      const { r, c } = emptyCells[Math.floor(Math.random() * emptyCells.length)];
      grid[r][c] = Math.random() < 0.9 ? 2 : 4;
      return { r, c, val: grid[r][c] };
    }
    return null;
  }

  // Render Grid Tiles to DOM
  function renderBoard(newTileCoord = null, mergedCoords = []) {
    tileContainer.innerHTML = '';

    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        const val = grid[r][c];
        if (val !== 0) {
          const tile = document.createElement('div');
          const tileClass = val <= 2048 ? `tile-${val}` : 'tile-super';
          tile.className = `tile ${tileClass}`;
          tile.textContent = val;

          // Position via CSS percentage calculation
          const topPercent = (r * 25);
          const leftPercent = (c * 25);
          tile.style.top = `calc(${topPercent}% + ${r * 2}px)`;
          tile.style.left = `calc(${leftPercent}% + ${c * 2}px)`;

          // Add pop/merge/new animations
          if (newTileCoord && newTileCoord.r === r && newTileCoord.c === c) {
            tile.classList.add('tile-new');
          } else if (mergedCoords.some(m => m.r === r && m.c === c)) {
            tile.classList.add('tile-merged');
          }

          tileContainer.appendChild(tile);
        }
      }
    }
  }

  // Update Score UI
  function updateScoreUI(addedScore) {
    currentScoreEl.textContent = score;
    if (score > bestScore) {
      bestScore = score;
      bestScoreEl.textContent = bestScore;
      saveBestScore();
    }

    if (addedScore > 0) {
      scoreAdditionEl.textContent = `+${addedScore}`;
      scoreAdditionEl.classList.remove('active');
      void scoreAdditionEl.offsetWidth; // Trigger reflow
      scoreAdditionEl.classList.add('active');
    }
  }

  // Move Logic (0: up, 1: right, 2: down, 3: left)
  function move(direction) {
    if (isOverlayActive()) return false;

    // Save previous state for undo
    const oldGrid = JSON.stringify(grid);
    const oldScore = score;

    let moved = false;
    let addedScore = 0;
    const mergedCoords = [];

    // Direction vectors & rotations
    if (direction === 3) { // LEFT
      for (let r = 0; r < SIZE; r++) {
        const row = grid[r];
        const res = slideAndMergeRow(row, r, false);
        if (res.moved) moved = true;
        addedScore += res.scoreGain;
        grid[r] = res.newRow;
        res.mergedIndices.forEach(c => mergedCoords.push({ r, c }));
      }
    } else if (direction === 1) { // RIGHT
      for (let r = 0; r < SIZE; r++) {
        const row = [...grid[r]].reverse();
        const res = slideAndMergeRow(row, r, true);
        if (res.moved) moved = true;
        addedScore += res.scoreGain;
        grid[r] = res.newRow.reverse();
        res.mergedIndices.forEach(revC => {
          const c = SIZE - 1 - revC;
          mergedCoords.push({ r, c });
        });
      }
    } else if (direction === 0) { // UP
      for (let c = 0; c < SIZE; c++) {
        const col = [grid[0][c], grid[1][c], grid[2][c], grid[3][c]];
        const res = slideAndMergeRow(col, c, false);
        if (res.moved) moved = true;
        addedScore += res.scoreGain;
        for (let r = 0; r < SIZE; r++) {
          grid[r][c] = res.newRow[r];
        }
        res.mergedIndices.forEach(r => mergedCoords.push({ r, c }));
      }
    } else if (direction === 2) { // DOWN
      for (let c = 0; c < SIZE; c++) {
        const col = [grid[3][c], grid[2][c], grid[1][c], grid[0][c]];
        const res = slideAndMergeRow(col, c, true);
        if (res.moved) moved = true;
        addedScore += res.scoreGain;
        const finalCol = res.newRow.reverse();
        for (let r = 0; r < SIZE; r++) {
          grid[r][c] = finalCol[r];
        }
        res.mergedIndices.forEach(revR => {
          const r = SIZE - 1 - revR;
          mergedCoords.push({ r, c });
        });
      }
    }

    if (moved) {
      previousState = {
        grid: JSON.parse(oldGrid),
        score: oldScore
      };

      score += addedScore;
      updateScoreUI(addedScore);

      if (addedScore > 0) {
        playSound('merge');
      } else {
        playSound('slide');
      }

      const newTile = addRandomTile();
      renderBoard(newTile, mergedCoords);

      // Check Win Condition (2048)
      if (!won && !keepPlaying && hasTile(2048)) {
        won = true;
        showWinOverlay();
        return true;
      }

      // Check Game Over
      if (checkGameOver()) {
        showGameOverOverlay();
      }

      return true;
    }

    return false;
  }

  // Slide and Merge Single 1D Row
  function slideAndMergeRow(row) {
    // 1. Filter out zeros
    let nonZeros = row.filter(val => val !== 0);
    let scoreGain = 0;
    const mergedIndices = [];
    const newRow = [];

    let i = 0;
    while (i < nonZeros.length) {
      if (i + 1 < nonZeros.length && nonZeros[i] === nonZeros[i + 1]) {
        const mergedVal = nonZeros[i] * 2;
        newRow.push(mergedVal);
        scoreGain += mergedVal;
        mergedIndices.push(newRow.length - 1);
        i += 2;
      } else {
        newRow.push(nonZeros[i]);
        i++;
      }
    }

    // Fill remaining with zeros
    while (newRow.length < SIZE) {
      newRow.push(0);
    }

    // Check if row changed
    const moved = row.some((val, idx) => val !== newRow[idx]);
    return { newRow, scoreGain, moved, mergedIndices };
  }

  // Check if target tile exists
  function hasTile(target) {
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === target) return true;
      }
    }
    return false;
  }

  // Check if any valid moves remain
  function checkGameOver() {
    // 1. Check for empty cells
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE; c++) {
        if (grid[r][c] === 0) return false;
      }
    }
    // 2. Check for possible adjacent horizontal merges
    for (let r = 0; r < SIZE; r++) {
      for (let c = 0; c < SIZE - 1; c++) {
        if (grid[r][c] === grid[r][c + 1]) return false;
      }
    }
    // 3. Check for possible adjacent vertical merges
    for (let c = 0; c < SIZE; c++) {
      for (let r = 0; r < SIZE - 1; r++) {
        if (grid[r][c] === grid[r + 1][c]) return false;
      }
    }
    return true;
  }

  // Overlays (Win / Game Over)
  function showWinOverlay() {
    playSound('win');
    overlayIcon.textContent = '🏆';
    overlayTitle.textContent = 'YOU REACHED 2048!';
    overlayMsg.textContent = 'Congratulations! Keep going to reach 4096 & 8192!';
    btnKeepGoing.style.display = 'inline-flex';
    gameOverlay.classList.add('active');

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#facc15', '#38bdf8', '#fb6f99', '#4ade80']
      });
    }
  }

  function showGameOverOverlay() {
    playSound('gameover');
    overlayIcon.textContent = '💥';
    overlayTitle.textContent = 'GAME OVER!';
    overlayMsg.textContent = `No more moves left! Final score: ${score}`;
    btnKeepGoing.style.display = 'none';
    gameOverlay.classList.add('active');
  }

  function hideOverlay() {
    gameOverlay.classList.remove('active');
  }

  function isOverlayActive() {
    return gameOverlay.classList.contains('active') && !keepPlaying;
  }

  // Undo Move
  function handleUndo() {
    if (!previousState) return;
    grid = JSON.parse(JSON.stringify(previousState.grid));
    score = previousState.score;
    previousState = null;
    hideOverlay();
    updateScoreUI(0);
    renderBoard();
  }

  // Event Listeners: Keyboard Navigation
  window.addEventListener('keydown', (e) => {
    switch (e.key) {
      case 'ArrowUp':
      case 'w':
      case 'W':
        e.preventDefault();
        move(0);
        break;
      case 'ArrowRight':
      case 'd':
      case 'D':
        e.preventDefault();
        move(1);
        break;
      case 'ArrowDown':
      case 's':
      case 'S':
        e.preventDefault();
        move(2);
        break;
      case 'ArrowLeft':
      case 'a':
      case 'A':
        e.preventDefault();
        move(3);
        break;
      case 'u':
      case 'U':
        handleUndo();
        break;
      case 'r':
      case 'R':
        initGame();
        break;
    }
  });

  // Event Listeners: Touch Swipe Gesture Detection
  let touchStartX = 0;
  let touchStartY = 0;
  let touchEndX = 0;
  let touchEndY = 0;
  const MIN_SWIPE_DISTANCE = 30;

  boardGrid.addEventListener('touchstart', (e) => {
    if (e.touches.length === 1) {
      touchStartX = e.touches[0].clientX;
      touchStartY = e.touches[0].clientY;
      touchEndX = touchStartX;
      touchEndY = touchStartY;
    }
  }, { passive: false });

  boardGrid.addEventListener('touchmove', (e) => {
    // Prevent scrolling while swiping on game board
    if (e.cancelable) {
      e.preventDefault();
    }
    if (e.touches.length === 1) {
      touchEndX = e.touches[0].clientX;
      touchEndY = e.touches[0].clientY;
    }
  }, { passive: false });

  boardGrid.addEventListener('touchend', () => {
    const dx = touchEndX - touchStartX;
    const dy = touchEndY - touchStartY;
    const absDx = Math.abs(dx);
    const absDy = Math.abs(dy);

    if (Math.max(absDx, absDy) > MIN_SWIPE_DISTANCE) {
      if (absDx > absDy) {
        // Horizontal Swipe
        if (dx > 0) move(1); // Right
        else move(3);        // Left
      } else {
        // Vertical Swipe
        if (dy > 0) move(2); // Down
        else move(0);        // Up
      }
    }
  });

  // D-Pad Virtual Touch Controls
  dpadBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const dir = btn.dataset.dir;
      if (dir === 'up') move(0);
      else if (dir === 'right') move(1);
      else if (dir === 'down') move(2);
      else if (dir === 'left') move(3);
    });
  });

  // Control Buttons
  btnRestart.addEventListener('click', initGame);
  btnTryAgain.addEventListener('click', initGame);
  btnUndo.addEventListener('click', handleUndo);

  btnKeepGoing.addEventListener('click', () => {
    keepPlaying = true;
    hideOverlay();
  });

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  // Start initial game
  loadBestScore();
  initGame();
})();
