/**
 * Four in a Row (Connect 4) Game Engine
 * Features: Smart Minimax AI Bot, 2P Local Mode, Audio Synthesizer, Confetti Win
 */

(function () {
  'use strict';

  // Game Constants
  const ROWS = 6;
  const COLS = 7;
  const PLAYER_RED = 1;    // Player 1 (Red)
  const PLAYER_YELLOW = 2; // Player 2 / Bot (Yellow)

  // State Variables
  let board = [];
  let currentPlayer = PLAYER_RED;
  let gameMode = 'bot';       // 'bot' | '2p'
  let difficulty = 'medium';  // 'easy' | 'medium' | 'hard'
  let isGameOver = false;
  let isAiThinking = false;
  let moveHistory = [];
  let soundEnabled = true;

  let scores = {
    p1: 0,
    p2: 0,
    draws: 0
  };

  // DOM Elements
  const gridEl = document.getElementById('connect-grid');
  const statusBannerEl = document.getElementById('status-banner');
  const statusIconEl = document.getElementById('status-icon');
  const statusTextEl = document.getElementById('status-text');
  const scoreP1El = document.getElementById('score-p1');
  const scoreP2El = document.getElementById('score-p2');
  const scoreDrawsEl = document.getElementById('score-draws');
  const nameP1El = document.getElementById('name-p1');
  const nameP2El = document.getElementById('name-p2');
  const scoreBoxP1 = document.getElementById('score-box-p1');
  const scoreBoxP2 = document.getElementById('score-box-p2');
  const btnModeBot = document.getElementById('btn-mode-bot');
  const btnMode2P = document.getElementById('btn-mode-2p');
  const difficultyGroup = document.getElementById('difficulty-group');
  const difficultySelect = document.getElementById('difficulty-select');
  const btnUndo = document.getElementById('btn-undo');
  const btnRestart = document.getElementById('btn-restart');
  const btnResetScore = document.getElementById('btn-reset-score');
  const btnSound = document.getElementById('sound-toggle-btn');
  const indicators = document.querySelectorAll('.indicator');

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
      if (type === 'drop') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(0.3, now);
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
          gain.gain.setValueAtTime(0.35, now + idx * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + idx * 0.1 + 0.25);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + idx * 0.1);
          osc.stop(now + idx * 0.1 + 0.26);
        });
      } else if (type === 'undo') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.linearRampToValueAtTime(330, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      }
    } catch (e) {
      // Audio context silently handled
    }
  }

  // Load saved scores
  function loadScores() {
    try {
      const saved = localStorage.getItem('nexus_connect4_scores');
      if (saved) {
        const parsed = JSON.parse(saved);
        scores.p1 = parsed.p1 || 0;
        scores.p2 = parsed.p2 || 0;
        scores.draws = parsed.draws || 0;
      }
    } catch (e) {}
    updateScoreboardUI();
  }

  function saveScores() {
    try {
      localStorage.setItem('nexus_connect4_scores', JSON.stringify(scores));
    } catch (e) {}
  }

  // Initialize Board
  function initBoard() {
    board = [];
    for (let r = 0; r < ROWS; r++) {
      const row = [];
      for (let c = 0; c < COLS; c++) {
        row.push(0);
      }
      board.push(row);
    }
    currentPlayer = PLAYER_RED;
    isGameOver = false;
    isAiThinking = false;
    moveHistory = [];
    renderBoardDOM();
    updateStatusUI();
    clearHoverIndicator();
  }

  // Render DOM Grid
  function renderBoardDOM() {
    gridEl.innerHTML = '';
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS; c++) {
        const cell = document.createElement('div');
        cell.className = 'cell';
        cell.dataset.row = r;
        cell.dataset.col = c;
        cell.setAttribute('role', 'button');
        cell.setAttribute('aria-label', `Column ${c + 1}, Row ${r + 1}`);

        // Click handler for column drop
        cell.addEventListener('click', () => handleColumnClick(c));
        cell.addEventListener('mouseenter', () => handleColumnHover(c));
        cell.addEventListener('mouseleave', () => clearHoverIndicator());

        gridEl.appendChild(cell);
      }
    }
  }

  // Hover Column Indicators
  function handleColumnHover(col) {
    if (isGameOver || (gameMode === 'bot' && currentPlayer === PLAYER_YELLOW) || isAiThinking) {
      clearHoverIndicator();
      return;
    }
    indicators.forEach((ind, i) => {
      ind.className = 'indicator';
      if (i === col && getLowestEmptyRow(col) !== -1) {
        ind.classList.add(currentPlayer === PLAYER_RED ? 'show-p1' : 'show-p2');
      }
    });
  }

  function clearHoverIndicator() {
    indicators.forEach(ind => {
      ind.className = 'indicator';
    });
  }

  // Find lowest available row in column
  function getLowestEmptyRow(col, customBoard = board) {
    for (let r = ROWS - 1; r >= 0; r--) {
      if (customBoard[r][col] === 0) {
        return r;
      }
    }
    return -1;
  }

  // Handle Player Column Click
  function handleColumnClick(col) {
    if (isGameOver || isAiThinking) return;
    if (gameMode === 'bot' && currentPlayer === PLAYER_YELLOW) return;

    makeMove(col);
  }

  // Make a Move
  function makeMove(col) {
    const row = getLowestEmptyRow(col);
    if (row === -1) return false; // Column is full

    board[row][col] = currentPlayer;
    moveHistory.push({ row, col, player: currentPlayer });
    playSound('drop');

    // Update DOM cell with drop animation
    const cellIndex = row * COLS + col;
    const cell = gridEl.children[cellIndex];
    if (cell) {
      cell.innerHTML = '';
      const disc = document.createElement('div');
      disc.className = `disc ${currentPlayer === PLAYER_RED ? 'red' : 'yellow'} drop-anim`;
      cell.appendChild(disc);
    }

    // Check Win Condition
    const winResult = checkWin(board, currentPlayer);
    if (winResult) {
      handleGameOver('win', winResult);
      return true;
    }

    // Check Draw Condition
    if (checkDraw(board)) {
      handleGameOver('draw');
      return true;
    }

    // Switch Player Turn
    currentPlayer = currentPlayer === PLAYER_RED ? PLAYER_YELLOW : PLAYER_RED;
    updateStatusUI();
    clearHoverIndicator();

    // Trigger AI if in Bot Mode
    if (!isGameOver && gameMode === 'bot' && currentPlayer === PLAYER_YELLOW) {
      triggerAiMove();
    }

    return true;
  }

  // Trigger AI Move
  function triggerAiMove() {
    isAiThinking = true;
    updateStatusUI();

    const thinkDelay = difficulty === 'easy' ? 350 : (difficulty === 'medium' ? 500 : 650);

    setTimeout(() => {
      if (isGameOver) {
        isAiThinking = false;
        return;
      }
      const aiCol = calculateAiMove();
      isAiThinking = false;
      if (aiCol !== null && aiCol !== -1) {
        makeMove(aiCol);
      }
    }, thinkDelay);
  }

  // AI Decision Logic
  function calculateAiMove() {
    const validCols = [];
    for (let c = 0; c < COLS; c++) {
      if (getLowestEmptyRow(c) !== -1) {
        validCols.push(c);
      }
    }
    if (validCols.length === 0) return null;

    // 1. Instant Win Check
    for (let c of validCols) {
      const r = getLowestEmptyRow(c);
      board[r][c] = PLAYER_YELLOW;
      if (checkWin(board, PLAYER_YELLOW)) {
        board[r][c] = 0;
        return c;
      }
      board[r][c] = 0;
    }

    // 2. Instant Opponent Block Check
    for (let c of validCols) {
      const r = getLowestEmptyRow(c);
      board[r][c] = PLAYER_RED;
      if (checkWin(board, PLAYER_RED)) {
        board[r][c] = 0;
        return c;
      }
      board[r][c] = 0;
    }

    // Easy: Random pick with center bias
    if (difficulty === 'easy') {
      // 30% center column bias, else random
      if (validCols.includes(3) && Math.random() < 0.35) return 3;
      return validCols[Math.floor(Math.random() * validCols.length)];
    }

    // Medium: 2-ply evaluation
    if (difficulty === 'medium') {
      let bestScore = -Infinity;
      let bestCol = validCols[0];
      for (let c of validCols) {
        const r = getLowestEmptyRow(c);
        board[r][c] = PLAYER_YELLOW;
        const score = evaluateBoard(board) - (Math.abs(3 - c) * 3);
        board[r][c] = 0;
        if (score > bestScore) {
          bestScore = score;
          bestCol = c;
        }
      }
      return bestCol;
    }

    // Hard / Master: Minimax with Alpha-Beta Pruning (Depth 5)
    let bestCol = validCols[0];
    let maxEval = -Infinity;
    const depth = 5;

    // Sort columns center-outward for better alpha-beta cutoffs
    const sortedCols = [3, 2, 4, 1, 5, 0, 6].filter(c => validCols.includes(c));

    for (let c of sortedCols) {
      const r = getLowestEmptyRow(c);
      board[r][c] = PLAYER_YELLOW;
      const evaluation = minimax(board, depth - 1, -Infinity, Infinity, false);
      board[r][c] = 0;

      if (evaluation > maxEval) {
        maxEval = evaluation;
        bestCol = c;
      }
    }
    return bestCol;
  }

  // Minimax Algorithm with Alpha-Beta Pruning
  function minimax(currentBoard, depth, alpha, beta, isMaximizing) {
    if (checkWin(currentBoard, PLAYER_YELLOW)) return 10000 + depth;
    if (checkWin(currentBoard, PLAYER_RED)) return -10000 - depth;
    if (checkDraw(currentBoard) || depth === 0) return evaluateBoard(currentBoard);

    const validCols = [3, 2, 4, 1, 5, 0, 6].filter(c => getLowestEmptyRow(c, currentBoard) !== -1);

    if (isMaximizing) {
      let maxEval = -Infinity;
      for (let c of validCols) {
        const r = getLowestEmptyRow(c, currentBoard);
        currentBoard[r][c] = PLAYER_YELLOW;
        const ev = minimax(currentBoard, depth - 1, alpha, beta, false);
        currentBoard[r][c] = 0;
        maxEval = Math.max(maxEval, ev);
        alpha = Math.max(alpha, ev);
        if (beta <= alpha) break;
      }
      return maxEval;
    } else {
      let minEval = Infinity;
      for (let c of validCols) {
        const r = getLowestEmptyRow(c, currentBoard);
        currentBoard[r][c] = PLAYER_RED;
        const ev = minimax(currentBoard, depth - 1, alpha, beta, true);
        currentBoard[r][c] = 0;
        minEval = Math.min(minEval, ev);
        beta = Math.min(beta, ev);
        if (beta <= alpha) break;
      }
      return minEval;
    }
  }

  // Board Evaluation Heuristic
  function evaluateBoard(b) {
    let score = 0;
    // Center column weight
    for (let r = 0; r < ROWS; r++) {
      if (b[r][3] === PLAYER_YELLOW) score += 6;
      else if (b[r][3] === PLAYER_RED) score -= 6;
    }

    // Windows of 4 evaluation
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += evaluateWindow([b[r][c], b[r][c+1], b[r][c+2], b[r][c+3]]);
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        score += evaluateWindow([b[r][c], b[r+1][c], b[r+2][c], b[r+3][c]]);
      }
    }
    // Diagonal \
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += evaluateWindow([b[r][c], b[r+1][c+1], b[r+2][c+2], b[r+3][c+3]]);
      }
    }
    // Diagonal /
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        score += evaluateWindow([b[r][c], b[r-1][c+1], b[r-2][c+2], b[r-3][c+3]]);
      }
    }
    return score;
  }

  function evaluateWindow(window) {
    let score = 0;
    const yellowCount = window.filter(cell => cell === PLAYER_YELLOW).length;
    const redCount = window.filter(cell => cell === PLAYER_RED).length;
    const emptyCount = window.filter(cell => cell === 0).length;

    if (yellowCount === 4) score += 1000;
    else if (yellowCount === 3 && emptyCount === 1) score += 20;
    else if (yellowCount === 2 && emptyCount === 2) score += 5;

    if (redCount === 4) score -= 1000;
    else if (redCount === 3 && emptyCount === 1) score -= 40;
    else if (redCount === 2 && emptyCount === 2) score -= 8;

    return score;
  }

  // Check 4 in a row victory
  function checkWin(b, player) {
    // Horizontal
    for (let r = 0; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r][c+1] === player && b[r][c+2] === player && b[r][c+3] === player) {
          return [{r, c}, {r, c: c+1}, {r, c: c+2}, {r, c: c+3}];
        }
      }
    }
    // Vertical
    for (let c = 0; c < COLS; c++) {
      for (let r = 0; r < ROWS - 3; r++) {
        if (b[r][c] === player && b[r+1][c] === player && b[r+2][c] === player && b[r+3][c] === player) {
          return [{r, c}, {r: r+1, c}, {r: r+2, c}, {r: r+3, c}];
        }
      }
    }
    // Diagonal \
    for (let r = 0; r < ROWS - 3; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r+1][c+1] === player && b[r+2][c+2] === player && b[r+3][c+3] === player) {
          return [{r, c}, {r: r+1, c: c+1}, {r: r+2, c: c+2}, {r: r+3, c: c+3}];
        }
      }
    }
    // Diagonal /
    for (let r = 3; r < ROWS; r++) {
      for (let c = 0; c < COLS - 3; c++) {
        if (b[r][c] === player && b[r-1][c+1] === player && b[r-2][c+2] === player && b[r-3][c+3] === player) {
          return [{r, c}, {r: r-1, c: c+1}, {r: r-2, c: c+2}, {r: r-3, c: c+3}];
        }
      }
    }
    return null;
  }

  // Check Draw
  function checkDraw(b) {
    for (let c = 0; c < COLS; c++) {
      if (b[0][c] === 0) return false;
    }
    return true;
  }

  // Handle Game Over
  function handleGameOver(result, winCells = null) {
    isGameOver = true;
    statusBannerEl.className = 'status-banner';

    if (result === 'win') {
      playSound('win');
      if (winCells) {
        winCells.forEach(({ r, c }) => {
          const idx = r * COLS + c;
          if (gridEl.children[idx]) {
            gridEl.children[idx].classList.add('win-highlight');
          }
        });
      }

      if (currentPlayer === PLAYER_RED) {
        scores.p1++;
        statusBannerEl.classList.add('winner-red');
        statusIconEl.textContent = '🏆';
        statusTextEl.textContent = `${gameMode === 'bot' ? 'YOU WON!' : 'PLAYER 1 WINS!'}`;
        triggerConfetti('#ef4444');
      } else {
        scores.p2++;
        statusBannerEl.classList.add('winner-yellow');
        statusIconEl.textContent = '🏆';
        statusTextEl.textContent = `${gameMode === 'bot' ? 'BOT WINS!' : 'PLAYER 2 WINS!'}`;
        triggerConfetti('#facc15');
      }
    } else {
      scores.draws++;
      statusBannerEl.classList.add('tie');
      statusIconEl.textContent = '🤝';
      statusTextEl.textContent = "IT'S A DRAW!";
    }

    saveScores();
    updateScoreboardUI();
  }

  // Confetti Animation
  function triggerConfetti(mainColor) {
    if (typeof confetti === 'function') {
      confetti({
        particleCount: 70,
        spread: 70,
        origin: { y: 0.6 },
        colors: [mainColor, '#38bdf8', '#fb6f99', '#ffffff']
      });
    }
  }

  // Update Status Banner UI
  function updateStatusUI() {
    if (isGameOver) return;
    statusBannerEl.className = 'status-banner';

    scoreBoxP1.classList.toggle('active-turn', currentPlayer === PLAYER_RED);
    scoreBoxP2.classList.toggle('active-turn', currentPlayer === PLAYER_YELLOW);

    if (isAiThinking) {
      statusIconEl.textContent = '🤖';
      statusTextEl.textContent = 'BOT IS THINKING...';
    } else if (currentPlayer === PLAYER_RED) {
      statusIconEl.textContent = '🔴';
      statusTextEl.textContent = `${gameMode === 'bot' ? 'YOUR TURN (RED)' : "PLAYER 1'S TURN"}`;
    } else {
      statusIconEl.textContent = '🟡';
      statusTextEl.textContent = `${gameMode === 'bot' ? "BOT'S TURN (YELLOW)" : "PLAYER 2'S TURN"}`;
    }
  }

  // Update Scoreboard UI
  function updateScoreboardUI() {
    scoreP1El.textContent = scores.p1;
    scoreP2El.textContent = scores.p2;
    scoreDrawsEl.textContent = scores.draws;
  }

  // Undo Move
  function handleUndo() {
    if (isAiThinking || moveHistory.length === 0) return;

    if (isGameOver) {
      // Allow undo after game over
      isGameOver = false;
      document.querySelectorAll('.win-highlight').forEach(el => el.classList.remove('win-highlight'));
    }

    // In Bot mode, undo 2 moves (both Bot and Player)
    const movesToUndo = (gameMode === 'bot' && moveHistory.length >= 2) ? 2 : 1;

    for (let i = 0; i < movesToUndo; i++) {
      if (moveHistory.length > 0) {
        const lastMove = moveHistory.pop();
        board[lastMove.row][lastMove.col] = 0;
        const cellIndex = lastMove.row * COLS + lastMove.col;
        if (gridEl.children[cellIndex]) {
          gridEl.children[cellIndex].innerHTML = '';
        }
        currentPlayer = lastMove.player;
      }
    }

    playSound('undo');
    updateStatusUI();
    clearHoverIndicator();
  }

  // Reset Scores
  function handleResetScores() {
    if (confirm('Clear all win and draw scores?')) {
      scores = { p1: 0, p2: 0, draws: 0 };
      saveScores();
      updateScoreboardUI();
    }
  }

  // Set Game Mode
  function setGameMode(mode) {
    gameMode = mode;
    btnModeBot.classList.toggle('active', mode === 'bot');
    btnMode2P.classList.toggle('active', mode === '2p');
    difficultyGroup.style.display = mode === 'bot' ? 'flex' : 'none';

    if (mode === 'bot') {
      nameP1El.textContent = 'YOU (P1)';
      nameP2El.textContent = 'BOT (AI)';
    } else {
      nameP1El.textContent = 'PLAYER 1';
      nameP2El.textContent = 'PLAYER 2';
    }

    initBoard();
  }

  // Event Listeners
  btnModeBot.addEventListener('click', () => setGameMode('bot'));
  btnMode2P.addEventListener('click', () => setGameMode('2p'));
  difficultySelect.addEventListener('change', (e) => {
    difficulty = e.target.value;
    initBoard();
  });

  btnUndo.addEventListener('click', handleUndo);
  btnRestart.addEventListener('click', initBoard);
  btnResetScore.addEventListener('click', handleResetScores);

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  // Global Keyboard Shortcuts
  window.addEventListener('keydown', (e) => {
    if (e.key >= '1' && e.key <= '7') {
      const colIndex = parseInt(e.key, 10) - 1;
      handleColumnClick(colIndex);
    } else if (e.key.toLowerCase() === 'u') {
      handleUndo();
    } else if (e.key.toLowerCase() === 'r') {
      initBoard();
    }
  });

  // Start initial game
  loadScores();
  setGameMode('bot');
})();
