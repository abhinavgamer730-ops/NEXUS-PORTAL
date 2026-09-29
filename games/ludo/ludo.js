// Authentic Ludo King 15x15 Engine - Organized Master Grid
const PLAYERS = [
  { id: 'red', name: 'RED', emoji: '🔴', className: 'red-turn', startCircuitIdx: 0, pawnClass: 'pawn-red' },
  { id: 'green', name: 'GREEN', emoji: '🟢', className: 'green-turn', startCircuitIdx: 13, pawnClass: 'pawn-green' },
  { id: 'yellow', name: 'YELLOW', emoji: '🟡', className: 'yellow-turn', startCircuitIdx: 26, pawnClass: 'pawn-yellow' },
  { id: 'blue', name: 'BLUE', emoji: '🔵', className: 'blue-turn', startCircuitIdx: 39, pawnClass: 'pawn-blue' }
];

// 52 Outer Circuit Track Cells (1-indexed Grid Row r, Col c)
const CIRCUIT = [
  { r: 7, c: 2, isSafe: true, isStart: 'red' },     // 0: Red Start ⭐
  { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }, { r: 7, c: 6 },
  { r: 6, c: 7 }, { r: 5, c: 7 },
  { r: 4, c: 7, isSafe: true },                     // 7: Top Star ⭐
  { r: 3, c: 7 }, { r: 2, c: 7 }, { r: 1, c: 7 },
  { r: 1, c: 8 },
  { r: 1, c: 9 },
  { r: 2, c: 9, isSafe: true, isStart: 'green' },   // 13: Green Start ⭐
  { r: 3, c: 9 }, { r: 4, c: 9 }, { r: 5, c: 9 }, { r: 6, c: 9 },
  { r: 7, c: 10 }, { r: 7, c: 11 },
  { r: 7, c: 12, isSafe: true },                    // 20: Right Star ⭐
  { r: 7, c: 13 }, { r: 7, c: 14 }, { r: 7, c: 15 },
  { r: 8, c: 15 },
  { r: 9, c: 15 },
  { r: 9, c: 14, isSafe: true, isStart: 'yellow' },  // 26: Yellow Start ⭐
  { r: 9, c: 13 }, { r: 9, c: 12 }, { r: 9, c: 11 }, { r: 9, c: 10 },
  { r: 10, c: 9 }, { r: 11, c: 9 },
  { r: 12, c: 9, isSafe: true },                    // 33: Bottom Star ⭐
  { r: 13, c: 9 }, { r: 14, c: 9 }, { r: 15, c: 9 },
  { r: 15, c: 8 },
  { r: 15, c: 7 },
  { r: 14, c: 7, isSafe: true, isStart: 'blue' },   // 39: Blue Start ⭐
  { r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 },
  { r: 9, c: 6 }, { r: 9, c: 5 },
  { r: 9, c: 4, isSafe: true },                     // 46: Left Star ⭐
  { r: 9, c: 3 }, { r: 9, c: 2 }, { r: 9, c: 1 },
  { r: 8, c: 1 },
  { r: 7, c: 1 }
];

// Colored Home Stretches leading to Center Home Goal
const HOME_STRETCHES = {
  red:    [{r:8,c:2}, {r:8,c:3}, {r:8,c:4}, {r:8,c:5}, {r:8,c:6}, {r:8,c:7}],
  green:  [{r:2,c:8}, {r:3,c:8}, {r:4,c:8}, {r:5,c:8}, {r:6,c:8}, {r:7,c:8}],
  yellow: [{r:8,c:14}, {r:8,c:13}, {r:8,c:12}, {r:8,c:11}, {r:8,c:10}, {r:8,c:9}],
  blue:   [{r:14,c:8}, {r:13,c:8}, {r:12,c:8}, {r:11,c:8}, {r:10,c:8}, {r:9,c:8}]
};

// Player pawn positions: -1 = Yard, 0..55 = Step along path, 56 = Home Goal
let pawns = {
  red: [-1, -1, -1, -1],
  green: [-1, -1, -1, -1],
  yellow: [-1, -1, -1, -1],
  blue: [-1, -1, -1, -1]
};

let isVsBot = true;
let botDifficulty = 4; // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Impossible
let turnIdx = 0; // 0 = Red, 1 = Green, 2 = Yellow, 3 = Blue
let isRolling = false;
let lastRoll = 0;
let gameState = 'WAITING_FOR_ROLL';

