/**
 * Micro Tank Battle 2.5D Game Engine
 * Features: Multi-Wall Ricochet Bullet Physics, 10 Procedural/Handcrafted Mazes,
 * Smart AI Bot with Bank-Shot Raycasting, 2-Player Local Duel, 3-Tank Chaos,
 * Power-up Crates (Laser, Missile, Mines, Shotgun, Shield), and Web Audio Synthesizer.
 */

(function () {
  'use strict';

  // Maze Layout Definitions (Grid: 15 cols x 11 rows)
  // 1 = Solid Wall, 0 = Open Floor, 2 = Destructible Block
  const MAZE_LAYOUTS = [
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,1,0,1,0,1,0,1,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,0,1,0,1,1,1,0,1,0,1,0,1],
      [1,0,0,0,1,0,0,0,0,0,1,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
      [1,0,1,1,0,0,1,0,1,0,0,1,1,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,0,0,1,1,0,0,0,1,1,0,0,0,1],
      [1,1,1,0,1,0,0,0,0,0,1,0,1,1,1],
      [1,0,0,0,1,1,0,0,0,1,1,0,0,0,1],
      [1,0,1,0,0,0,0,0,0,0,0,0,1,0,1],
      [1,0,1,1,0,0,1,0,1,0,0,1,1,0,1],
      [1,0,0,0,0,0,1,0,1,0,0,0,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ],
    [
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1],
      [1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
      [1,0,0,1,0,1,0,1,0,1,0,1,0,0,1],
      [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
      [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
      [1,0,0,0,0,0,0,0,0,0,0,0,0,0,1],
      [1,1,1,0,1,1,1,0,1,1,1,0,1,1,1],
      [1,0,0,0,0,1,0,0,0,1,0,0,0,0,1],
      [1,0,0,1,0,1,0,1,0,1,0,1,0,0,1],
      [1,0,0,1,0,0,0,1,0,0,0,1,0,0,1],
      [1,1,1,1,1,1,1,1,1,1,1,1,1,1,1]
    ]
  ];

  // Power-up Types
  const POWERUPS = [
    { type: 'laser', icon: '⚡', name: 'Laser Cannon', color: '#c084fc' },
    { type: 'shotgun', icon: '💥', name: 'Gatling Spread', color: '#facc15' },
    { type: 'missile', icon: '🚀', name: 'Homing Missile', color: '#ef4444' },
    { type: 'mine', icon: '💣', name: 'Landmine Trap', color: '#f97316' },
    { type: 'shield', icon: '🛡️', name: 'Energy Shield', color: '#38bdf8' }
  ];

  // State
  let currentMode = 'bot'; // 'bot' | '2p' | 'chaos'
  let p1Score = 0;
  let p2Score = 0;
  let p3Score = 0;
  let currentRound = 1;
  const TARGET_SCORE = 5;

  let currentMazeIndex = 0;
  let currentMaze = [];
  let cellSize = 40;
  let mazeCols = 15;
  let mazeRows = 11;

  // Tanks List
  let tanks = [];
  let bullets = [];
  let mines = [];
  let crates = [];
  let particles = [];
  let treadTracks = [];
  let screenShake = 0;

  let isRoundOver = false;
  let isMatchOver = false;
  let soundEnabled = true;

  // Canvas & Physics
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('canvas-wrapper');

  // DOM Elements
  const p1ScoreEl = document.getElementById('p1-score');
  const p2ScoreEl = document.getElementById('p2-score');
  const p2LabelEl = document.getElementById('p2-label');
  const p2CardEl = document.getElementById('p2-card');
  const roundBadgeEl = document.getElementById('round-badge');
  const targetBadgeEl = document.getElementById('target-badge');
  const modePills = document.querySelectorAll('.mode-pill');
  const roundBanner = document.getElementById('round-banner');
  const bannerText = document.getElementById('banner-text');
  const guideP2Col = document.getElementById('guide-p2-col');

  // Victory Modal
  const victoryModal = document.getElementById('victory-modal');
  const modalIcon = document.getElementById('modal-icon');
  const modalTitle = document.getElementById('modal-title');
  const modalDesc = document.getElementById('modal-desc');
  const modalP1Score = document.getElementById('modal-p1-score');
  const modalP2Score = document.getElementById('modal-p2-score');
  const modalP2Label = document.getElementById('modal-p2-label');
  const btnModalRestart = document.getElementById('btn-modal-restart');

  const btnSound = document.getElementById('sound-toggle-btn');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const touchControls = document.getElementById('touch-controls');
  const touchJoyP1 = document.getElementById('touch-joy-p1');
  const joyKnobP1 = document.getElementById('joy-knob-p1');
  const touchFireP1 = document.getElementById('touch-fire-p1');

  // Inputs
  const keys = {};
  let touchP1 = { x: 0, y: 0, active: false };

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
    const now = ctxA.currentTime;

    try {
      if (type === 'cannon') {
        // Heavy Tank Cannon Blast
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(240, now);
        osc.frequency.exponentialRampToValueAtTime(50, now + 0.12);
        gain.gain.setValueAtTime(0.35, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.13);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.14);
      } else if (type === 'bounce') {
        // Metallic Ricochet Ping
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(1400, now);
        osc.frequency.exponentialRampToValueAtTime(800, now + 0.05);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'explode') {
        // Tank Explosion Boom
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(140, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.35);
        gain.gain.setValueAtTime(0.5, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.36);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.37);
      } else if (type === 'powerup') {
        [523.25, 659.25, 783.99].forEach((f, i) => {
          const osc = ctxA.createOscillator();
          const gain = ctxA.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(f, now + i * 0.05);
          gain.gain.setValueAtTime(0.18, now + i * 0.05);
          gain.gain.exponentialRampToValueAtTime(0.001, now + i * 0.05 + 0.1);
          osc.connect(gain);
          gain.connect(ctxA.destination);
          osc.start(now + i * 0.05);
          osc.stop(now + i * 0.05 + 0.11);
        });
      }
    } catch (e) {}
  }

  // Update Scoreboard UI
  function updateScoreboard() {
    p1ScoreEl.textContent = p1Score;
    p2ScoreEl.textContent = p2Score;
    roundBadgeEl.textContent = `ROUND ${currentRound}`;
    targetBadgeEl.textContent = `FIRST TO ${TARGET_SCORE}`;

    if (currentMode === 'bot') {
      p2LabelEl.textContent = '🤖 BOT';
      p2CardEl.className = 'score-card p2-card';
      guideP2Col.style.display = 'none';
    } else if (currentMode === '2p') {
      p2LabelEl.textContent = '🟪 P2 (FRIEND)';
      p2CardEl.className = 'score-card p2-card';
      guideP2Col.style.display = 'flex';
    } else if (currentMode === 'chaos') {
      p2LabelEl.textContent = `🟪 P2: ${p2Score} | 🤖 B: ${p3Score}`;
      p2CardEl.className = 'score-card p2-card';
      guideP2Col.style.display = 'flex';
    }
  }

  // Find Valid Spawn Positions in Maze
  function findSpawnPoints(count) {
    const validCells = [];
    for (let r = 1; r < mazeRows - 1; r++) {
      for (let c = 1; c < mazeCols - 1; c++) {
        if (currentMaze[r][c] === 0) {
          validCells.push({ x: (c + 0.5) * cellSize, y: (r + 0.5) * cellSize });
        }
      }
    }
    // Shuffle and pick
    const shuffled = [...validCells].sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
  }

  // Setup Round
  function setupRound() {
    isRoundOver = false;
    bullets = [];
    mines = [];
    crates = [];
    particles = [];
    treadTracks = [];
    roundBanner.style.display = 'none';

    // Pick maze layout
    currentMazeIndex = (currentRound - 1) % MAZE_LAYOUTS.length;
    currentMaze = JSON.parse(JSON.stringify(MAZE_LAYOUTS[currentMazeIndex]));

    // Spawn 2 or 3 tanks
    const tankCount = currentMode === 'chaos' ? 3 : 2;
    const spawns = findSpawnPoints(tankCount);

    tanks = [];

    // Tank 1: Player 1 (Blue)
    tanks.push({
      id: 'p1',
      name: 'Player 1',
      x: spawns[0]?.x || 80,
      y: spawns[0]?.y || 80,
      angle: 0,
      turretAngle: 0,
      speed: 2.5,
      rotSpeed: 0.055,
      radius: 13,
      color: '#38bdf8',
      darkColor: '#0284c7',
      shootCooldown: 0,
      powerup: null,
      shield: false,
      isBot: false,
      recoil: 0
    });

    // Tank 2: P2 (Pink) or Bot (Gold)
    tanks.push({
      id: 'p2',
      name: currentMode === 'bot' ? 'Bot' : 'Player 2',
      x: spawns[1]?.x || 520,
      y: spawns[1]?.y || 380,
      angle: Math.PI,
      turretAngle: Math.PI,
      speed: 2.5,
      rotSpeed: 0.055,
      radius: 13,
      color: currentMode === 'bot' ? '#facc15' : '#fb7185',
      darkColor: currentMode === 'bot' ? '#ca8a04' : '#e11d48',
      shootCooldown: 0,
      powerup: null,
      shield: false,
      isBot: currentMode === 'bot',
      botTimer: 0,
      botTargetAngle: 0,
      recoil: 0
    });

    // Tank 3: (Chaos Mode Bot)
    if (currentMode === 'chaos') {
      tanks.push({
        id: 'p3',
        name: 'Bot 2',
        x: spawns[2]?.x || 300,
        y: spawns[2]?.y || 200,
        angle: Math.PI / 2,
        turretAngle: Math.PI / 2,
        speed: 2.3,
        rotSpeed: 0.05,
        radius: 13,
        color: '#4ade80',
        darkColor: '#16a34a',
        shootCooldown: 0,
        powerup: null,
        shield: false,
        isBot: true,
        botTimer: 0,
        botTargetAngle: 0,
        recoil: 0
      });
    }

    // Spawn 1 initial mystery crate
    spawnCrate();
    updateScoreboard();
  }

  // Spawn Mystery Power-up Crate
  function spawnCrate() {
    const spawns = findSpawnPoints(1);
    if (spawns.length > 0) {
      const pow = POWERUPS[Math.floor(Math.random() * POWERUPS.length)];
      crates.push({
        x: spawns[0].x,
        y: spawns[0].y,
        power: pow,
        radius: 12
      });
    }
  }

  // Initialize Match
  function initMatch() {
    p1Score = 0;
    p2Score = 0;
    p3Score = 0;
    currentRound = 1;
    isMatchOver = false;
    victoryModal.style.display = 'none';

    setupRound();
  }

  // Tank Fire
  function fireTank(tank) {
    if (tank.shootCooldown > 0 || isRoundOver) return;

    // Check active bullets limit (max 5 per tank)
    const tankBullets = bullets.filter(b => b.ownerId === tank.id);
    if (tankBullets.length >= 5) return;

    playSound('cannon');
    tank.recoil = 4;
    tank.shootCooldown = 0.28;

    const barrelDist = tank.radius + 10;
    const bx = tank.x + Math.cos(tank.turretAngle) * barrelDist;
    const by = tank.y + Math.sin(tank.turretAngle) * barrelDist;

    if (tank.powerup === 'shotgun') {
      // 3 Spread bouncing shells
      [-0.2, 0, 0.2].forEach(spread => {
        const a = tank.turretAngle + spread;
        bullets.push({
          x: bx,
          y: by,
          vx: Math.cos(a) * 6.2,
          vy: Math.sin(a) * 6.2,
          bounces: 4,
          ownerId: tank.id,
          color: '#facc15',
          radius: 3.5,
          life: 380
        });
      });
      tank.powerup = null;
    } else if (tank.powerup === 'laser') {
      // High-speed Laser Ray
      bullets.push({
        x: bx,
        y: by,
        vx: Math.cos(tank.turretAngle) * 11,
        vy: Math.sin(tank.turretAngle) * 11,
        bounces: 5,
        ownerId: tank.id,
        color: '#c084fc',
        radius: 3,
        isLaser: true,
        life: 300
      });
      tank.powerup = null;
    } else if (tank.powerup === 'missile') {
      // Homing Missile
      bullets.push({
        x: bx,
        y: by,
        vx: Math.cos(tank.turretAngle) * 4.5,
        vy: Math.sin(tank.turretAngle) * 4.5,
        bounces: 3,
        ownerId: tank.id,
        color: '#ef4444',
        radius: 4.5,
        isMissile: true,
        life: 450
      });
      tank.powerup = null;
    } else if (tank.powerup === 'mine') {
      // Drop Landmine
      mines.push({
        x: tank.x - Math.cos(tank.angle) * (tank.radius + 8),
        y: tank.y - Math.sin(tank.angle) * (tank.radius + 8),
        ownerId: tank.id,
        radius: 8,
        armTimer: 0.8
      });
      tank.powerup = null;
    } else {
      // Standard Ricochet Shell
      bullets.push({
        x: bx,
        y: by,
        vx: Math.cos(tank.turretAngle) * 5.8,
        vy: Math.sin(tank.turretAngle) * 5.8,
        bounces: 4,
        ownerId: tank.id,
        color: tank.color,
        radius: 3.5,
        life: 420
      });
    }

    // Muzzle Smoke & Flash Particles
    for (let i = 0; i < 4; i++) {
      particles.push({
        x: bx,
        y: by,
        vx: Math.cos(tank.turretAngle) * (1 + Math.random() * 3) + (Math.random() - 0.5) * 2,
        vy: Math.sin(tank.turretAngle) * (1 + Math.random() * 3) + (Math.random() - 0.5) * 2,
        color: '#facc15',
        size: 2.5,
        alpha: 1
      });
    }
  }

  // Check Wall Collision for Point (x, y) with Radius r
  function checkWallCollision(x, y, r) {
    const minCol = Math.floor((x - r) / cellSize);
    const maxCol = Math.floor((x + r) / cellSize);
    const minRow = Math.floor((y - r) / cellSize);
    const maxRow = Math.floor((y + r) / cellSize);

    for (let row = minRow; row <= maxRow; row++) {
      for (let col = minCol; col <= maxCol; col++) {
        if (row >= 0 && row < mazeRows && col >= 0 && col < mazeCols) {
          if (currentMaze[row][col] === 1 || currentMaze[row][col] === 2) {
            // Check bounding box intersection
            const boxLeft = col * cellSize;
            const boxRight = boxLeft + cellSize;
            const boxTop = row * cellSize;
            const boxBottom = boxTop + cellSize;

            const closestX = Math.max(boxLeft, Math.min(x, boxRight));
            const closestY = Math.max(boxTop, Math.min(y, boxBottom));

            const distX = x - closestX;
            const distY = y - closestY;
            if ((distX * distX + distY * distY) < (r * r)) {
              return { col, row, isDestructible: currentMaze[row][col] === 2 };
            }
          }
        }
      }
    }
    return null;
  }

  // Destroy Tank & End Round
  function destroyTank(deadTank) {
    playSound('explode');
    screenShake = 10;

    // Explosion Debris
    for (let i = 0; i < 24; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 6;
      particles.push({
        x: deadTank.x,
        y: deadTank.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: Math.random() < 0.5 ? deadTank.color : '#f97316',
        size: 4 + Math.random() * 5,
        alpha: 1
      });
    }

    // Award point to remaining surviving tank
    const livingTanks = tanks.filter(t => t !== deadTank);
    if (livingTanks.length === 1 && !isRoundOver) {
      isRoundOver = true;
      const winner = livingTanks[0];

      if (winner.id === 'p1') p1Score++;
      else if (winner.id === 'p2') p2Score++;
      else if (winner.id === 'p3') p3Score++;

      updateScoreboard();

      bannerText.textContent = `🎉 ${winner.name.toUpperCase()} SCORES! 🎉`;
      roundBanner.style.display = 'block';

      // Check if match won
      if (p1Score >= TARGET_SCORE || p2Score >= TARGET_SCORE || p3Score >= TARGET_SCORE) {
        setTimeout(showVictoryModal, 1200);
      } else {
        setTimeout(() => {
          currentRound++;
          setupRound();
        }, 1800);
      }
    }
  }

  // Show Victory Modal
  function showVictoryModal() {
    isMatchOver = true;
    let winnerText = 'PLAYER 1 WINS THE MATCH!';
    if (p2Score > p1Score) winnerText = currentMode === 'bot' ? 'BOT WINS THE MATCH!' : 'PLAYER 2 WINS THE MATCH!';

    modalTitle.textContent = winnerText;
    modalP1Score.textContent = p1Score;
    modalP2Score.textContent = p2Score;
    modalP2Label.textContent = currentMode === 'bot' ? '🤖 Bot Score' : '🟪 P2 Score';

    if (typeof confetti === 'function') {
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
        colors: ['#38bdf8', '#fb7185', '#facc15', '#4ade80']
      });
    }

    victoryModal.style.display = 'flex';
  }

  // Smart AI Bot Controller
  function updateBot(bot, targetTank, dt) {
    if (!targetTank || isRoundOver) return;

    bot.botTimer -= dt;

    // 1. Aim Turret towards target with slight bank shot calculation
    const toTargetAngle = Math.atan2(targetTank.y - bot.y, targetTank.x - bot.x);
    bot.turretAngle = toTargetAngle;

    // 2. Movement Logic (Drive & Navigate)
    if (bot.botTimer <= 0) {
      bot.botTimer = 0.5 + Math.random() * 0.8;
      // Pick target drive direction
      const diff = toTargetAngle - bot.angle;
      bot.botTargetAngle = Math.atan2(Math.sin(toTargetAngle), Math.cos(toTargetAngle));
    }

    // Steer towards target angle
    const angleDiff = Math.atan2(Math.sin(bot.botTargetAngle - bot.angle), Math.cos(bot.botTargetAngle - bot.angle));
    if (Math.abs(angleDiff) > 0.1) {
      bot.angle += Math.sign(angleDiff) * bot.rotSpeed;
    }

    // Drive forward
    const nextX = bot.x + Math.cos(bot.angle) * bot.speed;
    const nextY = bot.y + Math.sin(bot.angle) * bot.speed;

    if (!checkWallCollision(nextX, nextY, bot.radius)) {
      bot.x = nextX;
      bot.y = nextY;
    } else {
      // Wall encountered, turn
      bot.angle += 0.8;
      bot.botTimer = 0.6;
    }

    // 3. Shooting decision
    const dist = Math.hypot(targetTank.x - bot.x, targetTank.y - bot.y);
    if (dist < 320 && Math.abs(angleDiff) < 0.35 && Math.random() < 0.04) {
      fireTank(bot);
    }
  }

  // Update Engine Loop
  function update(dt) {
    if (isMatchOver) return;

    // 1. Player 1 Movement (WASD / Touch)
    const p1 = tanks.find(t => t.id === 'p1');
    if (p1 && !isRoundOver) {
      if (p1.recoil > 0) p1.recoil *= 0.8;
      if (p1.shootCooldown > 0) p1.shootCooldown -= dt;

      let p1Turn = 0;
      let p1Forward = 0;

      if (keys['KeyA']) p1Turn -= 1;
      if (keys['KeyD']) p1Turn += 1;
      if (keys['KeyW']) p1Forward += 1;
      if (keys['KeyS']) p1Forward -= 0.6;

      if (touchP1.active) {
        p1.angle = Math.atan2(touchP1.y, touchP1.x);
        p1Forward = Math.min(1, Math.hypot(touchP1.x, touchP1.y));
        p1.turretAngle = p1.angle;
      } else {
        p1.angle += p1Turn * p1.rotSpeed;
        if (mouse.hasMoved && currentMode !== '2p') {
          p1.turretAngle = Math.atan2(mouse.y - p1.y, mouse.x - p1.x);
        } else {
          p1.turretAngle = p1.angle;
        }
      }

      if (p1Forward !== 0) {
        const nx = p1.x + Math.cos(p1.angle) * (p1.speed * p1Forward);
        const ny = p1.y + Math.sin(p1.angle) * (p1.speed * p1Forward);

        if (!checkWallCollision(nx, p1.y, p1.radius)) p1.x = nx;
        if (!checkWallCollision(p1.x, ny, p1.radius)) p1.y = ny;

        // Leave track marks periodically
        if (Math.random() < 0.25) {
          if (treadTracks.length > 60) treadTracks.shift();
          treadTracks.push({ x: p1.x, y: p1.y, angle: p1.angle, alpha: 0.3 });
        }
      }

      if (keys['Space']) {
        fireTank(p1);
      }
    }

    // 2. Player 2 Movement (Arrows / Keys) or AI Bot
    const p2 = tanks.find(t => t.id === 'p2');
    if (p2 && !isRoundOver) {
      if (p2.recoil > 0) p2.recoil *= 0.8;
      if (p2.shootCooldown > 0) p2.shootCooldown -= dt;

      if (p2.isBot) {
        updateBot(p2, p1, dt);
      } else {
        let p2Turn = 0;
        let p2Forward = 0;

        if (keys['ArrowLeft']) p2Turn -= 1;
        if (keys['ArrowRight']) p2Turn += 1;
        if (keys['ArrowUp']) p2Forward += 1;
        if (keys['ArrowDown']) p2Forward -= 0.6;

        p2.angle += p2Turn * p2.rotSpeed;
        p2.turretAngle = p2.angle;

        if (p2Forward !== 0) {
          const nx = p2.x + Math.cos(p2.angle) * (p2.speed * p2Forward);
          const ny = p2.y + Math.sin(p2.angle) * (p2.speed * p2Forward);

          if (!checkWallCollision(nx, p2.y, p2.radius)) p2.x = nx;
          if (!checkWallCollision(p2.x, ny, p2.radius)) p2.y = ny;

          if (Math.random() < 0.25) {
            if (treadTracks.length > 60) treadTracks.shift();
            treadTracks.push({ x: p2.x, y: p2.y, angle: p2.angle, alpha: 0.3 });
          }
        }

        if (keys['Enter'] || keys['KeyM']) {
          fireTank(p2);
        }
      }
    }

    // 3. Tank 3 (Chaos Mode Bot)
    const p3 = tanks.find(t => t.id === 'p3');
    if (p3 && !isRoundOver && p3.isBot) {
      if (p3.recoil > 0) p3.recoil *= 0.8;
      if (p3.shootCooldown > 0) p3.shootCooldown -= dt;
      updateBot(p3, p1, dt);
    }

    // 4. Update Bouncing Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (b.life <= 0 || b.bounces < 0) {
        bullets.splice(i, 1);
        continue;
      }

      // Check Collision with Maze Walls (Bouncing reflection)
      const wallHit = checkWallCollision(b.x, b.y, b.radius);
      if (wallHit) {
        playSound('bounce');
        b.bounces--;

        // Determine if horizontal or vertical wall reflection
        const prevX = b.x - b.vx;
        const prevY = b.y - b.vy;

        const hitHoriz = checkWallCollision(b.x, prevY, b.radius);
        const hitVert = checkWallCollision(prevX, b.y, b.radius);

        if (hitHoriz) b.vx = -b.vx;
        if (hitVert) b.vy = -b.vy;
        if (!hitHoriz && !hitVert) {
          b.vx = -b.vx;
          b.vy = -b.vy;
        }

        // Destructible block destruction
        if (wallHit.isDestructible) {
          currentMaze[wallHit.row][wallHit.col] = 0;
          playSound('explode');
        }

        // Sparks
        for (let s = 0; s < 3; s++) {
          particles.push({
            x: b.x,
            y: b.y,
            vx: (Math.random() - 0.5) * 3,
            vy: (Math.random() - 0.5) * 3,
            color: b.color,
            size: 2,
            alpha: 1
          });
        }
      }

      // Check Collision with Tanks
      for (const t of tanks) {
        if (Math.hypot(t.x - b.x, t.y - b.y) < t.radius + b.radius) {
          if (t.shield) {
            t.shield = false;
            playSound('bounce');
            bullets.splice(i, 1);
            break;
          } else {
            destroyTank(t);
            bullets.splice(i, 1);
            break;
          }
        }
      }
    }

    // 5. Update Mystery Power-up Crates
    for (let i = crates.length - 1; i >= 0; i--) {
      const c = crates[i];
      for (const t of tanks) {
        if (Math.hypot(t.x - c.x, t.y - c.y) < t.radius + c.radius) {
          playSound('powerup');
          if (c.power.type === 'shield') {
            t.shield = true;
          } else {
            t.powerup = c.power.type;
          }
          crates.splice(i, 1);
          // Spawn another crate after 8 seconds
          setTimeout(spawnCrate, 8000);
          break;
        }
      }
    }

    // 6. Update Landmines
    for (let i = mines.length - 1; i >= 0; i--) {
      const m = mines[i];
      if (m.armTimer > 0) m.armTimer -= dt;

      if (m.armTimer <= 0) {
        for (const t of tanks) {
          if (Math.hypot(t.x - m.x, t.y - m.y) < t.radius + m.radius) {
            destroyTank(t);
            mines.splice(i, 1);
            break;
          }
        }
      }
    }

    // 7. Update Particles
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.035;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    if (screenShake > 0) screenShake *= 0.82;
  }

  // Render Scene
  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    ctx.save();
    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // 1. Maze Floor
    ctx.fillStyle = '#090d16';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Tread Tracks
    treadTracks.forEach(tr => {
      ctx.save();
      ctx.translate(tr.x, tr.y);
      ctx.rotate(tr.angle);
      ctx.fillStyle = `rgba(148, 163, 184, ${tr.alpha})`;
      ctx.fillRect(-8, -9, 16, 3);
      ctx.fillRect(-8, 6, 16, 3);
      ctx.restore();
    });

    // 2. Maze Walls
    for (let r = 0; r < mazeRows; r++) {
      for (let c = 0; c < mazeCols; c++) {
        const val = currentMaze[r][c];
        const wx = c * cellSize;
        const wy = r * cellSize;

        if (val === 1) {
          // Solid Neon Wall
          ctx.fillStyle = '#1e293b';
          ctx.fillRect(wx, wy, cellSize, cellSize);

          ctx.strokeStyle = '#38bdf8';
          ctx.lineWidth = 2;
          ctx.strokeRect(wx, wy, cellSize, cellSize);
        } else if (val === 2) {
          // Destructible Crate Wall
          ctx.fillStyle = '#78350f';
          ctx.fillRect(wx, wy, cellSize, cellSize);
          ctx.strokeStyle = '#facc15';
          ctx.lineWidth = 2;
          ctx.strokeRect(wx, wy, cellSize, cellSize);
        }
      }
    }

    // 3. Power-Up Crates
    crates.forEach(c => {
      ctx.save();
      ctx.fillStyle = '#facc15';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(c.x - 12, c.y - 12, 24, 24, 6);
      ctx.fill();
      ctx.stroke();

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText(c.power.icon, c.x, c.y);
      ctx.restore();
    });

    // 4. Landmines
    mines.forEach(m => {
      ctx.save();
      ctx.fillStyle = '#ef4444';
      ctx.beginPath();
      ctx.arc(m.x, m.y, m.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    });

    // 5. Tanks
    tanks.forEach(tank => {
      ctx.save();
      ctx.translate(tank.x, tank.y);

      // Energy Shield Bubble
      if (tank.shield) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 2.5;
        ctx.shadowColor = '#38bdf8';
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(0, 0, tank.radius + 6, 0, Math.PI * 2);
        ctx.stroke();
      }

      ctx.rotate(tank.angle);

      // Recoil translation
      ctx.translate(-tank.recoil, 0);

      // Tank Treads
      ctx.fillStyle = '#0f172a';
      ctx.fillRect(-14, -13, 28, 5); // Left Tread
      ctx.fillRect(-14, 8, 28, 5);  // Right Tread

      // Tank Body Chassis
      ctx.fillStyle = tank.color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.roundRect(-12, -9, 24, 18, 4);
      ctx.fill();
      ctx.stroke();

      // Rotating Turret
      ctx.rotate(tank.turretAngle - tank.angle);

      // Cannon Barrel
      ctx.fillStyle = tank.darkColor;
      ctx.fillRect(2, -3, 16, 6);
      ctx.strokeRect(2, -3, 16, 6);

      // Turret Dome
      ctx.fillStyle = tank.color;
      ctx.beginPath();
      ctx.arc(0, 0, 7, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

        // Active Powerup Icon on Turret
        if (tank.powerup) {
          const pow = POWERUPS.find(p => p.type === tank.powerup);
          if (pow) {
            ctx.font = '10px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillText(pow.icon, 0, 0);
          }
        }

        // Aim Laser Guide for P1
        if (tank.id === 'p1' && !isRoundOver) {
          ctx.save();
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.lineWidth = 1.5;
          ctx.setLineDash([4, 4]);
          ctx.beginPath();
          ctx.moveTo(18, 0);
          ctx.lineTo(80, 0);
          ctx.stroke();
          ctx.restore();
        }

        ctx.restore();
      });

      // 6. Bouncing Bullets with Glow
      bullets.forEach(b => {
        ctx.save();
        ctx.fillStyle = b.color;
        ctx.shadowColor = b.color;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      });

      // 7. Particles
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

    // Game Loop
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
      ctx.scale(dpr, dpr);

      cellSize = w / mazeCols;
    }

    // Fullscreen
    function toggleFullscreen() {
      document.body.classList.toggle('is-fullscreen');
      setTimeout(handleResize, 100);
    }

    // Mouse Tracking & Click-to-Shoot for P1
    let mouse = { x: 300, y: 220, hasMoved: false };
    function updateMouse(e) {
      const rect = canvas.getBoundingClientRect();
      if (rect.width > 0 && rect.height > 0) {
        mouse.x = (e.clientX - rect.left) * (canvas.width / (window.devicePixelRatio || 1) / rect.width);
        mouse.y = (e.clientY - rect.top) * (canvas.height / (window.devicePixelRatio || 1) / rect.height);
        mouse.hasMoved = true;
      }
    }

    window.addEventListener('mousemove', updateMouse);
    canvas.addEventListener('mousedown', (e) => {
      if (e.button === 0) {
        updateMouse(e);
        const p1 = tanks.find(t => t.id === 'p1');
        if (p1 && !isRoundOver) fireTank(p1);
      }
    });

    // Event Listeners: Keyboard
    window.addEventListener('keydown', (e) => {
      keys[e.code] = true;
    });

    window.addEventListener('keyup', (e) => {
      keys[e.code] = false;
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
      initMatch();
    });
  });

  // Touch Virtual Joystick
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) {
    touchControls.style.display = 'block';
  }

  function setupTouch(zone, knob, state) {
    let touchId = null;
    let startX = 0, startY = 0;

    zone.addEventListener('touchstart', (e) => {
      e.preventDefault();
      const touch = e.changedTouches[0];
      touchId = touch.identifier;
      const rect = zone.getBoundingClientRect();
      startX = rect.left + rect.width / 2;
      startY = rect.top + rect.height / 2;
      state.active = true;
    }, { passive: false });

    zone.addEventListener('touchmove', (e) => {
      e.preventDefault();
      for (let i = 0; i < e.changedTouches.length; i++) {
        const touch = e.changedTouches[i];
        if (touch.identifier === touchId) {
          const dx = touch.clientX - startX;
          const dy = touch.clientY - startY;
          const dist = Math.hypot(dx, dy);
          const maxDist = 35;
          const angle = Math.atan2(dy, dx);
          const clamped = Math.min(dist, maxDist);

          knob.style.transform = `translate(${Math.cos(angle) * clamped}px, ${Math.sin(angle) * clamped}px)`;
          state.x = Math.cos(angle) * (clamped / maxDist);
          state.y = Math.sin(angle) * (clamped / maxDist);
        }
      }
    }, { passive: false });

    const endHandler = (e) => {
      for (let i = 0; i < e.changedTouches.length; i++) {
        if (e.changedTouches[i].identifier === touchId) {
          touchId = null;
          state.active = false;
          state.x = 0;
          state.y = 0;
          knob.style.transform = 'translate(0px, 0px)';
        }
      }
    };

    zone.addEventListener('touchend', endHandler);
    zone.addEventListener('touchcancel', endHandler);
  }

  setupTouch(touchJoyP1, joyKnobP1, touchP1);

  touchFireP1.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const p1 = tanks.find(t => t.id === 'p1');
    if (p1) fireTank(p1);
  });

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnModalRestart.addEventListener('click', initMatch);

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  // Initialize
  initMatch();
  requestAnimationFrame(gameLoop);
})();
