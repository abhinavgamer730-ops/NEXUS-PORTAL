// Chess Master ♟️👑 - Full 2D Engine with Minimax Alpha-Beta AI
const BOARD_SIZE = 8;
const PIECE_GLYPHS = {
  w: { p: '♙', r: '♖', n: '♘', b: '♗', q: '♕', k: '♔' },
  b: { p: '♟', r: '♜', n: '♞', b: '♝', q: '♛', k: '♚' }
};

const PIECE_VALUES = {
  p: 10,
  n: 30,
  b: 30,
  r: 50,
  q: 90,
  k: 1000
};

// Position Square Tables (Center dominance & development bonus)
const PAWN_TABLE = [
  [0,  0,  0,  0,  0,  0,  0,  0],
  [5, 10, 10,-20,-20, 10, 10,  5],
  [1,  2,  3,  5,  5,  3,  2,  1],
  [0,  0,  4,  7,  7,  4,  0,  0],
  [0,  0,  4,  7,  7,  4,  0,  0],
  [1, -1, -2,  0,  0, -2, -1,  1],
  [1,  2,  2,-20,-20,  2,  2,  1],
  [0,  0,  0,  0,  0,  0,  0,  0]
];

const KNIGHT_TABLE = [
  [-10,-5,-5,-5,-5,-5,-5,-10],
  [ -5, 0, 0, 3, 3, 0, 0, -5],
  [ -5, 0, 5, 5, 5, 5, 0, -5],
  [ -5, 0, 5, 8, 8, 5, 0, -5],
  [ -5, 0, 5, 8, 8, 5, 0, -5],
  [ -5, 0, 5, 5, 5, 5, 0, -5],
  [ -5, 0, 0, 3, 3, 0, 0, -5],
  [-10,-5,-5,-5,-5,-5,-5,-10]
];

// Game State Variables
let board = [];
let currentTurn = 'w'; // 'w' = White (Player 1), 'b' = Black (Player 2 / Bot)
let isVsBot = true;
let botDifficulty = 4; // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Impossible
let selectedSquare = null;
let validMoves = [];
let capturedWhite = [];
let capturedBlack = [];
let gameEnded = false;

// DOM Elements
const chessboardEl = document.getElementById('chessboard');
const turnInfoEl = document.getElementById('turn-info');
const statusBannerEl = document.getElementById('status-banner');
const capturedWhiteEl = document.getElementById('captured-white');
const capturedBlackEl = document.getElementById('captured-black');
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
   CHESS BOARD INITIALIZATION & RENDER ENGINE
   ========================================================================== */

function initBoard() {
  board = Array(8).fill(null).map(() => Array(8).fill(null));

  // Black Pieces (Top R0..R1)
  const backRankB = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    board[0][c] = { type: backRankB[c], color: 'b' };
    board[1][c] = { type: 'p', color: 'b' };
  }

  // White Pieces (Bottom R6..R7)
  const backRankW = ['r', 'n', 'b', 'q', 'k', 'b', 'n', 'r'];
  for (let c = 0; c < 8; c++) {
    board[6][c] = { type: 'p', color: 'w' };
    board[7][c] = { type: backRankW[c], color: 'w' };
  }

  currentTurn = 'w';
  selectedSquare = null;
  validMoves = [];
  capturedWhite = [];
  capturedBlack = [];
  gameEnded = false;

  statusBannerEl.textContent = 'CLICK A PIECE TO SEE VALID MOVES & PLAY!';
  updateHUD();
  renderBoard();
}

function updateHUD() {
  capturedWhiteEl.textContent = capturedWhite.join(' ');
  capturedBlackEl.textContent = capturedBlack.join(' ');

  if (gameEnded) return;

  if (currentTurn === 'w') {
    turnInfoEl.textContent = 'CURRENT TURN: WHITE ♔ (PLAYER 1)';
    turnInfoEl.className = 'turn-badge white-turn';
  } else {
    if (isVsBot) {
      turnInfoEl.textContent = 'BOT IS THINKING... 🤖 (BLACK)';
      turnInfoEl.className = 'turn-badge bot-turn';
    } else {
      turnInfoEl.textContent = 'CURRENT TURN: BLACK ♚ (PLAYER 2)';
      turnInfoEl.className = 'turn-badge black-turn';
    }
  }
}

