// Checkers Master 🔴⚫👑 - Full 2D Engine with Minimax Alpha-Beta AI
const BOARD_SIZE = 8;

let board = [];
let currentTurn = 'r'; // 'r' = Red (Player 1), 'b' = Black (Player 2 / Bot)
let isVsBot = true;
let botDifficulty = 4; // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Impossible
let selectedSquare = null;
let validMoves = [];
let mustMultiJump = null; // Enforces multi-jump continuation
let gameEnded = false;

// DOM Elements
const boardEl = document.getElementById('checkers-board');
const turnInfoEl = document.getElementById('turn-info');
const statusBannerEl = document.getElementById('status-banner');
const countRedEl = document.getElementById('count-red');
const countBlackEl = document.getElementById('count-black');
const btnReset = document.getElementById('btn-reset');
const btnBot = document.getElementById('btn-mode-bot');
const btn2p = document.getElementById('btn-mode-2p');
const diffContainerEl = document.getElementById('diff-container');
const diffSliderEl = document.getElementById('diff-slider');
const diffLabelEl = document.getElementById('diff-label');
const modeBadgeEl = document.getElementById('mode-badge');
const startOverlayEl = document.getElementById('start-overlay');
const btnStartEl = document.getElementById('btn-start');

const DIFF_LABELS = {
  1: 'EASY 🟢',
  2: 'MEDIUM 🟡',
  3: 'HARD 🟠',
  4: 'IMPOSSIBLE 💀'
};

function triggerConfetti() {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  }
}

function updateModeBadgeUI() {
  if (modeBadgeEl) {
    if (isVsBot) {
      modeBadgeEl.textContent = `MODE: 🤖 VS BOT (${DIFF_LABELS[botDifficulty]})`;
    } else {
      modeBadgeEl.textContent = `MODE: 👥 2-PLAYER LOCAL`;
    }
  }
}

if (btnBot && btn2p) {
  btnBot.addEventListener('click', () => setMode(true));
  btn2p.addEventListener('click', () => setMode(false));
}

if (diffSliderEl) {
  diffSliderEl.addEventListener('input', (e) => {
    botDifficulty = parseInt(e.target.value, 10);
    if (diffLabelEl) diffLabelEl.textContent = DIFF_LABELS[botDifficulty];
    updateModeBadgeUI();
  });
}

function setMode(vsBot) {
  isVsBot = vsBot;
  if (btnBot) btnBot.classList.toggle('active', vsBot);
  if (btn2p) btn2p.classList.toggle('active', !vsBot);
  if (diffContainerEl) diffContainerEl.style.display = vsBot ? 'flex' : 'none';
  updateModeBadgeUI();
}

if (btnStartEl) {
  btnStartEl.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.add('hidden');
    updateModeBadgeUI();
    initBoard();
  });
}

if (btnReset) {
  btnReset.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.remove('hidden');
  });
}

/* ==========================================================================
   BOARD INITIALIZATION & RENDER ENGINE
   ========================================================================== */

function initBoard() {
  board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Populate 12 Black pieces on rows 0, 1, 2
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { player: 'b', isKing: false };
      }
    }
  }

  // Populate 12 Red pieces on rows 5, 6, 7
  for (let r = 5; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if ((r + c) % 2 === 1) {
        board[r][c] = { player: 'r', isKing: false };
      }
    }
  }

  currentTurn = 'r';
  selectedSquare = null;
  validMoves = [];
  mustMultiJump = null;
  gameEnded = false;

  statusBannerEl.textContent = 'CLICK A RED PIECE TO SEE VALID MOVES!';
  updateHUD();
  renderBoard();
}

