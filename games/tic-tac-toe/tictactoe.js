// Tic Tac Toe Logic with First-to-5 Points Match Engine
const TARGET_WIN_POINTS = 5;

let board = Array(9).fill('');
let currentPlayer = 'X';
let isVsBot = true;
let isGameActive = false;
let botDifficulty = 4; // 1: EASY, 2: MEDIUM, 3: HARD, 4: IMPOSSIBLE
let autoNextRoundTimer = null;

let scoreX = 0;
let scoreO = 0;
let scoreDraw = 0;

const WIN_COMBOS = [
  [0, 1, 2], [3, 4, 5], [6, 7, 8],
  [0, 3, 6], [1, 4, 7], [2, 5, 8],
  [0, 4, 8], [2, 4, 6]
];

const DIFF_NAMES = {
  1: 'EASY 🟢',
  2: 'MEDIUM 🟡',
  3: 'HARD 🔴',
  4: 'IMPOSSIBLE 💀'
};

function triggerConfetti() {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
  }
}

const cells = document.querySelectorAll('.cell');
const btnBot = document.getElementById('btn-mode-bot');
const btn2p = document.getElementById('btn-mode-2p');
const btnStart = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');
const diffContainer = document.getElementById('diff-container');
const diffSlider = document.getElementById('diff-slider');
const diffLabel = document.getElementById('diff-label');
const statusBanner = document.getElementById('status-banner');
const modeBadgeEl = document.getElementById('mode-badge');
const startOverlayEl = document.getElementById('start-overlay');

function updateModeBadgeUI() {
  if (modeBadgeEl) {
    if (isVsBot) {
      modeBadgeEl.textContent = `MODE: 🤖 VS BOT (${DIFF_NAMES[botDifficulty]})`;
    } else {
      modeBadgeEl.textContent = `MODE: 👥 2-PLAYER LOCAL`;
    }
  }
}

// Mode Switch
if (btnBot && btn2p) {
  btnBot.addEventListener('click', () => setMode(true));
  btn2p.addEventListener('click', () => setMode(false));
}

function setMode(vsBot) {
  isVsBot = vsBot;
  if (btnBot) btnBot.classList.toggle('active', vsBot);
  if (btn2p) btn2p.classList.toggle('active', !vsBot);
  if (diffContainer) diffContainer.style.display = vsBot ? 'flex' : 'none';
  updateModeBadgeUI();
}

// Difficulty Slider Event
if (diffSlider) {
  diffSlider.addEventListener('input', (e) => {
    botDifficulty = Number(e.target.value);
    if (diffLabel) diffLabel.textContent = DIFF_NAMES[botDifficulty];
    updateModeBadgeUI();
  });
}

// Start & Reset Buttons
if (btnStart) {
  btnStart.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.add('hidden');
    updateModeBadgeUI();
    resetFullMatch();
    startNextRound();
  });
}

if (btnReset) {
  btnReset.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.remove('hidden');
  });
}

function handleStartBtnClick() {
  if (scoreX >= TARGET_WIN_POINTS || scoreO >= TARGET_WIN_POINTS || !isGameActive) {
    resetFullMatch();
    startNextRound();
  }
}

function resetFullMatch() {
  if (autoNextRoundTimer) clearTimeout(autoNextRoundTimer);
  scoreX = 0;
  scoreO = 0;
  scoreDraw = 0;
  updateScores();
  btnStart.textContent = '▶️ START GAME';

  board = Array(9).fill('');
  currentPlayer = 'X';
  isGameActive = false;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });

  statusBanner.textContent = 'CLICK "START GAME" TO BEGIN 5-POINT MATCH!';
  statusBanner.style.color = 'var(--gold)';
}

function startNextRound() {
  if (autoNextRoundTimer) clearTimeout(autoNextRoundTimer);
  board = Array(9).fill('');
  currentPlayer = 'X';
  isGameActive = true;

  cells.forEach(cell => {
    cell.textContent = '';
    cell.className = 'cell';
  });

  statusBanner.textContent = `ROUND STARTED! PLAYER ${currentPlayer}'S TURN!`;
  statusBanner.style.color = 'var(--pink)';
}

// Cell Tap Handler (PC Mouse + Mobile Touch)
function handleCellTap(idx) {
  if (!isGameActive) {
    if (scoreX >= TARGET_WIN_POINTS || scoreO >= TARGET_WIN_POINTS) {
      statusBanner.textContent = '🏆 MATCH OVER! CLICK "START NEW MATCH"!';
    } else {
      statusBanner.textContent = '⚠️ CLICK "START GAME" FIRST!';
    }
    statusBanner.style.color = 'var(--gold)';
    return;
  }

  if (board[idx] === '' && (currentPlayer === 'X' || !isVsBot)) {
    makeMove(idx, currentPlayer);

    if (isGameActive && isVsBot && currentPlayer === 'O') {
      statusBanner.textContent = 'BOT IS THINKING... 🤖';
      statusBanner.style.color = 'var(--cyan)';
      setTimeout(makeBotMove, 250);
    }
  }
}

cells.forEach(cell => {
  const idx = Number(cell.dataset.idx);
  cell.addEventListener('click', () => handleCellTap(idx));
  cell.addEventListener('touchstart', (e) => {
    e.preventDefault();
    handleCellTap(idx);
  }, { passive: false });
});

