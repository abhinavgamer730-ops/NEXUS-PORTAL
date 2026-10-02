/**
 * Turbo Drift: Neon Highway 2.5D Engine
 * Features: Pseudo-3D Curved Horizon Road, Near-Miss Nitro NOS System,
 * Drift Mechanics with Skidmarks, Traffic Vehicles, Police Chase Mode,
 * Garage Customization & Upgrades, Fullscreen, and Web Audio Synthesizer.
 */

(function () {
  'use strict';

  // Car Catalog
  const CARS = [
    {
      id: 0,
      name: 'Neon Runner',
      className: 'Muscle GT',
      icon: '🚗',
      price: 0,
      baseSpeed: 160,
      maxSpeed: 210,
      handling: 1.0,
      driftMultiplier: 1.0,
      color: '#06b6d4',
      roofColor: '#0284c7'
    },
    {
      id: 1,
      name: 'Tokyo Drifter',
      className: 'JDM Turbo',
      icon: '🏎️',
      price: 300,
      baseSpeed: 180,
      maxSpeed: 230,
      handling: 1.25,
      driftMultiplier: 1.4,
      color: '#f43f5e',
      roofColor: '#be123c'
    },
    {
      id: 2,
      name: 'Cyber Phantom',
      className: 'Hypercar',
      icon: '⚡',
      price: 750,
      baseSpeed: 200,
      maxSpeed: 265,
      handling: 1.35,
      driftMultiplier: 1.6,
      color: '#a855f7',
      roofColor: '#7e22ce'
    }
  ];

  // Domestic & Traffic Vehicles
  const TRAFFIC_TYPES = [
    { name: 'Sedan', color: '#64748b', width: 65, length: 110, speed: 85 },
    { name: 'Taxi', color: '#facc15', width: 65, length: 110, speed: 95 },
    { name: 'SportsCar', color: '#ef4444', width: 68, length: 115, speed: 120 },
    { name: 'SemiTruck', color: '#3b82f6', width: 85, length: 220, speed: 70 },
    { name: 'Police', color: '#1e293b', width: 68, length: 115, speed: 140, isPolice: true }
  ];

  // DOM Elements
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('canvas-wrapper');

  const hudSpeed = document.getElementById('hud-speed');
  const hudNosFill = document.getElementById('hud-nos-fill');
  const hudScore = document.getElementById('hud-score');
  const hudDriftBadge = document.getElementById('hud-drift-badge');
  const hudTimeBadge = document.getElementById('hud-time-badge');
  const hudCoins = document.getElementById('hud-coins');
  const hudDist = document.getElementById('hud-dist');
  const hudShieldPill = document.getElementById('hud-shield-pill');

  const nearMissBanner = document.getElementById('near-miss-banner');
  const nearMissText = document.getElementById('near-miss-text');

  const btnGarage = document.getElementById('btn-garage');
  const garageModal = document.getElementById('garage-modal');
  const garageCloseBtn = document.getElementById('garage-close-btn');
  const garageDriveBtn = document.getElementById('garage-drive-btn');
  const garageCoins = document.getElementById('garage-coins');

  const gameoverModal = document.getElementById('gameover-modal');
  const goTitle = document.getElementById('go-title');
  const goDist = document.getElementById('go-dist');
  const goTopSpeed = document.getElementById('go-top-speed');
  const goMisses = document.getElementById('go-misses');
  const goCoins = document.getElementById('go-coins');
  const goScore = document.getElementById('go-score');
  const goNewBest = document.getElementById('go-new-best');
  const btnRestart = document.getElementById('btn-restart');
  const btnOpenGarage = document.getElementById('btn-open-garage');

  const btnFullscreen = document.getElementById('btn-fullscreen');
  const soundToggleBtn = document.getElementById('sound-toggle-btn');
  const modePills = document.querySelectorAll('.mode-pill');

  // Virtual Touch Controls
  const btnSteerLeft = document.getElementById('btn-steer-left');
  const btnSteerRight = document.getElementById('btn-steer-right');
  const btnTouchDrift = document.getElementById('btn-touch-drift');
  const btnTouchNos = document.getElementById('btn-touch-nos');

  // Audio Context
  let audioCtx = null;
  let soundEnabled = true;
  let synthMusicPlaying = false;
  let engineOsc = null;
  let engineGain = null;

  function initAudio() {
    if (!audioCtx) {
      const AudioContext = window.AudioContext || window.webkitAudioContext;
      if (AudioContext) audioCtx = new AudioContext();
    }
    if (audioCtx && audioCtx.state === 'suspended') {
      audioCtx.resume();
    }
  }

  function playSound(type) {
    if (!soundEnabled) return;
    initAudio();
    if (!audioCtx) return;

    const t = audioCtx.currentTime;
    const osc = audioCtx.createOscillator();
    const gain = audioCtx.createGain();
    osc.connect(gain);
    gain.connect(audioCtx.destination);

    if (type === 'nos') {
      osc.type = 'sawtooth';
      osc.frequency.setValueAtTime(140, t);
      osc.frequency.exponentialRampToValueAtTime(550, t + 0.35);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.4);
      osc.start(t);
      osc.stop(t + 0.4);
    } else if (type === 'miss') {
      osc.type = 'sine';
      osc.frequency.setValueAtTime(440, t);
      osc.frequency.exponentialRampToValueAtTime(880, t + 0.2);
      gain.gain.setValueAtTime(0.25, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    } else if (type === 'coin') {
      osc.type = 'triangle';
      osc.frequency.setValueAtTime(587.33, t);
      osc.frequency.setValueAtTime(880, t + 0.08);
      gain.gain.setValueAtTime(0.2, t);
      gain.gain.exponentialRampToValueAtTime(0.01, t + 0.25);
      osc.start(t);
      osc.stop(t + 0.25);
    } else if (type === 'drift') {
      osc.type = 'square';
      osc.frequency.setValueAtTime(80 + Math.random() * 40, t);
      gain.gain.setValueAtTime(0.05, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.15);
      osc.start(t);
      osc.stop(t + 0.15);
    } else if (type === 'crash') {
      // Noise buffer crash explosion
      const bufSize = audioCtx.sampleRate * 0.5;
      const buffer = audioCtx.createBuffer(1, bufSize, audioCtx.sampleRate);
      const data = buffer.getChannelData(0);
      for (let i = 0; i < bufSize; i++) data[i] = (Math.random() * 2 - 1) * Math.exp(-i / (bufSize * 0.25));
      const noise = audioCtx.createBufferSource();
      noise.buffer = buffer;
      const f = audioCtx.createBiquadFilter();
      f.type = 'lowpass';
      f.frequency.setValueAtTime(300, t);
      f.frequency.linearRampToValueAtTime(50, t + 0.5);
      noise.connect(f);
      f.connect(gain);
      gain.gain.setValueAtTime(0.4, t);
      gain.gain.linearRampToValueAtTime(0.01, t + 0.5);
      noise.start(t);
    }
  }

  // Persistent Saved Data
  let coins = 0;
  let selectedCarId = 0;
  let unlockedCars = [0];
  let upgrades = { speed: 1, nos: 1, drift: 1 };
  let selectedUnderglow = '#06b6d4';
  let bestScore = 0;

  function loadSavedData() {
    try {
      const data = JSON.parse(localStorage.getItem('turbo_drift_data') || '{}');
      coins = data.coins || 0;
      selectedCarId = data.selectedCarId || 0;
      unlockedCars = data.unlockedCars || [0];
      upgrades = data.upgrades || { speed: 1, nos: 1, drift: 1 };
      selectedUnderglow = data.selectedUnderglow || '#06b6d4';
      bestScore = data.bestScore || 0;
    } catch (e) {
      console.warn('Storage load failed', e);
    }
  }

  function saveGameData() {
    try {
      localStorage.setItem('turbo_drift_data', JSON.stringify({
        coins,
        selectedCarId,
        unlockedCars,
        upgrades,
        selectedUnderglow,
        bestScore
      }));
    } catch (e) {
      console.warn('Storage save failed', e);
    }
  }

  // Game Engine State
  let currentMode = 'endless'; // 'endless', 'police', 'time'
  let isGameOver = false;
  let isPaused = false;

  let player = {
    x: 0, // Road center is 0, -1 left curb, +1 right curb
    y: 0,
    speed: 0,
    maxSpeed: 180,
    angle: 0,
    driftAngle: 0,
    isDrifting: false,
    nosGauge: 100,
    isNos: false,
    hasShield: false,
    steerDir: 0
  };

  let distance = 0;
  let score = 0;
  let nearMissCount = 0;
  let maxSpeedAchieved = 0;
  let timeRemaining = 60;
  let driftMultiplier = 1.0;
  let screenShake = 0;

  // Road Curve & Segments
  let roadPosition = 0;
  let roadCurve = 0;
  let targetCurve = 0;
  let curveTimer = 0;

  // Traffic & Pickups
  let trafficCars = [];
  let collectibles = [];
  let skidMarks = [];
  let particles = [];

  // Keys Map
  const keys = {};

  // Setup New Run
  function startRun() {
    loadSavedData();
    const activeCar = CARS.find(c => c.id === selectedCarId) || CARS[0];

    const speedBonus = (upgrades.speed - 1) * 12;
    player.maxSpeed = activeCar.baseSpeed + speedBonus;
    player.speed = 30;
    player.x = 0;
    player.angle = 0;
    player.driftAngle = 0;
    player.isDrifting = false;
    player.nosGauge = 100;
    player.isNos = false;
    player.hasShield = false;
    player.steerDir = 0;

    distance = 0;
    score = 0;
    nearMissCount = 0;
    maxSpeedAchieved = player.speed;
    timeRemaining = 60;
    driftMultiplier = 1.0;
    isGameOver = false;
    isPaused = false;
    screenShake = 0;

    trafficCars = [];
    collectibles = [];
    skidMarks = [];
    particles = [];

    // Spawn initial traffic
    for (let i = 0; i < 6; i++) {
      spawnTraffic(300 + i * 220);
    }

    gameoverModal.style.display = 'none';
    garageModal.style.display = 'none';
    updateHUD();
  }

  // Spawn Traffic Ahead
  function spawnTraffic(zPos) {
    const typeIdx = Math.floor(Math.random() * (currentMode === 'police' ? 5 : 4));
    const type = TRAFFIC_TYPES[typeIdx];

    // Pick 1 of 3 Highway Lanes: -0.65, 0, +0.65
    const lanes = [-0.65, 0, 0.65];
    const laneX = lanes[Math.floor(Math.random() * lanes.length)];

    trafficCars.push({
      x: laneX,
      z: zPos,
      type: type,
      speed: type.speed + (Math.random() * 20 - 10),
      passed: false
    });

    // Chance to spawn Gold Coin or Nitro pickup beside car
    if (Math.random() < 0.45) {
      const freeLanes = lanes.filter(l => l !== laneX);
      const coinLane = freeLanes[Math.floor(Math.random() * freeLanes.length)];
      collectibles.push({
        x: coinLane,
        z: zPos + (Math.random() * 80 - 40),
        type: Math.random() < 0.2 ? 'nos' : (Math.random() < 0.1 ? 'shield' : 'coin'),
        collected: false
      });
    }
  }

  // Update Game Loop
  function update(dt) {
    if (isGameOver || isPaused) return;

    const activeCar = CARS.find(c => c.id === selectedCarId) || CARS[0];
    const nosBonus = 1 + (upgrades.nos - 1) * 0.15;
    const driftBonus = activeCar.driftMultiplier * (1 + (upgrades.drift - 1) * 0.12);

    // 1. Inputs: Steering & Drifting
    let steerInput = 0;
    if (keys['KeyA'] || keys['ArrowLeft'] || player.steerDir < 0) steerInput -= 1;
    if (keys['KeyD'] || keys['ArrowRight'] || player.steerDir > 0) steerInput += 1;

    const wantsNos = (keys['KeyW'] || keys['ArrowUp'] || keys['Space'] || keys['nos_touch']) && player.nosGauge > 0;
    const wantsDrift = keys['KeyS'] || keys['ArrowDown'] || keys['ShiftLeft'] || keys['ShiftRight'] || keys['drift_touch'];

    // 2. NOS Nitro Acceleration
    if (wantsNos && player.nosGauge > 0) {
      player.isNos = true;
      player.nosGauge = Math.max(0, player.nosGauge - 28 * dt);
      const nosTopSpeed = player.maxSpeed * (1.35 * nosBonus);
      player.speed += 140 * dt;
      if (player.speed > nosTopSpeed) player.speed = nosTopSpeed;
      if (Math.random() < 0.4) playSound('nos');
    } else {
      player.isNos = false;
      // Normal acceleration / natural coast
      if (player.speed < player.maxSpeed) {
        player.speed += 50 * dt;
      } else {
        player.speed -= 40 * dt;
      }
      // Slow passive NOS recharge
      player.nosGauge = Math.min(100, player.nosGauge + 6 * dt);
    }

    if (player.speed > maxSpeedAchieved) maxSpeedAchieved = Math.round(player.speed);

    // 3. Drift Mechanics
    if (wantsDrift && Math.abs(steerInput) > 0.1 && player.speed > 60) {
      player.isDrifting = true;
      driftMultiplier = Math.min(3.5, driftMultiplier + 1.2 * dt);
      player.driftAngle += (steerInput * 0.45 - player.driftAngle) * 0.15;
      score += Math.round(80 * driftMultiplier * dt);

      // Spawn Skidmarks and Smoke
      if (Math.random() < 0.6) {
        playSound('drift');
        skidMarks.push({
          x: player.x - 0.08,
          z: 30,
          alpha: 0.8
        });
        skidMarks.push({
          x: player.x + 0.08,
          z: 30,
          alpha: 0.8
        });
      }
    } else {
      player.isDrifting = false;
      player.driftAngle *= 0.85;
      driftMultiplier = Math.max(1.0, driftMultiplier - 1.5 * dt);
    }

    // 4. Steer Position Clamping
    const turnRate = (player.isDrifting ? 1.6 : 1.1) * activeCar.handling * (player.speed / 120);
    player.x += steerInput * turnRate * dt;

    // Grass / Shoulder drag penalty
    if (Math.abs(player.x) > 0.95) {
      player.speed = Math.max(40, player.speed - 90 * dt);
      screenShake = 3;
    }
    player.x = Math.max(-1.25, Math.min(1.25, player.x));

    // 5. Dynamic Highway Road Curvature
    curveTimer -= dt;
    if (curveTimer <= 0) {
      curveTimer = 3 + Math.random() * 4;
      targetCurve = (Math.random() * 2 - 1) * 1.5;
    }
    roadCurve += (targetCurve - roadCurve) * 0.05;
    roadPosition += (player.speed * 2.5) * dt;

    // Pull car with road curve
    player.x -= roadCurve * (player.speed / 350) * dt;

    // 6. Distance & Score Increment
    const distanceDelta = (player.speed / 3600) * dt;
    distance += distanceDelta;
    score += Math.round((player.speed * (player.isNos ? 1.5 : 1.0) * driftMultiplier) * dt);

    // 7. Time Attack Mode
    if (currentMode === 'time') {
      timeRemaining -= dt;
      if (timeRemaining <= 0) {
        triggerCrash('⏱️ TIME EXPIRED!');
        return;
      }
    }

    // 8. Update Traffic Cars
    for (let i = trafficCars.length - 1; i >= 0; i--) {
      const car = trafficCars[i];
      // Relative speed towards player
      const relSpeed = player.speed - car.speed;
      car.z -= relSpeed * 2.2 * dt;

      // Check Collision with Player
      if (car.z > -20 && car.z < 45) {
        const dx = Math.abs(player.x - car.x);
        if (dx < 0.28) {
          if (player.hasShield) {
            player.hasShield = false;
            playSound('crash');
            screenShake = 12;
            trafficCars.splice(i, 1);
            showBanner('🛡️ SHIELD PROTECTED!');
            continue;
          } else {
            triggerCrash('💥 HIGHWAY CRASH!');
            return;
          }
        }
      }

      // Check Near-Miss (Passing within 0.45 horizontal distance closely)
      if (!car.passed && car.z < 0 && car.z > -40) {
        const dx = Math.abs(player.x - car.x);
        if (dx >= 0.28 && dx <= 0.48 && player.speed > 100) {
          car.passed = true;
          nearMissCount++;
          const bonus = Math.round(150 * (player.isNos ? 2 : 1));
          score += bonus;
          player.nosGauge = Math.min(100, player.nosGauge + 35);
          playSound('miss');
          showBanner(`⚡ NEAR MISS! +${bonus}`);
        }
      }

      // Recycle cars that passed far behind
      if (car.z < -100) {
        trafficCars.splice(i, 1);
        spawnTraffic(700 + Math.random() * 200);
      }
    }

    // 9. Update Collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const item = collectibles[i];
      item.z -= player.speed * 2.2 * dt;

      if (!item.collected && item.z > -15 && item.z < 40) {
        if (Math.abs(player.x - item.x) < 0.3) {
          item.collected = true;
          if (item.type === 'coin') {
            coins += 5;
            playSound('coin');
            score += 200;
          } else if (item.type === 'nos') {
            player.nosGauge = 100;
            playSound('nos');
            showBanner('🚀 FULL NITRO REFILL!');
          } else if (item.type === 'shield') {
            player.hasShield = true;
            playSound('coin');
            showBanner('🛡️ ENERGY SHIELD ACTIVE!');
          }
          collectibles.splice(i, 1);
          continue;
        }
      }

      if (item.z < -60) {
        collectibles.splice(i, 1);
      }
    }

    // 10. Update Skid Marks
    for (let i = skidMarks.length - 1; i >= 0; i--) {
      skidMarks[i].z -= player.speed * 2.2 * dt;
      skidMarks[i].alpha -= 0.6 * dt;
      if (skidMarks[i].z < -60 || skidMarks[i].alpha <= 0) {
        skidMarks.splice(i, 1);
      }
    }

    if (screenShake > 0) screenShake *= 0.85;

    updateHUD();
  }

  // Near-Miss Banner Notification
  let bannerTimer = null;
  function showBanner(text) {
    nearMissText.textContent = text;
    nearMissBanner.style.display = 'block';
    if (bannerTimer) clearTimeout(bannerTimer);
    bannerTimer = setTimeout(() => {
      nearMissBanner.style.display = 'none';
    }, 1200);
  }

  // Update HUD
  function updateHUD() {
    hudSpeed.textContent = Math.round(player.speed);
    hudNosFill.style.width = `${Math.max(0, Math.min(100, player.nosGauge))}%`;
    hudScore.textContent = score.toLocaleString();
    hudCoins.textContent = `💰 ${coins}`;
    hudDist.textContent = `🏁 ${distance.toFixed(1)} KM`;

    if (player.isDrifting && driftMultiplier > 1.2) {
      hudDriftBadge.textContent = `DRIFT x${driftMultiplier.toFixed(1)} 🔥`;
      hudDriftBadge.style.display = 'inline-block';
    } else {
      hudDriftBadge.style.display = 'none';
    }

    if (currentMode === 'time') {
      hudTimeBadge.textContent = `⏱️ ${Math.max(0, Math.ceil(timeRemaining))}s`;
      hudTimeBadge.style.display = 'inline-block';
    } else {
      hudTimeBadge.style.display = 'none';
    }

    hudShieldPill.style.display = player.hasShield ? 'inline-block' : 'none';
  }

  // Trigger Crash & Game Over
  function triggerCrash(reason) {
    if (isGameOver) return;
    isGameOver = true;
    playSound('crash');
    screenShake = 20;

    saveGameData();

    const isNewBest = score > bestScore;
    if (isNewBest) {
      bestScore = score;
      saveGameData();
    }

    goTitle.textContent = reason;
    goDist.textContent = `${distance.toFixed(1)} KM`;
    goTopSpeed.textContent = `${maxSpeedAchieved} MPH`;
    goMisses.textContent = nearMissCount;
    goCoins.textContent = `💰 ${coins}`;
    goScore.textContent = score.toLocaleString();
    goNewBest.style.display = isNewBest ? 'block' : 'none';

    if (typeof confetti === 'function' && isNewBest) {
      confetti({ particleCount: 70, spread: 60, origin: { y: 0.6 } });
    }

    setTimeout(() => {
      gameoverModal.style.display = 'flex';
    }, 600);
  }

  // 2.5D Synthwave Scene Rendering
  function render() {
    const w = canvas.width / (window.devicePixelRatio || 1);
    const h = canvas.height / (window.devicePixelRatio || 1);

    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    const horizonY = h * 0.42;

    // 1. Sky Gradient (Retro Synthwave Dark Violet to Orange)
    const skyGrad = ctx.createLinearGradient(0, 0, 0, horizonY);
    skyGrad.addColorStop(0, '#0f051d');
    skyGrad.addColorStop(0.65, '#2e1065');
    skyGrad.addColorStop(1, '#f43f5e');
    ctx.fillStyle = skyGrad;
    ctx.fillRect(0, 0, w, horizonY);

    // 2. Glowing Neon Sun on Horizon
    const sunRadius = 65;
    const sunX = w / 2 + roadCurve * 35;
    const sunGrad = ctx.createRadialGradient(sunX, horizonY - 10, 5, sunX, horizonY - 10, sunRadius);
    sunGrad.addColorStop(0, '#fef08a');
    sunGrad.addColorStop(0.4, '#facc15');
    sunGrad.addColorStop(0.8, '#f43f5e');
    sunGrad.addColorStop(1, 'rgba(244, 63, 94, 0)');

    ctx.fillStyle = sunGrad;
    ctx.beginPath();
    ctx.arc(sunX, horizonY - 10, sunRadius, 0, Math.PI * 2);
    ctx.fill();

    // Horizontal Sun Slits
    ctx.fillStyle = '#0f051d';
    for (let sl = 0; sl < 5; sl++) {
      const sy = horizonY - 24 + sl * 6;
      ctx.fillRect(sunX - sunRadius, sy, sunRadius * 2, 2.5 + sl * 0.5);
    }

    // 3. Cyber Mountains Backdrop
    ctx.fillStyle = '#1e1138';
    ctx.beginPath();
    ctx.moveTo(0, horizonY);
    ctx.lineTo(w * 0.15, horizonY - 35);
    ctx.lineTo(w * 0.35, horizonY - 12);
    ctx.lineTo(w * 0.55, horizonY - 45);
    ctx.lineTo(w * 0.75, horizonY - 18);
    ctx.lineTo(w * 0.9, horizonY - 38);
    ctx.lineTo(w, horizonY);
    ctx.closePath();
    ctx.fill();

    // 4. Ground Grid & Synthwave Road Perspective
    // Side Grid Ground
    const groundGrad = ctx.createLinearGradient(0, horizonY, 0, h);
    groundGrad.addColorStop(0, '#090d16');
    groundGrad.addColorStop(1, '#1e1b4b');
    ctx.fillStyle = groundGrad;
    ctx.fillRect(0, horizonY, w, h - horizonY);

    // Render Road Segments
    const segments = 40;
    for (let i = segments; i >= 0; i--) {
      const z1 = i * 20;
      const z2 = (i + 1) * 20;

      const p1 = project(z1, w, h, horizonY);
      const p2 = project(z2, w, h, horizonY);

      if (p1.y >= h || p2.y <= horizonY) continue;

      const isAlt = Math.floor((z1 + roadPosition) / 40) % 2 === 0;

      // Road Asphalt
      ctx.fillStyle = isAlt ? '#13112c' : '#191538';
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.w, p1.y);
      ctx.lineTo(p1.x + p1.w, p1.y);
      ctx.lineTo(p2.x + p2.w, p2.y);
      ctx.lineTo(p2.x - p2.w, p2.y);
      ctx.closePath();
      ctx.fill();

      // Neon Curbs (Cyan / Magenta)
      ctx.fillStyle = isAlt ? '#06b6d4' : '#f43f5e';
      const curbW1 = p1.w * 0.08;
      const curbW2 = p2.w * 0.08;

      // Left Curb
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.w - curbW1, p1.y);
      ctx.lineTo(p1.x - p1.w, p1.y);
      ctx.lineTo(p2.x - p2.w, p2.y);
      ctx.lineTo(p2.x - p2.w - curbW2, p2.y);
      ctx.closePath();
      ctx.fill();

      // Right Curb
      ctx.beginPath();
      ctx.moveTo(p1.x + p1.w, p1.y);
      ctx.lineTo(p1.x + p1.w + curbW1, p1.y);
      ctx.lineTo(p2.x + p2.w + curbW2, p2.y);
      ctx.lineTo(p2.x + p2.w, p2.y);
      ctx.closePath();
      ctx.fill();

      // Dashed Lane Center Line
      if (isAlt) {
        ctx.fillStyle = '#facc15';
        const lineW1 = p1.w * 0.03;
        const lineW2 = p2.w * 0.03;
        ctx.beginPath();
        ctx.moveTo(p1.x - lineW1, p1.y);
        ctx.lineTo(p1.x + lineW1, p1.y);
        ctx.lineTo(p2.x + lineW2, p2.y);
        ctx.lineTo(p2.x - lineW2, p2.y);
        ctx.closePath();
        ctx.fill();
      }
    }

    // 5. Draw Skid Marks
    skidMarks.forEach(s => {
      const p = project(s.z, w, h, horizonY);
      if (p.y > horizonY && p.y < h) {
        const sx = p.x + (s.x * p.w);
        ctx.save();
        ctx.fillStyle = `rgba(15, 23, 42, ${s.alpha})`;
        ctx.fillRect(sx - 4, p.y - 2, 8, 4);
        ctx.restore();
      }
    });

    // 6. Draw Collectibles (Coins & Nitro Orbs)
    collectibles.forEach(c => {
      if (c.z > 0 && c.z < 650) {
        const p = project(c.z, w, h, horizonY);
        const cx = p.x + (c.x * p.w);
        const size = Math.max(6, 24 * p.scale);

        ctx.save();
        if (c.type === 'coin') {
          ctx.fillStyle = '#facc15';
          ctx.strokeStyle = '#0f172a';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(cx, p.y - size, size, 0, Math.PI * 2);
          ctx.fill();
          ctx.stroke();
          ctx.fillStyle = '#713f12';
          ctx.font = `bold ${Math.round(size * 1.1)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('$', cx, p.y - size);
        } else if (c.type === 'nos') {
          ctx.fillStyle = '#06b6d4';
          ctx.shadowColor = '#06b6d4';
          ctx.shadowBlur = 10;
          ctx.beginPath();
          ctx.arc(cx, p.y - size, size * 1.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(size * 0.9)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('⚡', cx, p.y - size);
        } else if (c.type === 'shield') {
          ctx.fillStyle = '#38bdf8';
          ctx.beginPath();
          ctx.arc(cx, p.y - size, size * 1.1, 0, Math.PI * 2);
          ctx.fill();
          ctx.fillStyle = '#ffffff';
          ctx.font = `bold ${Math.round(size * 0.9)}px sans-serif`;
          ctx.textAlign = 'center';
          ctx.textBaseline = 'middle';
          ctx.fillText('🛡️', cx, p.y - size);
        }
        ctx.restore();
      }
    });

    // 7. Draw Traffic Vehicles (Sorted by distance)
    const sortedTraffic = [...trafficCars].sort((a, b) => b.z - a.z);
    sortedTraffic.forEach(car => {
      if (car.z > 0 && car.z < 650) {
        const p = project(car.z, w, h, horizonY);
        const cx = p.x + (car.x * p.w);
        const carW = car.type.width * p.scale;
        const carH = (car.type.length * 0.55) * p.scale;

        drawTrafficCar(cx, p.y, carW, carH, car.type);
      }
    });

    // 8. Draw Player Car (Bottom Center)
    const playerScreenY = h * 0.82;
    const playerScreenX = (w / 2) + (player.x * (w * 0.38));
    drawPlayerCar(playerScreenX, playerScreenY);

    // 9. NOS Speed Warp Lines Effect
    if (player.isNos) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.4)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 12; i++) {
        const lx = Math.random() * w;
        const ly = horizonY + Math.random() * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx + (lx - w / 2) * 0.35, ly + 40);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Perspective Projection Helper
  function project(z, w, h, horizonY) {
    const scale = 160 / (z + 160);
    const y = horizonY + (h - horizonY) * scale;
    const curveOffset = roadCurve * (1 - scale) * (w * 0.45);
    const x = (w / 2) + curveOffset;
    const roadWidth = (w * 0.42) * scale;
    return { x, y, w: roadWidth, scale };
  }

  // Draw Player Car
  function drawPlayerCar(x, y) {
    const activeCar = CARS.find(c => c.id === selectedCarId) || CARS[0];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.driftAngle * 0.85);

    // Neon Underglow
    ctx.shadowColor = selectedUnderglow;
    ctx.shadowBlur = 18;
    ctx.fillStyle = selectedUnderglow;
    ctx.fillRect(-35, -15, 70, 32);
    ctx.shadowBlur = 0;

    // Rear Wheels & Treads
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-38, -12, 10, 26);
    ctx.fillRect(28, -12, 10, 26);

    // Main Body Chassis
    ctx.fillStyle = activeCar.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.roundRect(-32, -18, 64, 38, 8);
    ctx.fill();
    ctx.stroke();

    // Cabin / Windshield
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-22, -14, 44, 20, 5);
    ctx.fill();

    // Rear Windshield Glass
    ctx.fillStyle = '#38bdf8';
    ctx.fillRect(-18, -10, 36, 12);

    // Tail Lights (Red Glow)
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 8;
    ctx.fillRect(-28, 14, 16, 5);
    ctx.fillRect(12, 14, 16, 5);
    ctx.shadowBlur = 0;

    // Spoiler Wing
    ctx.fillStyle = activeCar.roofColor;
    ctx.fillRect(-32, 18, 64, 5);

    // NOS Nitro Flame Exhaust
    if (player.isNos) {
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.moveTo(-16, 22);
      ctx.lineTo(-12, 38 + Math.random() * 10);
      ctx.lineTo(-8, 22);
      ctx.fill();

      ctx.beginPath();
      ctx.moveTo(8, 22);
      ctx.lineTo(12, 38 + Math.random() * 10);
      ctx.lineTo(16, 22);
      ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Shield Dome Bubble
    if (player.hasShield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 48, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Traffic Car
  function drawTrafficCar(x, y, w, h, type) {
    ctx.save();
    ctx.translate(x, y);

    // Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
    ctx.fillRect(-w / 2, -h / 2 + 5, w, h);

    // Chassis
    ctx.fillStyle = type.color;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = Math.max(1.5, 2.5 * (w / 60));
    ctx.beginPath();
    ctx.roundRect(-w / 2, -h, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Rear Windshield
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-w * 0.35, -h * 0.85, w * 0.7, h * 0.35);

    // Tail Lights
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(-w * 0.45, -h * 0.15, w * 0.3, h * 0.12);
    ctx.fillRect(w * 0.15, -h * 0.15, w * 0.3, h * 0.12);

    // Police Lights Siren (if Police car)
    if (type.isPolice) {
      const isRed = Math.floor(Date.now() / 150) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 8;
      ctx.fillRect(-w * 0.25, -h * 0.95, w * 0.5, h * 0.15);
      ctx.shadowBlur = 0;
    }

    ctx.restore();
  }

  // Animation Loop
  let lastTime = performance.now();
  function gameLoop(time) {
    const dt = Math.min((time - lastTime) / 1000, 0.1);
    lastTime = time;

    update(dt);
    render();

    requestAnimationFrame(gameLoop);
  }

  // Resize Handler
  function handleResize() {
    const rect = wrapper.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    const w = rect.width;
    const h = rect.height;

    canvas.width = w * dpr;
    canvas.height = h * dpr;
  }

  // Garage UI Management
  function openGarage() {
    isPaused = true;
    garageCoins.textContent = `💰 ${coins} CREDITS`;

    // Render Car Cards
    CARS.forEach(car => {
      const btn = document.getElementById(`btn-car-${car.id}`);
      const isUnlocked = unlockedCars.includes(car.id);
      const isSelected = selectedCarId === car.id;

      if (isSelected) {
        btn.textContent = 'SELECTED';
        btn.className = 'btn-select-car selected';
      } else if (isUnlocked) {
        btn.textContent = 'SELECT';
        btn.className = 'btn-select-car';
      } else {
        btn.textContent = `UNLOCK 💰${car.price}`;
        btn.className = 'btn-select-car';
      }

      btn.onclick = () => {
        if (isSelected) return;
        if (isUnlocked) {
          selectedCarId = car.id;
          saveGameData();
          openGarage();
        } else if (coins >= car.price) {
          coins -= car.price;
          unlockedCars.push(car.id);
          selectedCarId = car.id;
          playSound('coin');
          saveGameData();
          openGarage();
        }
      };
    });

    // Tuning Levels
    document.getElementById('tune-lvl-speed').textContent = `LVL ${upgrades.speed}/5`;
    document.getElementById('tune-lvl-nos').textContent = `LVL ${upgrades.nos}/5`;
    document.getElementById('tune-lvl-drift').textContent = `LVL ${upgrades.drift}/5`;

    const btnSpeed = document.getElementById('btn-tune-speed');
    const btnNos = document.getElementById('btn-tune-nos');
    const btnDrift = document.getElementById('btn-tune-drift');

    btnSpeed.textContent = upgrades.speed < 5 ? `UPGRADE 💰${upgrades.speed * 80}` : 'MAX';
    btnNos.textContent = upgrades.nos < 5 ? `UPGRADE 💰${upgrades.nos * 100}` : 'MAX';
    btnDrift.textContent = upgrades.drift < 5 ? `UPGRADE 💰${upgrades.drift * 90}` : 'MAX';

    btnSpeed.onclick = () => {
      const cost = upgrades.speed * 80;
      if (upgrades.speed < 5 && coins >= cost) {
        coins -= cost;
        upgrades.speed++;
        playSound('coin');
        saveGameData();
        openGarage();
      }
    };

    btnNos.onclick = () => {
      const cost = upgrades.nos * 100;
      if (upgrades.nos < 5 && coins >= cost) {
        coins -= cost;
        upgrades.nos++;
        playSound('coin');
        saveGameData();
        openGarage();
      }
    };

    btnDrift.onclick = () => {
      const cost = upgrades.drift * 90;
      if (upgrades.drift < 5 && coins >= cost) {
        coins -= cost;
        upgrades.drift++;
        playSound('coin');
        saveGameData();
        openGarage();
      }
    };

    // Underglow Colors
    document.querySelectorAll('.neon-color-pill').forEach(pill => {
      pill.classList.toggle('active', pill.dataset.color === selectedUnderglow);
      pill.onclick = () => {
        selectedUnderglow = pill.dataset.color;
        saveGameData();
        openGarage();
      };
    });

    garageModal.style.display = 'flex';
  }

  function closeGarage() {
    garageModal.style.display = 'none';
    isPaused = false;
    startRun();
  }

  // Keyboard Event Listeners
  window.addEventListener('keydown', (e) => {
    initAudio();
    keys[e.code] = true;
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Space'].includes(e.code)) {
      e.preventDefault();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  // Touch Virtual Buttons
  btnSteerLeft.addEventListener('touchstart', (e) => { e.preventDefault(); player.steerDir = -1; });
  btnSteerLeft.addEventListener('touchend', (e) => { e.preventDefault(); player.steerDir = 0; });
  btnSteerRight.addEventListener('touchstart', (e) => { e.preventDefault(); player.steerDir = 1; });
  btnSteerRight.addEventListener('touchend', (e) => { e.preventDefault(); player.steerDir = 0; });

  btnTouchDrift.addEventListener('touchstart', (e) => { e.preventDefault(); keys['drift_touch'] = true; });
  btnTouchDrift.addEventListener('touchend', (e) => { e.preventDefault(); keys['drift_touch'] = false; });
  btnTouchNos.addEventListener('touchstart', (e) => { e.preventDefault(); keys['nos_touch'] = true; });
  btnTouchNos.addEventListener('touchend', (e) => { e.preventDefault(); keys['nos_touch'] = false; });

  // Mode Selection
  modePills.forEach(pill => {
    pill.addEventListener('click', () => {
      modePills.forEach(p => p.classList.remove('active'));
      pill.classList.add('active');
      currentMode = pill.dataset.mode;
      startRun();
    });
  });

  // Buttons & Modals
  btnGarage.addEventListener('click', openGarage);
  btnOpenGarage.addEventListener('click', openGarage);
  garageCloseBtn.addEventListener('click', closeGarage);
  garageDriveBtn.addEventListener('click', closeGarage);
  btnRestart.addEventListener('click', startRun);

  btnFullscreen.addEventListener('click', () => {
    document.body.classList.toggle('is-fullscreen');
    setTimeout(handleResize, 100);
  });

  soundToggleBtn.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    soundToggleBtn.textContent = soundEnabled ? '🔊' : '🔇';
  });

  window.addEventListener('resize', handleResize);

  // Initialize
  loadSavedData();
  handleResize();
  startRun();
  requestAnimationFrame(gameLoop);

})();
