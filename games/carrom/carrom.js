// Carrom Master - VS BOT & 2-Player Engine
const canvas = document.getElementById('board');
const ctx = canvas.getContext('2d');

const WIDTH = 400;
const HEIGHT = 400;
const FRICTION = 0.98;
const POCKET_RADIUS = 24;

const BASELINE_BOTTOM = HEIGHT - 70;
const BASELINE_TOP = 70;

let isVsBot = true;
let botDifficulty = 4; // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Impossible
let currentTurn = 1; // 1 = Player 1 (Bottom), 2 = Bot / Player 2 (Top)
let scoreP1 = 0;
let scoreP2 = 0;

const diffContainerEl = document.getElementById('diff-container');
const diffSliderEl = document.getElementById('diff-slider');
const diffLabelEl = document.getElementById('diff-label');
const btnBot = document.getElementById('btn-mode-bot');
const btn2p = document.getElementById('btn-mode-2p');
const modeBadgeEl = document.getElementById('mode-badge');
const startOverlayEl = document.getElementById('start-overlay');
const btnStartEl = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');

const DIFF_LABELS = {
  1: 'EASY 🟢',
  2: 'MEDIUM 🟡',
  3: 'HARD 🟠',
  4: 'IMPOSSIBLE 💀'
};

function updateModeBadgeUI() {
  if (modeBadgeEl) {
    if (isVsBot) {
      modeBadgeEl.textContent = `MODE: 🤖 VS BOT (${DIFF_LABELS[botDifficulty]})`;
      const labelP2 = document.getElementById('label-p2');
      if (labelP2) labelP2.innerHTML = `BOT: <strong id="score-p2" style="color: var(--bubblegum);">${scoreP2}</strong>`;
    } else {
      modeBadgeEl.textContent = `MODE: 👥 2-PLAYER LOCAL`;
      const labelP2 = document.getElementById('label-p2');
      if (labelP2) labelP2.innerHTML = `P2: <strong id="score-p2" style="color: var(--bubblegum);">${scoreP2}</strong>`;
    }
  }
}

if (btnBot && btn2p) {
  btnBot.addEventListener('click', () => setMode(true));
  btn2p.addEventListener('click', () => setMode(false));
}

function setMode(vsBot) {
  isVsBot = vsBot;
  if (btnBot) btnBot.classList.toggle('active', vsBot);
  if (btn2p) btn2p.classList.toggle('active', !vsBot);
  if (diffContainerEl) diffContainerEl.style.display = vsBot ? 'flex' : 'none';
  updateModeBadgeUI();
}

if (diffSliderEl) {
  diffSliderEl.addEventListener('input', (e) => {
    botDifficulty = parseInt(e.target.value, 10);
    if (diffLabelEl) diffLabelEl.textContent = DIFF_LABELS[botDifficulty];
    updateModeBadgeUI();
  });
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

let pocketedCount = 0;
let piecePocketedThisTurn = false;

let isAiming = false;
let aimStart = { x: WIDTH / 2, y: BASELINE_BOTTOM };
let aimCurrent = { x: WIDTH / 2, y: BASELINE_BOTTOM };

const POCKETS = [
  { x: 28, y: 28 },
  { x: WIDTH - 28, y: 28 },
  { x: 28, y: HEIGHT - 28 },
  { x: WIDTH - 28, y: HEIGHT - 28 }
];

function triggerConfetti() {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  }
}

class Piece {
  constructor(x, y, radius, color, points = 0, isStriker = false, strikerOwner = 0) {
    this.x = x;
    this.y = y;
    this.vx = 0;
    this.vy = 0;
    this.radius = radius;
    this.color = color;
    this.points = points;
    this.isStriker = isStriker;
    this.strikerOwner = strikerOwner;
    this.isPocketed = false;
  }

  isMoving() {
    return !this.isPocketed && (Math.abs(this.vx) > 0.05 || Math.abs(this.vy) > 0.05);
  }