const diceValEl = document.getElementById('dice-val');
const btnRoll = document.getElementById('btn-roll');
const turnInfoEl = document.getElementById('turn-info');
const ludoGridEl = document.getElementById('ludo-grid');
const btnBot = document.getElementById('btn-mode-bot');
const btn2p = document.getElementById('btn-mode-2p');
const diffContainerEl = document.getElementById('diff-container');
const diffSliderEl = document.getElementById('diff-slider');
const diffLabelEl = document.getElementById('diff-label');

const DIFF_LABELS = {
  1: 'EASY 🟢',
  2: 'MEDIUM 🟡',
  3: 'HARD 🟠',
  4: 'IMPOSSIBLE 💀'
};

const modeBadgeEl = document.getElementById('mode-badge');
const startOverlayEl = document.getElementById('start-overlay');
const btnStartEl = document.getElementById('btn-start');
const btnReset = document.getElementById('btn-reset');

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
    resetGame();
  });
}

if (btnReset) {
  btnReset.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.remove('hidden');
  });
}

function triggerConfetti() {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({ particleCount: 50, spread: 60, origin: { y: 0.6 } });
  }
}

// Generate Full 57-Step Path for a Player
function getPlayerPath(playerId) {
  const p = PLAYERS.find(x => x.id === playerId);
  const path = [];

  for (let step = 0; step < 51; step++) {
    const circuitIdx = (p.startCircuitIdx + step) % 52;
    path.push(CIRCUIT[circuitIdx]);
  }

  const stretch = HOME_STRETCHES[playerId];
  stretch.forEach(coord => path.push(coord));

  return path;
}

const PLAYER_PATHS = {
  red: getPlayerPath('red'),
  green: getPlayerPath('green'),
  yellow: getPlayerPath('yellow'),
  blue: getPlayerPath('blue')
};

// Populate 52 Circuit Track Cells & 20 Home Stretch Cells
function populateTrackCells() {
  // 52 Outer Circuit Cells
  CIRCUIT.forEach(coord => {
    const cell = document.createElement('div');
    cell.className = 'track-cell';
    cell.style.gridArea = `${coord.r} / ${coord.c} / ${coord.r + 1} / ${coord.c + 1}`;
    cell.dataset.r = coord.r;
    cell.dataset.c = coord.c;

    if (coord.isStart) cell.classList.add(`cell-${coord.isStart}-start`);
    if (coord.isSafe) cell.classList.add('safe-star-cell');

    ludoGridEl.appendChild(cell);
  });

  // Home Stretch Cells
  Object.keys(HOME_STRETCHES).forEach(pId => {
    HOME_STRETCHES[pId].forEach((coord, idx) => {
      // Avoid overwriting center goal cell (8,8) if already center home
      if (coord.r === 8 && coord.c === 8) return;

      const cell = document.createElement('div');
      cell.className = `track-cell cell-${pId}-home`;
      cell.style.gridArea = `${coord.r} / ${coord.c} / ${coord.r + 1} / ${coord.c + 1}`;
      cell.dataset.r = coord.r;
      cell.dataset.c = coord.c;
      ludoGridEl.appendChild(cell);
    });
  });
}

function getCell(r, c) {
  return document.querySelector(`.track-cell[data-r="${r}"][data-c="${c}"]`);
}

// Render Pawn Elements on Board
function renderPawns() {
  PLAYERS.forEach(p => {
    pawns[p.id].forEach((step, idx) => {
      let pawnEl = document.querySelector(`.pawn[data-player="${p.id}"][data-idx="${idx}"]`);
      if (!pawnEl) {
        pawnEl = document.createElement('button');
        pawnEl.className = `pawn ${p.pawnClass}`;
        pawnEl.dataset.player = p.id;
        pawnEl.dataset.idx = idx;
        pawnEl.textContent = p.emoji;

        pawnEl.addEventListener('click', () => handlePawnClick(p.id, idx));
        pawnEl.addEventListener('touchstart', (e) => {
          e.preventDefault();
          handlePawnClick(p.id, idx);
        }, { passive: false });
      }

      if (step === -1) {
        // Yard slot
        const slot = document.getElementById(`slot-${p.id}-${idx}`);
        if (slot && pawnEl.parentElement !== slot) slot.appendChild(pawnEl);
      } else {
        // Board cell
        const path = PLAYER_PATHS[p.id];
        const coord = path[step];
        const cell = getCell(coord.r, coord.c);
        if (cell && pawnEl.parentElement !== cell) cell.appendChild(pawnEl);
      }
    });
  });
}

