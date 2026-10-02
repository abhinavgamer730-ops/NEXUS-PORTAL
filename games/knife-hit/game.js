/**
 * Knife Hit Arcade Game Engine (High-Fidelity Polish)
 * Features: 60FPS Canvas Physics, Multi-Layer Realistic Synthesized Audio,
 * Log Recoil Spring, Smooth Blade Insertion & Radial Handle Orientation,
 * Apple Slicing Physics, Knife Arsenal Shop, 2-Player Duel Mode
 */

(function () {
  'use strict';

  // Knife Skins Catalog
  const SKINS = [
    { id: 'classic', name: 'Classic Dagger', icon: '🗡️', price: 0, bladeColor: '#e2e8f0', bladeEdge: '#94a3b8', hiltColor: '#64748b', gripColor: '#334155', glowColor: null },
    { id: 'katana', name: 'Golden Katana', icon: '⚔️', price: 20, bladeColor: '#fef08a', bladeEdge: '#eab308', hiltColor: '#ca8a04', gripColor: '#854d0e', glowColor: '#fef08a' },
    { id: 'kunai', name: 'Ninja Kunai', icon: '🥷', price: 40, bladeColor: '#7dd3fc', bladeEdge: '#0284c7', hiltColor: '#0369a1', gripColor: '#0c4a6e', glowColor: '#38bdf8' },
    { id: 'laser', name: 'Cyber Saber', icon: '⚡', price: 70, bladeColor: '#e9d5ff', bladeEdge: '#a855f7', hiltColor: '#7e22ce', gripColor: '#581c87', glowColor: '#c084fc' },
    { id: 'ruby', name: 'Ruby Blade', icon: '💎', price: 100, bladeColor: '#fecdd3', bladeEdge: '#f43f5e', hiltColor: '#e11d48', gripColor: '#9f1239', glowColor: '#fb7185' },
    { id: 'excalibur', name: 'Excalibur', icon: '👑', price: 150, bladeColor: '#bbf7d0', bladeEdge: '#22c55e', hiltColor: '#16a34a', gripColor: '#14532d', glowColor: '#4ade80' }
  ];

  // Boss Definitions
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
  let logPattern = 'constant';
  let patternTimer = 0;
  let logRecoilY = 0; // Micro recoil bounce on strike

  // Active Stage Objects
  let embeddedKnives = []; // [ { angle, skin, player } ]
  let flyingKnife = null;  // { x, y, vy, vx, rot, skin, player, deflected }
  let readyKnifeY = 440;
  let targetReadyKnifeY = 440;
  let apples = []; // [ { angle, sliced, pieces: [] } ]
  let particles = [];
  let logPieces = [];
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

  // Multi-Layer Realistic Web Audio Synthesizer
  let audioCtx = null;
  let noiseBuffer = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
        // Generate pre-rendered white noise buffer for realistic wood crack & whoosh
        const bufferSize = audioCtx.sampleRate * 1.5;
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      }
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
    return audioCtx;
  }

  function playSound(type) {
    if (!soundEnabled) return;
    const ctxA = getAudioContext();
    if (!ctxA) return;

    const now = ctxA.currentTime;

    try {
      if (type === 'throw') {
        // Aerodynamic Blade Whoosh (Filtered noise sweep)
        if (noiseBuffer) {
          const noise = ctxA.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = ctxA.createBiquadFilter();
          filter.type = 'bandpass';
          filter.Q.setValueAtTime(3.5, now);
          filter.frequency.setValueAtTime(900, now);
          filter.frequency.exponentialRampToValueAtTime(300, now + 0.08);

          const gain = ctxA.createGain();
          gain.gain.setValueAtTime(0.2, now);
          gain.gain.exponentialRampToValueAtTime(0.01, now + 0.08);

          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctxA.destination);
          noise.start(now);
          noise.stop(now + 0.09);
        }
      } else if (type === 'hit') {
        // REALISTIC SOLID WOOD THWACK! (3 acoustic layers)
        
        // 1. Heavy Low Wood Body Thump
        const oscThump = ctxA.createOscillator();
        const gainThump = ctxA.createGain();
        oscThump.type = 'sine';
        oscThump.frequency.setValueAtTime(160, now);
        oscThump.frequency.exponentialRampToValueAtTime(45, now + 0.07);
        gainThump.gain.setValueAtTime(0.45, now);
        gainThump.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        oscThump.connect(gainThump);
        gainThump.connect(ctxA.destination);
        oscThump.start(now);
        oscThump.stop(now + 0.09);

        // 2. Wood Fiber Penetration Crack (Filtered Noise Transient)
        if (noiseBuffer) {
          const noise = ctxA.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = ctxA.createBiquadFilter();
          filter.type = 'bandpass';
          filter.Q.setValueAtTime(2.0, now);
          filter.frequency.setValueAtTime(1600, now);
          filter.frequency.exponentialRampToValueAtTime(600, now + 0.04);

          const gainNoise = ctxA.createGain();
          gainNoise.gain.setValueAtTime(0.35, now);
          gainNoise.gain.exponentialRampToValueAtTime(0.001, now + 0.045);

          noise.connect(filter);
          filter.connect(gainNoise);
          gainNoise.connect(ctxA.destination);
          noise.start(now);
          noise.stop(now + 0.05);
        }

        // 3. High Tensile Steel Ring Ping
        const oscPing = ctxA.createOscillator();
        const gainPing = ctxA.createGain();
        oscPing.type = 'triangle';
        oscPing.frequency.setValueAtTime(2400, now);
        oscPing.frequency.exponentialRampToValueAtTime(1800, now + 0.03);
        gainPing.gain.setValueAtTime(0.15, now);
        gainPing.gain.exponentialRampToValueAtTime(0.001, now + 0.035);
        oscPing.connect(gainPing);
        gainPing.connect(ctxA.destination);
        oscPing.start(now);
        oscPing.stop(now + 0.04);

      } else if (type === 'clash') {
        // High Metallic Blade Clang & Deflection
        [880, 1760, 3150].forEach((freq, i) => {
          const osc = ctxA.createOscillator();
          const gain = ctxA.createGain();
          osc.type = i === 0 ? 'sawtooth' : 'sine';
          osc.frequency.setValueAtTime(freq, now);
          osc.frequency.exponentialRampToValueAtTime(freq * 0.7, now + 0.25);
          gain.gain.setValueAtTime(0.3 / (i + 1), now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
          osc.connect(gain);
          gain.connect(ctxA.destination);
          osc.start(now);
          osc.stop(now + 0.27);
        });
      } else if (type === 'apple') {
        // Juicy Fruit Squelch + Pop
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(900, now);
        osc.frequency.exponentialRampToValueAtTime(1400, now + 0.08);
        gain.gain.setValueAtTime(0.28, now);
        gain.gain.exponentialRampToValueAtTime(0.01, now + 0.09);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'stage') {
        // Log Fracture Explosion & Chime
        [523.25, 659.25, 783.99, 1046.50].forEach((freq, i) => {
          const osc = ctxA.createOscillator();
          const gain = ctxA.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, now + i * 0.06);
          gain.gain.setValueAtTime(0.25, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(ctxA.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.21);
        });
      }
    } catch (e) {}
  }

  // Update HUD
  function updateHUD() {
    scoreValEl.textContent = score;
    appleValEl.textContent = `🍎 ${totalApples}`;
    bestValEl.textContent = bestScore;

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

    // Stack Icons
    let stackHTML = '';
    const skinDef = SKINS.find(s => s.id === equippedSkin) || SKINS[0];
    const icon = skinDef.icon || '🗡️';

    for (let i = 0; i < totalStageKnives; i++) {
      const isUsed = i >= remainingKnives;
      stackHTML += `<div class="stack-knife ${isUsed ? 'used' : ''}">${icon}</div>`;
    }
    knifeStackEl.innerHTML = stackHTML;
  }

  // Setup Stage
  function setupStage() {
    isStageTransition = false;
    isGameOver = false;
    embeddedKnives = [];
    flyingKnife = null;
    apples = [];
    particles = [];
    logPieces = [];
    logRecoilY = 0;
    readyKnifeY = height * 0.88;
    targetReadyKnifeY = height * 0.88;

    const isBoss = (currentStage % 5) === 0;
    const bossConfig = BOSS_CONFIGS[currentStage] || (isBoss ? BOSS_CONFIGS[5] : null);

    if (isBoss && bossConfig) {
      bossBannerEl.style.display = 'block';
      bossTextEl.textContent = `⚠️ BOSS: ${bossConfig.name} ⚠️`;
      totalStageKnives = bossConfig.knives || 9;
      logPattern = bossConfig.pattern || 'wobble';
      logRadius = 80;
      setTimeout(() => { bossBannerEl.style.display = 'none'; }, 2000);
    } else {
      bossBannerEl.style.display = 'none';
      totalStageKnives = Math.min(6 + Math.floor(currentStage / 2), 11);
      logRadius = 72;

      if (currentStage === 1) logPattern = 'constant';
      else if (currentStage === 2) logPattern = 'wobble';
      else if (currentStage === 3) logPattern = 'reversal';
      else logPattern = ['wobble', 'reversal', 'stutter'][Math.floor(Math.random() * 3)];
    }

    remainingKnives = totalStageKnives;
    logAngle = 0;
    logSpeed = 0.032 + Math.min(currentStage * 0.003, 0.035);

    // Pre-embedded obstacles (Stage 3+)
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

    // Apples on Log perimeter
    const appleCount = Math.random() < 0.6 ? (Math.random() < 0.25 ? 2 : 1) : 0;
    for (let a = 0; a < appleCount; a++) {
      let randAppleAngle = Math.random() * Math.PI * 2;
      const tooClose = embeddedKnives.some(k => Math.abs(normalizeAngle(k.angle - randAppleAngle)) < 0.4);
      if (!tooClose) {
        apples.push({ angle: randAppleAngle, sliced: false });
      }
    }

    updateHUD();
  }

  // Initialize Game
  function initGame() {
    currentStage = 1;
    score = 0;
    duelTurn = 'p1';
    gameModal.style.display = 'none';
    loadSavedData();
    setupStage();

    if (!animationFrameId) {
      lastTime = performance.now();
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  }

  function normalizeAngle(a) {
    while (a > Math.PI) a -= Math.PI * 2;
    while (a < -Math.PI) a += Math.PI * 2;
    return a;
  }

  // Throw Knife
  function throwKnife() {
    if (isGameOver || isStageTransition || flyingKnife || remainingKnives <= 0) return;

    playSound('throw');

    flyingKnife = {
      x: logX,
      y: readyKnifeY,
      vy: -32, // High speed 60FPS travel
      vx: 0,
      rot: 0,
      skin: equippedSkin,
      player: duelTurn,
      deflected: false
    };

    remainingKnives--;
    // Slide up next knife smoothly
    readyKnifeY = height * 0.95;
    targetReadyKnifeY = height * 0.88;

    updateHUD();
  }

  // Handle Stage Cleared
  function handleStageClear() {
    isStageTransition = true;
    playSound('stage');

    const isBoss = (currentStage % 5) === 0;
    const pieceCount = 14;
    for (let i = 0; i < pieceCount; i++) {
      const ang = (Math.PI * 2 * i) / pieceCount;
      const spd = 4 + Math.random() * 6;
      logPieces.push({
        x: logX + Math.cos(ang) * (logRadius * 0.5),
        y: logY + Math.sin(ang) * (logRadius * 0.5),
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd + 1,
        rot: Math.random() * Math.PI,
        vRot: (Math.random() - 0.5) * 0.25,
        size: 16 + Math.random() * 12,
        color: isBoss ? '#f43f5e' : '#d97706',
        alpha: 1
      });
    }

    if (isBoss && typeof confetti === 'function') {
      confetti({
        particleCount: 75,
        spread: 65,
        origin: { y: 0.4 },
        colors: ['#38bdf8', '#facc15', '#fb7185', '#4ade80', '#c084fc']
      });
    }

    setTimeout(() => {
      currentStage++;
      setupStage();
    }, 850);
  }

  // Handle Game Over
  function handleGameOver() {
    if (isGameOver) return;
    isGameOver = true;
    screenShake = 12;
    playSound('clash');

    if (flyingKnife) {
      flyingKnife.deflected = true;
      flyingKnife.vx = (Math.random() > 0.5 ? 1 : -1) * (5 + Math.random() * 5);
      flyingKnife.vy = 10 + Math.random() * 6;
    }

    // Sparks
    for (let i = 0; i < 16; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 3 + Math.random() * 6;
      particles.push({
        x: logX,
        y: logY + logRadius,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: '#facc15',
        size: 3 + Math.random() * 2.5,
        alpha: 1
      });
    }

    setTimeout(showGameOverModal, 700);
  }

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

  // Update Engine Loop
  function update(dt) {
    patternTimer += dt;

    // Smooth Reload animation
    readyKnifeY += (targetReadyKnifeY - readyKnifeY) * 0.25;

    // Spring Recoil decay
    logRecoilY *= 0.72;

    // Rotation patterns
    if (logPattern === 'constant') {
      logAngle += logSpeed;
    } else if (logPattern === 'wobble') {
      logAngle += logSpeed + Math.sin(patternTimer * 2.8) * 0.022;
    } else if (logPattern === 'reversal') {
      const wave = Math.sin(patternTimer * 1.5);
      logAngle += logSpeed * (wave > 0.35 ? 1.4 : (wave < -0.35 ? -1.3 : 0.15));
    } else if (logPattern === 'stutter') {
      const step = Math.floor(patternTimer * 4.5) % 4;
      logAngle += step === 0 ? 0.003 : logSpeed * 1.5;
    } else if (logPattern === 'hyper') {
      logAngle += (Math.sin(patternTimer * 3.2) > 0 ? 1 : -1) * logSpeed * 1.6;
    }

    if (screenShake > 0) screenShake *= 0.82;

    // Flying Knife Update
    if (flyingKnife) {
      if (flyingKnife.deflected) {
        flyingKnife.x += flyingKnife.vx;
        flyingKnife.y += flyingKnife.vy;
        flyingKnife.rot += 0.3;
        if (flyingKnife.y > height + 80) flyingKnife = null;
      } else {
        flyingKnife.y += flyingKnife.vy;

        // Collision with log perimeter
        const targetY = logY + logRadius;
        if (flyingKnife.y <= targetY) {
          // Precise impact angle in local rotating coordinates
          // At bottom of circle, world angle is PI/2
          const hitAngle = normalizeAngle((Math.PI / 2) - logAngle);

          // Check clash against existing knives
          const MIN_BLADE_ANGLE = 0.22; // ~12.6 degrees safety threshold
          let collidedKnife = null;

          for (const k of embeddedKnives) {
            const diff = Math.abs(normalizeAngle(k.angle - hitAngle));
            if (diff < MIN_BLADE_ANGLE) {
              collidedKnife = k;
              break;
            }
          }

          if (collidedKnife) {
            handleGameOver();
          } else {
            // SUCCESSFUL WOOD EMBED!
            playSound('hit');
            screenShake = 3.5;
            logRecoilY = -6; // Juicy micro recoil bounce upwards!
            score++;

            embeddedKnives.push({
              angle: hitAngle,
              skin: flyingKnife.skin,
              player: flyingKnife.player
            });

            // Wood Splinter Particles
            for (let i = 0; i < 9; i++) {
              const ang = Math.PI / 2 + (Math.random() - 0.5) * 1.4;
              particles.push({
                x: logX,
                y: targetY,
                vx: Math.cos(ang) * (2 + Math.random() * 4),
                vy: Math.sin(ang) * (2 + Math.random() * 4),
                color: '#d97706',
                size: 2.2 + Math.random() * 2,
                alpha: 1
              });
            }

            // Apple Slicing Check
            apples.forEach(apple => {
              if (!apple.sliced) {
                const diff = Math.abs(normalizeAngle(apple.angle - hitAngle));
                if (diff < 0.28) {
                  apple.sliced = true;
                  totalApples += 2;
                  saveGameData();
                  playSound('apple');

                  for (let j = 0; j < 12; j++) {
                    const aAng = Math.random() * Math.PI * 2;
                    particles.push({
                      x: logX,
                      y: targetY,
                      vx: Math.cos(aAng) * (3 + Math.random() * 4),
                      vy: Math.sin(aAng) * (3 + Math.random() * 4),
                      color: '#ef4444',
                      size: 3 + Math.random() * 2.5,
                      alpha: 1
                    });
                  }
                }
              }
            });

            flyingKnife = null;

            if (currentMode === 'duel') {
              duelTurn = duelTurn === 'p1' ? 'p2' : 'p1';
            }

            updateHUD();

            if (remainingKnives <= 0) {
              handleStageClear();
            }
          }
        }
      }
    }

    // Particles Update
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.22;
      p.alpha -= 0.026;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // Exploding Pieces Update
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

  /**
   * Draw Knife Shape
   * Standard Orientation:
   * (0, 0) is the Crossguard base.
   * Tip is at (0, -38) [Pointed UP towards negative Y]
   * Hilt & Grip are at (0, +28) [Pointed DOWN towards positive Y]
   */
  function drawKnife(cx, cy, skinId, isPlayer2, embeddedInLog = false) {
    const skin = SKINS.find(s => s.id === skinId) || SKINS[0];
    const bladeCol = isPlayer2 ? '#fb7185' : skin.bladeColor;
    const bladeEdge = isPlayer2 ? '#f43f5e' : skin.bladeEdge;
    const hiltCol = isPlayer2 ? '#e11d48' : skin.hiltColor;
    const gripCol = isPlayer2 ? '#9f1239' : skin.gripColor;

    ctx.save();
    ctx.translate(cx, cy);

    if (skin.glowColor) {
      ctx.shadowColor = skin.glowColor;
      ctx.shadowBlur = 7;
    }

    // 1. Blade Body
    ctx.fillStyle = bladeCol;
    ctx.beginPath();
    ctx.moveTo(0, -38);      // Blade Sharp Tip
    ctx.lineTo(6, -8);       // Right edge taper
    ctx.lineTo(6, 0);        // Right base
    ctx.lineTo(-6, 0);       // Left base
    ctx.lineTo(-6, -8);      // Left edge taper
    ctx.closePath();
    ctx.fill();

    // Blade Center Ridge Line
    ctx.strokeStyle = bladeEdge;
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(0, -34);
    ctx.lineTo(0, 0);
    ctx.stroke();

    // Outline
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.2;
    ctx.stroke();

    // 2. Crossguard (Guard)
    ctx.fillStyle = hiltCol;
    ctx.beginPath();
    ctx.roundRect(-10, 0, 20, 5, 2.5);
    ctx.fill();
    ctx.stroke();

    // 3. Handle Grip (Sticks OUT into space)
    ctx.fillStyle = gripCol;
    ctx.beginPath();
    ctx.roundRect(-3.5, 5, 7, 20, 2);
    ctx.fill();
    ctx.stroke();

    // Grip Ribs
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1.2;
    ctx.beginPath();
    ctx.moveTo(-3, 10); ctx.lineTo(3, 10);
    ctx.moveTo(-3, 15); ctx.lineTo(3, 15);
    ctx.moveTo(-3, 20); ctx.lineTo(3, 20);
    ctx.stroke();

    // 4. Pommel Ring / Gem at End of Handle
    ctx.fillStyle = isPlayer2 ? '#fda4af' : (skin.glowColor || '#ffffff');
    ctx.beginPath();
    ctx.arc(0, 28, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    ctx.restore();
  }

  // Render Loop
  function render() {
    ctx.clearRect(0, 0, width, height);

    ctx.save();
    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // 1. Draw Exploding Log Pieces
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

    // 2. Draw Central Log with Spring Recoil Bounce
    if (!isStageTransition) {
      ctx.save();
      ctx.translate(logX, logY + logRecoilY);
      ctx.rotate(logAngle);

      const isBoss = (currentStage % 5) === 0;
      const bossConfig = BOSS_CONFIGS[currentStage] || (isBoss ? BOSS_CONFIGS[5] : null);

      if (isBoss && bossConfig) {
        ctx.fillStyle = bossConfig.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

        ctx.strokeStyle = bossConfig.ringColor;
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius * 0.65, 0, Math.PI * 2);
        ctx.stroke();

        ctx.font = '38px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText(bossConfig.icon, 0, 0);
      } else {
        // Classic Wood Target
        ctx.fillStyle = '#d97706';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 5.5;
        ctx.beginPath();
        ctx.arc(0, 0, logRadius, 0, Math.PI * 2);
        ctx.fill();
        ctx.stroke();

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

        ctx.fillStyle = '#78350f';
        ctx.beginPath();
        ctx.arc(0, 0, logRadius * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }

      // 3. Draw Embedded Knives:
      // Tip is buried in wood (pointing towards center), handle sticks OUTWARDS into the air!
      embeddedKnives.forEach(k => {
        ctx.save();
        // Rotate to the exact radial angle of contact
        ctx.rotate(k.angle - Math.PI / 2);
        // Translate radially to log perimeter
        ctx.translate(0, logRadius);
        // Draw knife: Tip points at log center (-Y), handle points outwards (+Y)
        drawKnife(0, 0, k.skin, k.player === 'p2', true);
        ctx.restore();
      });

      // 4. Draw Apples on Log Perimeter
      apples.forEach(apple => {
        if (!apple.sliced) {
          ctx.save();
          ctx.rotate(apple.angle - Math.PI / 2);
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

    // 5. Draw Flying Knife (Tip facing UPwards towards the log)
    if (flyingKnife) {
      ctx.save();
      ctx.translate(flyingKnife.x, flyingKnife.y);
      if (flyingKnife.deflected) {
        ctx.rotate(flyingKnife.rot);
      }
      drawKnife(0, 0, flyingKnife.skin, flyingKnife.player === 'p2', false);
      ctx.restore();
    }

    // 6. Draw Ready Knife at Bottom Launcher
    if (!flyingKnife && remainingKnives > 0 && !isStageTransition && !isGameOver) {
      drawKnife(logX, readyKnifeY, equippedSkin, currentMode === 'duel' && duelTurn === 'p2', false);
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

  // Skin Arsenal Shop
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
    targetReadyKnifeY = height * 0.88;
    readyKnifeY = targetReadyKnifeY;
  }

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  loadSavedData();
  initGame();
})();