  update() {
    if (this.isPocketed) return;

    this.x += this.vx;
    this.y += this.vy;

    this.vx *= FRICTION;
    this.vy *= FRICTION;

    if (Math.abs(this.vx) < 0.08) this.vx = 0;
    if (Math.abs(this.vy) < 0.08) this.vy = 0;

    // Wall bounces
    if (this.x - this.radius < 20) { this.x = 20 + this.radius; this.vx *= -1; }
    if (this.x + this.radius > WIDTH - 20) { this.x = WIDTH - 20 - this.radius; this.vx *= -1; }
    if (this.y - this.radius < 20) { this.y = 20 + this.radius; this.vy *= -1; }
    if (this.y + this.radius > HEIGHT - 20) { this.y = HEIGHT - 20 - this.radius; this.vy *= -1; }

    // Pocket check
    POCKETS.forEach(p => {
      const dx = this.x - p.x;
      const dy = this.y - p.y;
      const dist = Math.hypot(dx, dy);

      if (dist < POCKET_RADIUS) {
        if (this.isStriker) {
          // Reset Striker to baseline
          this.x = WIDTH / 2;
          this.y = this.strikerOwner === 1 ? BASELINE_BOTTOM : BASELINE_TOP;
          this.vx = 0;
          this.vy = 0;
        } else {
          this.isPocketed = true;
          this.vx = 0;
          this.vy = 0;

          piecePocketedThisTurn = true;
          if (currentTurn === 1) {
            scoreP1 += this.points;
          } else {
            scoreP2 += this.points;
          }
          pocketedCount++;
          updateHUD();
          triggerConfetti();
        }
      }
    });
  }

  draw() {
    if (this.isPocketed) return;

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
    ctx.fillStyle = this.color;
    ctx.fill();
    ctx.lineWidth = 2.5;
    ctx.strokeStyle = '#0f172a';
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(this.x, this.y, this.radius * 0.45, 0, Math.PI * 2);
    ctx.strokeStyle = this.isStriker ? '#ffffff' : '#0f172a';
    ctx.stroke();
  }
}

let pieces = [];
let strikerP1;
let strikerP2;

const turnInfoEl = document.getElementById('turn-info');
const labelP2El = document.getElementById('label-p2');
const strikerSlider = document.getElementById('striker-slider');
const strikerPosVal = document.getElementById('striker-pos-val');

if (strikerSlider) {
  strikerSlider.addEventListener('input', (e) => {
    if (pieces.some(p => p.isMoving())) return;
    const val = parseFloat(e.target.value);
    const activeStriker = getActiveStriker();
    const baselineY = currentTurn === 1 ? BASELINE_BOTTOM : BASELINE_TOP;
    activeStriker.x = val;
    activeStriker.y = baselineY;
    updateSliderLabel(val);
  });
}

function updateSliderLabel(val) {
  if (!strikerPosVal) return;
  const center = WIDTH / 2;
  const diff = val - center;
  if (Math.abs(diff) < 5) {
    strikerPosVal.textContent = 'CENTER';
  } else if (diff < 0) {
    strikerPosVal.textContent = `LEFT (${Math.abs(Math.round(diff))})`;
  } else {
    strikerPosVal.textContent = `RIGHT (${Math.round(diff)})`;
  }
}

function resetStrikersToDefault() {
  if (strikerP1) {
    strikerP1.x = WIDTH / 2;
    strikerP1.y = BASELINE_BOTTOM;
    strikerP1.vx = 0;
    strikerP1.vy = 0;
  }
  if (strikerP2) {
    strikerP2.x = WIDTH / 2;
    strikerP2.y = BASELINE_TOP;
    strikerP2.vx = 0;
    strikerP2.vy = 0;
  }
  if (strikerSlider) {
    strikerSlider.value = WIDTH / 2;
    updateSliderLabel(WIDTH / 2);
  }
}




