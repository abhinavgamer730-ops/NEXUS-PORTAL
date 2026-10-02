/**
 * Stack Jump (Bird Tower Stacker) Game Engine
 * Features: 60FPS Canvas Physics, Parallax Altitude Gradients, Perfect Combos, Audio Synth
 */

(function () {
  'use strict';

  // Canvas & Environment Setup
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const currentScoreEl = document.getElementById('current-score');
  const bestScoreEl = document.getElementById('best-score');
  const finalScoreEl = document.getElementById('final-score');
  const finalBestEl = document.getElementById('final-best');
  const comboBadge = document.getElementById('combo-badge');
  const startOverlay = document.getElementById('start-overlay');
  const gameoverOverlay = document.getElementById('gameover-overlay');
  const newBestToast = document.getElementById('new-best-toast');
  const btnStartGame = document.getElementById('btn-start-game');
  const btnRestartGame = document.getElementById('btn-restart-game');
  const btnSound = document.getElementById('sound-toggle-btn');

  const WIDTH = 400;
  const HEIGHT = 580;
  const BLOCK_HEIGHT = 44;
  const DEFAULT_BLOCK_WIDTH = 135;
  const GRAVITY = 0.75;
  const JUMP_VELOCITY = -13.2;

  // Game State
  let state = 'START'; // 'START' | 'PLAYING' | 'GAMEOVER'
  let score = 0;
  let bestScore = 0;
  let combo = 0;
  let cameraY = 0;
  let targetCameraY = 0;
  let soundEnabled = true;

  // Palette Gradients for Block Stacks
  const THEME_PALETTES = [
    { top: '#4ade80', side: '#16a34a', border: '#0f172a' }, // Mint
    { top: '#fb7185', side: '#e11d48', border: '#0f172a' }, // Bubblegum
    { top: '#38bdf8', side: '#0284c7', border: '#0f172a' }, // Sky Blue
    { top: '#facc15', side: '#ca8a04', border: '#0f172a' }, // Sunny Gold
    { top: '#c084fc', side: '#9333ea', border: '#0f172a' }, // Purple
    { top: '#fb923c', side: '#ea580c', border: '#0f172a' }  // Orange
  ];

  // Bird Object
  let bird = {
    x: 200,
    y: 430,
    width: 36,
    height: 32,
    velocityY: 0,
    isGrounded: true,
    rotation: 0,
    blinkTimer: 0,
    wingFlap: 0,
    standBlockIndex: 0
  };

  // Stack of Placed Blocks
  let stack = [];
  // Currently Sliding Block
  let currentBlock = null;
  // Visual Particles
  let particles = [];
  // Background Floating Clouds
  let clouds = [];

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
      if (type === 'jump') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(260, now);
        osc.frequency.exponentialRampToValueAtTime(520, now + 0.12);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.12);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.13);
      } else if (type === 'land') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(80, now + 0.08);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'perfect') {
        [523.25, 659.25, 783.99].forEach((freq, i) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.28, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.21);
        });
      } else if (type === 'hit') {
        const osc = ctx.createOscillator();
        const gain = ctx.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.linearRampToValueAtTime(80, now + 0.25);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.25);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start(now);
        osc.stop(now + 0.26);
      }
    } catch (e) {}
  }

  // Load Saved High Score
  function loadBestScore() {
    try {
      bestScore = parseInt(localStorage.getItem('nexus_stackjump_best') || '0', 10);
    } catch (e) {
      bestScore = 0;
    }
    bestScoreEl.textContent = bestScore;
  }

  function saveBestScore() {
    try {
      localStorage.setItem('nexus_stackjump_best', bestScore.toString());
    } catch (e) {}
  }

  // Initialize Background Clouds
  function initClouds() {
    clouds = [];
    for (let i = 0; i < 7; i++) {
      clouds.push({
        x: Math.random() * WIDTH,
        y: Math.random() * HEIGHT * 2 - HEIGHT,
        size: 30 + Math.random() * 35,
        speed: 0.2 + Math.random() * 0.35
      });
    }
  }

  // Reset & Start Game
  function resetGame() {
    score = 0;
    combo = 0;
    cameraY = 0;
    targetCameraY = 0;
    particles = [];
    currentScoreEl.textContent = '0';
    initClouds();

    // Create Initial Base Platform
    const baseWidth = DEFAULT_BLOCK_WIDTH + 20;
    const baseY = 480;
    stack = [
      {
        x: (WIDTH - baseWidth) / 2,
        y: baseY,
        width: baseWidth,
        height: BLOCK_HEIGHT,
        palette: THEME_PALETTES[0]
      }
    ];

    // Reset Bird on Base Platform
    bird.x = 200;
    bird.y = baseY - bird.height;
    bird.velocityY = 0;
    bird.isGrounded = true;
    bird.rotation = 0;
    bird.standBlockIndex = 0;

    spawnNextBlock();
  }

  // Spawn Next Sliding Block
  function spawnNextBlock() {
    const topBlock = stack[stack.length - 1];
    const side = Math.random() < 0.5 ? 'left' : 'right';
    const speed = Math.min(4.2 + score * 0.12, 8.8);
    const blockWidth = Math.max(DEFAULT_BLOCK_WIDTH - Math.floor(score / 15) * 10, 85);
    const paletteIndex = Math.floor(score / 5) % THEME_PALETTES.length;

    const blockY = topBlock.y - BLOCK_HEIGHT;
    const startX = side === 'left' ? -blockWidth - 30 : WIDTH + 30;

    currentBlock = {
      x: startX,
      y: blockY,
      width: blockWidth,
      height: BLOCK_HEIGHT,
      speed: side === 'left' ? speed : -speed,
      direction: side,
      palette: THEME_PALETTES[paletteIndex],
      passedCenter: false,
      stopped: false
    };
  }

  // Jump Action (Triggered on Tap/Click/Key)
  function handleJump() {
    if (state === 'START') {
      state = 'PLAYING';
      startOverlay.style.display = 'none';
      resetGame();
      playSound('jump');
      bird.velocityY = JUMP_VELOCITY;
      bird.isGrounded = false;
      return;
    }

    if (state === 'GAMEOVER') return;

    if (bird.isGrounded) {
      bird.velocityY = JUMP_VELOCITY;
      bird.isGrounded = false;
      bird.wingFlap = 1;
      playSound('jump');
      createDustParticles(bird.x, bird.y + bird.height, '#ffffff');
    }
  }

  // Particle Generators
  function createDustParticles(x, y, color) {
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: x + (Math.random() * 20 - 10),
        y: y,
        vx: (Math.random() - 0.5) * 4,
        vy: -Math.random() * 2.5,
        radius: 3 + Math.random() * 3,
        color: color,
        alpha: 1,
        life: 18
      });
    }
  }

  function createPerfectSparks(x, y) {
    for (let i = 0; i < 16; i++) {
      particles.push({
        x: x,
        y: y,
        vx: (Math.random() - 0.5) * 7,
        vy: -Math.random() * 6 - 2,
        radius: 3.5 + Math.random() * 3,
        color: Math.random() < 0.5 ? '#facc15' : '#fb7185',
        alpha: 1,
        life: 28
      });
    }
  }

  // Show Combo Toast
  function triggerComboToast(multiplier) {
    comboBadge.textContent = multiplier > 1 ? `PERFECT! x${multiplier}` : 'PERFECT!';
    comboBadge.classList.add('show');
    setTimeout(() => {
      comboBadge.classList.remove('show');
    }, 850);
  }

  // Trigger Game Over
  function triggerGameOver() {
    state = 'GAMEOVER';
    playSound('hit');

    finalScoreEl.textContent = score;
    finalBestEl.textContent = bestScore;

    let isNewHigh = false;
    if (score > bestScore) {
      bestScore = score;
      saveBestScore();
      bestScoreEl.textContent = bestScore;
      finalBestEl.textContent = bestScore;
      isNewHigh = true;
    }

    newBestToast.style.display = isNewHigh ? 'block' : 'none';
    if (isNewHigh && typeof confetti === 'function') {
      confetti({ particleCount: 70, spread: 70, origin: { y: 0.6 } });
    }

    gameoverOverlay.style.display = 'flex';
  }

  // Game Loop Update
  function update() {
    // Update Clouds
    clouds.forEach(c => {
      c.x += c.speed;
      if (c.x - c.size > WIDTH) {
        c.x = -c.size * 2;
        c.y = (stack[stack.length - 1] ? stack[stack.length - 1].y : 0) + (Math.random() * HEIGHT * 2 - HEIGHT);
      }
    });

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.15;
      p.alpha -= 1 / p.life;
      if (p.alpha <= 0) {
        particles.splice(i, 1);
      }
    }

    if (state !== 'PLAYING') return;

    // Smooth Camera Follow
    const topBlockY = stack[stack.length - 1].y;
    targetCameraY = Math.max(0, 360 - topBlockY);
    cameraY += (targetCameraY - cameraY) * 0.1;

    // 1. Update Bird Physics
    if (!bird.isGrounded) {
      bird.velocityY += GRAVITY;
      bird.y += bird.velocityY;

      // Slight rotation while jumping/falling
      bird.rotation = Math.min(Math.max(bird.velocityY * 0.04, -0.4), 0.5);
    } else {
      bird.rotation = 0;
    }

    // Wing Flap animation decay
    if (bird.wingFlap > 0) {
      bird.wingFlap -= 0.08;
    }

    // 2. Update Moving Block
    if (currentBlock && !currentBlock.stopped) {
      currentBlock.x += currentBlock.speed;

      const targetX = (WIDTH - currentBlock.width) / 2;
      const birdFootY = bird.y + bird.height;
      const blockTopY = currentBlock.y;

      // Check if block reached or passed center
      const isPastCenter = (currentBlock.direction === 'left' && currentBlock.x >= targetX) ||
                           (currentBlock.direction === 'right' && currentBlock.x <= targetX);

      // Check Collision with Bird
      const birdLeft = bird.x - bird.width / 2;
      const birdRight = bird.x + bird.width / 2;
      const blockLeft = currentBlock.x;
      const blockRight = currentBlock.x + currentBlock.width;

      const horizontalOverlap = birdRight > blockLeft + 6 && birdLeft < blockRight - 6;
      const verticalLevel = birdFootY > blockTopY + 4 && bird.y < blockTopY + BLOCK_HEIGHT - 6;

      // Case A: Bird gets hit from side while standing on lower block
      if (bird.isGrounded && horizontalOverlap && verticalLevel) {
        triggerGameOver();
        return;
      }

      // Case B: Bird is in the air and landing on the block
      if (!bird.isGrounded && bird.velocityY > 0) {
        const isLandingLevel = birdFootY >= blockTopY && birdFootY <= blockTopY + 16;

        if (isLandingLevel && horizontalOverlap) {
          // Successful landing!
          currentBlock.stopped = true;
          currentBlock.x = targetX; // Lock into stack column
          bird.y = blockTopY - bird.height;
          bird.velocityY = 0;
          bird.isGrounded = true;

          // Check Perfect Alignment
          const alignmentOffset = Math.abs(currentBlock.x - targetX);
          if (alignmentOffset < 14) {
            combo++;
            score += combo > 1 ? combo : 1;
            playSound('perfect');
            createPerfectSparks(200, blockTopY);
            triggerComboToast(combo);
          } else {
            combo = 0;
            score += 1;
            playSound('land');
            createDustParticles(200, blockTopY, '#ffffff');
          }

          currentScoreEl.textContent = score;
          if (score > bestScore) {
            bestScore = score;
            bestScoreEl.textContent = bestScore;
          }

          stack.push(currentBlock);
          spawnNextBlock();
          return;
        }
      }

      // Case C: Block completely overshoots the tower without being jumped onto
      const overshot = (currentBlock.direction === 'left' && currentBlock.x > WIDTH + 40) ||
                       (currentBlock.direction === 'right' && currentBlock.x < -currentBlock.width - 40);

      if (overshot) {
        triggerGameOver();
        return;
      }
    }

    // Bird falls off screen
    if (bird.y - cameraY > HEIGHT + 80) {
      triggerGameOver();
    }
  }

  // Draw Functions
  function draw() {
    ctx.clearRect(0, 0, WIDTH, HEIGHT);

    // Altitude Sky Gradient (shifts with tower height)
    const altitudeRatio = Math.min(score / 35, 1);
    const grad = ctx.createLinearGradient(0, 0, 0, HEIGHT);
    if (altitudeRatio < 0.5) {
      // Day Sky (Sky Blue -> Sunny Coral)
      grad.addColorStop(0, '#38bdf8');
      grad.addColorStop(1, '#fed7aa');
    } else {
      // High Altitude / Space Sky (Deep Indigo -> Twilight Magenta)
      grad.addColorStop(0, '#0f172a');
      grad.addColorStop(0.5, '#1e1b4b');
      grad.addColorStop(1, '#fb7185');
    }
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, WIDTH, HEIGHT);

    // Draw Parallax Clouds
    clouds.forEach(c => {
      const renderY = c.y + cameraY * 0.4;
      if (renderY > -100 && renderY < HEIGHT + 100) {
        drawCloud(c.x, renderY, c.size);
      }
    });

    ctx.save();
    ctx.translate(0, cameraY);

    // Draw Block Stack
    stack.forEach((b, idx) => {
      drawBlock(b.x, b.y, b.width, b.height, b.palette, idx === 0);
    });

    // Draw Currently Sliding Block
    if (currentBlock) {
      drawBlock(currentBlock.x, currentBlock.y, currentBlock.width, currentBlock.height, currentBlock.palette, false);
    }

    // Draw Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // Draw Cute Cartoon Bird
    drawBird(bird.x, bird.y, bird.width, bird.height, bird.rotation);

    ctx.restore();
  }

  // Draw Block with 3D Bevel & Border
  function drawBlock(x, y, w, h, palette, isBase) {
    ctx.save();

    // Block Shadow Base
    ctx.fillStyle = palette.side;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.fill();

    // Block Top Highlight
    ctx.fillStyle = palette.top;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h - 8, [14, 14, 6, 6]);
    ctx.fill();

    // Cute Pattern on block
    ctx.fillStyle = 'rgba(255, 255, 255, 0.28)';
    ctx.beginPath();
    ctx.arc(x + w * 0.25, y + 15, 5, 0, Math.PI * 2);
    ctx.arc(x + w * 0.5, y + 15, 6, 0, Math.PI * 2);
    ctx.arc(x + w * 0.75, y + 15, 5, 0, Math.PI * 2);
    ctx.fill();

    // Outline
    ctx.strokeStyle = palette.border;
    ctx.lineWidth = 3.5;
    ctx.beginPath();
    ctx.roundRect(x, y, w, h, 14);
    ctx.stroke();

    ctx.restore();
  }

  // Draw Cute Cartoon Bird
  function drawBird(centerX, topY, w, h, angle) {
    ctx.save();
    ctx.translate(centerX, topY + h / 2);
    ctx.rotate(angle);

    // Body (Round Bright Yellow)
    ctx.fillStyle = '#facc15';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, 16, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // White Belly
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.ellipse(-2, 4, 8, 10, 0, 0, Math.PI * 2);
    ctx.fill();

    // Beak (Orange Triangle)
    ctx.fillStyle = '#f97316';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(12, -2);
    ctx.lineTo(24, 2);
    ctx.lineTo(12, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Big Cartoon Eye
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(6, -4, 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(8, -4, 2.5, 0, Math.PI * 2);
    ctx.fill();

    // Eye Sparkle
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(7, -5.5, 1, 0, Math.PI * 2);
    ctx.fill();

    // Wing
    ctx.save();
    ctx.translate(-8, 0);
    ctx.rotate(bird.wingFlap ? -0.5 : 0.1);
    ctx.fillStyle = '#fbbf24';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.ellipse(0, 0, 8, 5, -0.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();
    ctx.restore();

    ctx.restore();
  }

  // Draw Cloud
  function drawCloud(x, y, size) {
    ctx.save();
    ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
    ctx.beginPath();
    ctx.arc(x, y, size * 0.5, 0, Math.PI * 2);
    ctx.arc(x + size * 0.4, y - size * 0.15, size * 0.6, 0, Math.PI * 2);
    ctx.arc(x + size * 0.85, y, size * 0.45, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }

  // Main Animation Frame
  function loop() {
    update();
    draw();
    requestAnimationFrame(loop);
  }

  // Event Handlers
  canvas.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    handleJump();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp' || e.key === 'w' || e.key === 'W') {
      e.preventDefault();
      handleJump();
    }
  });

  btnStartGame.addEventListener('click', handleJump);
  btnRestartGame.addEventListener('click', () => {
    gameoverOverlay.style.display = 'none';
    state = 'PLAYING';
    resetGame();
  });

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  // Start Engine
  loadBestScore();
  resetGame();
  requestAnimationFrame(loop);
})();