function renderBoard() {
  chessboardEl.innerHTML = '';

  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const sq = document.createElement('div');
      const isLight = (r + c) % 2 === 0;
      sq.className = `square ${isLight ? 'light' : 'dark'}`;
      sq.dataset.r = r;
      sq.dataset.c = c;

      // Selection Highlight
      if (selectedSquare && selectedSquare.r === r && selectedSquare.c === c) {
        sq.classList.add('selected');
      }

      // Valid Move Highlight
      const moveMatch = validMoves.find(m => m.r === r && m.c === c);
      if (moveMatch) {
        sq.classList.add(moveMatch.isCapture ? 'valid-capture' : 'valid-move');
      }

      // Render Piece Glyph
      const piece = board[r][c];
      if (piece) {
        const pieceEl = document.createElement('div');
        pieceEl.className = `piece ${piece.color === 'w' ? 'white-p' : 'black-p'}`;
        pieceEl.textContent = PIECE_GLYPHS[piece.color][piece.type];
        sq.appendChild(pieceEl);
      }

      sq.addEventListener('click', () => handleSquareClick(r, c));
      chessboardEl.appendChild(sq);
    }
  }
}

/* ==========================================================================
   LEGAL MOVE GENERATION ENGINE
   ========================================================================== */

function getLegalMoves(r, c, testBoard = board) {
  const piece = testBoard[r][c];
  if (!piece) return [];

  const moves = [];
  const color = piece.color;
  const enemyColor = color === 'w' ? 'b' : 'w';

  function addMove(tr, tc) {
    if (tr < 0 || tr >= 8 || tc < 0 || tc >= 8) return false;
    const target = testBoard[tr][tc];
    if (!target) {
      moves.push({ r: tr, c: tc, isCapture: false });
      return true; // Continue sliding
    } else if (target.color === enemyColor) {
      moves.push({ r: tr, c: tc, isCapture: true });
      return false; // Blocked after capture
    }
    return false; // Blocked by friendly piece
  }

  // 1. PAWNS
  if (piece.type === 'p') {
    const dir = color === 'w' ? -1 : 1;
    const startRank = color === 'w' ? 6 : 1;

    // Forward 1
    if (r + dir >= 0 && r + dir < 8 && !testBoard[r + dir][c]) {
      moves.push({ r: r + dir, c: c, isCapture: false });
      // Forward 2 from start rank
      if (r === startRank && !testBoard[r + 2 * dir][c]) {
        moves.push({ r: r + 2 * dir, c: c, isCapture: false });
      }
    }

    // Diagonal Captures
    [-1, 1].forEach(dc => {
      const tr = r + dir;
      const tc = c + dc;
      if (tr >= 0 && tr < 8 && tc >= 0 && tc < 8) {
        const target = testBoard[tr][tc];
        if (target && target.color === enemyColor) {
          moves.push({ r: tr, c: tc, isCapture: true });
        }
      }
    });
  }

  // 2. ROOKS
  if (piece.type === 'r' || piece.type === 'q') {
    [[-1, 0], [1, 0], [0, -1], [0, 1]].forEach(([dr, dc]) => {
      let step = 1;
      while (addMove(r + dr * step, c + dc * step)) {
        step++;
      }
    });
  }

  // 3. KNIGHTS
  if (piece.type === 'n') {
    [[-2,-1], [-2,1], [-1,-2], [-1,2], [1,-2], [1,2], [2,-1], [2,1]].forEach(([dr, dc]) => {
      addMove(r + dr, c + dc);
    });
  }

  // 4. BISHOPS
  if (piece.type === 'b' || piece.type === 'q') {
    [[-1, -1], [-1, 1], [1, -1], [1, 1]].forEach(([dr, dc]) => {
      let step = 1;
      while (addMove(r + dr * step, c + dc * step)) {
        step++;
      }
    });
  }

  // 5. KINGS
  if (piece.type === 'k') {
    [[-1,-1], [-1,0], [-1,1], [0,-1], [0,1], [1,-1], [1,0], [1,1]].forEach(([dr, dc]) => {
      addMove(r + dr, c + dc);
    });
  }

  return moves;
}