function initBoard() {
  scoreP1 = 0;
  scoreP2 = 0;
  pocketedCount = 0;
  currentTurn = 1;
  isAiming = false;
  piecePocketedThisTurn = false;

  updateHUD();
  updateTurnBadge();

  pieces = [];
  const cx = WIDTH / 2;
  const cy = HEIGHT / 2;

  // Center Queen (Red)
  pieces.push(new Piece(cx, cy, 11, '#ef4444', 30));

  // Inner ring
  for (let i = 0; i < 6; i++) {
    const angle = (i * Math.PI) / 3;
    const color = i % 2 === 0 ? '#ffffff' : '#1e293b';
    const pts = i % 2 === 0 ? 10 : 5;
    pieces.push(new Piece(cx + Math.cos(angle) * 24, cy + Math.sin(angle) * 24, 11, color, pts));
  }

  // Outer ring
  for (let i = 0; i < 12; i++) {
    const angle = (i * Math.PI) / 6;
    const color = i % 2 === 0 ? '#ffffff' : '#1e293b';
    const pts = i % 2 === 0 ? 10 : 5;
    pieces.push(new Piece(cx + Math.cos(angle) * 48, cy + Math.sin(angle) * 48, 11, color, pts));
  }

  // Striker P1 (Bottom)
  strikerP1 = new Piece(cx, BASELINE_BOTTOM, 15, '#38bdf8', 0, true, 1);
  pieces.push(strikerP1);

  // Striker P2 / Bot (Top)
  strikerP2 = new Piece(cx, BASELINE_TOP, 15, '#fb6f99', 0, true, 2);
  pieces.push(strikerP2);

  resetStrikersToDefault();
}

function getActiveStriker() {
  return currentTurn === 1 ? strikerP1 : strikerP2;
}

function updateTurnBadge() {
  if (currentTurn === 1) {
    turnInfoEl.textContent = 'CURRENT TURN: PLAYER 1 🔵 (BOTTOM)';
    turnInfoEl.className = 'turn-badge p1-turn';
  } else {
    if (isVsBot) {
      turnInfoEl.textContent = 'BOT IS THINKING... 🤖 (TOP)';
      turnInfoEl.className = 'turn-badge bot-turn';
    } else {
      turnInfoEl.textContent = 'CURRENT TURN: PLAYER 2 🔴 (TOP)';
      turnInfoEl.className = 'turn-badge p2-turn';
    }
  }
}

function resolveCollisions() {
  const activePieces = pieces.filter(p => !p.isPocketed);
  const len = activePieces.length;

  for (let i = 0; i < len; i++) {
    for (let j = i + 1; j < len; j++) {
      const p1 = activePieces[i];
      const p2 = activePieces[j];

      if (!p1.isMoving() && !p2.isMoving()) continue;

      const dx = p2.x - p1.x;
      const dy = p2.y - p1.y;
      const dist = Math.hypot(dx, dy);

      if (dist < p1.radius + p2.radius) {
        const angle = Math.atan2(dy, dx);
        const sin = Math.sin(angle);
        const cos = Math.cos(angle);

        let vx1 = p1.vx * cos + p1.vy * sin;
        let vy1 = p1.vy * cos - p1.vx * sin;
        let vx2 = p2.vx * cos + p2.vy * sin;
        let vy2 = p2.vy * cos - p2.vx * sin;

        const temp = vx1;
        vx1 = vx2;
        vx2 = temp;

        p1.vx = vx1 * cos - vy1 * sin;
        p1.vy = vy1 * cos + vx1 * sin;
        p2.vx = vx2 * cos - vy2 * sin;
        p2.vy = vy2 * cos + vy2 * sin;

        const overlap = p1.radius + p2.radius - dist;
        p1.x -= Math.cos(angle) * (overlap / 2);
        p1.y -= Math.sin(angle) * (overlap / 2);
        p2.x += Math.cos(angle) * (overlap / 2);
        p2.y += Math.sin(angle) * (overlap / 2);
      }
    }
  }
}

function updateHUD() {
  document.getElementById('score-p1').textContent = scoreP1;
  const p2El = document.getElementById('score-p2');
  if (p2El) p2El.textContent = scoreP2;
  document.getElementById('pocket-val').textContent = pocketedCount;
}

// Check turn transition after motion stops
let wasMovingLastFrame = false;

function checkTurnEnd() {
  const isAnyMoving = pieces.some(p => p.isMoving());

  if (isAnyMoving && strikerSlider) {
    strikerSlider.disabled = true;
  }

  if (wasMovingLastFrame && !isAnyMoving) {
    // All pieces came to a complete stop!
    if (!piecePocketedThisTurn) {
      // Pass turn to opponent if no piece was pocketed
      currentTurn = currentTurn === 1 ? 2 : 1;
    }
    piecePocketedThisTurn = false;

    // Reset strikers back to baseline default position
    resetStrikersToDefault();

    updateTurnBadge();

    if (strikerSlider) {
      strikerSlider.disabled = (currentTurn === 2 && isVsBot);
    }

    // Trigger Bot Turn if turn === 2 & isVsBot
    if (currentTurn === 2 && isVsBot) {
      setTimeout(makeBotShot, 600);
    }
  }
  wasMovingLastFrame = isAnyMoving;
}

