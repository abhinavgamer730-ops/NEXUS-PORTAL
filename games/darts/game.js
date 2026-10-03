// Darts Clash 🎯 - 2-Player Local HTML5 Canvas Darts Engine
const canvas = document.getElementById('dartboard');
const ctx = canvas.getContext('2d');

const WIDTH = 400;
const HEIGHT = 400;
const CX = 200;
const CY = 200;

// Standard Dartboard 20 Sectors in Clockwise Order (Starting 12 o'clock)
const SECTORS = [20, 1, 18, 4, 13, 6, 10, 15, 2, 17, 3, 19, 7, 16, 8, 11, 14, 9, 12, 5];

// Game State Variables
let currentTurn = 1; // 1 = Player 1 (Red), 2 = Player 2 / Bot (Blue)
let isVsBot = true;
let botDifficulty = 4; // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Impossible
let p1Score = 0;
let p2Score = 0;
let p1ThrowsLeft = 3;
let p2ThrowsLeft = 3;
let landedDarts = [];
let isReticleMoving = true;
let matchEnded = false;

// Sine/Cosine Moving Reticle Parameters
let time = 0;
let reticleX = CX;
let reticleY = CY;
const amplitudeX = 135;
const amplitudeY = 135;
const freqX = 0.035;
const freqY = 0.048;

// DOM Elements
const turnInfoEl = document.getElementById('turn-info');
const throwBadgeEl = document.getElementById('throw-badge');
const scoreP1El = document.getElementById('score-p1');
const scoreP2El = document.getElementById('score-p2');
const dartsP1El = document.getElementById('darts-p1');
const dartsP2El = document.getElementById('darts-p2');
const btnP1 = document.getElementById('btn-throw-p1');
const btnP2 = document.getElementById('btn-throw-p2');
const btnReset = document.getElementById('btn-reset');
const btnBot = document.getElementById('btn-mode-bot');
const btn2p = document.getElementById('btn-mode-2p');
const diffContainerEl = document.getElementById('diff-container');
const diffSliderEl = document.getElementById('diff-slider');
const diffLabelEl = document.getElementById('diff-label');

const p2NameLabelEl = document.getElementById('p2-name-label');
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
    window.confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
  }
}

function updateModeBadgeUI() {
  if (modeBadgeEl) {
    if (isVsBot) {
      modeBadgeEl.textContent = `MODE: 🤖 VS BOT (${DIFF_LABELS[botDifficulty]})`;
      if (p2NameLabelEl) p2NameLabelEl.textContent = 'BOT 🤖';
    } else {
      modeBadgeEl.textContent = `MODE: 👥 2-PLAYER LOCAL`;
      if (p2NameLabelEl) p2NameLabelEl.textContent = 'PLAYER 2 🔵';
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
    resetMatch();
  });
}

if (btnReset) {
  btnReset.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.remove('hidden');
  });
}

/* ==========================================================================
   CANVAS RENDERING FUNCTIONS (Modular for asset swapping)
   ========================================================================== */