/* ==========================================================================
   INTERACTIVITY & TURN CONTROLLER
   ========================================================================== */

function handleSquareClick(r, c) {
  if (gameEnded) return;
  if (isVsBot && currentTurn === 'b') return; // Disable clicking during Bot turn

  const clickedPiece = board[r][c];

  // 1. If clicking own piece ➔ Select piece & highlight legal moves
  if (clickedPiece && clickedPiece.color === currentTurn) {
    selectedSquare = { r, c };
    validMoves = getLegalMoves(r, c);
    statusBannerEl.textContent = `SELECTED ${clickedPiece.color === 'w' ? 'WHITE' : 'BLACK'} ${clickedPiece.type.toUpperCase()}`;
    renderBoard();
    return;
  }

  // 2. If square was selected and clicking a valid move tile ➔ Execute move!
  if (selectedSquare) {
    const moveMatch = validMoves.find(m => m.r === r && m.c === c);
    if (moveMatch) {
      executeMove(selectedSquare.r, selectedSquare.c, r, c);
      selectedSquare = null;
      validMoves = [];
      return;
    }
  }

  // Clear selection if clicking empty or invalid tile
  selectedSquare = null;
  validMoves = [];
  renderBoard();
}

function executeMove(fr, fc, tr, tc) {
  const movingPiece = board[fr][fc];
  const targetPiece = board[tr][tc];

  // Record capture
  if (targetPiece) {
    const glyph = PIECE_GLYPHS[targetPiece.color][targetPiece.type];
    if (targetPiece.color === 'w') capturedWhite.push(glyph);
    else capturedBlack.push(glyph);
  }

  // Execute board state mutation
  board[tr][tc] = movingPiece;
  board[fr][fc] = null;

  // Pawn Promotion (Auto-promote to Queen at end rank)
  if (movingPiece.type === 'p') {
    if ((movingPiece.color === 'w' && tr === 0) || (movingPiece.color === 'b' && tr === 7)) {
      movingPiece.type = 'q';
    }
  }

  // King Victory Check
  if (targetPiece && targetPiece.type === 'k') {
    gameEnded = true;
    updateHUD();
    renderBoard();
    const winner = movingPiece.color === 'w' ? 'WHITE ♔' : 'BLACK ♚';
    statusBannerEl.textContent = `🎉 CHECKMATE! ${winner} WINS THE MATCH! 🏆`;
    triggerConfetti();
    return;
  }

  // Switch Turn
  currentTurn = currentTurn === 'w' ? 'b' : 'w';
  updateHUD();
  renderBoard();

  // Trigger Bot Turn if turn === 'b' & isVsBot
  if (currentTurn === 'b' && isVsBot && !gameEnded) {
    setTimeout(makeBotMove, 500);
  }
}

/* ==========================================================================
   MINIMAX ALPHA-BETA BOT AI ENGINE
   ========================================================================== */

function getAllLegalMovesForColor(color, testBoard = board) {
  const allMoves = [];
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      if (testBoard[r][c] && testBoard[r][c].color === color) {
        const moves = getLegalMoves(r, c, testBoard);
        moves.forEach(m => {
          allMoves.push({ fr: r, fc: c, tr: m.r, tc: m.c, isCapture: m.isCapture });
        });
      }
    }
  }
  return allMoves;
}