// Bot AI Shot Logic
function makeBotShot() {
  if (currentTurn !== 2 || !isVsBot || pieces.some(p => p.isMoving())) return;

  const targetables = pieces.filter(p => !p.isPocketed && !p.isStriker);
  if (targetables.length === 0) return;

  // Pick best target piece (closest to any pocket)
  let bestTarget = targetables[0];
  let minPocketDist = Infinity;
  let bestPocket = POCKETS[0];

  targetables.forEach(piece => {
    POCKETS.forEach(p => {
      const d = Math.hypot(piece.x - p.x, piece.y - p.y);
      if (d < minPocketDist) {
        minPocketDist = d;
        bestTarget = piece;
        bestPocket = p;
      }
    });
  });

  // Calculate aiming error and force based on difficulty
  let aimError = 0;
  let force = 9.5;

  if (botDifficulty === 1) {
    // Easy: Large aiming error, low force
    aimError = (Math.random() * 80 - 40);
    force = 5.0 + Math.random() * 3;
  } else if (botDifficulty === 2) {
    // Medium: Moderate aiming error
    aimError = (Math.random() * 40 - 20);
    force = 7.0 + Math.random() * 2;
  } else if (botDifficulty === 3) {
    // Hard: Small aiming error
    aimError = (Math.random() * 14 - 7);
    force = 8.5 + Math.random() * 1.5;
  } else {
    // Impossible: Pinpoint precision
    aimError = 0;
    force = 9.8;
  }

  // Position Bot Striker along top baseline near target piece
  strikerP2.x = Math.max(65, Math.min(WIDTH - 65, bestTarget.x + aimError));
  strikerP2.y = BASELINE_TOP;

  // Aim towards target piece
  const dx = (bestTarget.x + aimError) - strikerP2.x;
  const dy = bestTarget.y - strikerP2.y;
  const dist = Math.hypot(dx, dy) || 1;

  // Shoot striker forward into target!
  strikerP2.vx = (dx / dist) * force;
  strikerP2.vy = (dy / dist) * force;
}

// Pointer Events for Human Players
function getEventPos(e) {
  const rect = canvas.getBoundingClientRect();
  let clientX = e.clientX;
  let clientY = e.clientY;

  if (e.touches && e.touches.length > 0) {
    clientX = e.touches[0].clientX;
    clientY = e.touches[0].clientY;
  } else if (e.changedTouches && e.changedTouches.length > 0) {
    clientX = e.changedTouches[0].clientX;
    clientY = e.changedTouches[0].clientY;
  }

  return {
    x: Math.max(0, Math.min(WIDTH, (clientX - rect.left) * (WIDTH / rect.width))),
    y: Math.max(0, Math.min(HEIGHT, (clientY - rect.top) * (HEIGHT / rect.height)))
  };
}

function handlePointerDown(e) {
  if (pieces.some(p => p.isMoving())) return;
  if (currentTurn === 2 && isVsBot) return; // Disable during Bot turn

  const activeStriker = getActiveStriker();
  const baselineY = currentTurn === 1 ? BASELINE_BOTTOM : BASELINE_TOP;
  const pos = getEventPos(e);

  const dist = Math.hypot(pos.x - activeStriker.x, pos.y - activeStriker.y);

  if (dist < 40) {
    isAiming = true;
    aimStart = { x: activeStriker.x, y: activeStriker.y };
    aimCurrent = { x: pos.x, y: pos.y };
  } else if (Math.abs(pos.y - baselineY) < 30) {
    // Reposition active striker on its baseline
    const newX = Math.max(65, Math.min(WIDTH - 65, pos.x));
    activeStriker.x = newX;
    activeStriker.y = baselineY;
    aimStart = { x: activeStriker.x, y: activeStriker.y };
    aimCurrent = { x: pos.x, y: pos.y };
    if (strikerSlider) {
      strikerSlider.value = newX;
      updateSliderLabel(newX);
    }
  }
}

