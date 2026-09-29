/* ==========================================================================
   QUICK MATH QUIZ 🧮⚡ - VS BOT & 2-PLAYER Game Engine
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // DOM Elements
  const modeBadge = document.getElementById('mode-badge');
  const btnModeBot = document.getElementById('btn-mode-bot');
  const btnMode2P = document.getElementById('btn-mode-2p');
  const diffContainer = document.getElementById('diff-container');
  const diffSlider = document.getElementById('diff-slider');
  const diffLabel = document.getElementById('diff-label');
  const turnBadge = document.getElementById('turn-badge');
  const scoreP1 = document.getElementById('score-p1');
  const scoreP2 = document.getElementById('score-p2');
  const p2ScoreLabel = document.getElementById('p2-score-label');
  const timerVal = document.getElementById('timer-val');
  const timerBar = document.getElementById('timer-bar');
  const equationDisplay = document.getElementById('equation-display');
  const choiceBtns = [
    document.getElementById('choice-btn-0'),
    document.getElementById('choice-btn-1'),
    document.getElementById('choice-btn-2')
  ];
  const statusToast = document.getElementById('status-toast');

  // Modals
  const startOverlay = document.getElementById('start-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const btnStart = document.getElementById('btn-start');
  const btnRestart = document.getElementById('btn-restart');
  const btnChangeSettings = document.getElementById('btn-change-settings');
  const winnerTitle = document.getElementById('winner-title');
  const finalP1Score = document.getElementById('final-p1-score');
  const finalP2Score = document.getElementById('final-p2-score');
  const finalP2Name = document.getElementById('final-p2-name');
  const newHighscoreBadge = document.getElementById('new-highscore-badge');

  // Game Settings & State
  let gameMode = 'bot'; // 'bot' or '2p'
  let botDifficulty = 4; // 1: EASY, 2: MEDIUM, 3: HARD, 4: IMPOSSIBLE
  let currentPlayer = 1; // 1 or 2
  let scores = { 1: 0, 2: 0 };
  let highScore = parseInt(localStorage.getItem('quickmath_highscore') || '0', 10);

  let timeLeft = 60;
  let timerInterval = null;
  let botActionInterval = null;
  let currentAnswer = 0;
  let isProcessing = false;

  // Difficulty Labels
  const DIFF_NAMES = {
    1: 'EASY 🟢',
    2: 'MEDIUM 🟡',
    3: 'HARD 🟠',
    4: 'IMPOSSIBLE 💀'
  };

  // Update Active Mode Badge on Main Card
  function updateModeBadgeUI() {
    if (gameMode === 'bot') {
      modeBadge.textContent = `MODE: 🤖 VS BOT (${DIFF_NAMES[botDifficulty]})`;
    } else {
      modeBadge.textContent = `MODE: 👥 2-PLAYER LOCAL`;
    }
  }

  // Event Listeners for UI inside Start Screen Modal
  diffSlider.addEventListener('input', (e) => {
    botDifficulty = parseInt(e.target.value, 10);
    diffLabel.textContent = DIFF_NAMES[botDifficulty];
    updateModeBadgeUI();
  });

  btnModeBot.addEventListener('click', () => {
    if (gameMode !== 'bot') {
      gameMode = 'bot';
      btnModeBot.classList.add('active');
      btnMode2P.classList.remove('active');
      diffContainer.style.display = 'flex';
      p2ScoreLabel.textContent = 'BOT 🤖 SCORE';
      finalP2Name.textContent = 'BOT 🤖';
      updateModeBadgeUI();
    }
  });

  btnMode2P.addEventListener('click', () => {
    if (gameMode !== '2p') {
      gameMode = '2p';
      btnMode2P.classList.add('active');
      btnModeBot.classList.remove('active');
      diffContainer.style.display = 'none';
      p2ScoreLabel.textContent = 'P2 🔵 SCORE';
      finalP2Name.textContent = 'P2 🔵';
      updateModeBadgeUI();
    }
  });

  btnStart.addEventListener('click', startMatch);
  btnRestart.addEventListener('click', startMatch);

  btnChangeSettings.addEventListener('click', () => {
    gameoverOverlay.classList.add('hidden');
    startOverlay.classList.remove('hidden');
  });

  choiceBtns.forEach((btn) => {
    btn.addEventListener('click', (e) => {
      if (isProcessing) return;
      if (gameMode === 'bot' && currentPlayer === 2) return; // Bot turn
      const selectedValue = parseInt(e.target.getAttribute('data-value'), 10);
      handleChoiceSelection(selectedValue, e.target);
    });
  });

  function clearAllTimers() {
    if (timerInterval) clearInterval(timerInterval);
    if (botActionInterval) clearInterval(botActionInterval);
    timerInterval = null;
    botActionInterval = null;
  }

  // Start Full Match
  function startMatch() {
    clearAllTimers();
    scores = { 1: 0, 2: 0 };
    scoreP1.textContent = '0';
    scoreP2.textContent = '0';

    updateModeBadgeUI();

    startOverlay.classList.add('hidden');
    gameoverOverlay.classList.add('hidden');
    newHighscoreBadge.classList.add('hidden');

    startPlayer1Turn();
  }

  function startPlayer1Turn() {
    currentPlayer = 1;
    timeLeft = 60;
    isProcessing = false;

    turnBadge.className = 'turn-badge p1-turn';
    turnBadge.textContent = 'CURRENT TURN: PLAYER 1 🔴 (60s)';
    statusToast.textContent = '⚡ PLAYER 1! SOLVE EQUATIONS BEFORE TIME RUNS OUT!';
    statusToast.style.background = '#fef9c3';

    updateTimerUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerUI();

      if (timeLeft <= 0) {
        handleTurnTimeUp();
      }
    }, 1000);

    nextQuestion();
  }

  function handleTurnTimeUp() {
    clearAllTimers();

    if (currentPlayer === 1) {
      if (gameMode === '2p') {
        startPlayer2Turn();
      } else {
        startBotTurn();
      }
    } else {
      endMatch();
    }
  }

  function startPlayer2Turn() {
    currentPlayer = 2;
    timeLeft = 60;
    isProcessing = false;

    turnBadge.className = 'turn-badge p2-turn';
    turnBadge.textContent = 'CURRENT TURN: PLAYER 2 🔵 (60s)';
    statusToast.textContent = `🔴 P1 SCORED ${scores[1]} PTS! 🔵 P2 GET READY!`;
    statusToast.style.background = '#e0f2fe';

    updateTimerUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerUI();

      if (timeLeft <= 0) {
        handleTurnTimeUp();
      }
    }, 1000);

    nextQuestion();
  }

  function startBotTurn() {
    currentPlayer = 2;
    timeLeft = 60;
    isProcessing = false;

    turnBadge.className = 'turn-badge bot-turn';
    turnBadge.textContent = 'CURRENT TURN: BOT 🤖 (60s)';
    statusToast.textContent = `🔴 YOU SCORED ${scores[1]} PTS! 🤖 BOT IS SOLVING NOW...`;
    statusToast.style.background = '#fef9c3';

    choiceBtns.forEach(btn => btn.disabled = true);

    updateTimerUI();

    timerInterval = setInterval(() => {
      timeLeft--;
      updateTimerUI();

      if (timeLeft <= 0) {
        handleTurnTimeUp();
      }
    }, 1000);

    const botSpeeds = { 1: 2800, 2: 2000, 3: 1400, 4: 900 };
    const botAccuracies = { 1: 0.70, 2: 0.85, 3: 0.92, 4: 0.98 };

    const speed = botSpeeds[botDifficulty] || 1500;
    const accuracy = botAccuracies[botDifficulty] || 0.90;

    nextQuestion();

    botActionInterval = setInterval(() => {
      if (timeLeft <= 0) return;
      executeBotStep(accuracy);
    }, speed);
  }

  function executeBotStep(accuracy) {
    if (isProcessing || timeLeft <= 0) return;

    const isCorrect = Math.random() < accuracy;
    let chosenBtn;

    if (isCorrect) {
      chosenBtn = choiceBtns.find(btn => parseInt(btn.getAttribute('data-value'), 10) === currentAnswer);
    } else {
      chosenBtn = choiceBtns.find(btn => parseInt(btn.getAttribute('data-value'), 10) !== currentAnswer);
    }

    if (!chosenBtn) chosenBtn = choiceBtns[0];

    const val = parseInt(chosenBtn.getAttribute('data-value'), 10);
    handleChoiceSelection(val, chosenBtn);
  }

  function updateTimerUI() {
    const clampedTime = Math.max(0, timeLeft);
    timerVal.textContent = `${clampedTime}s`;
    const percentage = Math.min(100, Math.max(0, (clampedTime / 60) * 100));
    timerBar.style.width = `${percentage}%`;

    if (clampedTime <= 10) {
      timerVal.style.color = '#ef4444';
    } else {
      timerVal.style.color = 'var(--text-color)';
    }
  }

  function nextQuestion() {
    isProcessing = false;
    choiceBtns.forEach(btn => {
      btn.className = 'choice-btn';
      if (gameMode === 'bot' && currentPlayer === 2) {
        btn.disabled = true;
      } else {
        btn.disabled = false;
      }
    });

    const activeScore = scores[currentPlayer];
    const diffLevel = Math.min(4, Math.floor(activeScore / 50) + 1);

    const operators = ['+', '-', '*', '/'];
    const op = operators[Math.floor(Math.random() * operators.length)];

    let num1, num2, answer;

    if (op === '+') {
      num1 = Math.floor(Math.random() * (12 * diffLevel)) + 1;
      num2 = Math.floor(Math.random() * (12 * diffLevel)) + 1;
      answer = num1 + num2;
    } else if (op === '-') {
      num1 = Math.floor(Math.random() * (15 * diffLevel)) + 5;
      num2 = Math.floor(Math.random() * num1) + 1;
      answer = num1 - num2;
    } else if (op === '*') {
      num1 = Math.floor(Math.random() * (5 + diffLevel * 2)) + 2;
      num2 = Math.floor(Math.random() * (5 + diffLevel * 2)) + 2;
      answer = num1 * num2;
    } else if (op === '/') {
      num2 = Math.floor(Math.random() * (5 + diffLevel * 2)) + 2;
      answer = Math.floor(Math.random() * (5 + diffLevel * 2)) + 2;
      num1 = num2 * answer;
    }

    currentAnswer = answer;

    const symbolMap = { '+': '+', '-': '−', '*': '×', '/': '÷' };
    equationDisplay.textContent = `${num1} ${symbolMap[op]} ${num2} = ?`;

    const choices = [answer];
    const offsetCandidates = [-1, 1, -2, 2, -10, 10, -5, 5, -3, 3];

    while (choices.length < 3) {
      const randOffset = offsetCandidates[Math.floor(Math.random() * offsetCandidates.length)];
      const distractor = Math.max(0, answer + randOffset);
      if (!choices.includes(distractor)) {
        choices.push(distractor);
      }
    }

    for (let i = choices.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [choices[i], choices[j]] = [choices[j], choices[i]];
    }

    choices.forEach((choice, idx) => {
      choiceBtns[idx].textContent = choice;
      choiceBtns[idx].setAttribute('data-value', choice);
    });
  }

  function handleChoiceSelection(selectedValue, clickedBtn) {
    isProcessing = true;

    if (selectedValue === currentAnswer) {
      scores[currentPlayer] += 10;
      timeLeft = Math.min(99, timeLeft + 2);
      updateScoreUI();
      updateTimerUI();

      clickedBtn.classList.add('correct-flash');
      if (currentPlayer === 1 || gameMode === '2p') {
        statusToast.textContent = `🎉 CORRECT! +10 PTS (+2s BONUS)`;
        statusToast.style.background = '#dcfce7';
      }

      setTimeout(() => {
        nextQuestion();
      }, 200);
    } else {
      timeLeft = Math.max(0, timeLeft - 5);
      updateTimerUI();

      clickedBtn.classList.add('wrong-flash');
      if (currentPlayer === 1 || gameMode === '2p') {
        statusToast.textContent = `❌ WRONG! -5s TIME PENALTY!`;
        statusToast.style.background = '#fee2e2';
      }

      if (timeLeft <= 0) {
        setTimeout(() => {
          handleTurnTimeUp();
        }, 200);
      } else {
        setTimeout(() => {
          nextQuestion();
        }, 200);
      }
    }
  }

  function updateScoreUI() {
    scoreP1.textContent = scores[1];
    scoreP2.textContent = scores[2];
  }

  function endMatch() {
    clearAllTimers();
    isProcessing = true;

    finalP1Score.textContent = scores[1];
    finalP2Score.textContent = scores[2];

    const p2Label = gameMode === 'bot' ? 'BOT 🤖' : 'PLAYER 2 👥';
    let winMsg = '';

    if (scores[1] > scores[2]) {
      winMsg = `🎉 PLAYER 1 WINS! (${scores[1]} - ${scores[2]})`;
    } else if (scores[2] > scores[1]) {
      winMsg = `🏆 ${p2Label} WINS! (${scores[2]} - ${scores[1]})`;
    } else {
      winMsg = `🤝 IT'S A DRAW! (${scores[1]} - ${scores[2]})`;
    }

    winnerTitle.textContent = winMsg;
    turnBadge.className = 'turn-badge win-turn';
    turnBadge.textContent = winMsg;

    if (scores[1] > highScore) {
      highScore = scores[1];
      localStorage.setItem('quickmath_highscore', highScore.toString());
      newHighscoreBadge.classList.remove('hidden');

      if (typeof confetti === 'function') {
        confetti({ particleCount: 100, spread: 80, origin: { y: 0.6 } });
      }
    }

    gameoverOverlay.classList.remove('hidden');
  }

  // Initial UI Setup
  updateModeBadgeUI();
});