function updateHUD() {
  let redCount = 0, redKings = 0;
  let blackCount = 0, blackKings = 0;

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = board[r][c];
      if (p) {
        if (p.player === 'r') {
          redCount++;
          if (p.isKing) redKings++;
        } else {
          blackCount++;
          if (p.isKing) blackKings++;
        }
      }
    }
  }

  countRedEl.textContent = `${redCount} 🔴 (${redKings} 👑)`;
  countBlackEl.textContent = `${blackCount} ⚪ (${blackKings} 👑)`;

  if (gameEnded) return;

  // Check victory condition (0 pieces remaining)
  if (redCount === 0) {
    endMatch('b');
    return;
  }
  if (blackCount === 0) {
    endMatch('r');
    return;
  }

  if (currentTurn === 'r') {
    turnInfoEl.textContent = 'CURRENT TURN: RED 🔴 (PLAYER 1)';
    turnInfoEl.className = 'turn-badge red-turn';
  } else {
    if (isVsBot) {
      turnInfoEl.textContent = 'BOT IS THINKING... 🤖 (BLACK)';
      turnInfoEl.className = 'turn-badge bot-turn';
    } else {
      turnInfoEl.textContent = 'CURRENT TURN: BLACK ⚪ (PLAYER 2)';
      turnInfoEl.className = 'turn-badge black-turn';
    }
  }
}

function renderBoard() {
  boardEl.innerHTML = '';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      const isDark = (r + c) % 2 === 1;
      sq.className = `square ${isDark ? 'dark' : 'light'}`;
      sq.dataset.r = r;
      sq.dataset.c = c;

      // Selection Highlight
      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('selected');
      }

      // Valid Move Highlight
      const moveMatch = validMoves.find(m => m.tr === r && m.tc === c);
      if (moveMatch) {
        sq.classList.add(moveMatch.isCapture ? 'valid-capture' : 'valid-move');
      }

      // Render Piece
      const piece = board[r][c];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `checker-piece ${piece.player === 'r' ? 'red-piece' : 'black-piece'}`;
        if (piece.isKing) {
          pieceEl.textContent = '👑';
        }
        sq.appendChild(pieceEl);
      }

      if (isDark) {
        sq.addEventListener('click', () => handleSquareClick(r, c));
      }

      boardEl.appendChild(sq);
    }
  }
}

/* ==========================================================================
   CHECKERS MOVE & JUMP GENERATION ENGINE
   ========================================================================== */

function getValidMovesForPiece(r, c, testBoard = board) {
  const piece = testBoard[r][c];
  if (!piece) return [];

  const moves = [];
  const player = piece.player;
  const opponent = player === 'r' ? 'b' : 'r';

  // Allowed Directions
  let dirs = [];
  if (piece.isKing) {
    dirs = [[-1, -1], [-1, 1], [1, -1], [1, 1]];
  } else if (player === 'r') {
    dirs = [[-1, -1], [-1, 1]]; // Upward
  } else {
    dirs = [[1, -1], [1, 1]]; // Downward
  }

  dirs.forEach(([dr, dc]) => {
    const tr = r + dr;
    const tc = c + dc;

    // 1. Simple Move
    if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8 && !testBoard[tr][tc]) {
      moves.push({ fr: r, fc: c, tr: tr, tc: tc, isCapture: false });
    }

    // 2. Jump Capture
    const jr = r + 2 * dr;
    const jc = c + 2 * dc;
    if (jr >= 0 && jr < 8 && jc >= 0 && jc < 8) {
      const midPiece = testBoard[tr][tc];
      const targetSquare = testBoard[jr][jc];

      if (midPiece && midPiece.player === opponent && !targetSquare) {
        moves.push({
          fr: r,
          fc: c,
          tr: jr,
          tc: jc,
          isCapture: true,
          capR: tr,
          capC: tc
        });
      }
    }
  });

  return moves;
}

function getAllLegalMoves(player, testBoard = board) {
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (testBoard[r][c] && testBoard[r][c].player === player) {
        const moves = getValidMovesForPiece(r, c, testBoard);
        moves.forEach(m => allMoves.push(m));
      }
    }
  }

  // Forced Capture Rule: If any jump captures exist, player MUST make a jump capture!
  const capturesOnly = allMoves.filter(m => m.isCapture);
  return capturesOnly.length > 0 ? capturesOnly : allMoves;
}

/* ==========================================================================
   INTERACTIVITY & TURN CONTROLLER
   ========================================================================== */