function handlePointerMove(e) {
  if (!isAiming) return;
  aimCurrent = getEventPos(e);
}

function handlePointerUp(e) {
  if (!isAiming) return;

  const activeStriker = getActiveStriker();
  const dx = aimStart.x - aimCurrent.x;
  const dy = aimStart.y - aimCurrent.y;
  const pullDistance = Math.hypot(dx, dy);

  if (pullDistance > 10) {
    activeStriker.vx = dx * 0.22;
    activeStriker.vy = dy * 0.22;
  }

  isAiming = false;
}

canvas.addEventListener('mousedown', handlePointerDown);
window.addEventListener('mousemove', handlePointerMove);
window.addEventListener('mouseup', handlePointerUp);

canvas.addEventListener('touchstart', (e) => { e.preventDefault(); handlePointerDown(e); }, { passive: false });
window.addEventListener('touchmove', (e) => { if (isAiming) e.preventDefault(); handlePointerMove(e); }, { passive: false });
window.addEventListener('touchend', handlePointerUp);
window.addEventListener('touchcancel', handlePointerUp);

function drawBoardBackground() {
  ctx.fillStyle = '#fde047';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.lineWidth = 20;
  ctx.strokeStyle = '#78350f';
  ctx.strokeRect(10, 10, WIDTH - 20, HEIGHT - 20);

  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0f172a';
  ctx.strokeRect(20, 20, WIDTH - 40, HEIGHT - 40);

  // 4 Corner Pockets
  POCKETS.forEach(p => {
    ctx.beginPath();
    ctx.arc(p.x, p.y, POCKET_RADIUS, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();
    ctx.lineWidth = 3;
    ctx.strokeStyle = '#334155';
    ctx.stroke();
  });

  // Center Circles
  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2, 45, 0, Math.PI * 2);
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#ef4444';
  ctx.stroke();

  ctx.beginPath();
  ctx.arc(WIDTH / 2, HEIGHT / 2, 18, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();

  // Bottom Baseline (P1)
  ctx.beginPath();
  ctx.moveTo(60, BASELINE_BOTTOM);
  ctx.lineTo(WIDTH - 60, BASELINE_BOTTOM);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  [60, WIDTH - 60].forEach(bx => {
    ctx.beginPath();
    ctx.arc(bx, BASELINE_BOTTOM, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#e0f2fe';
    ctx.fill();
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 2;
    ctx.stroke();
  });

  // Top Baseline (P2 / Bot)
  ctx.beginPath();
  ctx.moveTo(60, BASELINE_TOP);
  ctx.lineTo(WIDTH - 60, BASELINE_TOP);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#fb6f99';
  ctx.stroke();

  [60, WIDTH - 60].forEach(bx => {
    ctx.beginPath();
    ctx.arc(bx, BASELINE_TOP, 12, 0, Math.PI * 2);
    ctx.fillStyle = '#ffe4f3';
    ctx.fill();
    ctx.strokeStyle = '#fb6f99';
    ctx.lineWidth = 2;
    ctx.stroke();
  });
}

function gameLoop() {
  drawBoardBackground();

  pieces.forEach(p => {
    p.update();
    p.draw();
  });

  resolveCollisions();
  checkTurnEnd();

  // Draw Aiming Guide
  if (isAiming && aimStart && aimCurrent) {
    const dx = aimStart.x - aimCurrent.x;
    const dy = aimStart.y - aimCurrent.y;
    const targetX = aimStart.x + dx;
    const targetY = aimStart.y + dy;

    ctx.beginPath();
    ctx.moveTo(aimStart.x, aimStart.y);
    ctx.lineTo(targetX, targetY);
    ctx.lineWidth = 4;
    ctx.strokeStyle = currentTurn === 1 ? '#38bdf8' : '#fb6f99';
    ctx.setLineDash([6, 6]);
    ctx.stroke();
    ctx.setLineDash([]);

    ctx.beginPath();
    ctx.arc(targetX, targetY, 8, 0, Math.PI * 2);
    ctx.fillStyle = currentTurn === 1 ? '#38bdf8' : '#fb6f99';
    ctx.fill();
  }

  requestAnimationFrame(gameLoop);
}

initBoard();
gameLoop();
