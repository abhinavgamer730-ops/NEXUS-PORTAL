// Rock Paper Scissors Master 🪨📄✂️ - Bot-Only Engine
let playerScore = 0;
let botScore = 0;
let draws = 0;
let botDifficulty = 4; // 1 = Easy, 2 = Medium, 3 = Hard, 4 = Impossible
let playerHistory = [];
let isPlaying = false;
let matchEnded = false;

const MOVES = ['rock', 'paper', 'scissors'];
const HAND_ICONS = {
  rock: '✊',
  paper: '✋',
  scissors: '✌️'
};

const WIN_MAP = {
  rock: 'scissors',
  paper: 'rock',
  scissors: 'paper'
};

const COUNTER_MAP = {
  rock: 'paper',
  paper: 'scissors',
  scissors: 'rock'
};

const DIFF_LABELS = {
  1: 'EASY 🟢',
  2: 'MEDIUM 🟡',
  3: 'HARD 🟠',
  4: 'IMPOSSIBLE 💀'
};

// DOM Elements
const scorePlayerEl = document.getElementById('score-player');
const scoreDrawEl = document.getElementById('score-draw');
const scoreBotEl = document.getElementById('score-bot');
const statusBannerEl = document.getElementById('status-banner');
const playerHandEl = document.getElementById('player-hand');
const botHandEl = document.getElementById('bot-hand');
const playerHandCardEl = document.getElementById('player-hand-card');
const botHandCardEl = document.getElementById('bot-hand-card');
const btnRock = document.getElementById('btn-rock');
const btnPaper = document.getElementById('btn-paper');
const btnScissors = document.getElementById('btn-scissors');
const btnReset = document.getElementById('btn-reset');
const diffSliderEl = document.getElementById('diff-slider');
const diffLabelEl = document.getElementById('diff-label');
const modeBadgeEl = document.getElementById('mode-badge');
const startOverlayEl = document.getElementById('start-overlay');
const btnStartEl = document.getElementById('btn-start');

function updateModeBadgeUI() {
  if (modeBadgeEl) {
    modeBadgeEl.textContent = `MODE: 🤖 VS BOT (${DIFF_LABELS[botDifficulty]})`;
  }
}

function triggerConfetti() {
  if (typeof window !== 'undefined' && window.confetti) {
    window.confetti({ particleCount: 70, spread: 80, origin: { y: 0.6 } });
  }
}

if (diffSliderEl) {
  diffSliderEl.addEventListener('input', (e) => {
    botDifficulty = parseInt(e.target.value, 10);
    if (diffLabelEl) diffLabelEl.textContent = DIFF_LABELS[botDifficulty];
  });
}

/* ==========================================================================
   BOT AI SELECTION ENGINE
   ========================================================================== */

function getBotMove(playerChoice) {
  // Level 4: Impossible - Direct 100% Counter
  if (botDifficulty === 4) {
    return COUNTER_MAP[playerChoice];
  }

  // Level 1: Easy - 100% Random Choice
  if (botDifficulty === 1 || playerHistory.length === 0) {
    return MOVES[Math.floor(Math.random() * MOVES.length)];
  }

  // Level 2: Medium - Frequency Analysis (50% counter to most frequent move)
  if (botDifficulty === 2) {
    if (Math.random() < 0.5) {
      const counts = { rock: 0, paper: 0, scissors: 0 };
      playerHistory.forEach(m => counts[m]++);
      let mostFreq = 'rock';
      Object.keys(counts).forEach(m => {
        if (counts[m] > counts[mostFreq]) mostFreq = m;
      });
      return COUNTER_MAP[mostFreq];
    }
    return MOVES[Math.floor(Math.random() * MOVES.length)];
  }

  // Level 3: Hard - Markov Chain Pattern Recognition (75% counter to predicted move)
  if (botDifficulty === 3) {
    if (Math.random() < 0.75 && playerHistory.length >= 2) {
      const lastMove = playerHistory[playerHistory.length - 1];
      const transitions = { rock: 0, paper: 0, scissors: 0 };

      for (let i = 0; i < playerHistory.length - 1; i++) {
        if (playerHistory[i] === lastMove) {
          transitions[playerHistory[i + 1]]++;
        }
      }

      let predictedNext = MOVES[Math.floor(Math.random() * MOVES.length)];
      let maxCount = -1;
      Object.keys(transitions).forEach(m => {
        if (transitions[m] > maxCount) {
          maxCount = transitions[m];
          predictedNext = m;
        }
      });

      return COUNTER_MAP[predictedNext];
    }
    return MOVES[Math.floor(Math.random() * MOVES.length)];
  }

  return MOVES[Math.floor(Math.random() * MOVES.length)];
}