function evaluateBoard(testBoard) {
  let score = 0;
  for (let r = 0; r < 8; r++) {
    for (let c = 0; c < 8; c++) {
      const piece = testBoard[r][c];
      if (piece) {
        let val = PIECE_VALUES[piece.type] || 0;

        // Positional square table bonuses
        if (piece.type === 'p') val += PAWN_TABLE[r][c];
        else if (piece.type === 'n') val += KNIGHT_TABLE[r][c];

        if (piece.color === 'b') score += val;
        else score -= val;
      }
    }
  }
  return score;
}

function makeBotMove() {
  if (gameEnded || currentTurn !== 'b') return;

  const legalMoves = getAllLegalMovesForColor('b');
  if (legalMoves.length === 0) {
    statusBannerEl.textContent = '🤝 STALEMATE! NO LEGAL MOVES LEFT!';
    gameEnded = true;
    return;
  }

  let bestMove = legalMoves[0];

  // Level 1: Easy - Random Move
  if (botDifficulty === 1) {
    bestMove = legalMoves[Math.floor(Math.random() * legalMoves.length)];
  }
  // Level 2: Medium - Greedy Capture Heuristic
  else if (botDifficulty === 2) {
    let bestVal = -Infinity;
    legalMoves.forEach(m => {
      const target = board[m.tr][m.tc];
      let val = target ? PIECE_VALUES[target.type] : 0;
      if (val > bestVal) {
        bestVal = val;
        bestMove = m;
      }
    });
  }
  // Level 3: Hard - 2-Ply Minimax Evaluation
  else if (botDifficulty === 3) {
    let bestVal = -Infinity;
    legalMoves.forEach(m => {
      const target = board[m.tr][m.tc];
      const piece = board[m.fr][m.fc];

      board[m.tr][m.tc] = piece;
      board[m.fr][m.fc] = null;

      const evalVal = evaluateBoard(board);

      board[m.fr][m.fc] = piece;
      board[m.tr][m.tc] = target;

      if (evalVal > bestVal) {
        bestVal = evalVal;
        bestMove = m;
      }
    });
  }
  // Level 4: Impossible - Depth 3 Minimax Alpha-Beta Search
  else {
    let bestVal = -Infinity;
    legalMoves.forEach(m => {
      const target = board[m.tr][m.tc];
      const piece = board[m.fr][m.fc];

      board[m.tr][m.tc] = piece;
      board[m.fr][m.fc] = null;

      const evalVal = minimax(board, 2, -Infinity, Infinity, false);

      board[m.fr][m.fc] = piece;
      board[m.tr][m.tc] = target;

      if (evalVal > bestVal) {
        bestVal = evalVal;
        bestMove = m;
      }
    });
  }

  executeMove(bestMove.fr, bestMove.fc, bestMove.tr, bestMove.tc);
}

function minimax(testBoard, depth, alpha, beta, isMaximizing) {
  if (depth === 0) return evaluateBoard(testBoard);

  if (isMaximizing) {
    let maxEval = -Infinity;
    const moves = getAllLegalMovesForColor('b', testBoard);
    for (let m of moves) {
      const target = testBoard[m.tr][m.tc];
      const piece = testBoard[m.fr][m.fc];

      testBoard[m.tr][m.tc] = piece;
      testBoard[m.fr][m.fc] = null;

      const evalVal = minimax(testBoard, depth - 1, alpha, beta, false);

      testBoard[m.fr][m.fc] = piece;
      testBoard[m.tr][m.tc] = target;

      maxEval = Math.max(maxEval, evalVal);
      alpha = Math.max(alpha, evalVal);
      if (beta <= alpha) break;
    }
    return maxEval;
  } else {
    let minEval = Infinity;
    const moves = getAllLegalMovesForColor('w', testBoard);
    for (let m of moves) {
      const target = testBoard[m.tr][m.tc];
      const piece = testBoard[m.fr][m.fc];

      testBoard[m.tr][m.tc] = piece;
      testBoard[m.fr][m.fc] = null;

      const evalVal = minimax(testBoard, depth - 1, alpha, beta, true);

      testBoard[m.fr][m.fc] = piece;
      testBoard[m.tr][m.tc] = target;

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