function updateTurnBadge() {
  const current = PLAYERS[turnIdx];
  if (isVsBot && turnIdx > 0) {
    turnInfoEl.textContent = `BOT (${current.name}) IS THINKING... 🤖`;
  } else {
    turnInfoEl.textContent = `CURRENT TURN: ${current.name} PLAYER ${current.emoji}`;
  }
  turnInfoEl.className = `turn-badge ${current.className}`;

  if (gameState === 'WAITING_FOR_ROLL') {
    const isHumanTurn = !isVsBot || turnIdx === 0;
    btnRoll.disabled = !isHumanTurn;
    btnRoll.style.opacity = isHumanTurn ? '1' : '0.6';
    btnRoll.style.cursor = isHumanTurn ? 'pointer' : 'not-allowed';

    if (!isHumanTurn) {
      setTimeout(autoRollBot, 600);
    }
  } else {
    btnRoll.disabled = true;
    btnRoll.style.opacity = '0.6';
    btnRoll.style.cursor = 'not-allowed';
  }
}

function autoRollBot() {
  if (gameState === 'WAITING_FOR_ROLL' && isVsBot && turnIdx > 0 && !isRolling) {
    rollDice();
  }
}

function getMovablePawns(playerId, roll) {
  const playerPawns = pawns[playerId];
  const movable = [];

  playerPawns.forEach((step, idx) => {
    if (step === -1) {
      if (roll === 6) movable.push(idx);
    } else if (step < 56) {
      if (step + roll <= 56) movable.push(idx);
    }
  });

  return movable;
}

btnRoll.addEventListener('click', rollDice);

function rollDice() {
  if (isRolling || gameState !== 'WAITING_FOR_ROLL') return;

  isRolling = true;
  btnRoll.disabled = true;

  diceValEl.textContent = '🎲';
  diceValEl.style.transform = 'rotate(720deg) scale(1.2)';
  diceValEl.style.transition = 'transform 0.4s ease';

  setTimeout(() => {
    lastRoll = Math.floor(Math.random() * 6) + 1;
    diceValEl.style.transform = 'rotate(0deg) scale(1)';
    diceValEl.textContent = lastRoll;
    isRolling = false;

    const current = PLAYERS[turnIdx];
    const movable = getMovablePawns(current.id, lastRoll);

    if (movable.length === 0) {
      turnInfoEl.textContent = `🎲 ${current.name} ROLLED ${lastRoll} (NO MOVES) ➔ NEXT TURN`;
      setTimeout(() => {
        nextTurn(false);
      }, 700);
    } else {
      gameState = 'WAITING_FOR_MOVE';
      updateTurnBadge();
      highlightPawns(current.id, movable);

      if (isVsBot && turnIdx > 0) {
        setTimeout(() => autoPlayBotMove(current.id, movable), 500);
      }
    }
  }, 400);
}

function autoPlayBotMove(playerId, movable) {
  if (gameState !== 'WAITING_FOR_MOVE') return;

  let chosenIdx = movable[0];

  if (botDifficulty === 1) {
    // Easy: Random choice
    chosenIdx = movable[Math.floor(Math.random() * movable.length)];
  } else if (botDifficulty === 2) {
    // Medium: Prefer exiting yard or advancing furthest pawn
    const yardPawn = movable.find(idx => pawns[playerId][idx] === -1);
    if (yardPawn !== undefined) {
      chosenIdx = yardPawn;
    } else {
      chosenIdx = movable.reduce((best, idx) => (pawns[playerId][idx] > pawns[playerId][best] ? idx : best), movable[0]);
    }
  } else {
    // Hard / Impossible: Heuristic score calculation
    let bestScore = -Infinity;

    movable.forEach(idx => {
      const currentStep = pawns[playerId][idx];
      let score = 0;

      if (currentStep === -1) {
        score += 30; // Exit yard bonus
      } else {
        const nextStep = currentStep + lastRoll;
        score += nextStep; // Progression score

        // Victory bonus
        if (nextStep === 56) score += 100;

        // Capture check bonus
        if (nextStep < 51) {
          const pPath = PLAYER_PATHS[playerId];
          const targetCoord = pPath[nextStep];
          const circuitEntry = CIRCUIT.find(x => x.r === targetCoord.r && x.c === targetCoord.c);

          if (circuitEntry && !circuitEntry.isSafe) {
            PLAYERS.forEach(opp => {
              if (opp.id !== playerId) {
                pawns[opp.id].forEach(oppStep => {
                  if (oppStep >= 0 && oppStep < 51) {
                    const oppCoord = PLAYER_PATHS[opp.id][oppStep];
                    if (oppCoord.r === targetCoord.r && oppCoord.c === targetCoord.c) {
                      score += (botDifficulty === 4 ? 120 : 80); // Capture bonus!
                    }
                  }
                });
              }
            });

            if (circuitEntry.isSafe) score += 40; // Safe star bonus
          }
        }
      }

      if (score > bestScore) {
        bestScore = score;
        chosenIdx = idx;
      }
    });
  }

  handlePawnClick(playerId, chosenIdx);
}