function handleSquareClick(r, c) {
  if (gameEnded) return;
  if (isVsBot && currentTurn === 'b') return; // Disable during Bot turn

  const clickedPiece = board[r][c];

  // Enforce multi-jump sequence
  if (mustMultiJump) {
    if (mustMultiJump.r !== r || mustMultiJump.c !== c) {
      if (selectedSquare) {
        const moveMatch = validMoves.find(m => m.tr === r && m.tc === c);
        if (moveMatch) {
          executeMove(moveMatch);
          return;
        }
      }
      statusBannerEl.textContent = '⚠️ MULTI-JUMP REQUIRED! CONTINUE CAPTURING WITH SAME PIECE!';
      return;
    }
  }

  // 1. If clicking own piece ➔ Select piece & highlight valid moves
  if (clickedPiece && clickedPiece.player === currentTurn) {
    selectedSquare = { r, c };
    const allMoves = getAllLegalMoves(currentTurn);
    validMoves = allMoves.filter(m => m.fr === r && m.fc === c);

    if (validMoves.length === 0) {
      statusBannerEl.textContent = 'NO LEGAL MOVES FOR THIS PIECE!';
    } else {
      statusBannerEl.textContent = `SELECTED ${clickedPiece.player === 'r' ? 'RED' : 'BLACK'} ${clickedPiece.isKing ? 'KING 👑' : 'CHECKER'}`;
    }
    renderBoard();
    return;
  }

  // 2. If square was selected and clicking a valid move tile ➔ Execute move!
  if (selectedSquare) {
    const moveMatch = validMoves.find(m => m.tr === r && m.tc === c);
    if (moveMatch) {
      executeMove(moveMatch);
      return;
    }
  }

  // Clear selection
  if (!mustMultiJump) {
    selectedSquare = null;
    validMoves = [];
    renderBoard();
  }
}

function executeMove(move) {
  const { fr, fc, tr, tc, isCapture, capR, capC } = move;
  const piece = board[fr][fc];

  // Perform move
  board[tr][tc] = piece;
  board[fr][fc] = null;

  // Handle capture
  if (isCapture && capR !== undefined && capC !== undefined) {
    board[capR][capC] = null;
  }

  // King Promotion Check
  let promoted = false;
  if (!piece.isKing) {
    if ((piece.player === 'r' && tr === 0) || (piece.player === 'b' && tr === 7)) {
      piece.isKing = true;
      promoted = true;
      statusBannerEl.textContent = `👑 PIECE PROMOTED TO KING!`;
    }
  }

  // Multi-Jump Check (if jump captured and additional jumps are available)
  if (isCapture && !promoted) {
    const nextJumps = getValidMovesForPiece(tr, tc).filter(m => m.isCapture);
    if (nextJumps.length > 0) {
      mustMultiJump = { r: tr, c: tc };
      selectedSquare = { r: tr, c: tc };
      validMoves = nextJumps;
      updateHUD();
      renderBoard();
      statusBannerEl.textContent = '🔥 MULTI-JUMP AVAILABLE! KEEP CAPTURING!';

      if (isVsBot && currentTurn === 'b') {
        setTimeout(() => autoMultiJumpBot(tr, tc, nextJumps), 500);
      }
      return;
    }
  }

  mustMultiJump = null;
  selectedSquare = null;
  validMoves = [];

  // Switch Turn
  currentTurn = currentTurn === 'r' ? 'b' : 'r';
  updateHUD();
  renderBoard();

  // Check victory / stalemate
  const nextMoves = getAllLegalMoves(currentTurn);
  if (nextMoves.length === 0) {
    endMatch(currentTurn === 'r' ? 'b' : 'r');
    return;
  }

  // Trigger Bot Turn
  if (currentTurn === 'b' && isVsBot && !gameEnded) {
    setTimeout(makeBotMove, 500);
  }
}

function autoMultiJumpBot(r, c, nextJumps) {
  if (gameEnded) return;
  const choice = nextJumps[Math.floor(Math.random() * nextJumps.length)];
  executeMove(choice);
}

function endMatch(winnerPlayer) {
  gameEnded = true;
  updateHUD();
  renderBoard();

  const winnerName = winnerPlayer === 'r' ? 'RED 🔴 (PLAYER 1)' : (isVsBot ? 'BOT 🤖 (BLACK)' : 'BLACK ⚪ (PLAYER 2)');
  statusBannerEl.textContent = `🎉 GAME OVER! ${winnerName} WINS THE MATCH! 🏆`;
  statusBannerEl.className = 'status-banner win-turn';
  triggerConfetti();
}