function drawDartboard() {
  // 1. Black Outer Background Frame
  ctx.fillStyle = '#090d16';
  ctx.fillRect(0, 0, WIDTH, HEIGHT);

  ctx.beginPath();
  ctx.arc(CX, CY, 185, 0, Math.PI * 2);
  ctx.fillStyle = '#0f172a';
  ctx.fill();
  ctx.lineWidth = 4;
  ctx.strokeStyle = '#38bdf8';
  ctx.stroke();

  // 2. Render 20 Alternating Color Sectors & Rings
  const sectorAngle = (Math.PI * 2) / 20;

  for (let i = 0; i < 20; i++) {
    // Top (20) centered around -PI/2
    const startAngle = -Math.PI / 2 - sectorAngle / 2 + i * sectorAngle;
    const endAngle = startAngle + sectorAngle;
    const isEven = i % 2 === 0;

    // Single Outer Sector (95 to 140)
    ctx.beginPath();
    ctx.arc(CX, CY, 140, startAngle, endAngle);
    ctx.arc(CX, CY, 95, endAngle, startAngle, true);
    ctx.fillStyle = isEven ? '#1e293b' : '#f8fafc';
    ctx.fill();

    // Double Outer Ring (140 to 155)
    ctx.beginPath();
    ctx.arc(CX, CY, 155, startAngle, endAngle);
    ctx.arc(CX, CY, 140, endAngle, startAngle, true);
    ctx.fillStyle = isEven ? '#ef4444' : '#22c55e';
    ctx.fill();

    // Single Inner Sector (25 to 80)
    ctx.beginPath();
    ctx.arc(CX, CY, 80, startAngle, endAngle);
    ctx.arc(CX, CY, 25, endAngle, startAngle, true);
    ctx.fillStyle = isEven ? '#1e293b' : '#f8fafc';
    ctx.fill();

    // Triple Inner Ring (80 to 95)
    ctx.beginPath();
    ctx.arc(CX, CY, 95, startAngle, endAngle);
    ctx.arc(CX, CY, 80, endAngle, startAngle, true);
    ctx.fillStyle = isEven ? '#ef4444' : '#22c55e';
    ctx.fill();

    // Sector Dividers (Silver Lines)
    ctx.beginPath();
    ctx.moveTo(CX + Math.cos(startAngle) * 25, CY + Math.sin(startAngle) * 25);
    ctx.lineTo(CX + Math.cos(startAngle) * 155, CY + Math.sin(startAngle) * 155);
    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#94a3b8';
    ctx.stroke();

    // Outer Number Labels (168px radius)
    const midAngle = startAngle + sectorAngle / 2;
    const numX = CX + Math.cos(midAngle) * 168;
    const numY = CY + Math.sin(midAngle) * 168;

    ctx.font = '900 13px "Fredoka", sans-serif';
    ctx.fillStyle = '#facc15';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(SECTORS[i], numX, numY);
  }

  // 3. Single Bullseye (Green Ring: 12 to 25)
  ctx.beginPath();
  ctx.arc(CX, CY, 25, 0, Math.PI * 2);
  ctx.fillStyle = '#22c55e';
  ctx.fill();
  ctx.lineWidth = 2;
  ctx.strokeStyle = '#0f172a';
  ctx.stroke();

  // 4. Double Bullseye (Center Red Circle: 0 to 12)
  ctx.beginPath();
  ctx.arc(CX, CY, 12, 0, Math.PI * 2);
  ctx.fillStyle = '#ef4444';
  ctx.fill();
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.stroke();
}

function drawLandedDarts() {
  landedDarts.forEach(dart => {
    // Dart Pin Shadow
    ctx.beginPath();
    ctx.arc(dart.x + 3, dart.y + 3, 7, 0, Math.PI * 2);
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    ctx.fill();

    // Dart Pin Body
    ctx.beginPath();
    ctx.arc(dart.x, dart.y, 7, 0, Math.PI * 2);
    ctx.fillStyle = dart.player === 1 ? '#ef4444' : '#38bdf8';
    ctx.fill();
    ctx.lineWidth = 2;
    ctx.strokeStyle = '#ffffff';
    ctx.stroke();

    // Center Needle Tip
    ctx.beginPath();
    ctx.arc(dart.x, dart.y, 2.5, 0, Math.PI * 2);
    ctx.fillStyle = '#0f172a';
    ctx.fill();

    // Score Label
    ctx.font = '800 10px "Fredoka", sans-serif';
    ctx.fillStyle = '#ffffff';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillText(dart.score, dart.x, dart.y - 8);
  });
}

