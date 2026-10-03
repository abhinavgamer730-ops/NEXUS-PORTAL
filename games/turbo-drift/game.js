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
  const btnTouchGas = document.getElementById('btn-touch-gas');
  const btnTouchBrake = document.getElementById('btn-touch-brake');
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
    player.steerVel = 0;
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

  // Spawn Traffic Ahead (3 Wide Highway Lanes)
  function spawnTraffic(zPos) {
    const typeIdx = Math.floor(Math.random() * (currentMode === 'police' ? 5 : 4));
    const type = TRAFFIC_TYPES[typeIdx];

    // 3 Generous Lanes across wide road
    const lanes = [-0.66, 0, 0.66];
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

    // 1. Inputs: Steering, Gas, Brake, NOS
    let steerInput = 0;
    if (keys['KeyA'] || keys['ArrowLeft'] || player.steerDir < 0) steerInput -= 1;
    if (keys['KeyD'] || keys['ArrowRight'] || player.steerDir > 0) steerInput += 1;

    const wantsGas = keys['KeyW'] || keys['ArrowUp'] || keys['gas_touch'];
    const wantsBrake = keys['KeyS'] || keys['ArrowDown'] || keys['brake_touch'];
    const wantsNos = (keys['Space'] || keys['nos_touch']) && player.nosGauge > 0;

    // 2. Full Responsive Manual Speed Control
    if (wantsNos && player.nosGauge > 0) {
      player.isNos = true;
      player.nosGauge = Math.max(0, player.nosGauge - 32 * dt);
      const nosTopSpeed = player.maxSpeed * (1.35 * nosBonus);
      player.speed = Math.min(nosTopSpeed, player.speed + 180 * dt);
      if (Math.random() < 0.35) playSound('nos');
    } else if (wantsGas) {
      player.isNos = false;
      player.speed = Math.min(player.maxSpeed, player.speed + 120 * dt);
      player.nosGauge = Math.min(100, player.nosGauge + 8 * dt);
    } else if (wantsBrake) {
      player.isNos = false;
      player.speed = Math.max(25, player.speed - 160 * dt);
      player.nosGauge = Math.min(100, player.nosGauge + 15 * dt);
    } else {
      player.isNos = false;
      // Gentle coasting settling into 100 MPH cruising speed
      if (player.speed < 100) {
        player.speed += 50 * dt;
      } else if (player.speed > 100) {
        player.speed -= 35 * dt;
      }
      player.nosGauge = Math.min(100, player.nosGauge + 8 * dt);
    }

    if (player.speed > maxSpeedAchieved) maxSpeedAchieved = Math.round(player.speed);

    // 3. Auto-Drift & Score Multipliers on Steer
    if (Math.abs(steerInput) > 0.1 && player.speed > 60) {
      player.isDrifting = true;
      driftMultiplier = Math.min(3.5, driftMultiplier + 1.2 * dt);
      player.driftAngle += (steerInput * 0.35 - player.driftAngle) * 0.16;
      score += Math.round(90 * driftMultiplier * dt);

      // Spawn Skidmarks and Smoke
      if (Math.random() < 0.5) {
        playSound('drift');
        skidMarks.push({ x: player.x - 0.08, z: 30, alpha: 0.8 });
        skidMarks.push({ x: player.x + 0.08, z: 30, alpha: 0.8 });
      }
    } else {
      player.isDrifting = false;
      player.driftAngle *= 0.82;
      driftMultiplier = Math.max(1.0, driftMultiplier - 1.5 * dt);
    }

    // 4. Low-Sensitivity, Buttery-Smooth Controlled Steering (Zero Twitchiness)
    const baseTurnSpeed = 0.72 * activeCar.handling;
    const targetSteerSpeed = steerInput * baseTurnSpeed;
    // Smooth velocity interpolation
    player.steerVel += (targetSteerSpeed - player.steerVel) * Math.min(1.0, 7.0 * dt);
    player.x += player.steerVel * dt;
    player.x = Math.max(-0.95, Math.min(0.95, player.x));

    // 5. Straight Rock-Solid Highway (Zero sliding/curve distortion)
    roadPosition += (player.speed * 2.5) * dt;

    // 6. Distance & Score
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
      const relSpeed = player.speed - car.speed;
      car.z -= relSpeed * 2.2 * dt;

      // Check Collision (Spacious safety buffer between lanes)
      if (car.z > -20 && car.z < 45) {
        const dx = Math.abs(player.x - car.x);
        if (dx < 0.22) {
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

      // Check Near-Miss (Generous reward for close pass without crashing)
      if (!car.passed && car.z < 0 && car.z > -40) {
        const dx = Math.abs(player.x - car.x);
        if (dx >= 0.22 && dx <= 0.44 && player.speed > 80) {
          car.passed = true;
          nearMissCount++;
          const bonus = Math.round(150 * (player.isNos ? 2 : 1));
          score += bonus;
          player.nosGauge = Math.min(100, player.nosGauge + 40);
          playSound('miss');
          showBanner(`⚡ NEAR MISS! +${bonus}`);
        }
      }

      if (car.z < -100) {
        trafficCars.splice(i, 1);
        spawnTraffic(700 + Math.random() * 200);
      }
    }

    // 9. Update Magnetic Collectibles
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const item = collectibles[i];
      item.z -= player.speed * 2.2 * dt;

      // Magnetic Attraction
      const dist = Math.hypot((player.x - item.x) * 200, item.z);
      if (dist < 180 && item.z > -20) {
        const ang = Math.atan2(0 - item.z, (player.x - item.x) * 200);
        item.x += (player.x - item.x) * 6 * dt;
      }

      if (!item.collected && item.z > -15 && item.z < 40) {
        if (Math.abs(player.x - item.x) < 0.35) {
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

    // 10. Skid Marks
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
    const sunX = w / 2;
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
      ctx.fillStyle = isAlt ? '#110e28' : '#181438';
      ctx.beginPath();
      ctx.moveTo(p1.x - p1.w, p1.y);
      ctx.lineTo(p1.x + p1.w, p1.y);
      ctx.lineTo(p2.x + p2.w, p2.y);
      ctx.lineTo(p2.x - p2.w, p2.y);
      ctx.closePath();
      ctx.fill();

      // Neon Curbs (Cyan / Magenta)
      ctx.fillStyle = isAlt ? '#06b6d4' : '#f43f5e';
      const curbW1 = p1.w * 0.07;
      const curbW2 = p2.w * 0.07;

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

      // Two Dashed Highway Lane Dividers (Left Divider & Right Divider for 3 Wide Lanes)
      if (isAlt) {
        ctx.fillStyle = '#facc15';
        const lineW1 = p1.w * 0.02;
        const lineW2 = p2.w * 0.02;

        // Left Lane Line (at -33% road width)
        const l1 = -0.33 * p1.w;
        const l2 = -0.33 * p2.w;
        ctx.beginPath();
        ctx.moveTo(p1.x + l1 - lineW1, p1.y);
        ctx.lineTo(p1.x + l1 + lineW1, p1.y);
        ctx.lineTo(p2.x + l2 + lineW2, p2.y);
        ctx.lineTo(p2.x + l2 - lineW2, p2.y);
        ctx.closePath();
        ctx.fill();

        // Right Lane Line (at +33% road width)
        const r1 = 0.33 * p1.w;
        const r2 = 0.33 * p2.w;
        ctx.beginPath();
        ctx.moveTo(p1.x + r1 - lineW1, p1.y);
        ctx.lineTo(p1.x + r1 + lineW1, p1.y);
        ctx.lineTo(p2.x + r2 + lineW2, p2.y);
        ctx.lineTo(p2.x + r2 - lineW2, p2.y);
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
        ctx.fillRect(sx - 5, p.y - 3, 10, 5);
        ctx.restore();
      }
    });

    // 6. Draw Collectibles (Coins & Nitro Orbs)
    collectibles.forEach(c => {
      if (c.z > 0 && c.z < 650) {
        const p = project(c.z, w, h, horizonY);
        const cx = p.x + (c.x * p.w * 0.72);
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

    // 7. Draw Traffic Vehicles (Sorted by distance on wide highway)
    const sortedTraffic = [...trafficCars].sort((a, b) => b.z - a.z);
    sortedTraffic.forEach(car => {
      if (car.z > 0 && car.z < 650) {
        const p = project(car.z, w, h, horizonY);
        const cx = p.x + (car.x * p.w * 0.72);
        const carW = car.type.width * p.scale;
        const carH = (car.type.length * 0.55) * p.scale;

        drawTrafficCar(cx, p.y, carW, carH, car.type);
      }
    });

    // 8. Draw Player Car (Bottom Center on Wide Highway)
    const pPlayer = project(24, w, h, horizonY);
    const playerScreenY = pPlayer.y;
    const playerScreenX = pPlayer.x + (player.x * pPlayer.w * 0.72);
    drawPlayerCar(playerScreenX, playerScreenY);

    // 9. NOS Speed Warp Lines Effect
    if (player.isNos) {
      ctx.strokeStyle = 'rgba(6, 182, 212, 0.45)';
      ctx.lineWidth = 2;
      for (let i = 0; i < 14; i++) {
        const lx = Math.random() * w;
        const ly = horizonY + Math.random() * (h - horizonY);
        ctx.beginPath();
        ctx.moveTo(lx, ly);
        ctx.lineTo(lx, ly + 50);
        ctx.stroke();
      }
    }

    ctx.restore();
  }

  // Perspective Projection Helper (Super Wide & Spacious Highway)
  function project(z, w, h, horizonY) {
    const scale = 175 / (z + 175);
    const y = horizonY + (h - horizonY) * scale;
    const x = (w / 2);
    // Highway fills ~90% of screen width at base for a massive road!
    const roadWidth = (w * 0.92) * scale;
    return { x, y, w: roadWidth, scale };
  }

  // Draw Realistic Player Sports Car
  function drawPlayerCar(x, y) {
    const activeCar = CARS.find(c => c.id === selectedCarId) || CARS[0];
    ctx.save();
    ctx.translate(x, y);
    ctx.rotate(player.driftAngle * 0.82);

    // 1. Neon Underglow
    ctx.shadowColor = selectedUnderglow;
    ctx.shadowBlur = 22;
    ctx.fillStyle = selectedUnderglow;
    ctx.fillRect(-38, -16, 76, 36);
    ctx.shadowBlur = 0;

    // 2. Wide Racing Tires with Alloy Rims & Calipers
    // Left Rear Tire
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(-42, -14, 12, 30, 3);
    ctx.fill();
    ctx.fillStyle = '#64748b'; // Rim
    ctx.fillRect(-40, -10, 8, 22);
    ctx.fillStyle = '#ef4444'; // Brake Caliper
    ctx.fillRect(-39, -4, 4, 8);

    // Right Rear Tire
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.roundRect(30, -14, 12, 30, 3);
    ctx.fill();
    ctx.fillStyle = '#64748b'; // Rim
    ctx.fillRect(32, -10, 8, 22);
    ctx.fillStyle = '#ef4444'; // Brake Caliper
    ctx.fillRect(35, -4, 4, 8);

    // 3. Widebody Aerodynamic Chassis with Metallic Shading
    const carGrad = ctx.createLinearGradient(-35, 0, 35, 0);
    carGrad.addColorStop(0, activeCar.roofColor);
    carGrad.addColorStop(0.3, activeCar.color);
    carGrad.addColorStop(0.7, activeCar.color);
    carGrad.addColorStop(1, activeCar.roofColor);

    ctx.fillStyle = carGrad;
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.roundRect(-36, -20, 72, 42, 9);
    ctx.fill();
    ctx.stroke();

    // 4. Aerodynamic Cabin & Roof
    const roofGrad = ctx.createLinearGradient(0, -18, 0, 5);
    roofGrad.addColorStop(0, '#090d16');
    roofGrad.addColorStop(1, '#1e293b');
    ctx.fillStyle = roofGrad;
    ctx.beginPath();
    ctx.roundRect(-24, -16, 48, 22, 6);
    ctx.fill();
    ctx.stroke();

    // 5. Rear Tinted Windshield Glass with Specular Reflection
    const glassGrad = ctx.createLinearGradient(-18, -12, 18, 0);
    glassGrad.addColorStop(0, '#0284c7');
    glassGrad.addColorStop(0.5, '#38bdf8');
    glassGrad.addColorStop(1, '#0f172a');
    ctx.fillStyle = glassGrad;
    ctx.fillRect(-20, -12, 40, 14);

    // Glass Reflection Beam
    ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
    ctx.beginPath();
    ctx.moveTo(-16, -12);
    ctx.lineTo(-6, -12);
    ctx.lineTo(-12, 2);
    ctx.lineTo(-20, 2);
    ctx.closePath();
    ctx.fill();

    // 6. Modern Full-Width LED Tail Lightbar
    ctx.fillStyle = '#ef4444';
    ctx.shadowColor = '#ef4444';
    ctx.shadowBlur = 10;
    ctx.fillRect(-32, 16, 64, 4);
    // Reverse/Signal accents
    ctx.fillStyle = '#fef08a';
    ctx.fillRect(-32, 18, 8, 2);
    ctx.fillRect(24, 18, 8, 2);
    ctx.shadowBlur = 0;

    // 7. Dual Chrome Exhaust Tips & Carbon Diffuser
    ctx.fillStyle = '#0f172a'; // Diffuser
    ctx.fillRect(-28, 20, 56, 4);
    ctx.fillStyle = '#94a3b8'; // Left Chrome Pipe
    ctx.beginPath(); ctx.arc(-16, 21, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(-16, 21, 2, 0, Math.PI * 2); ctx.fill();

    ctx.fillStyle = '#94a3b8'; // Right Chrome Pipe
    ctx.beginPath(); ctx.arc(16, 21, 3.5, 0, Math.PI * 2); ctx.fill();
    ctx.fillStyle = '#0f172a'; ctx.beginPath(); ctx.arc(16, 21, 2, 0, Math.PI * 2); ctx.fill();

    // 8. High-Downforce Carbon Rear Spoiler Wing with Struts
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(-18, 14, 4, 8); // Left Strut
    ctx.fillRect(14, 14, 4, 8);  // Right Strut

    ctx.fillStyle = '#1e293b';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.roundRect(-36, 19, 72, 5, 2);
    ctx.fill();
    ctx.stroke();

    // 9. NOS Nitro Flame Exhaust
    if (player.isNos) {
      ctx.fillStyle = '#06b6d4';
      ctx.shadowColor = '#06b6d4';
      ctx.shadowBlur = 14;
      // Left Flame
      ctx.beginPath();
      ctx.moveTo(-19, 23);
      ctx.lineTo(-16, 42 + Math.random() * 12);
      ctx.lineTo(-13, 23);
      ctx.fill();
      // Right Flame
      ctx.beginPath();
      ctx.moveTo(13, 23);
      ctx.lineTo(16, 42 + Math.random() * 12);
      ctx.lineTo(19, 23);
      ctx.fill();

      // Yellow Core
      ctx.fillStyle = '#fef08a';
      ctx.beginPath(); ctx.moveTo(-18, 23); ctx.lineTo(-16, 34); ctx.lineTo(-14, 23); ctx.fill();
      ctx.beginPath(); ctx.moveTo(14, 23); ctx.lineTo(16, 34); ctx.lineTo(18, 23); ctx.fill();
      ctx.shadowBlur = 0;
    }

    // Shield Dome Bubble
    if (player.hasShield) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.setLineDash([6, 4]);
      ctx.beginPath();
      ctx.arc(0, 0, 52, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.restore();
  }

  // Draw Detailed Realistic Traffic Vehicles
  function drawTrafficCar(x, y, w, h, type) {
    ctx.save();
    ctx.translate(x, y);

    // Ground Shadow
    ctx.fillStyle = 'rgba(0, 0, 0, 0.45)';
    ctx.beginPath();
    ctx.roundRect(-w / 2 - 2, -h / 2, w + 4, h + 4, 6);
    ctx.fill();

    if (type.name === 'SemiTruck') {
      // ===== HEAVY 18-WHEELER FREIGHT TRUCK =====
      // Container Body
      ctx.fillStyle = '#1e3a8a';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h, w, h * 0.95, 4);
      ctx.fill();
      ctx.stroke();

      // Corrugated Cargo Container Ribs
      ctx.strokeStyle = '#3b82f6';
      ctx.lineWidth = 1.5;
      for (let rib = -h + 10; rib < -10; rib += 12) {
        ctx.beginPath();
        ctx.moveTo(-w / 2 + 4, rib);
        ctx.lineTo(w / 2 - 4, rib);
        ctx.stroke();
      }

      // Hazard Warning Red/White Tape
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-w / 2 + 2, -8, w - 4, 5);
      ctx.fillStyle = '#ffffff';
      for (let wt = -w / 2 + 4; wt < w / 2 - 8; wt += 12) {
        ctx.fillRect(wt, -8, 6, 5);
      }

      // Heavy Taillights & Top Marker Lights
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-w / 2 + 4, -3, 10, 4);
      ctx.fillRect(w / 2 - 14, -3, 10, 4);
      // Top Amber Clearance Lights
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-w / 2 + 4, -h + 2, 4, 3);
      ctx.fillRect(-2, -h + 2, 4, 3);
      ctx.fillRect(w / 2 - 8, -h + 2, 4, 3);

    } else if (type.name === 'Taxi') {
      // ===== NYC YELLOW TAXI =====
      ctx.fillStyle = '#eab308';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Checkered Roof Stripe
      ctx.fillStyle = '#0f172a';
      for (let chk = -w * 0.35; chk < w * 0.35; chk += 10) {
        ctx.fillRect(chk, -h * 0.6, 5, 4);
      }

      // Lighted TAXI Roof Box Sign
      ctx.fillStyle = '#fef08a';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.fillRect(-w * 0.22, -h * 0.98, w * 0.44, 7);
      ctx.strokeRect(-w * 0.22, -h * 0.98, w * 0.44, 7);
      ctx.fillStyle = '#0f172a';
      ctx.font = `bold ${Math.max(6, Math.round(w * 0.12))}px sans-serif`;
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('TAXI', 0, -h * 0.98 + 3.5);

      // Rear Windshield & Taillights
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w * 0.35, -h * 0.8, w * 0.7, h * 0.32);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-w * 0.44, -h * 0.14, w * 0.28, h * 0.12);
      ctx.fillRect(w * 0.16, -h * 0.14, w * 0.28, h * 0.12);

    } else if (type.name === 'Police') {
      // ===== POLICE INTERCEPTOR CRUISER =====
      // Black Body with White Roof
      ctx.fillStyle = '#0f172a';
      ctx.strokeStyle = '#334155';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // White Roof Panel
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(-w * 0.35, -h * 0.75, w * 0.7, h * 0.4);

      // Flashing Police Strobe Lightbar
      const isRed = Math.floor(Date.now() / 140) % 2 === 0;
      ctx.fillStyle = isRed ? '#ef4444' : '#3b82f6';
      ctx.shadowColor = ctx.fillStyle;
      ctx.shadowBlur = 10;
      ctx.fillRect(-w * 0.28, -h * 0.98, w * 0.28, 7);
      ctx.fillStyle = isRed ? '#3b82f6' : '#ef4444';
      ctx.shadowColor = ctx.fillStyle;
      ctx.fillRect(0, -h * 0.98, w * 0.28, 7);
      ctx.shadowBlur = 0;

      // Rear Windshield & Red Police Taillights
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w * 0.32, -h * 0.78, w * 0.64, h * 0.3);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-w * 0.45, -h * 0.14, w * 0.28, h * 0.12);
      ctx.fillRect(w * 0.17, -h * 0.14, w * 0.28, h * 0.12);

    } else if (type.name === 'SportsCar') {
      // ===== EXOTIC SUPERCAR =====
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h, w, h, 8);
      ctx.fill();
      ctx.stroke();

      // Engine Louver Slits
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-w * 0.3, -h * 0.8, w * 0.6, h * 0.4);
      ctx.strokeStyle = '#475569';
      for (let sl = -h * 0.75; sl < -h * 0.45; sl += 6) {
        ctx.beginPath(); ctx.moveTo(-w * 0.25, sl); ctx.lineTo(w * 0.25, sl); ctx.stroke();
      }

      // Aggressive LED Tail-strip
      ctx.fillStyle = '#f87171';
      ctx.fillRect(-w * 0.42, -h * 0.14, w * 0.84, 4);
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-w * 0.44, -h * 0.18, w * 0.25, 6);
      ctx.fillRect(w * 0.19, -h * 0.18, w * 0.25, 6);

    } else {
      // ===== STANDARD MODERN SEDAN =====
      ctx.fillStyle = type.color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(-w / 2, -h, w, h, 6);
      ctx.fill();
      ctx.stroke();

      // Rear Windshield Glass
      ctx.fillStyle = '#1e293b';
      ctx.fillRect(-w * 0.35, -h * 0.8, w * 0.7, h * 0.32);

      // Tail Lights with Amber Turn Accents
      ctx.fillStyle = '#ef4444';
      ctx.fillRect(-w * 0.45, -h * 0.15, w * 0.28, h * 0.12);
      ctx.fillRect(w * 0.17, -h * 0.15, w * 0.28, h * 0.12);
      ctx.fillStyle = '#f59e0b';
      ctx.fillRect(-w * 0.45, -h * 0.15, 4, h * 0.12);
      ctx.fillRect(w * 0.45 - 4, -h * 0.15, 4, h * 0.12);
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

  // Canvas Pointer & Screen Tap Controls (Low Sensitivity Smooth Drag / Tap)
  let isPointerDown = false;
  let lastTapTime = 0;

  function handlePointer(e) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0) {
      const relX = (e.clientX - rect.left) / rect.width;
      // Gentle, low-sensitivity tracking
      const targetX = (relX * 2 - 1) * 0.92;
      player.x += (targetX - player.x) * 0.07;
      player.x = Math.max(-0.95, Math.min(0.95, player.x));
    }
  }

  canvas.addEventListener('pointerdown', (e) => {
    initAudio();
    isPointerDown = true;
    const now = performance.now();
    if (now - lastTapTime < 300) {
      // Double tap to activate NOS!
      keys['nos_touch'] = true;
      setTimeout(() => { keys['nos_touch'] = false; }, 400);
    }
    lastTapTime = now;
    handlePointer(e);
  });

  window.addEventListener('pointermove', (e) => {
    if (isPointerDown) handlePointer(e);
  });

  window.addEventListener('pointerup', () => {
    isPointerDown = false;
  });

  window.addEventListener('pointercancel', () => {
    isPointerDown = false;
  });

  // Touch Virtual Buttons
  btnSteerLeft.addEventListener('touchstart', (e) => { e.preventDefault(); player.steerDir = -1; });
  btnSteerLeft.addEventListener('touchend', (e) => { e.preventDefault(); player.steerDir = 0; });
  btnSteerRight.addEventListener('touchstart', (e) => { e.preventDefault(); player.steerDir = 1; });
  btnSteerRight.addEventListener('touchend', (e) => { e.preventDefault(); player.steerDir = 0; });

  btnTouchBrake.addEventListener('touchstart', (e) => { e.preventDefault(); keys['brake_touch'] = true; });
  btnTouchBrake.addEventListener('touchend', (e) => { e.preventDefault(); keys['brake_touch'] = false; });
  btnTouchGas.addEventListener('touchstart', (e) => { e.preventDefault(); keys['gas_touch'] = true; });
  btnTouchGas.addEventListener('touchend', (e) => { e.preventDefault(); keys['gas_touch'] = false; });
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

  // Cross-Browser True Fullscreen Toggle
  function toggleFullScreen() {
    const elem = document.documentElement;
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement || document.mozFullScreenElement || document.msFullscreenElement);

    if (!isFs) {
      if (elem.requestFullscreen) {
        elem.requestFullscreen().catch(() => {});
      } else if (elem.webkitRequestFullscreen) {
        elem.webkitRequestFullscreen();
      } else if (elem.mozRequestFullScreen) {
        elem.mozRequestFullScreen();
      } else if (elem.msRequestFullscreen) {
        elem.msRequestFullscreen();
      }
      document.body.classList.add('is-fullscreen');
      btnFullscreen.textContent = '✕ EXIT';
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen().catch(() => {});
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.mozCancelFullScreen) {
        document.mozCancelFullScreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
      document.body.classList.remove('is-fullscreen');
      btnFullscreen.textContent = '⛶ FULLSCREEN';
    }
    setTimeout(handleResize, 150);
  }

  btnFullscreen.addEventListener('click', toggleFullScreen);

  document.addEventListener('fullscreenchange', () => {
    const isFs = !!(document.fullscreenElement || document.webkitFullscreenElement);
    document.body.classList.toggle('is-fullscreen', isFs);
    btnFullscreen.textContent = isFs ? '✕ EXIT' : '⛶ FULLSCREEN';
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