function makeMove(idx, player) {
  board[idx] = player;
  const cell = cells[idx];
  cell.textContent = player;
  cell.classList.add(player.toLowerCase());

  const winCombo = checkWin(board, player);
  if (winCombo) {
    isGameActive = false;
    winCombo.forEach(i => cells[i].classList.add('win'));

    if (player === 'X') scoreX++; else scoreO++;
    updateScores();

    // Check if either player reached 5 points (Ultimate Match Winner)
    if (scoreX >= TARGET_WIN_POINTS || scoreO >= TARGET_WIN_POINTS) {
      const winnerName = (player === 'X') ? 'PLAYER (X)' : (isVsBot ? 'BOT 🤖' : 'OPPONENT (O)');
      statusBanner.textContent = `🏆 ULTIMATE CHAMPION! ${winnerName} WON THE 5-POINT MATCH! 🥳🎉`;
      statusBanner.style.color = 'var(--emerald)';
      triggerConfetti();
      btnStart.textContent = '▶️ START NEW MATCH';
      return;
    }

    // Auto next round in 1.8 seconds
    statusBanner.textContent = `🎉 ROUND WON BY ${player}! NEXT ROUND IN 2s...`;
    statusBanner.style.color = 'var(--gold)';
    triggerConfetti();

    autoNextRoundTimer = setTimeout(() => {
      startNextRound();
    }, 1800);
    return;
  }

  if (board.every(c => c !== '')) {
    isGameActive = false;
    scoreDraw++;
    updateScores();
    statusBanner.textContent = "🤝 ROUND DRAW! NEXT ROUND IN 2s...";
    statusBanner.style.color = '#cbd5e1';

    autoNextRoundTimer = setTimeout(() => {
      startNextRound();
    }, 1800);
    return;
  }

  currentPlayer = player === 'X' ? 'O' : 'X';
  statusBanner.textContent = `PLAYER ${currentPlayer}'S TURN!`;
  statusBanner.style.color = currentPlayer === 'X' ? 'var(--pink)' : 'var(--cyan)';
}

// Bot AI with 4 Difficulty Levels
function makeBotMove() {
  if (!isGameActive) return;
  const availSpots = board.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);
  if (availSpots.length === 0) return;

  let moveIdx;
  const roll = Math.random();

  if (botDifficulty === 1 && roll < 0.7) {
    moveIdx = availSpots[Math.floor(Math.random() * availSpots.length)];
  } else if (botDifficulty === 2 && roll < 0.4) {
    moveIdx = availSpots[Math.floor(Math.random() * availSpots.length)];
  } else if (botDifficulty === 3 && roll < 0.15) {
    moveIdx = availSpots[Math.floor(Math.random() * availSpots.length)];
  } else {
    if (availSpots.length >= 8) {
      const centerOrCorner = [4, 0, 2, 6, 8].filter(i => board[i] === '');
      moveIdx = centerOrCorner[Math.floor(Math.random() * centerOrCorner.length)];
    } else {
      moveIdx = minimax(board, 'O', 0, -1000, 1000).index;
    }
  }

  makeMove(moveIdx, 'O');
}

// Alpha-Beta Minimax
function minimax(newBoard, player, depth, alpha, beta) {
  const availSpots = newBoard.map((val, idx) => val === '' ? idx : null).filter(val => val !== null);

  if (checkWin(newBoard, 'X')) return { score: -10 + depth };
  if (checkWin(newBoard, 'O')) return { score: 10 - depth };
  if (availSpots.length === 0 || depth >= 6) return { score: 0 };

  if (player === 'O') {
    let bestScore = -10000;
    let bestMove;
    for (let i = 0; i < availSpots.length; i++) {
      const idx = availSpots[i];
      newBoard[idx] = 'O';
      const result = minimax(newBoard, 'X', depth + 1, alpha, beta);
      newBoard[idx] = '';

      if (result.score > bestScore) {
        bestScore = result.score;
        bestMove = idx;
      }
      alpha = Math.max(alpha, bestScore);
      if (beta <= alpha) break;
    }
    return { index: bestMove, score: bestScore };
  } else {
    let bestScore = 10000;
    let bestMove;
    for (let i = 0; i < availSpots.length; i++) {
      const idx = availSpots[i];
      newBoard[idx] = 'X';
      const result = minimax(newBoard, 'O', depth + 1, alpha, beta);
      newBoard[idx] = '';

      if (result.score < bestScore) {
        bestScore = result.score;
        bestMove = idx;
      }
      beta = Math.min(beta, bestScore);
      if (beta <= alpha) break;
    }
    return { index: bestMove, score: bestScore };
  }
}

function checkWin(b, p) {
  for (let combo of WIN_COMBOS) {
    if (b[combo[0]] === p && b[combo[1]] === p && b[combo[2]] === p) {
      return combo;
    }
  }
  return null;
}

function updateScores() {
  document.getElementById('score-x').textContent = scoreX;
  document.getElementById('score-o').textContent = scoreO;
  document.getElementById('score-draw').textContent = scoreDraw;
}

resetFullMatch();