function drawReticle() {
  if (!isReticleMoving && matchEnded) return;

  const color = currentTurn === 1 ? '#ef4444' : '#38bdf8';

  // Crosshair Outer Ring
  ctx.beginPath();
  ctx.arc(reticleX, reticleY, 18, 0, Math.PI * 2);
  ctx.lineWidth = 2.5;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Crosshairs
  ctx.beginPath();
  ctx.moveTo(reticleX - 24, reticleY);
  ctx.lineTo(reticleX + 24, reticleY);
  ctx.moveTo(reticleX, reticleY - 24);
  ctx.lineTo(reticleX, reticleY + 24);
  ctx.lineWidth = 2;
  ctx.strokeStyle = color;
  ctx.stroke();

  // Inner Target Dot
  ctx.beginPath();
  ctx.arc(reticleX, reticleY, 4, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/* ==========================================================================
   SCORING LOGIC & MATHEMATICAL CALCULATIONS
   ========================================================================== */

function calculateScore(x, y) {
  const dx = x - CX;
  const dy = y - CY;
  const dist = Math.hypot(dx, dy);

  // 1. Off Board Miss
  if (dist > 155) {
    return { points: 0, text: 'MISS! ❌ 0 PTS' };
  }

  // 2. Double Bullseye (Center Red)
  if (dist <= 12) {
    return { points: 50, text: '🎯 DOUBLE BULLSEYE! +50 PTS' };
  }

  // 3. Single Bullseye (Green Ring)
  if (dist <= 25) {
    return { points: 25, text: '🎯 BULLSEYE! +25 PTS' };
  }

  // 4. Sector Angle Lookup
  let angle = Math.atan2(dy, dx);
  // Shift angle so 12 o'clock sector (20) starts centered at -PI/2
  let shiftedAngle = angle + Math.PI / 2 + Math.PI / 20;
  if (shiftedAngle < 0) shiftedAngle += Math.PI * 2;
  if (shiftedAngle >= Math.PI * 2) shiftedAngle -= Math.PI * 2;

  const sectorIndex = Math.floor((shiftedAngle / (Math.PI * 2)) * 20) % 20;
  const val = SECTORS[sectorIndex];

  // 5. Ring Multipliers
  if (dist >= 80 && dist <= 95) {
    const pts = val * 3;
    return { points: pts, text: `🔥 TRIPLE ${val}! +${pts} PTS` };
  }

  if (dist >= 140 && dist <= 155) {
    const pts = val * 2;
    return { points: pts, text: `⚡ DOUBLE ${val}! +${pts} PTS` };
  }

  return { points: val, text: `🎯 SINGLE ${val}! +${val} PTS` };
}

/* ==========================================================================
   MODE & DIFFICULTY SELECTION
   ========================================================================== */


/* ==========================================================================
   GAME LOOP & TURN MECHANICS
   ========================================================================== */

function updateHUD() {
  scoreP1El.textContent = p1Score;
  scoreP2El.textContent = p2Score;

  dartsP1El.textContent = '🔴 '.repeat(p1ThrowsLeft);
  dartsP2El.textContent = '🔵 '.repeat(p2ThrowsLeft);

  if (matchEnded) {
    btnP1.disabled = true;
    btnP2.disabled = true;
    return;
  }

  btnP1.disabled = (currentTurn !== 1 || p1ThrowsLeft === 0);
  btnP2.disabled = (currentTurn !== 2 || p2ThrowsLeft === 0 || isVsBot);

  if (currentTurn === 1) {
    turnInfoEl.textContent = `CURRENT TURN: PLAYER 1 🔴 (THROW ${4 - p1ThrowsLeft}/3)`;
    turnInfoEl.className = 'turn-badge p1-turn';
  } else {
    if (isVsBot) {
      turnInfoEl.textContent = `BOT IS AIMING... 🤖 (THROW ${4 - p2ThrowsLeft}/3)`;
      turnInfoEl.className = 'turn-badge bot-turn';
    } else {
      turnInfoEl.textContent = `CURRENT TURN: PLAYER 2 🔵 (THROW ${4 - p2ThrowsLeft}/3)`;
      turnInfoEl.className = 'turn-badge p2-turn';
    }
  }

  // Trigger Bot Turn
  if (currentTurn === 2 && isVsBot && !matchEnded && isReticleMoving) {
    scheduleBotThrow();
  }
}

let botTimer = null;
function scheduleBotThrow() {
  if (botTimer) clearTimeout(botTimer);

  // Time delay before Bot evaluates reticle position and throws
  botTimer = setTimeout(() => {
    if (currentTurn !== 2 || !isVsBot || matchEnded || !isReticleMoving) return;

    // Bot accuracy evaluation based on difficulty level
    const distFromCenter = Math.hypot(reticleX - CX, reticleY - CY);

    let shouldThrow = false;
    if (botDifficulty === 1) {
      // Easy: 40% chance to throw on any frame
      shouldThrow = Math.random() < 0.4;
    } else if (botDifficulty === 2) {
      // Medium: Throws when within 60px of center
      shouldThrow = distFromCenter < 60 || Math.random() < 0.2;
    } else if (botDifficulty === 3) {
      // Hard: Throws when within 25px of center (Bullseye)
      shouldThrow = distFromCenter < 25 || Math.random() < 0.1;
    } else {
      // Impossible: Throws when within 12px of Double Bullseye
      shouldThrow = distFromCenter <= 14;
    }

    if (shouldThrow) {
      handleThrow(2);
    } else {
      // Keep checking on next frame
      scheduleBotThrow();
    }
  }, 30);
}

function handleThrow(player) {
  if (matchEnded) return;
  if (player !== currentTurn) return;

  const throwsLeft = player === 1 ? p1ThrowsLeft : p2ThrowsLeft;
  if (throwsLeft <= 0) return;

  // Freeze reticle at current impact position
  isReticleMoving = false;

  // Calculate score at reticle coordinates
  const impactX = reticleX;
  const impactY = reticleY;
  const result = calculateScore(impactX, impactY);

  // Record landed dart
  landedDarts.push({
    x: impactX,
    y: impactY,
    player: player,
    score: result.points
  });

  // Update scores & throws
  if (player === 1) {
    p1Score += result.points;
    p1ThrowsLeft--;
  } else {
    p2Score += result.points;
    p2ThrowsLeft--;
  }

  // Display result badge
  const pName = player === 1 ? 'PLAYER 1' : (isVsBot ? 'BOT' : 'PLAYER 2');
  throwBadgeEl.textContent = `${pName}: ${result.text}`;

  if (result.points >= 25) {
    triggerConfetti();
  }

  // Advance turn or check match end after short delay
  setTimeout(() => {
    if (p1ThrowsLeft === 0 && p2ThrowsLeft === 0) {
      endMatch();
    } else {
      // Alternate turn if opponent has throws left, or continue if opponent is done
      if (player === 1 && p2ThrowsLeft > 0) {
        currentTurn = 2;
      } else if (player === 2 && p1ThrowsLeft > 0) {
        currentTurn = 1;
      }
      isReticleMoving = true;
      updateHUD();
    }
  }, 900);

  updateHUD();
}

function endMatch() {
  matchEnded = true;
  isReticleMoving = false;

  const p2Title = isVsBot ? 'BOT' : 'PLAYER 2 (BLUE)';

  if (p1Score > p2Score) {
    turnInfoEl.textContent = `🎉 PLAYER 1 (RED) WINS THE MATCH! (${p1Score} vs ${p2Score}) 🏆`;
    turnInfoEl.className = 'turn-badge win-turn';
    triggerConfetti();
  } else if (p2Score > p1Score) {
    turnInfoEl.textContent = `🎉 ${p2Title} WINS THE MATCH! (${p2Score} vs ${p1Score}) 🏆`;
    turnInfoEl.className = 'turn-badge win-turn';
    triggerConfetti();
  } else {
    turnInfoEl.textContent = `🤝 IT'S A DRAW MATCH! (${p1Score} - ${p2Score})`;
    turnInfoEl.className = 'turn-badge win-turn';
  }

  btnP1.disabled = true;
  btnP2.disabled = true;
}

function initMatch() {
  currentTurn = 1;
  p1Score = 0;
  p2Score = 0;
  p1ThrowsLeft = 3;
  p2ThrowsLeft = 3;
  landedDarts = [];
  isReticleMoving = true;
  matchEnded = false;
  time = 0;

  if (botTimer) clearTimeout(botTimer);

  throwBadgeEl.textContent = 'READY TO THROW! AIM AND PRESS YOUR KEY';
  updateHUD();
}

/* ==========================================================================
   EVENT LISTENERS & GAME LOOP
   ========================================================================== */

btnP1.addEventListener('click', () => handleThrow(1));
btnP2.addEventListener('click', () => handleThrow(2));
btnReset.addEventListener('click', initMatch);

// Keyboard Controls: Spacebar = P1, Enter = P2
window.addEventListener('keydown', (e) => {
  if (e.code === 'Space') {
    e.preventDefault();
    handleThrow(1);
  } else if (e.code === 'Enter' && !isVsBot) {
    e.preventDefault();
    handleThrow(2);
  }
});

// Canvas Click Handler (VS Bot / P1 = Anywhere / Left Half, P2 = Right Half in 2P mode)
canvas.addEventListener('click', (e) => {
  if (isVsBot) {
    handleThrow(1);
  } else {
    const rect = canvas.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    if (clickX < rect.width / 2) {
      handleThrow(1);
    } else {
      handleThrow(2);
    }
  }
});

function gameLoop() {
  if (isReticleMoving && !matchEnded) {
    time += 1;
    reticleX = CX + Math.sin(time * freqX) * amplitudeX;
    reticleY = CY + Math.cos(time * freqY) * amplitudeY;
  }

  drawDartboard();
  drawLandedDarts();
  drawReticle();

  requestAnimationFrame(gameLoop);
}

// Start Game Engine
initMatch();
gameLoop();