/* ==========================================================================
   MINIMAX ALPHA-BETA BOT AI ENGINE
   ========================================================================== */

function evaluateBoard(testBoard) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const p = testBoard[r][c];
      if (p) {
        let val = p.isKing ? 18 : 10;
        // Position advancement bonus
        val += p.player === 'b' ? r : (7 - r);

        if (p.player === 'b') score += val;
        else score -= val;
      }
    }
  }
  return score;
}

function makeBotMove() {
  if (gameEnded || currentTurn !== 'b') return;

  const legalMoves = getAllLegalMoves('b');
  if (legalMoves.length === 0) {
    endMatch('r');
    return;
  }

  let bestMove = legalMoves[0];

  // Level 1: Easy - Random Choice
  if (botDifficulty === 1) {
    bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
  // Level 2: Medium - Greedy Captures & King Promotions
  else if (botDifficulty === 2) {
    let maxScore = -Infinity;
    legalMoves.forEach(m => {
      let score = m.isCapture ? 50 : 0;
      if (m.tr === 7) score += 40; // Promotion
      if (score > maxScore) {
        maxScore = score;
        bestMove = m;
      }
    });
  }
  // Level 3: Hard - 2-Ply Minimax Evaluation
  else if (botDifficulty === 3) {
    let bestVal = -Infinity;
    legalMoves.forEach(m => {
      const copyBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));
      copyBoard[m.tr][m.tc] = copyBoard[m.fr][m.fc];
      copyBoard[m.fr][m.fc] = null;
      if (m.isCapture && m.capR !== undefined) copyBoard[m.capR][m.capC] = null;

      const evalVal = evaluateBoard(copyBoard);
      if (evalVal > bestVal) {
        bestVal = evalVal;
        bestMove = m;
      }
    });
  }
  // Level 4: Impossible - Depth 4 Minimax Alpha-Beta Search
  else {
    let bestVal = -Infinity;
    legalMoves.forEach(m => {
      const copyBoard = board.map(row => row.map(cell => cell ? { ...cell } : null));
      copyBoard[m.tr][m.tc] = copyBoard[m.fr][m.fc];
      copyBoard[m.fr][m.fc] = null;
      if (m.isCapture && m.capR !== undefined) copyBoard[m.capR][m.capC] = null;

      const evalVal = minimax(copyBoard, 3, -Infinity, Infinity, false);
      if (evalVal > bestVal) {
        bestVal = evalVal;
        bestMove = m;
      }
    });
  }

  executeMove(bestMove);
}

function minimax(testBoard, depth, alpha, beta, isMaximizing) {
  if (depth === 0) return evaluateBoard(testBoard);

  if (isMaximizing) {
    let maxEval = -Infinity;
    const moves = getAllLegalMoves('b', testBoard);
    for (let m of moves) {
      const copyBoard = testBoard.map(row => row.map(cell => cell ? { ...cell } : null));
      copyBoard[m.tr][m.tc] = copyBoard[m.fr][m.fc];
      copyBoard[m.fr][m.fc] = null;
      if (m.isCapture && m.capR !== undefined) copyBoard[m.capR][m.capC] = null;

      const evalVal = minimax(copyBoard, depth - 1, alpha, beta, false);
      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    const moves = getAllLegalMoves('r', testBoard);
    for (let m of moves) {
      const copyBoard = testBoard.map(row => row.map(cell => cell ? { ...cell } : null));
      copyBoard[m.tr][m.tc] = copyBoard[m.fr][m.fc];
      copyBoard[m.fr][m.fc] = null;
      if (m.isCapture && m.capR !== undefined) copyBoard[m.capR][m.capC] = null;

      const evalVal = minimax(copyBoard, depth - 1, alpha, beta, true);
      minEval = Math.min(minEval, evalVal);
      beta = Math.min(beta, evalVal);
      if (beta <= alpha) break;
    }
    return minEval;
  }
}

/* ==========================================================================
   EVENT LISTENERS & STARTUP
   ========================================================================== */

btnReset.addEventListener('click', initBoard);
initBoard();
