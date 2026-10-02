/**
 * Memory Card Match Puzzle Engine
 * Modes: Solo, vs Bot (AI Memory), and 2 Players (Pass & Play)
 * Features: 3D Flip Transitions, 3 Themes, Bot AI Simulator, Turn Engine, Web Audio Synth
 */

(function () {
  'use strict';

  // Card Emoji Themes
  const THEMES = {
    animals: ['🐱', '🐶', '🦊', '🐼', '🦁', '🐸', '🦄', '🐙', '🐧', '🐨'],
    food: ['🍕', '🍔', '🍟', '🍩', '🍦', '🍓', '🥑', '🌮', '🍉', '🧁'],
    arcade: ['🕹️', '👾', '🎲', '🎯', '🚀', '💎', '⚡', '👑', '🏆', '💣']
  };

  const DIFFICULTIES = {
    easy: { pairs: 6, cols: 4, rows: 3, class: 'grid-easy' },
    medium: { pairs: 8, cols: 4, rows: 4, class: 'grid-medium' },
    hard: { pairs: 10, cols: 5, rows: 4, class: 'grid-hard' }
  };

  // State
  let currentMode = 'solo'; // 'solo' | 'bot' | '2p'
  let currentDifficulty = 'medium';
  let currentTheme = 'animals';
  let deckData = [];
  let cards = [];
  let firstCard = null;
  let secondCard = null;
  let isBoardLocked = false;
  let moves = 0;
  let matchesFound = 0;
  let comboStreak = 0;
  let timerInterval = null;
  let secondsElapsed = 0;
  let isGameStarted = false;
  let isPeeking = false;
  let soundEnabled = true;

  // Multiplayer / Bot State
  let currentTurn = 'player'; // 'player' | 'bot' (in bot mode) or 'p1' | 'p2' (in 2p mode)
  let p1Score = 0;
  let p2Score = 0;
  let botScore = 0;
  let botMemory = {}; // { cardIndex: cardId }
  let botTimeoutId1 = null;
  let botTimeoutId2 = null;

  // DOM Elements
  const cardGrid = document.getElementById('card-grid');
  const modePills = document.querySelectorAll('.mode-pill');
  const diffPills = document.querySelectorAll('.diff-pill');
  const themeSelect = document.getElementById('theme-select');
  const btnRestart = document.getElementById('btn-restart');
  const btnPeek = document.getElementById('btn-peek');
  const btnSound = document.getElementById('sound-toggle-btn');
  const comboBanner = document.getElementById('combo-banner');
  const comboMultiplierEl = document.getElementById('combo-multiplier');

  // Turn Banner Elements
  const turnBanner = document.getElementById('turn-banner');
  const turnBadge = document.getElementById('turn-badge');
  const turnIcon = document.getElementById('turn-icon');
  const turnText = document.getElementById('turn-text');

  // Stats Elements
  const statBox1 = document.getElementById('stat-box-1');
  const statLabel1 = document.getElementById('stat-label-1');
  const statVal1 = document.getElementById('stat-val-1');

  const statBox2 = document.getElementById('stat-box-2');
  const statLabel2 = document.getElementById('stat-label-2');
  const statVal2 = document.getElementById('stat-val-2');

  const statBox3 = document.getElementById('stat-box-3');
  const statLabel3 = document.getElementById('stat-label-3');
  const statVal3 = document.getElementById('stat-val-3');

  const statBox4 = document.getElementById('stat-box-4');
  const statLabel4 = document.getElementById('stat-label-4');
  const statVal4 = document.getElementById('stat-val-4');

  // Modal Elements
  const victoryModal = document.getElementById('victory-modal');
  const modalHeroIcon = document.getElementById('modal-hero-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalLabel1 = document.getElementById('modal-label-1');
  const modalVal1 = document.getElementById('modal-val-1');
  const modalLabel2 = document.getElementById('modal-label-2');
  const modalVal2 = document.getElementById('modal-val-2');
  const modalLabel3 = document.getElementById('modal-label-3');
  const modalVal3 = document.getElementById('modal-val-3');
  const modalNewBest = document.getElementById('modal-new-best');
  const btnModalRestart = document.getElementById('btn-modal-restart');

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
      if (type === 'flip') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(320, now);
        osc.frequency.exponentialRampToValueAtTime(500, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'match') {
        const chord = [523.25, 659.25, 783.99, 1046.50];
        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.22, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.22);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.23);
        });
      } else if (type === 'mismatch') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.12);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'turn') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(660, now + 0.07);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.07);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.08);
      } else if (type === 'win') {
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.28, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.31);
        });
      }
    } catch (e) {}
  }

  // Best Record Management (Solo Mode)
  function getBestMoves(diff) {
    try {
      return localStorage.getItem(`nexus_memory_best_${diff}`) || null;
    } catch (e) {
      return null;
    }
  }

  function saveBestMoves(diff, newMoves) {
    try {
      const currentBest = getBestMoves(diff);
      if (!currentBest || newMoves < parseInt(currentBest, 10)) {
        localStorage.setItem(`nexus_memory_best_${diff}`, newMoves.toString());
        return true;
      }
    } catch (e) {}
    return false;
  }

  // Format Time Helper
  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  }

  // Timer Controls
  function startTimer() {
    if (isGameStarted) return;
    isGameStarted = true;
    secondsElapsed = 0;
    timerInterval = setInterval(() => {
      secondsElapsed++;
      const timeStr = formatTime(secondsElapsed);
      if (currentMode === 'solo') {
        statVal2.textContent = timeStr;
      } else {
        statVal3.textContent = timeStr;
      }
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isGameStarted = false;
  }

  function clearBotTimeouts() {
    if (botTimeoutId1) clearTimeout(botTimeoutId1);
    if (botTimeoutId2) clearTimeout(botTimeoutId2);
    botTimeoutId1 = null;
    botTimeoutId2 = null;
  }

  // Shuffle Fisher-Yates
  function shuffle(array) {
    let currentIndex = array.length;
    let randomIndex;
    while (currentIndex !== 0) {
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    return array;
  }

  // Update Turn Banner & Scoreboard UI
  function updateScoreboardUI() {
    const totalPairs = DIFFICULTIES[currentDifficulty].pairs;
    const remainingPairs = totalPairs - matchesFound;

    if (currentMode === 'solo') {
      turnBanner.style.display = 'none';
      btnPeek.style.display = 'inline-flex';

      statLabel1.textContent = 'MOVES';
      statVal1.textContent = moves;

      statLabel2.textContent = 'TIME';
      statVal2.textContent = formatTime(secondsElapsed);

      statLabel3.textContent = 'PAIRS';
      statVal3.textContent = `${matchesFound}/${totalPairs}`;

      statLabel4.textContent = 'BEST';
      const best = getBestMoves(currentDifficulty);
      statVal4.textContent = best ? `${best}` : '-';

      statBox1.classList.remove('active-turn');
      statBox2.classList.remove('active-turn');
      statBox3.classList.remove('active-turn');
      statBox4.classList.remove('active-turn');
      statBox4.className = 'stat-box best-box';
    } else if (currentMode === 'bot') {
      turnBanner.style.display = 'flex';
      btnPeek.style.display = 'none';

      statLabel1.textContent = '👤 YOU';
      statVal1.textContent = p1Score;

      statLabel2.textContent = '🤖 BOT';
      statVal2.textContent = botScore;

      statLabel3.textContent = 'TIME';
      statVal3.textContent = formatTime(secondsElapsed);

      statLabel4.textContent = 'LEFT';
      statVal4.textContent = remainingPairs;
      statBox4.className = 'stat-box';

      if (currentTurn === 'player') {
        turnBadge.className = 'turn-badge turn-player';
        turnIcon.textContent = '👤';
        turnText.textContent = 'YOUR TURN';
        statBox1.classList.add('active-turn');
        statBox2.classList.remove('active-turn');
      } else {
        turnBadge.className = 'turn-badge turn-bot';
        turnIcon.textContent = '🤖';
        turnText.textContent = "BOT'S TURN";
        statBox1.classList.remove('active-turn');
        statBox2.classList.add('active-turn');
      }
    } else if (currentMode === '2p') {
      turnBanner.style.display = 'flex';
      btnPeek.style.display = 'none';

      statLabel1.textContent = '🟦 P1';
      statVal1.textContent = p1Score;

      statLabel2.textContent = '🟪 P2';
      statVal2.textContent = p2Score;

      statLabel3.textContent = 'TIME';
      statVal3.textContent = formatTime(secondsElapsed);

      statLabel4.textContent = 'LEFT';
      statVal4.textContent = remainingPairs;
      statBox4.className = 'stat-box';

      if (currentTurn === 'p1') {
        turnBadge.className = 'turn-badge turn-p1';
        turnIcon.textContent = '🟦';
        turnText.textContent = "PLAYER 1'S TURN";
        statBox1.classList.add('active-turn');
        statBox2.classList.remove('active-turn');
      } else {
        turnBadge.className = 'turn-badge turn-p2';
        turnIcon.textContent = '🟪';
        turnText.textContent = "PLAYER 2'S TURN";
        statBox1.classList.remove('active-turn');
        statBox2.classList.add('active-turn');
      }
    }
  }

  // Initialize Game Board
  function initGame() {
    stopTimer();
    clearBotTimeouts();

    secondsElapsed = 0;
    moves = 0;
    matchesFound = 0;
    comboStreak = 0;
    p1Score = 0;
    p2Score = 0;
    botScore = 0;
    botMemory = {};
    firstCard = null;
    secondCard = null;
    isBoardLocked = false;
    isPeeking = false;
    currentTurn = currentMode === '2p' ? 'p1' : 'player';

    victoryModal.style.display = 'none';
    comboBanner.classList.remove('show');

    updateScoreboardUI();

    const config = DIFFICULTIES[currentDifficulty];
    const totalPairs = config.pairs;

    // Pick emojis for theme
    const themePool = THEMES[currentTheme] || THEMES.animals;
    const selectedEmojis = themePool.slice(0, totalPairs);

    // Create Pair Deck
    deckData = [];
    selectedEmojis.forEach((emoji, id) => {
      deckData.push({ id, emoji });
      deckData.push({ id, emoji });
    });
    shuffle(deckData);

    // Set Grid Class
    cardGrid.className = `card-grid ${config.class}`;
    cardGrid.innerHTML = '';

    // Render Cards
    cards = deckData.map((cardItem, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.id = cardItem.id;
      cardEl.dataset.index = index;
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', `Card ${index + 1}`);

      cardEl.innerHTML = `
        <div class="card-face card-back">✨</div>
        <div class="card-face card-front">${cardItem.emoji}</div>
      `;

      cardEl.addEventListener('click', () => handlePlayerCardClick(cardEl, cardItem, index));
      cardGrid.appendChild(cardEl);
      return cardEl;
    });
  }

  // Handle Player Card Click
  function handlePlayerCardClick(cardEl, cardItem, index) {
    if (isBoardLocked || isPeeking) return;
    if (currentMode === 'bot' && currentTurn === 'bot') return; // Ignore human click on Bot turn
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    startTimer();
    flipCard(cardEl, cardItem, index);
  }

  // Core Flip Card Routine
  function flipCard(cardEl, cardItem, index) {
    playSound('flip');
    cardEl.classList.add('flipped');

    // Register card in bot's memory for both human and bot turns
    botMemory[index] = cardItem.id;

    if (!firstCard) {
      firstCard = { el: cardEl, data: cardItem, index };
    } else {
      secondCard = { el: cardEl, data: cardItem, index };
      moves++;
      isBoardLocked = true;
      checkForMatch();
    }
  }

  // Check For Match
  function checkForMatch() {
    const isMatch = firstCard.data.id === secondCard.data.id;

    if (isMatch) {
      handleMatchSuccess();
    } else {
      handleMismatch();
    }
  }

  // Handle Match Success
  function handleMatchSuccess() {
    matchesFound++;
    const totalPairs = DIFFICULTIES[currentDifficulty].pairs;

    // Assign Score to active entity
    if (currentMode === 'solo') {
      comboStreak++;
      if (comboStreak > 1) {
        comboMultiplierEl.textContent = comboStreak;
        comboBanner.classList.add('show');
        setTimeout(() => comboBanner.classList.remove('show'), 1200);
      }
    } else if (currentMode === 'bot') {
      if (currentTurn === 'player') {
        p1Score++;
      } else {
        botScore++;
      }
    } else if (currentMode === '2p') {
      if (currentTurn === 'p1') {
        p1Score++;
      } else {
        p2Score++;
      }
    }

    playSound('match');

    setTimeout(() => {
      if (firstCard && secondCard) {
        firstCard.el.classList.add('matched');
        secondCard.el.classList.add('matched');

        // Delete from bot memory since they are already matched
        delete botMemory[firstCard.index];
        delete botMemory[secondCard.index];

        resetCardSelection();
      }

      updateScoreboardUI();

      // Check if Game Completed
      if (matchesFound === totalPairs) {
        handleVictory();
      } else {
        // Pass Turn to next player / bot (as requested: turn alternates every turn)
        passTurn();
      }
    }, 320);
  }

  // Handle Mismatch
  function handleMismatch() {
    comboStreak = 0;
    playSound('mismatch');

    setTimeout(() => {
      if (firstCard && secondCard) {
        firstCard.el.classList.add('shake');
        secondCard.el.classList.add('shake');

        setTimeout(() => {
          if (firstCard && secondCard) {
            firstCard.el.classList.remove('flipped', 'shake');
            secondCard.el.classList.remove('flipped', 'shake');
            resetCardSelection();
            updateScoreboardUI();
            passTurn();
          }
        }, 400);
      }
    }, 450);
  }

  function resetCardSelection() {
    firstCard = null;
    secondCard = null;
    isBoardLocked = false;
  }

  // Pass Turn Routine
  function passTurn() {
    if (currentMode === 'solo') {
      isBoardLocked = false;
      return;
    }

    if (currentMode === 'bot') {
      currentTurn = currentTurn === 'player' ? 'bot' : 'player';
      updateScoreboardUI();
      playSound('turn');

      if (currentTurn === 'bot') {
        isBoardLocked = true;
        scheduleBotTurn();
      } else {
        isBoardLocked = false;
      }
    } else if (currentMode === '2p') {
      currentTurn = currentTurn === 'p1' ? 'p2' : 'p1';
      updateScoreboardUI();
      playSound('turn');
      isBoardLocked = false;
    }
  }

  // Smart Bot AI Simulator
  function scheduleBotTurn() {
    botTimeoutId1 = setTimeout(() => {
      executeBotMove();
    }, 750);
  }

  function executeBotMove() {
    if (matchesFound === DIFFICULTIES[currentDifficulty].pairs) return;

    // Get list of unmatched card indexes
    const availableIndexes = [];
    cards.forEach((cardEl, idx) => {
      if (!cardEl.classList.contains('matched') && !cardEl.classList.contains('flipped')) {
        availableIndexes.push(idx);
      }
    });

    if (availableIndexes.length === 0) return;

    let pickIndex1 = null;
    let pickIndex2 = null;

    // Strategy 1: Check if bot already has a known matching pair in memory
    const memoryGroups = {};
    for (const [idxStr, id] of Object.entries(botMemory)) {
      const idx = parseInt(idxStr, 10);
      if (availableIndexes.includes(idx)) {
        if (!memoryGroups[id]) memoryGroups[id] = [];
        memoryGroups[id].push(idx);
      }
    }

    for (const id in memoryGroups) {
      if (memoryGroups[id].length >= 2) {
        pickIndex1 = memoryGroups[id][0];
        pickIndex2 = memoryGroups[id][1];
        break;
      }
    }

    // Strategy 2: If no known pair, pick an unrevealed card for Card 1
    if (pickIndex1 === null) {
      const unknownIndexes = availableIndexes.filter(idx => botMemory[idx] === undefined);
      if (unknownIndexes.length > 0) {
        pickIndex1 = unknownIndexes[Math.floor(Math.random() * unknownIndexes.length)];
      } else {
        pickIndex1 = availableIndexes[Math.floor(Math.random() * availableIndexes.length)];
      }
    }

    // Flip Bot's First Card
    const cardEl1 = cards[pickIndex1];
    const cardData1 = deckData[pickIndex1];
    flipCard(cardEl1, cardData1, pickIndex1);

    // Bot thinks before picking Card 2
    botTimeoutId2 = setTimeout(() => {
      // Strategy 3: Check if newly flipped Card 1 matches any other card in memory!
      if (pickIndex2 === null) {
        for (const [idxStr, id] of Object.entries(botMemory)) {
          const idx = parseInt(idxStr, 10);
          if (idx !== pickIndex1 && availableIndexes.includes(idx) && id === cardData1.id) {
            pickIndex2 = idx;
            break;
          }
        }
      }

      // Strategy 4: If still no known match, pick another unrevealed or random card
      if (pickIndex2 === null) {
        const remainingChoices = availableIndexes.filter(idx => idx !== pickIndex1);
        const unknownChoices = remainingChoices.filter(idx => botMemory[idx] === undefined);
        if (unknownChoices.length > 0) {
          pickIndex2 = unknownChoices[Math.floor(Math.random() * unknownChoices.length)];
        } else {
          pickIndex2 = remainingChoices[Math.floor(Math.random() * remainingChoices.length)];
        }
      }

      const cardEl2 = cards[pickIndex2];
      const cardData2 = deckData[pickIndex2];
      flipCard(cardEl2, cardData2, pickIndex2);
    }, 800);
  }

  // Handle Game Victory / Game Over Modal
  function handleVictory() {
    stopTimer();
    clearBotTimeouts();
    playSound('win');

    if (currentMode === 'solo') {
      modalHeroIcon.textContent = '🏆';
      modalTitle.textContent = 'GREAT MEMORY!';
      modalDesc.textContent = 'You matched all cards successfully!';

      modalLabel1.textContent = 'Total Moves';
      modalVal1.textContent = moves;

      modalLabel2.textContent = 'Time Taken';
      modalVal2.textContent = formatTime(secondsElapsed);

      const isNewBest = saveBestMoves(currentDifficulty, moves);
      const bestRecord = getBestMoves(currentDifficulty);

      modalLabel3.textContent = 'Best Record';
      modalVal3.textContent = bestRecord || moves;
      modalNewBest.style.display = isNewBest ? 'block' : 'none';
    } else if (currentMode === 'bot') {
      modalNewBest.style.display = 'none';
      modalLabel1.textContent = 'You (Pairs)';
      modalVal1.textContent = p1Score;
      modalLabel2.textContent = 'Bot (Pairs)';
      modalVal2.textContent = botScore;
      modalLabel3.textContent = 'Time';
      modalVal3.textContent = formatTime(secondsElapsed);

      if (p1Score > botScore) {
        modalHeroIcon.textContent = '🎉';
        modalTitle.textContent = 'YOU WIN!';
        modalDesc.textContent = `You outsmarted the Bot with ${p1Score} vs ${botScore} pairs!`;
      } else if (botScore > p1Score) {
        modalHeroIcon.textContent = '🤖';
        modalTitle.textContent = 'BOT WINS!';
        modalDesc.textContent = `The Bot had sharp memory this round (${botScore} vs ${p1Score})!`;
      } else {
        modalHeroIcon.textContent = '🤝';
        modalTitle.textContent = "IT'S A TIE!";
        modalDesc.textContent = `Both you and the Bot matched ${p1Score} pairs equally!`;
      }
    } else if (currentMode === '2p') {
      modalNewBest.style.display = 'none';
      modalLabel1.textContent = 'P1 Pairs';
      modalVal1.textContent = p1Score;
      modalLabel2.textContent = 'P2 Pairs';
      modalVal2.textContent = p2Score;
      modalLabel3.textContent = 'Time';
      modalVal3.textContent = formatTime(secondsElapsed);

      if (p1Score > p2Score) {
        modalHeroIcon.textContent = '👑';
        modalTitle.textContent = 'PLAYER 1 WINS!';
        modalDesc.textContent = `Player 1 won the memory battle with ${p1Score} pairs!`;
      } else if (p2Score > p1Score) {
        modalHeroIcon.textContent = '👑';
        modalTitle.textContent = 'PLAYER 2 WINS!';
        modalDesc.textContent = `Player 2 won the memory battle with ${p2Score} pairs!`;
      } else {
        modalHeroIcon.textContent = '🤝';
        modalTitle.textContent = "TIED GAME!";
        modalDesc.textContent = `Equally matched memory masters (${p1Score} pairs each)!`;
      }
    }

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#facc15', '#fb7185', '#4ade80', '#c084fc']
      });
    }

    victoryModal.style.display = 'flex';
  }

  // Hint Peek (Only in Solo Mode)
  function handlePeek() {
    if (isPeeking || isBoardLocked || matchesFound === DIFFICULTIES[currentDifficulty].pairs) return;
    isPeeking = true;
    btnPeek.disabled = true;

    cards.forEach(c => {
      if (!c.classList.contains('matched')) {
        c.classList.add('flipped');
      }
    });

    setTimeout(() => {
      cards.forEach(c => {
        if (!c.classList.contains('matched')) {
          c.classList.remove('flipped');
        }
      });
      isPeeking = false;
      setTimeout(() => {
        btnPeek.disabled = false;
      }, 2000);
    }, 1100);
  }

  // Event Listeners: Mode Switcher
  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      modePills.forEach(p => {
        p.classList.remove('active');
        p.setAttribute('aria-selected', 'false');
      });
      pill.classList.add('active');
      pill.setAttribute('aria-selected', 'true');
      currentMode = pill.dataset.mode;
      initGame();
    });
  });

  // Event Listeners: Difficulty Pills
  diffPills.forEach(pill => {
    pill.addEventListener('click', () => {
      diffPills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentDifficulty = pill.dataset.diff;
      initGame();
    });
  });

  // Event Listeners: Theme Select
  themeSelect.addEventListener('change', (e) => {
    currentTheme = e.target.value;
    initGame();
  });

  // Action Buttons
  btnRestart.addEventListener('click', initGame);
  btnModalRestart.addEventListener('click', initGame);
  btnPeek.addEventListener('click', handlePeek);

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  // Start initial game
  initGame();
})();
