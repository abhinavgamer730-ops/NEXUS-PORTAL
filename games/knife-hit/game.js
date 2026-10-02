/**
 * Knife Hit Arcade Game Engine
 * Features: 60FPS Canvas Physics, Rotating Log Physics, Boss Encounters,
 * Apple Slicing, Knife Skin Arsenal, 2-Player Duel Mode, Web Audio Synthesizer
 */

(function () {
  'use strict';

  // Knife Skins Catalog
  const SKINS = [
    { id: 'classic', name: 'Classic Dagger', icon: '🗡️', price: 0, bladeColor: '#cbd5e1', hiltColor: '#94a3b8', glowColor: null },
    { id: 'katana', name: 'Golden Katana', icon: '⚔️', price: 20, bladeColor: '#facc15', hiltColor: '#ca8a04', glowColor: '#fef08a' },
    { id: 'kunai', name: 'Ninja Kunai', icon: '🥷', price: 40, bladeColor: '#38bdf8', hiltColor: '#0284c7', glowColor: '#7dd3fc' },
    { id: 'laser', name: 'Cyber Saber', icon: '⚡', price: 70, bladeColor: '#a855f7', hiltColor: '#7e22ce', glowColor: '#c084fc' },
    { id: 'ruby', name: 'Ruby Broadsword', icon: '💎', price: 100, bladeColor: '#fb7185', hiltColor: '#e11d48', glowColor: '#fda4af' },
    { id: 'excalibur', name: 'Holy Excalibur', icon: '👑', price: 150, bladeColor: '#4ade80', hiltColor: '#16a34a', glowColor: '#86efac' }
  ];

  // Boss Stage Definitions
  const BOSS_CONFIGS = {
    5: { name: 'CHEESY PIZZA', icon: '🍕', color: '#f59e0b', ringColor: '#b45309', pattern: 'wobble', knives: 9 },
    10: { name: 'GIANT WATERMELON', icon: '🍉', color: '#22c55e', ringColor: '#15803d', pattern: 'reversal', knives: 10 },
    15: { name: 'VIKING SHIELD', icon: '🛡️', color: '#38bdf8', ringColor: '#0369a1', pattern: 'stutter', knives: 11 },
    20: { name: 'NEON CYBER CORE', icon: '💎', color: '#c084fc', ringColor: '#7e22ce', pattern: 'hyper', knives: 12 }
  };

  // State
  let currentMode = 'solo'; // 'solo' | 'duel'
  let currentStage = 1;
  let score = 0;
  let bestScore = 0;
  let totalApples = 0;
  let equippedSkin = 'classic';
  let unlockedSkins = ['classic'];
  let soundEnabled = true;

  // 2-Player Duel State
  let duelTurn = 'p1'; // 'p1' | 'p2'
  let duelScores = { p1: 0, p2: 0 };

  // Canvas & Physics Loop
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('canvas-wrapper');

  let width = 400;
  let height = 520;
  let logX = width / 2;
  let logY = 150;
  let logRadius = 75;
  let logAngle = 0;
  let logSpeed = 0.035;
  let logPattern = 'constant'; // 'constant' | 'wobble' | 'reversal' | 'stutter' | 'hyper'
  let patternTimer = 0;

  // Active Stage Objects
  let embeddedKnives = []; // [ { angle, skin, player } ]
  let flyingKnife = null;  // { y, speed, skin, player }
  let readyKnife = { y: 440, skin: 'classic', player: 'p1' };
  let apples = []; // [ { angle, sliced, sliceTimer, pieces: [] } ]
  let particles = [];
  let logPieces = []; // When log explodes
  let screenShake = 0;

  let totalStageKnives = 7;
  let remainingKnives = 7;
  let isGameOver = false;
  let isStageTransition = false;
  let animationFrameId = null;
  let lastTime = 0;

  // DOM Elements
  const scoreValEl = document.getElementById('score-val');
  const appleValEl = document.getElementById('apple-val');
  const bestValEl = document.getElementById('best-val');
  const stagePillsEl = document.getElementById('stage-pills');
  const knifeStackEl = document.getElementById('knife-stack');
  const bossBannerEl = document.getElementById('boss-banner');
  const bossTextEl = document.getElementById('boss-text');
  const modePills = document.querySelectorAll('.mode-pill');
  const duelTurnBanner = document.getElementById('duel-turn-banner');
  const duelTurnPill = document.getElementById('duel-turn-pill');
  const duelTurnIcon = document.getElementById('duel-turn-icon');
  const duelTurnText = document.getElementById('duel-turn-text');
  const btnSound = document.getElementById('sound-toggle-btn');
  const btnShop = document.getElementById('btn-shop');
  const shopModal = document.getElementById('shop-modal');
  const btnShopClose = document.getElementById('btn-shop-close');
  const shopAppleCount = document.getElementById('shop-apple-count');
  const skinGrid = document.getElementById('skin-grid');

  // Modal Elements
  const gameModal = document.getElementById('game-modal');
  const modalHeroIcon = document.getElementById('modal-hero-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalScore = document.getElementById('modal-score');
  const modalStage = document.getElementById('modal-stage');
  const modalApples = document.getElementById('modal-apples');
  const modalNewBest = document.getElementById('modal-new-best');
  const btnModalRestart = document.getElementById('btn-modal-restart');

  // Load Saved Data
  function loadSavedData() {
    try {
      bestScore = parseInt(localStorage.getItem('nexus_knife_best') || '0', 10);
      totalApples = parseInt(localStorage.getItem('nexus_knife_apples') || '0', 10);
      const savedSkins = localStorage.getItem('nexus_knife_unlocked');
      if (savedSkins) unlockedSkins = JSON.parse(savedSkins);
      const savedEquipped = localStorage.getItem('nexus_knife_equipped');
      if (savedEquipped && unlockedSkins.includes(savedEquipped)) equippedSkin = savedEquipped;
    } catch (e) {}
    updateHUD();
  }

  function saveGameData() {
    try {
      localStorage.setItem('nexus_knife_best', bestScore.toString());
      localStorage.setItem('nexus_knife_apples', totalApples.toString());
      localStorage.setItem('nexus_knife_unlocked', JSON.stringify(unlockedSkins));
      localStorage.setItem('nexus_knife_equipped', equippedSkin);
    } catch (e) {}
  }

  // Web Audio Synthesizer
  let audioCtx = null;
  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) audioCtx = new AudioCtxClass();
    }
    if (audioCtx && audioCtx.state === 'suspended') audioCtx.resume();
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    const ctxA = getAudioContext();
    if (!ctxA) return;

    try {
      const now = ctxA.currentTime;
      if (type === 'throw') {
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(600, now);
        osc.frequency.exponentialRampToValueAtTime(150, now + 0.08);
        gain.gain.setValueAtTime(0.2, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'hit') {
        // Wooden THWACK!
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(180, now);
        osc.frequency.exponentialRampToValueAtTime(40, now + 0.07);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'apple') {
        // Juicy squish
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(800, now);
        osc.frequency.exponentialRampToValueAtTime(1200, now + 0.09);
        gain.gain.setValueAtTime(0.25, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.1);
      } else if (type === 'clash') {
        // Metallic CLANG & Deflect
        const osc1 = ctxA.createOscillator();
        const osc2 = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc1.type = 'sawtooth';
        osc2.type = 'square';
        osc1.frequency.setValueAtTime(880, now);
        osc2.frequency.setValueAtTime(440, now);
        osc1.frequency.exponentialRampToValueAtTime(220, now + 0.2);
        gain.gain.setValueAtTime(0.3, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.22);
        osc1.connect(gain);
        osc2.connect(gain);
        gain.connect(ctxA.destination);
        osc1.start(now);
        osc2.start(now);
        osc1.stop(now + 0.23);
        osc2.stop(now + 0.23);
      } else if (type === 'stage') {
        // Stage clear log fracture
        [440, 554.37, 659.25, 880].forEach((f, i) => {
          const osc = ctxA.createOscillator();
          const gain = ctxA.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.25, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.05 + 0.18);
          osc.connect(gain);
          gain.connect(ctxA.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.19);
        });
      }
    } catch (e) {}
  }

  // Update HUD Display
  function updateHUD() {
    scoreValEl.textContent = score;
    appleValEl.textContent = `🍎 ${totalApples}`;
    bestValEl.textContent = bestScore;

    // Stage Pills indicator (1 to 4, then Boss)
    const stageInCycle = ((currentStage - 1) % 5) + 1;
    const isBossStage = stageInCycle === 5;

    let pillsHTML = '';
    for (let i = 1; i <= 4; i++) {
      let cls = 'stage-dot';
      if (i < stageInCycle) cls += ' completed';
      else if (i === stageInCycle) cls += ' active';
      pillsHTML += `<span class="${cls}">${i}</span>`;
    }
    let bossCls = 'stage-dot boss-dot';
    if (isBossStage) bossCls += ' active';
    pillsHTML += `<span class="${bossCls}">👑</span>`;
    stagePillsEl.innerHTML = pillsHTML;

    // 2-Player Turn Banner
    if (currentMode === 'duel') {
      duelTurnBanner.style.display = 'flex';
      if (duelTurn === 'p1') {
        duelTurnPill.className = 'turn-pill p1-turn';
        duelTurnIcon.textContent = '🟦';
        duelTurnText.textContent = 'PLAYER 1 THROW';
      } else {
        duelTurnPill.className = 'turn-pill p2-turn';
        duelTurnIcon.textContent = '🟪';
        duelTurnText.textContent = 'PLAYER 2 THROW';
      }
    } else {
      duelTurnBanner.style.display = 'none';
    }

    // Render Remaining Knives Stack
    let stackHTML = '';
    const skinDef = SKINS.find(s => s.id === equippedSkin) || SKINS[0];
    const icon = currentMode === 'duel' ? (duelTurn === 'p1' ? '🗡️' : '🗡️') : (skinDef.icon || '🗡️');

    for (let i = 0; i < totalStageKnives; i++) {
      const isUsed = i >= remainingKnives;
      stackHTML += `<div class="stack-knife ${isUsed ? 'used' : ''}">${icon}</div>`;
    }
    knifeStackEl.innerHTML = stackHTML;
  }

  // Set up New Stage
  function setupStage() {
    isStageTransition = false;
    isGameOver = false;
    embeddedKnives = [];
    flyingKnife = null;
    apples = [];
    particles = [];
    logPieces = [];

    const isBoss = (currentStage % 5) === 0;
    const bossConfig = BOSS_CONFIGS[currentStage] || (isBoss ? BOSS_CONFIGS[5] : null);

    if (isBoss && bossConfig) {
      bossBannerEl.style.display = 'block';
      bossTextEl.textContent = `⚠️ BOSS: ${bossConfig.name} ⚠️`;
      totalStageKnives = bossConfig.knives || 9;
      logPattern = bossConfig.pattern || 'wobble';
      logRadius = 82;
      setTimeout(() => { bossBannerEl.style.display = 'none'; }, 2000);
    } else {
      bossBannerEl.style.display = 'none';
      totalStageKnives = Math.min(6 + Math.floor(currentStage / 2), 11);
      logRadius = 75;

      // Assign rotation pattern based on difficulty
      if (currentStage === 1) logPattern = 'constant';
      else if (currentStage === 2) logPattern = 'wobble';
      else if (currentStage === 3) logPattern = 'reversal';
      else logPattern = ['wobble', 'reversal', 'stutter'][Math.floor(Math.random() * 3)];
    }

    remainingKnives = totalStageKnives;
    logAngle = 0;
    logSpeed = 0.032 + Math.min(currentStage * 0.003, 0.035);

    // Pre-embedded obstacles (from Stage 3 onwards)
    if (!isBoss && currentStage >= 3) {
      const obstacleCount = Math.min(Math.floor((currentStage - 2) / 2), 3);
      for (let i = 0; i < obstacleCount; i++) {
        const randAngle = (Math.PI * 2 * (i + 1)) / (obstacleCount + 1) + (Math.random() * 0.4 - 0.2);
        embeddedKnives.push({
          angle: randAngle,
          skin: 'classic',
          player: 'env'
        });
      }
    }

    // Apples on Log perimeter (25% to 50% spawn chance)
    const appleCount = Math.random() < 0.65 ? (Math.random() < 0.3 ? 2 : 1) : 0;
    for (let a = 0; a < appleCount; a++) {
      let randAppleAngle = Math.random() * Math.PI * 2;
      // Make sure it doesn't collide with existing obstacles
      const tooClose = embeddedKnives.some(k => Math.abs(normalizeAngle(k.angle - randAppleAngle)) < 0.35);
      if (!tooClose) {
        apples.push({ angle: randAppleAngle, sliced: false, sliceTimer: 0 });
      }
    }

    readyKnife = {
      y: 440,
      skin: equippedSkin,
      player: duelTurn
    };

    updateHUD();
  }

  // Initialize Game
  function initGame() {
    currentStage = 1;
    score = 0;
    duelTurn = 'p1';
    duelScores = { p1: 0, p2: 0 };
    gameModal.style.display = 'none';
    loadSavedData();
    setupStage();

    if (!animationFrameId) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  // Normalize Angle (-PI to PI)
  function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  // Throw Knife Trigger
  function throwKnife() {
    if (isGameOver || isStageTransition || flyingKnife || remainingKnives <= 0) return;

    playSound('throw');

    flyingKnife = {
      x: logX,
      y: readyKnife.y,
      speed: 28,
      skin: equippedSkin,
      player: duelTurn,
      deflected: false,
      vx: 0,
      vy: -28,
      rot: 0
    };

    remainingKnives--;
    updateHUD();
  }

  // Handle Log Break / Stage Victory
  function handleStageClear() {
    isStageTransition = true;
    playSound('stage');

    // Create log explosion shards
    const isBoss = (currentStage % 5) === 0;
    const pieceCount = 12;
    for (let i = 0; i < pieceCount; i++) {
      const ang = (Math.PI * 2 * i) / pieceCount;
      const spd = 4 + Math.random() * 6;
      logPieces.push({
        x: logX + Math.cos(ang) * (logRadius * 0.5),
        y: logY + Math.sin(ang) * (logRadius * 0.5),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd + 1,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.3,
        size: 16 + Math.random() * 12,
        color: isBoss ? '#f43f5e' : '#d97706',
        alpha: 1
      });
    }

    // Confetti on boss clear
    if (isBoss && typeof confetti === 'function') {
      confetti({
        particleCount: 70,
        spread: 60,
        origin: { y: 0.4 },
        colors: ['#38bdf8', '#facc15', '#fb7185', '#4ade80']
      });
    }

    setTimeout(() => {
      currentStage++;
      setupStage();
    }, 900);
  }

  // Handle Game Over
  function handleGameOver(reason, hitKnife) {
    if (isGameOver) return;
    isGameOver = true;
    screenShake = 16;
    playSound('clash');

    // Deflect flying knife
    if (flyingKnife) {
      flyingKnife.deflected = true;
      flyingKnife.vx = (Math.random() - 0.5) * 12;
      flyingKnife.vy = 8 + Math.random() * 8;
    }

    // Spawn sparks at collision point
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 7;
      particles.push({
        x: logX,
        y: logY + logRadius,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: '#facc15',
        size: 3 + Math.random() * 3,
        alpha: 1
      });
    }

    setTimeout(() => {
      showGameOverModal();
    }, 700);
  }

  // Game Over Modal UI
  function showGameOverModal() {
    const isNewBest = score > bestScore;
    if (isNewBest) {
      bestScore = score;
      saveGameData();
    }

    if (currentMode === 'solo') {
      modalHeroIcon.textContent = '💥';
      modalTitle.textContent = 'GAME OVER';
      modalDesc.textContent = 'You hit another knife blade!';
      modalScore.textContent = score;
      modalStage.textContent = currentStage;
      modalApples.textContent = `🍎 ${totalApples}`;
      modalNewBest.style.display = isNewBest ? 'block' : 'none';
    } else {
      modalNewBest.style.display = 'none';
      const winner = duelTurn === 'p1' ? 'Player 2 (🟪)' : 'Player 1 (🟦)';
      modalHeroIcon.textContent = '👑';
      modalTitle.textContent = `${winner} WINS!`;
      modalDesc.textContent = `${duelTurn.toUpperCase()} clashed blades!`;
      modalScore.textContent = score;
      modalStage.textContent = currentStage;
      modalApples.textContent = `🍎 ${totalApples}`;
    }

    gameModal.style.display = 'flex';
  }

  // Core Physics & Update Step
  function update(dt) {
    patternTimer += dt;

    // Rotation patterns
    if (logPattern === 'constant') {
      logAngle += logSpeed;
    } else if (logPattern === 'wobble') {
      logAngle += logSpeed + Math.sin(patternTimer * 2.5) * 0.025;
    } else if (logPattern === 'reversal') {
      const wave = Math.sin(patternTimer * 1.6);
      logAngle += logSpeed * (wave > 0.3 ? 1.4 : (wave < -0.3 ? -1.2 : 0.2));
    } else if (logPattern === 'stutter') {
      const step = Math.floor(patternTimer * 4) % 4;
      logAngle += step === 0 ? 0.005 : logSpeed * 1.5;
    } else if (logPattern === 'hyper') {
      logAngle += (Math.sin(patternTimer * 3) > 0 ? 1 : -1) * logSpeed * 1.6;
    }

    // Screen Shake decay
    if (screenShake > 0) screenShake *= 0.85;

    // Update Flying Knife
    if (flyingKnife) {
      if (flyingKnife.deflected) {
        flyingKnife.x += flyingKnife.vx;
        flyingKnife.y += flyingKnife.vy;
        flyingKnife.rot += 0.25;
        if (flyingKnife.y > height + 80) flyingKnife = null;
      } else {
        flyingKnife.y += flyingKnife.vy;

        // Check distance to log perimeter
        const targetY = logY + logRadius;
        if (flyingKnife.y <= targetY) {
          // Calculate contact angle relative to log
          const hitAngle = normalizeAngle((Math.PI / 2) - logAngle);

          // Check collision with already embedded knives
          const MIN_BLADE_ANGLE = 0.22; // ~12.6 degrees
          let collidedKnife = null;

          for (const k of embeddedKnives) {
            const diff = Math.abs(normalizeAngle(k.angle - hitAngle));
            if (diff < MIN_BLADE_ANGLE) {
              collidedKnife = k;
              break;
            }
          }

          if (collidedKnife) {
            handleGameOver('knife_clash', collidedKnife);
          } else {
            // Successful Wood Embed!
            playSound('hit');
            screenShake = 6;
            score++;
            embeddedKnives.push({
              angle: hitAngle,
              skin: flyingKnife.skin,
              player: flyingKnife.player
            });

            // Wood splinter particles
            for (let i = 0; i < 8; i++) {
              const ang = Math.PI / 2 + (Math.random() - 0.5) * 1.5;
              particles.push({
                x: logX,
                y: targetY,
                vx: Math.cos(ang) * (2 + Math.random() * 4),
                vy: Math.sin(ang) * (2 + Math.random() * 4),
                color: '#d97706',
                size: 2.5 + Math.random() * 2.5,
                alpha: 1
              });
            }

            // Check if hit any Apple on log!
            apples.forEach(apple => {
              if (!apple.sliced) {
                const diff = Math.abs(normalizeAngle(apple.angle - hitAngle));
                if (diff < 0.26) {
                  apple.sliced = true;
                  totalApples += 2;
                  saveGameData();
                  playSound('apple');

                  // Apple juice particles
                  for (let j = 0; j < 12; j++) {
                    const aAng = Math.random() * Math.PI * 2;
                    particles.push({
                      x: logX,
                      y: targetY,
                      vx: Math.cos(aAng) * (3 + Math.random() * 5),
                      vy: Math.sin(aAng) * (3 + Math.random() * 5),
                      color: '#ef4444',
                      size: 3 + Math.random() * 3,
                      alpha: 1
                    });
                  }
                }
              }
            });

            flyingKnife = null;

            // In 2P Duel, switch turn after each throw
            if (currentMode === 'duel') {
              duelTurn = duelTurn === 'p1' ? 'p2' : 'p1';
            }

            updateHUD();

            // Check if all knives embedded
            if (remainingKnives <= 0) {
              handleStageClear();
            }
          }
        }
      }
    }

    // Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // Gravity
      p.alpha -= 0.025;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // Update Log Exploding Pieces
    for (let i = logPieces.length - 1; i >= 0; i--) {
      const lp = logPieces[i];
      lp.x += lp.vx;
      lp.y += lp.vy;
      lp.vy += 0.25;
      lp.rot += lp.vRot;
      lp.alpha -= 0.018;
      if (lp.alpha <= 0) logPieces.splice(i, 1);
    }
  }

  // Draw Blade Helper
  function drawKnifeShape(cx, cy, skinId, isPlayer2) {
    const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
    const bladeCol = isPlayer2 ? '#fb7185' : skin.bladeColor;
    const hiltCol = isPlayer2 ? '#e11d48' : skin.hiltColor;

    ctx.save();
    ctx.translate(cx, cy);

    // Glow Effect
    if (skin.glowColor) {
      ctx.shadowColor = skin.glowColor;
      ctx.shadowBlur = 8;
    }

    // Blade Point & Edge
    ctx.fillStyle = bladeCol;
    ctx.beginPath();
    ctx.moveTo(0, -45);       // Tip
    ctx.lineTo(7, -10);       // Right blade edge
    ctx.lineTo(7, 0);         // Guard
    ctx.lineTo(-7, 0);        // Guard
    ctx.lineTo(-7, -10);      // Left blade edge
    ctx.closePath();
    ctx.fill();

    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // Crossguard
    ctx.fillStyle = hiltCol;
    ctx.beginPath();
    ctx.roundRect(-11, 0, 22, 6, 3);
    ctx.fill();
    ctx.stroke();

    // Hilt Grip
    ctx.fillStyle = hiltCol;
    ctx.beginPath();
    ctx.roundRect(-4, 6, 8, 22, 2);
    ctx.fill();
    ctx.stroke();

    // Pommel Gem
    ctx.fillStyle = isPlayer2 ? '#fda4af' : (skin.glowColor || '#ffffff');
    ctx.beginPath();
    ctx.arc(0, 30, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Main Render Routine
  function render() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    // Screen Shake
    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // 1. Draw Exploding Log Pieces (if transitioning)
    logPieces.forEach(lp => {
      ctx.save();
      ctx.translate(lp.x, lp.y);
      ctx.rotate(lp.rot);
      ctx.globalAlpha = Math.max(0, lp.alpha);
      ctx.fillStyle = lp.color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-lp.size / 2, -lp.size / 2, lp.size, lp.size, 4);
      ctx.fill();
      ctx.stroke();
      ctx.restore();
    });

    // 2. Draw Central Rotating Log / Boss Target
    if (!isStageTransition) {
      ctx.save();
      ctx.translate(logX, logY);
      ctx.rotate(logAngle);

      const isBoss = (currentStage % 5) === 0;
      const bossConfig = BOSS_CONFIGS[currentStage] || (isBoss ? BOSS_CONFIGS[5] : null);

      if (isBoss && bossConfig) {
        // Boss Target
        ctx.fillStyle = bossConfig.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Inner Rings
        ctx.strokeStyle = bossConfig.ringColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        // Boss Hero Icon in Center
        ctx.font = '40px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bossConfig.icon, 0, 0);
      } else {
        // Classic Cartoon Wood Log
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        // Wood Texture Growth Rings
        ctx.strokeStyle = '#b45309';
        ctx.lineWidth = 4;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius * 0.72, 0, Math.PI * 2);
        ctx.stroke();

        ctx.strokeStyle = '#92400e';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius * 0.42, 0, Math.PI * 2);
        ctx.stroke();

        // Core Ring
        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, 0, logRadius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Embedded Knives
      embeddedKnives.forEach(k => {
        ctx.save();
        ctx.rotate(k.angle);
        ctx.translate(0, logRadius);
        // Flip knife outwards
        ctx.rotate(Math.PI);
        drawKnifeShape(0, 0, k.skin, k.player === 'p2');
        ctx.restore();
      });

      // 4. Draw Apples on Log
      apples.forEach(apple => {
        if (!apple.sliced) {
          ctx.save();
          ctx.rotate(apple.angle);
          ctx.translate(0, logRadius + 6);
          ctx.font = '26px sans-serif';
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🍎', 0, 0);
          ctx.restore();
        }
      });

      ctx.restore();
    }

    // 5. Draw Flying Knife
    if (flyingKnife) {
      ctx.save();
      ctx.translate(flyingKnife.x, flyingKnife.y);
      if (flyingKnife.deflected) {
        ctx.rotate(flyingKnife.rot);
      }
      drawKnifeShape(0, 0, flyingKnife.skin, flyingKnife.player === 'p2');
      ctx.restore();
    }

    // 6. Draw Ready Knife at Bottom Launcher
    if (!flyingKnife && remainingKnives > 0 && !isStageTransition && !isGameOver) {
      drawKnifeShape(logX, readyKnife.y, equippedSkin, currentMode === 'duel' && duelTurn === 'p2');
    }

    // 7. Draw Particles
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    ctx.restore();
  }

  // Animation Frame Loop
  function gameLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    update(dt);
    render();

    animationFrameId = requestAnimationFrame(gameLoop);
  }

  // Skin Arsenal Shop UI
  function openShop() {
    shopAppleCount.textContent = `🍎 ${totalApples}`;
    skinGrid.innerHTML = '';

    SKINS.forEach(skin => {
      const isUnlocked = unlockedSkins.includes(skin.id);
      const isEquipped = equippedSkin === skin.id;

      const itemEl = document.createElement('div');
      itemEl.className = `skin-item ${isEquipped ? 'equipped' : ''} ${!isUnlocked ? 'locked' : ''}`;

      itemEl.innerHTML = `
        <div class="skin-icon">${skin.icon}</div>
        <div class="skin-name">${skin.name}</div>
        <div class="skin-price">${isEquipped ? 'EQUIPPED' : (isUnlocked ? 'SELECT' : `🍎 ${skin.price}`)}</div>
      `;

      itemEl.addEventListener('click', () => {
        if (isUnlocked) {
          equippedSkin = skin.id;
          saveGameData();
          openShop();
          updateHUD();
        } else if (totalApples >= skin.price) {
          totalApples -= skin.price;
          unlockedSkins.push(skin.id);
          equippedSkin = skin.id;
          saveGameData();
          openShop();
          updateHUD();
          playSound('stage');
        } else {
          playSound('clash');
        }
      });

      skinGrid.appendChild(itemEl);
    });

    shopModal.style.display = 'flex';
  }

  // Event Listeners
  wrapper.addEventListener('pointerdown', (e) => {
    e.preventDefault();
    throwKnife();
  });

  window.addEventListener('keydown', (e) => {
    if (e.code === 'Space' || e.code === 'ArrowUp') {
      e.preventDefault();
      throwKnife();
    }
  });

  // Mode Selection
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

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  btnShop.addEventListener('click', openShop);
  btnShopClose.addEventListener('click', () => { shopModal.style.display = 'none'; });
  btnModalRestart.addEventListener('click', initGame);

  // Resize Handler for crisp canvas resolution
  function handleResize() {
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    width = rect.width;
    height = rect.height;

    canvas.width = width * dpr;
    canvas.height = height * dpr;
    ctx.scale(dpr, dpr);

    logX = width / 2;
    logY = height * 0.3;
    readyKnife.y = height * 0.88;
  }

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  // Start initial game
  loadSavedData();
  initGame();
})();