function highlightPawns(playerId, movableIndices) {
  document.querySelectorAll('.pawn').forEach(p => p.classList.remove('movable-pulse'));

  movableIndices.forEach(idx => {
    const pawnEl = document.querySelector(`.pawn[data-player="${playerId}"][data-idx="${idx}"]`);
    if (pawnEl) pawnEl.classList.add('movable-pulse');
  });
}

function handlePawnClick(playerId, pawnIdx) {
  if (gameState !== 'WAITING_FOR_MOVE') return;
  const current = PLAYERS[turnIdx];
  if (current.id !== playerId) return;

  const movable = getMovablePawns(playerId, lastRoll);
  if (!movable.includes(pawnIdx)) return;

  let capturedOpponent = false;
  let currentStep = pawns[playerId][pawnIdx];

  if (currentStep === -1) {
    pawns[playerId][pawnIdx] = 0; // Exit yard onto Start cell
  } else {
    pawns[playerId][pawnIdx] += lastRoll;
  }

  const newStep = pawns[playerId][pawnIdx];

  // Capture Check
  if (newStep < 51) {
    const pPath = PLAYER_PATHS[playerId];
    const targetCoord = pPath[newStep];
    const circuitEntry = CIRCUIT.find(x => x.r === targetCoord.r && x.c === targetCoord.c);

    if (circuitEntry && !circuitEntry.isSafe) {
      PLAYERS.forEach(opp => {
        if (opp.id !== playerId) {
          pawns[opp.id].forEach((oppStep, oppIdx) => {
            if (oppStep >= 0 && oppStep < 51) {
              const oppCoord = PLAYER_PATHS[opp.id][oppStep];
              if (oppCoord.r === targetCoord.r && oppCoord.c === targetCoord.c) {
                pawns[opp.id][oppIdx] = -1; // Sent back to Yard
                capturedOpponent = true;
                triggerConfetti();
              }
            }
          });
        }
      });
    }
  }

  document.querySelectorAll('.pawn').forEach(p => p.classList.remove('movable-pulse'));
  renderPawns();

  // Victory Check
  if (pawns[playerId].every(step => step === 56)) {
    triggerConfetti();
    turnInfoEl.textContent = `🎉 ${current.name} PLAYER IS THE LUDO KING CHAMPION! 👑`;
    turnInfoEl.className = `turn-badge ${current.className}`;
    setTimeout(resetMatch, 3000);
    return;
  }

  const bonusRoll = (lastRoll === 6 || capturedOpponent || newStep === 56);
  nextTurn(bonusRoll);
}

function nextTurn(bonusRoll) {
  if (!bonusRoll) {
    turnIdx = (turnIdx + 1) % PLAYERS.length;
  } else {
    triggerConfetti();
  }
  gameState = 'WAITING_FOR_ROLL';
  lastRoll = 0;
  updateTurnBadge();
}

function resetMatch() {
  pawns = {
    red: [-1, -1, -1, -1],
    green: [-1, -1, -1, -1],
    yellow: [-1, -1, -1, -1],
    blue: [-1, -1, -1, -1]
  };
  turnIdx = 0;
  lastRoll = 0;
  gameState = 'WAITING_FOR_ROLL';
  renderPawns();
  updateTurnBadge();
}

populateTrackCells();
renderPawns();
updateTurnBadge();