/* ==========================================================================
   ROUND PLAY & EVALUATION LOGIC
   ========================================================================== */

function playRound(playerChoice) {
  if (isPlaying || matchEnded) return;

  isPlaying = true;
  setButtonsDisabled(true);

  // Start Hand Shake Animation
  playerHandEl.textContent = '✊';
  botHandEl.textContent = '✊';
  playerHandEl.classList.add('shaking');
  botHandEl.classList.add('shaking');
  statusBannerEl.textContent = 'ROCK... PAPER... SCISSORS... SHOOT! ✊';

  const botChoice = getBotMove(playerChoice);

  setTimeout(() => {
    // Stop Shake Animation & Reveal Hands
    playerHandEl.classList.remove('shaking');
    botHandEl.classList.remove('shaking');

    playerHandEl.textContent = HAND_ICONS[playerChoice];
    botHandEl.textContent = HAND_ICONS[botChoice];

    // Evaluate Outcome
    if (playerChoice === botChoice) {
      draws++;
      statusBannerEl.textContent = `🤝 BOTH CHOSE ${playerChoice.toUpperCase()}! IT'S A DRAW!`;
      statusBannerEl.style.background = 'var(--sub-bg)';
      statusBannerEl.style.color = 'var(--text-color)';
    } else if (WIN_MAP[playerChoice] === botChoice) {
      playerScore++;
      statusBannerEl.textContent = `🎉 YOU CHOSE ${playerChoice.toUpperCase()} vs BOT'S ${botChoice.toUpperCase()} ➔ YOU WIN!`;
      statusBannerEl.style.background = '#dcfce7';
      statusBannerEl.style.color = '#15803d';
    } else {
      botScore++;
      statusBannerEl.textContent = `🤖 BOT CHOSE ${botChoice.toUpperCase()} vs YOUR ${playerChoice.toUpperCase()} ➔ BOT WINS!`;
      statusBannerEl.style.background = '#fee2e2';
      statusBannerEl.style.color = '#b91c1c';
    }

    playerHistory.push(playerChoice);
    updateScoreboard();

    // Check Match End (First to 5 wins)
    if (playerScore >= 5 || botScore >= 5) {
      endMatch();
    } else {
      isPlaying = false;
      setButtonsDisabled(false);
    }
  }, 600);
}

function updateScoreboard() {
  scorePlayerEl.textContent = playerScore;
  scoreDrawEl.textContent = draws;
  scoreBotEl.textContent = botScore;
}

function setButtonsDisabled(disabled) {
  btnRock.disabled = disabled;
  btnPaper.disabled = disabled;
  btnScissors.disabled = disabled;
}

function endMatch() {
  matchEnded = true;
  isPlaying = false;
  setButtonsDisabled(true);

  if (playerScore >= 5) {
    statusBannerEl.textContent = `🏆 CONGRATULATIONS! YOU DEFEATED THE BOT ${playerScore} TO ${botScore}! 🎉`;
    statusBannerEl.style.background = 'var(--sunny)';
    statusBannerEl.style.color = '#0f172a';
    triggerConfetti();
  } else {
    statusBannerEl.textContent = `💀 GAME OVER! THE BOT DEFEATED YOU ${botScore} TO ${playerScore}!`;
    statusBannerEl.style.background = '#ef4444';
    statusBannerEl.style.color = '#ffffff';
  }
}

function resetMatch() {
  playerScore = 0;
  botScore = 0;
  draws = 0;
  playerHistory = [];
  isPlaying = false;
  matchEnded = false;

  playerHandEl.textContent = '✊';
  botHandEl.textContent = '✊';
  statusBannerEl.textContent = 'CHOOSE ROCK, PAPER, OR SCISSORS TO START!';
  statusBannerEl.style.background = 'var(--sub-bg)';
  statusBannerEl.style.color = 'var(--text-color)';

  updateScoreboard();
  setButtonsDisabled(false);
}

/* ==========================================================================
   EVENT LISTENERS
   ========================================================================== */

btnRock.addEventListener('click', () => playRound('rock'));
btnPaper.addEventListener('click', () => playRound('paper'));
btnScissors.addEventListener('click', () => playRound('scissors'));
btnReset.addEventListener('click', resetMatch);

resetMatch();
