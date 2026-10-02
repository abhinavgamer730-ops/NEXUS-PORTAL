/**
 * Memory Card Match Puzzle Engine
 * Features: 3D Flip Transitions, 3 Themes, Hint Peek, Combo Multipliers, Web Audio Synth
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
  let currentDifficulty = 'medium';
  let currentTheme = 'animals';
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

  // DOM Elements
  const cardGrid = document.getElementById('card-grid');
  const moveCountEl = document.getElementById('move-count');
  const timerValEl = document.getElementById('timer-val');
  const pairsMatchedEl = document.getElementById('pairs-matched');
  const bestMovesEl = document.getElementById('best-moves');
  const comboBanner = document.getElementById('combo-banner');
  const comboMultiplierEl = document.getElementById('combo-multiplier');
  const diffPills = document.querySelectorAll('.diff-pill');
  const themeSelect = document.getElementById('theme-select');
  const btnRestart = document.getElementById('btn-restart');
  const btnPeek = document.getElementById('btn-peek');
  const btnSound = document.getElementById('sound-toggle-btn');

  // Modal Elements
  const victoryModal = document.getElementById('victory-modal');
  const modalMoves = document.getElementById('modal-moves');
  const modalTime = document.getElementById('modal-time');
  const modalBest = document.getElementById('modal-best');
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
        osc.frequency.exponentialRampToValueAtTime(480, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'match') {
        const chord = comboStreak > 1 ? [523.25, 659.25, 783.99, 1046.50] : [523.25, 659.25, 783.99];
        chord.forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.25, now + i * 0.06);
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
        osc.frequency.setValueAtTime(200, now);
        osc.frequency.exponentialRampToValueAtTime(140, now + 0.1);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.1);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.11);
      } else if (type === 'win') {
        [440, 554.37, 659.25, 880].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.1);
          gain.gain.setValueAtTime(0.3, now + i * 0.1);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.1 + 0.3);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.1);
          osc.stop(now + i * 0.1 + 0.31);
        });
      }
    } catch (e) {}
  }

  // Best Record Management
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

  function updateBestRecordUI() {
    const best = getBestMoves(currentDifficulty);
    bestMovesEl.textContent = best ? `${best}` : '-';
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
      timerValEl.textContent = formatTime(secondsElapsed);
    }, 1000);
  }

  function stopTimer() {
    if (timerInterval) {
      clearInterval(timerInterval);
      timerInterval = null;
    }
    isGameStarted = false;
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

  // Initialize Game Board
  function initGame() {
    stopTimer();
    secondsElapsed = 0;
    moves = 0;
    matchesFound = 0;
    comboStreak = 0;
    firstCard = null;
    secondCard = null;
    isBoardLocked = false;
    isPeeking = false;

    moveCountEl.textContent = '0';
    timerValEl.textContent = '00:00';
    victoryModal.style.display = 'none';
    comboBanner.classList.remove('show');

    const config = DIFFICULTIES[currentDifficulty];
    const totalPairs = config.pairs;
    pairsMatchedEl.textContent = `0/${totalPairs}`;
    updateBestRecordUI();

    // Pick emojis for theme
    const themePool = THEMES[currentTheme] || THEMES.animals;
    const selectedEmojis = themePool.slice(0, totalPairs);

    // Create Pair Deck
    const deck = [];
    selectedEmojis.forEach((emoji, id) => {
      deck.push({ id, emoji });
      deck.push({ id, emoji });
    });
    shuffle(deck);

    // Set Grid Class
    cardGrid.className = `card-grid ${config.class}`;
    cardGrid.innerHTML = '';

    // Render Cards
    cards = deck.map((cardData, index) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'memory-card';
      cardEl.dataset.id = cardData.id;
      cardEl.dataset.index = index;
      cardEl.setAttribute('role', 'button');
      cardEl.setAttribute('aria-label', 'Hidden Card');

      cardEl.innerHTML = `
        <div class="card-face card-back">✨</div>
        <div class="card-face card-front">${cardData.emoji}</div>
      `;

      cardEl.addEventListener('click', () => handleCardClick(cardEl, cardData));
      cardGrid.appendChild(cardEl);
      return cardEl;
    });
  }

  // Handle Card Click
  function handleCardClick(cardEl, cardData) {
    if (isBoardLocked || isPeeking) return;
    if (cardEl.classList.contains('flipped') || cardEl.classList.contains('matched')) return;

    startTimer();
    playSound('flip');
    cardEl.classList.add('flipped');

    if (!firstCard) {
      // First card chosen
      firstCard = { el: cardEl, data: cardData };
    } else {
      // Second card chosen
      secondCard = { el: cardEl, data: cardData };
      moves++;
      moveCountEl.textContent = moves;
      checkForMatch();
    }
  }

  // Check For Match
  function checkForMatch() {
    isBoardLocked = true;
    const isMatch = firstCard.data.id === secondCard.data.id;

    if (isMatch) {
      handleMatchSuccess();
    } else {
      handleMismatch();
    }
  }

  // Handle Match
  function handleMatchSuccess() {
    matchesFound++;
    comboStreak++;
    const totalPairs = DIFFICULTIES[currentDifficulty].pairs;
    pairsMatchedEl.textContent = `${matchesFound}/${totalPairs}`;

    playSound('match');

    // Trigger combo toast if streak > 1
    if (comboStreak > 1) {
      comboMultiplierEl.textContent = comboStreak;
      comboBanner.classList.add('show');
      setTimeout(() => comboBanner.classList.remove('show'), 1200);
    }

    setTimeout(() => {
      if (firstCard && secondCard) {
        firstCard.el.classList.add('matched');
        secondCard.el.classList.add('matched');
        resetTurn();
      }

      // Check for Game Victory
      if (matchesFound === totalPairs) {
        handleVictory();
      }
    }, 280);
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
            resetTurn();
          }
        }, 400);
      }
    }, 450);
  }

  function resetTurn() {
    firstCard = null;
    secondCard = null;
    isBoardLocked = false;
  }

  // Handle Victory
  function handleVictory() {
    stopTimer();
    playSound('win');

    const isNewBest = saveBestMoves(currentDifficulty, moves);
    const bestRecord = getBestMoves(currentDifficulty);

    modalMoves.textContent = moves;
    modalTime.textContent = formatTime(secondsElapsed);
    modalBest.textContent = bestRecord || moves;
    modalNewBest.style.display = isNewBest ? 'block' : 'none';

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#facc15', '#fb7185', '#4ade80']
      });
    }

    victoryModal.style.display = 'flex';
  }

  // Hint Peek (Briefly reveals all cards)
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
