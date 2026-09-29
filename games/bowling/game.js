/* ==========================================================================
   NEON STRIKE BOWLING 🎳⚡ - Vanilla JavaScript Game & Physics Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  const canvas = document.getElementById('bowling-canvas');
  const ctx = canvas.getContext('2d');

  // UI Elements
  const btnModeBot = document.getElementById('btn-mode-bot');
  const btnMode2P = document.getElementById('btn-mode-2p');
  const diffContainer = document.getElementById('diff-container');
  const diffSlider = document.getElementById('diff-slider');
  const diffLabel = document.getElementById('diff-label');
  const turnInfo = document.getElementById('turn-info');
  const statusBanner = document.getElementById('status-banner');
  const p2NameLabel = document.getElementById('p2-name-label');
  const btnReset = document.getElementById('btn-reset');

  // Game Settings & State
  let gameMode = 'bot'; // 'bot' or '2p'
  let botDifficulty = 4; // 1: EASY, 2: MEDIUM, 3: HARD, 4: IMPOSSIBLE
  let currentPlayer = 1; // 1 or 2
  let currentFrame = 1; // 1 to 10
  let currentRoll = 1; // 1, 2, or 3 (in frame 10)
  let gamePhase = 'AIM'; // 'AIM', 'DRAGGING', 'ROLLING', 'FRAME_END', 'GAME_OVER'

  // Canvas Scale Helper for responsive mouse/touch coordinates
  function getCanvasCoords(e) {
    const rect = canvas.getBoundingClientRect();
    const scaleX = canvas.width / rect.width;
    const scaleY = canvas.height / rect.height;
    let clientX, clientY;
    if (e.touches && e.touches.length > 0) {
      clientX = e.touches[0].clientX;
      clientY = e.touches[0].clientY;
    } else if (e.changedTouches && e.changedTouches.length > 0) {
      clientX = e.changedTouches[0].clientX;
      clientY = e.changedTouches[0].clientY;
    } else {
      clientX = e.clientX;
      clientY = e.clientY;
    }
    return {
      x: (clientX - rect.left) * scaleX,
      y: (clientY - rect.top) * scaleY
    };
  }

  // Pin & Ball Geometry Constants
  const BALL_RADIUS = 15;
  const BALL_MASS = 5.0;
  const PIN_RADIUS = 9;
  const PIN_MASS = 1.0;
  const START_BALL_Y = 480;
  const LANE_LEFT = 50;
  const LANE_RIGHT = 350;

  // Standard 10-Pin Triangle Positions
  const PIN_POSITIONS = [
    { id: 1, x: 200, y: 140 }, // Head pin
    { id: 2, x: 186, y: 118 }, { id: 3, x: 214, y: 118 },
    { id: 4, x: 172, y: 96 },  { id: 5, x: 200, y: 96 },  { id: 6, x: 228, y: 96 },
    { id: 7, x: 158, y: 74 },  { id: 8, x: 186, y: 74 },  { id: 9, x: 214, y: 74 }, { id: 10, x: 242, y: 74 }
  ];

  class Ball {
    constructor() {
      this.reset();
    }
    reset() {
      this.x = 200;
      this.y = START_BALL_Y;
      this.vx = 0;
      this.vy = 0;
      this.radius = BALL_RADIUS;
      this.mass = BALL_MASS;
      this.inGutter = false;
    }
  }

  class Pin {
    constructor(pos) {
      this.id = pos.id;
      this.startX = pos.x;
      this.startY = pos.y;
      this.x = pos.x;
      this.y = pos.y;
      this.vx = 0;
      this.vy = 0;
      this.radius = PIN_RADIUS;
      this.mass = PIN_MASS;
      this.knocked = false;
      this.inGutter = false;
      this.rotation = 0;
      this.opacity = 1.0;
    }
    reset() {
      this.x = this.startX;
      this.y = this.startY;
      this.vx = 0;
      this.vy = 0;
      this.knocked = false;
      this.inGutter = false;
      this.rotation = 0;
      this.opacity = 1.0;
    }
  }

  let ball = new Ball();
  let pins = PIN_POSITIONS.map(p => new Pin(p));

  // Scoreboard Data Structure
  // playerRolls[p][frame] = array of roll scores [r1, r2, r3]
  let playerRolls = {
    1: Array(11).fill(null).map(() => []),
    2: Array(11).fill(null).map(() => [])
  };

  // Touch / Drag Control Tracking
  let dragStartPos = null;
  let dragStartTime = 0;
  let currentDragPos = null;

  // Bot Timer Reference
  let botTurnTimer = null;

  // Difficulty Labels
  const DIFF_NAMES = {
    1: 'EASY 🟢',
    2: 'MEDIUM 🟡',
    3: 'HARD 🟠',
    4: 'IMPOSSIBLE 💀'
  };

  const modeBadge = document.getElementById('mode-badge');
  const startOverlay = document.getElementById('start-overlay');
  const btnStart = document.getElementById('btn-start');

  function updateModeBadgeUI() {
    if (gameMode === 'bot') {
      modeBadge.textContent = `MODE: 🤖 VS BOT (${DIFF_NAMES[botDifficulty]})`;
    } else {
      modeBadge.textContent = `MODE: 👥 2-PLAYER LOCAL`;
    }
  }

  // Event Listeners for UI inside Modal
  diffSlider.addEventListener('input', (e) => {
    botDifficulty = parseInt(e.target.value);
    diffLabel.textContent = DIFF_NAMES[botDifficulty];
    updateModeBadgeUI();
  });

  btnModeBot.addEventListener('click', () => {
    if (gameMode !== 'bot') {
      gameMode = 'bot';
      btnModeBot.classList.add('active');
      btnMode2P.classList.remove('active');
      diffContainer.style.display = 'flex';
      p2NameLabel.textContent = 'BOT 🤖';
      updateModeBadgeUI();
    }
  });

  btnMode2P.addEventListener('click', () => {
    if (gameMode !== '2p') {
      gameMode = '2p';
      btnMode2P.classList.add('active');
      btnModeBot.classList.remove('active');
      diffContainer.style.display = 'none';
      p2NameLabel.textContent = 'P2 🔵';
      updateModeBadgeUI();
    }
  });

  btnStart.addEventListener('click', () => {
    startOverlay.classList.add('hidden');
    updateModeBadgeUI();
    resetMatch();
  });

  btnReset.addEventListener('click', () => {
    startOverlay.classList.remove('hidden');
  });

  function resetMatch() {
    if (botTurnTimer) clearTimeout(botTurnTimer);
    currentPlayer = 1;
    currentFrame = 1;
    currentRoll = 1;
    gamePhase = 'AIM';
    playerRolls = {
      1: Array(11).fill(null).map(() => []),
      2: Array(11).fill(null).map(() => [])
    };
    ball.reset();
    pins.forEach(p => p.reset());
    updateScoreboardUI();
    updateTurnUI();
    setStatus('👆 SWIPE OR DRAG THE BALL UPWARD TO BOWL!');
  }

  // Pointer & Touch Controls
  canvas.addEventListener('pointerdown', handlePointerDown);
  canvas.addEventListener('pointermove', handlePointerMove);
  canvas.addEventListener('pointerup', handlePointerUp);
  canvas.addEventListener('pointercancel', handlePointerUp);

  function handlePointerDown(e) {
    if (gamePhase !== 'AIM') return;
    if (gameMode === 'bot' && currentPlayer === 2) return; // Bot turn

    const coords = getCanvasCoords(e);
    // Check if pointer is near ball
    const distToBall = Math.hypot(coords.x - ball.x, coords.y - ball.y);
    if (distToBall < ball.radius * 3 || coords.y > 420) {
      // Reposition ball horizontally if clicked near foul line
      ball.x = Math.max(70, Math.min(330, coords.x));
      dragStartPos = { x: ball.x, y: ball.y };
      dragStartTime = performance.now();
      currentDragPos = { x: coords.x, y: coords.y };
      gamePhase = 'DRAGGING';
    }
  }

  function handlePointerMove(e) {
    if (gamePhase === 'AIM') {
      if (gameMode === 'bot' && currentPlayer === 2) return;
      const coords = getCanvasCoords(e);
      if (e.buttons === 1 || e.type === 'touchmove') {
        ball.x = Math.max(70, Math.min(330, coords.x));
      }
    } else if (gamePhase === 'DRAGGING') {
      const coords = getCanvasCoords(e);
      currentDragPos = { x: coords.x, y: coords.y };
      if (coords.y >= 450) {
        ball.x = Math.max(70, Math.min(330, coords.x));
      }
    }
  }

  function handlePointerUp(e) {
    if (gamePhase !== 'DRAGGING') return;
    const coords = getCanvasCoords(e);
    const endTime = performance.now();
    const dt = Math.max(16, endTime - dragStartTime);

    const dx = coords.x - dragStartPos.x;
    const dy = coords.y - dragStartPos.y;

    // Flick must be upwards (negative dy)
    if (dy >= -10) {
      gamePhase = 'AIM';
      dragStartPos = null;
      currentDragPos = null;
      setStatus('⚠️ Flick UPWARDS towards the pins!');
      return;
    }

    // Calculate speed and angle
    const speedRaw = Math.hypot(dx, dy) / dt; // px per ms
    const speedScaled = Math.min(18, Math.max(6, speedRaw * 22)); // clamp speed between 6 and 18

    const angle = Math.atan2(dy, dx);
    ball.vx = Math.cos(angle) * speedScaled;
    ball.vy = Math.sin(angle) * speedScaled;

    gamePhase = 'ROLLING';
    dragStartPos = null;
    currentDragPos = null;
    setStatus('🎳 BALL IS ROLLING!');
  }

  // Bot AI Action
  function triggerBotTurn() {
    setStatus('🤖 BOT IS AIMING...');
    botTurnTimer = setTimeout(() => {
      let targetX = 200;
      let power = 17;

      if (botDifficulty === 1) {
        targetX = 200 + (Math.random() * 90 - 45); // EASY: wide variance
        power = 10 + Math.random() * 4;
      } else if (botDifficulty === 2) {
        targetX = 200 + (Math.random() * 40 - 20); // MEDIUM: moderate variance
        power = 13 + Math.random() * 3;
      } else if (botDifficulty === 3) {
        targetX = 200 + (Math.random() * 14 - 7); // HARD: tight head pin aim
        power = 16 + Math.random() * 2;
      } else {
        targetX = 207 + (Math.random() * 3 - 1.5); // IMPOSSIBLE: perfect pocket hit
        power = 18;
      }

      ball.x = 200 + (Math.random() * 20 - 10);
      ball.y = START_BALL_Y;

      const dx = targetX - ball.x;
      const dy = 140 - ball.y;
      const angle = Math.atan2(dy, dx);

      ball.vx = Math.cos(angle) * power;
      ball.vy = Math.sin(angle) * power;

      gamePhase = 'ROLLING';
      setStatus('🤖 BOT RELEASED THE BALL!');
    }, 1000);
  }

  // Physics Update Loop
  function updatePhysics() {
    if (gamePhase !== 'ROLLING') return;

    let stillMoving = false;

    // Update Ball
    ball.x += ball.vx;
    ball.y += ball.vy;
    ball.vx *= 0.985;
    ball.vy *= 0.985;

    if (Math.hypot(ball.vx, ball.vy) > 0.1) stillMoving = true;

    // Check Gutter for Ball
    if (!ball.inGutter) {
      if (ball.x - ball.radius < LANE_LEFT || ball.x + ball.radius > LANE_RIGHT) {
        ball.inGutter = true;
        setStatus('💥 GUTTER BALL!');
      }
    }

    if (ball.inGutter) {
      if (ball.x < 200) ball.x = 35;
      else ball.x = 365;
      ball.vx = 0;
    }

    // Update Standing & Knocked Pins
    pins.forEach(pin => {
      if (pin.knocked || Math.hypot(pin.vx, pin.vy) > 0.05) {
        pin.x += pin.vx;
        pin.y += pin.vy;
        pin.vx *= 0.94;
        pin.vy *= 0.94;

        if (Math.hypot(pin.vx, pin.vy) > 0.05) stillMoving = true;

        const distFromStart = Math.hypot(pin.x - pin.startX, pin.y - pin.startY);
        if (distFromStart > 10 || Math.hypot(pin.vx, pin.vy) > 0.8) {
          pin.knocked = true;
        }

        if (pin.knocked && Math.abs(pin.rotation) < 1.2) {
          pin.rotation += (pin.vx * 0.05);
        }

        if (pin.y < 50) {
          pin.opacity = Math.max(0, pin.opacity - 0.05);
        }
      }

      // Ball to Pin Collision
      if (!pin.knocked && !ball.inGutter) {
        const d = Math.hypot(ball.x - pin.x, ball.y - pin.y);
        const minDist = ball.radius + pin.radius;

        if (d < minDist) {
          pin.knocked = true;
          const nx = (pin.x - ball.x) / (d || 1);
          const ny = (pin.y - ball.y) / (d || 1);

          const overlap = minDist - d;
          pin.x += nx * overlap;
          pin.y += ny * overlap;

          const k = 2 * (ball.vx * nx + ball.vy * ny - pin.vx * nx - pin.vy * ny) / (ball.mass + pin.mass);
          ball.vx -= k * pin.mass * nx;
          ball.vy -= k * pin.mass * ny;
          pin.vx += k * ball.mass * nx;
          pin.vy += k * ball.mass * ny;
        }
      }
    });

    // Pin-to-Pin Collisions
    for (let i = 0; i < pins.length; i++) {
      for (let j = i + 1; j < pins.length; j++) {
        const p1 = pins[i];
        const p2 = pins[j];

        const d = Math.hypot(p1.x - p2.x, p1.y - p2.y);
        const minDist = p1.radius + p2.radius;

        if (d < minDist) {
          if (p1.knocked || p2.knocked || Math.hypot(p1.vx, p1.vy) > 0.5 || Math.hypot(p2.vx, p2.vy) > 0.5) {
            p1.knocked = true;
            p2.knocked = true;

            const nx = (p2.x - p1.x) / (d || 1);
            const ny = (p2.y - p1.y) / (d || 1);

            const overlap = (minDist - d) / 2;
            p1.x -= nx * overlap;
            p1.y -= ny * overlap;
            p2.x += nx * overlap;
            p2.y += ny * overlap;

            const k = 2 * (p1.vx * nx + p1.vy * ny - p2.vx * nx - p2.vy * ny) / (p1.mass + p2.mass);
            p1.vx -= k * p2.mass * nx;
            p1.vy -= k * p2.mass * ny;
            p2.vx += k * p1.mass * nx;
            p2.vy += k * p1.mass * ny;
          }
        }
      }
    }

    // Ball reaches pit or stops completely
    if (ball.y < 30 || (!stillMoving && Math.hypot(ball.vx, ball.vy) < 0.1 && ball.y < 400)) {
      handleRollEnd();
    }
  }

  // Roll Finish & Score Processing
  function handleRollEnd() {
    gamePhase = 'FRAME_END';

    const standingPins = pins.filter(p => !p.knocked);
    const knockedCount = 10 - standingPins.length;

    const rolls = playerRolls[currentPlayer][currentFrame];
    let prevRollsCount = rolls.length;

    let pinsKnockedThisRoll = 0;
    if (prevRollsCount === 0) {
      pinsKnockedThisRoll = knockedCount;
    } else if (prevRollsCount === 1) {
      if (currentFrame === 10 && rolls[0] === 10) {
        pinsKnockedThisRoll = knockedCount;
      } else {
        pinsKnockedThisRoll = knockedCount - rolls[0];
      }
    } else if (prevRollsCount === 2) {
      if (rolls[0] + rolls[1] >= 10) {
        pinsKnockedThisRoll = knockedCount - (rolls[1] === 10 || rolls[0] + rolls[1] === 10 ? 0 : rolls[1]);
      }
    }
    pinsKnockedThisRoll = Math.max(0, Math.min(10, pinsKnockedThisRoll));
    rolls.push(pinsKnockedThisRoll);

    let rollText = '';
    if (pinsKnockedThisRoll === 10) {
      rollText = '❌ STRIKE!';
      if (typeof confetti === 'function') {
        confetti({ particleCount: 60, spread: 70, origin: { y: 0.6 } });
      }
    } else if (prevRollsCount === 1 && (rolls[0] + pinsKnockedThisRoll === 10)) {
      rollText = '╱ SPARE!';
      if (typeof confetti === 'function') {
        confetti({ particleCount: 40, spread: 50, origin: { y: 0.6 } });
      }
    } else {
      rollText = `🎳 ${pinsKnockedThisRoll} PIN${pinsKnockedThisRoll === 1 ? '' : 'S'} DOWN!`;
    }
    setStatus(rollText);

    updateScoreboardUI();

    setTimeout(() => {
      advanceTurn(pinsKnockedThisRoll);
    }, 1200);
  }

  function advanceTurn(pinsKnockedThisRoll) {
    const rolls = playerRolls[currentPlayer][currentFrame];

    if (currentFrame < 10) {
      if (rolls[0] === 10 || rolls.length === 2) {
        nextTurn();
      } else {
        currentRoll = 2;
        resetBallAndKeepStandingPins();
      }
    } else {
      if (rolls.length === 1) {
        if (rolls[0] === 10) {
          resetAllPinsAndBall();
        } else {
          resetBallAndKeepStandingPins();
        }
      } else if (rolls.length === 2) {
        if (rolls[0] + rolls[1] >= 10) {
          if (rolls[1] === 10 || rolls[0] + rolls[1] === 10) {
            resetAllPinsAndBall();
          } else {
            resetBallAndKeepStandingPins();
          }
        } else {
          nextTurn();
        }
      } else {
        nextTurn();
      }
    }
  }

  function nextTurn() {
    if (gameMode === 'bot') {
      if (currentPlayer === 1) {
        currentPlayer = 2;
        currentRoll = 1;
        resetAllPinsAndBall();
        updateTurnUI();
        triggerBotTurn();
      } else {
        if (currentFrame === 10) {
          endGame();
        } else {
          currentPlayer = 1;
          currentFrame++;
          currentRoll = 1;
          resetAllPinsAndBall();
          updateTurnUI();
          gamePhase = 'AIM';
          setStatus('👆 YOUR TURN! SWIPE OR DRAG UPWARD TO BOWL');
        }
      }
    } else {
      if (currentPlayer === 1) {
        currentPlayer = 2;
        currentRoll = 1;
        resetAllPinsAndBall();
        updateTurnUI();
        gamePhase = 'AIM';
        setStatus('👥 PLAYER 2 TURN! SWIPE OR DRAG UPWARD');
      } else {
        if (currentFrame === 10) {
          endGame();
        } else {
          currentPlayer = 1;
          currentFrame++;
          currentRoll = 1;
          resetAllPinsAndBall();
          updateTurnUI();
          gamePhase = 'AIM';
          setStatus('🔴 PLAYER 1 TURN! SWIPE OR DRAG UPWARD');
        }
      }
    }
  }

  function resetAllPinsAndBall() {
    ball.reset();
    pins.forEach(p => p.reset());
    gamePhase = 'AIM';
  }

  function resetBallAndKeepStandingPins() {
    ball.reset();
    pins.forEach(p => {
      p.vx = 0;
      p.vy = 0;
      if (!p.knocked) {
        p.x = p.startX;
        p.y = p.startY;
      } else {
        p.opacity = 0;
      }
    });
    gamePhase = 'AIM';
  }

  function endGame() {
    gamePhase = 'GAME_OVER';
    const scoreP1 = calculateTotalScore(1);
    const scoreP2 = calculateTotalScore(2);

    let winText = '';
    if (scoreP1 > scoreP2) {
      winText = `🎉 PLAYER 1 WINS! (${scoreP1} - ${scoreP2})`;
      turnInfo.className = 'turn-badge win-turn';
    } else if (scoreP2 > scoreP1) {
      const p2Title = gameMode === 'bot' ? 'BOT 🤖' : 'PLAYER 2 👥';
      winText = `🏆 ${p2Title} WINS! (${scoreP2} - ${scoreP1})`;
      turnInfo.className = 'turn-badge win-turn';
    } else {
      winText = `🤝 IT'S A DRAW MATCH! (${scoreP1} - ${scoreP2})`;
      turnInfo.className = 'turn-badge win-turn';
    }

    turnInfo.textContent = winText;
    setStatus('🎮 MATCH COMPLETED! CLICK RESET TO PLAY AGAIN');

    if (typeof confetti === 'function') {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
    }
  }

  function setStatus(msg) {
    statusBanner.textContent = msg;
  }

  function updateTurnUI() {
    if (gamePhase === 'GAME_OVER') return;
    if (currentPlayer === 1) {
      turnInfo.className = 'turn-badge p1-turn';
      turnInfo.textContent = `CURRENT TURN: PLAYER 1 🔴 (FRAME ${currentFrame} / ROLL ${currentRoll})`;
    } else {
      if (gameMode === 'bot') {
        turnInfo.className = 'turn-badge bot-turn';
        turnInfo.textContent = `CURRENT TURN: BOT 🤖 (FRAME ${currentFrame} / ROLL ${currentRoll})`;
      } else {
        turnInfo.className = 'turn-badge p2-turn';
        turnInfo.textContent = `CURRENT TURN: PLAYER 2 🔵 (FRAME ${currentFrame} / ROLL ${currentRoll})`;
      }
    }
  }

  // 10-Frame Bowling Score Calculation Engine
  function calculateTotalScore(p) {
    let total = 0;
    const allRolls = [];

    for (let f = 1; f <= 10; f++) {
      const fRolls = playerRolls[p][f];
      for (let r of fRolls) {
        allRolls.push(r);
      }
    }

    let rollIdx = 0;
    for (let f = 1; f <= 10; f++) {
      const fRolls = playerRolls[p][f];
      if (fRolls.length === 0) break;

      if (f < 10) {
        if (fRolls[0] === 10) {
          total += 10;
          if (allRolls[rollIdx + 1] !== undefined) total += allRolls[rollIdx + 1];
          if (allRolls[rollIdx + 2] !== undefined) total += allRolls[rollIdx + 2];
          rollIdx += 1;
        } else if (fRolls.length === 2 && (fRolls[0] + fRolls[1] === 10)) {
          total += 10;
          if (allRolls[rollIdx + 2] !== undefined) total += allRolls[rollIdx + 2];
          rollIdx += 2;
        } else {
          const frameSum = fRolls.reduce((a, b) => a + b, 0);
          total += frameSum;
          rollIdx += fRolls.length;
        }
      } else {
        const frame10Sum = fRolls.reduce((a, b) => a + b, 0);
        total += frame10Sum;
      }
    }
    return total;
  }

  function updateScoreboardUI() {
    [1, 2].forEach(p => {
      for (let f = 1; f <= 10; f++) {
        const cell = document.getElementById(`f${f}-p${p}`);
        const fRolls = playerRolls[p][f];

        if (!cell) continue;

        if (fRolls.length === 0) {
          cell.textContent = '-';
          continue;
        }

        let text = '';
        if (f < 10) {
          if (fRolls[0] === 10) {
            text = 'X';
          } else if (fRolls.length === 1) {
            text = fRolls[0] === 0 ? '-' : fRolls[0];
          } else if (fRolls.length === 2) {
            const r1 = fRolls[0] === 0 ? '-' : fRolls[0];
            const r2 = (fRolls[0] + fRolls[1] === 10) ? '/' : (fRolls[1] === 0 ? '-' : fRolls[1]);
            text = `${r1} ${r2}`;
          }
        } else {
          text = fRolls.map((r, i) => {
            if (r === 10) return 'X';
            if (i > 0 && fRolls[i-1] + r === 10 && fRolls[i-1] !== 10) return '/';
            return r === 0 ? '-' : r;
          }).join(' ');
        }
        cell.textContent = text;
      }

      document.getElementById(`tot-p${p}`).textContent = calculateTotalScore(p);
    });
  }

  // Main Canvas Rendering Function
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // 1. Draw Lane Floor & Wood Planks
    const laneGrad = ctx.createLinearGradient(0, 0, 0, canvas.height);
    laneGrad.addColorStop(0, '#1e1b4b');
    laneGrad.addColorStop(0.2, '#b45309');
    laneGrad.addColorStop(0.9, '#d97706');
    laneGrad.addColorStop(1, '#92400e');
    ctx.fillStyle = laneGrad;
    ctx.fillRect(LANE_LEFT, 0, LANE_RIGHT - LANE_LEFT, canvas.height);

    // Wood Plank Lines
    ctx.strokeStyle = 'rgba(0, 0, 0, 0.12)';
    ctx.lineWidth = 1;
    for (let x = LANE_LEFT + 25; x < LANE_RIGHT; x += 25) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, canvas.height);
      ctx.stroke();
    }

    // 2. Draw Gutters
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, LANE_LEFT, canvas.height);
    ctx.fillRect(LANE_RIGHT, 0, 50, canvas.height);

    // Neon Border Lines
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(LANE_LEFT, 0);
    ctx.lineTo(LANE_LEFT, canvas.height);
    ctx.moveTo(LANE_RIGHT, 0);
    ctx.lineTo(LANE_RIGHT, canvas.height);
    ctx.stroke();

    // 3. Draw Foul Line
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 4;
    ctx.beginPath();
    ctx.moveTo(LANE_LEFT, START_BALL_Y + 18);
    ctx.lineTo(LANE_RIGHT, START_BALL_Y + 18);
    ctx.stroke();

    // Lane Arrow Markers
    ctx.fillStyle = 'rgba(255, 255, 255, 0.3)';
    [120, 160, 200, 240, 280].forEach(ax => {
      ctx.beginPath();
      ctx.moveTo(ax, 340);
      ctx.lineTo(ax - 6, 355);
      ctx.lineTo(ax + 6, 355);
      ctx.closePath();
      ctx.fill();
    });

    // 4. Draw Pit
    ctx.fillStyle = '#020617';
    ctx.fillRect(0, 0, canvas.width, 45);

    // 5. Draw Aim Arrow during DRAGGING or AIM
    if ((gamePhase === 'AIM' || gamePhase === 'DRAGGING') && (gameMode !== 'bot' || currentPlayer === 1)) {
      ctx.save();
      ctx.strokeStyle = gamePhase === 'DRAGGING' ? '#facc15' : 'rgba(255, 255, 255, 0.5)';
      ctx.lineWidth = gamePhase === 'DRAGGING' ? 4 : 2;
      ctx.setLineDash([8, 6]);

      let targetX = ball.x;
      let targetY = 140;
      if (gamePhase === 'DRAGGING' && currentDragPos) {
        const dx = currentDragPos.x - dragStartPos.x;
        const dy = currentDragPos.y - dragStartPos.y;
        if (dy < 0) {
          targetX = ball.x + (dx * 1.5);
          targetY = ball.y + (dy * 1.5);
        }
      }

      ctx.beginPath();
      ctx.moveTo(ball.x, ball.y);
      ctx.lineTo(targetX, targetY);
      ctx.stroke();
      ctx.restore();
    }

    // 6. Draw Pins
    pins.forEach(pin => {
      if (pin.opacity <= 0) return;
      ctx.save();
      ctx.globalAlpha = pin.opacity;
      ctx.translate(pin.x, pin.y);
      ctx.rotate(pin.rotation);

      if (!pin.knocked) {
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.beginPath();
        ctx.ellipse(0, 4, pin.radius, pin.radius * 0.5, 0, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, pin.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        ctx.fillStyle = '#ef4444';
        ctx.beginPath();
        ctx.arc(0, 0, pin.radius * 0.6, 0, Math.PI * 2);
        ctx.fill();

        ctx.fillStyle = '#ffffff';
        ctx.beginPath();
        ctx.arc(0, 0, pin.radius * 0.25, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillStyle = '#cbd5e1';
        ctx.beginPath();
        ctx.ellipse(0, 0, pin.radius * 1.2, pin.radius * 0.6, 0, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#64748b';
        ctx.lineWidth = 1;
        ctx.stroke();
      }
      ctx.restore();
    });

    // 7. Draw Bowling Ball
    if (ball.y > 20) {
      ctx.save();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.beginPath();
      ctx.ellipse(ball.x + 3, ball.y + 4, ball.radius, ball.radius * 0.6, 0, 0, Math.PI * 2);
      ctx.fill();

      const ballGrad = ctx.createRadialGradient(
        ball.x - 4, ball.y - 4, 2,
        ball.x, ball.y, ball.radius
      );
      if (currentPlayer === 1) {
        ballGrad.addColorStop(0, '#fca5a5');
        ballGrad.addColorStop(0.5, '#ef4444');
        ballGrad.addColorStop(1, '#7f1d1d');
      } else {
        ballGrad.addColorStop(0, '#7dd3fc');
        ballGrad.addColorStop(0.5, '#0284c7');
        ballGrad.addColorStop(1, '#0c4a6e');
      }

      ctx.fillStyle = ballGrad;
      ctx.beginPath();
      ctx.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.stroke();

      ctx.fillStyle = '#0f172a';
      ctx.beginPath();
      ctx.arc(ball.x - 4, ball.y - 4, 2.5, 0, Math.PI * 2);
      ctx.arc(ball.x + 4, ball.y - 4, 2.5, 0, Math.PI * 2);
      ctx.arc(ball.x, ball.y + 3, 3, 0, Math.PI * 2);
      ctx.fill();

      ctx.restore();
    }
  }

  function gameLoop() {
    updatePhysics();
    render();
    requestAnimationFrame(gameLoop);
  }

  resetMatch();
  gameLoop();
});
