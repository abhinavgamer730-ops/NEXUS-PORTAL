/**
 * Zombie Survivor: Arena 2.5D Game Engine
 * Features: Top-Down Arena Camera, Dynamic Flashlight & Decals, Explosive Barrels,
 * 6 Heavy Weapons, Mid-Run Perk Cards, Permanent Armory Shop, Wave Bosses,
 * Mobile Virtual Joysticks, Fullscreen Toggle, and Multi-Layer Synthesized Audio.
 */

(function () {
  'use strict';

  // Weapon Definitions
  const WEAPONS = [
    {
      id: 'pistols',
      name: 'Dual Pistols',
      icon: '🔫',
      price: 0,
      damage: 22,
      fireRate: 0.18, // seconds between shots
      bulletSpeed: 14,
      bulletCount: 1,
      spread: 0.08,
      bulletColor: '#facc15',
      bulletSize: 4,
      piercing: 1,
      knockback: 2,
      sound: 'pistol',
      tier: 1,
      maxTier: 5,
      upgradeCost: 50
    },
    {
      id: 'shotgun',
      name: 'Combat Shotgun',
      icon: '💥',
      price: 100,
      damage: 18,
      fireRate: 0.55,
      bulletSpeed: 13,
      bulletCount: 6,
      spread: 0.35,
      bulletColor: '#fb923c',
      bulletSize: 3.5,
      piercing: 1,
      knockback: 7,
      sound: 'shotgun',
      tier: 1,
      maxTier: 5,
      upgradeCost: 120
    },
    {
      id: 'smg',
      name: 'Plasma SMG',
      icon: '⚡',
      price: 250,
      damage: 16,
      fireRate: 0.09,
      bulletSpeed: 16,
      bulletCount: 1,
      spread: 0.12,
      bulletColor: '#38bdf8',
      bulletSize: 3.5,
      piercing: 1,
      knockback: 1.5,
      sound: 'smg',
      tier: 1,
      maxTier: 5,
      upgradeCost: 200
    },
    {
      id: 'rocket',
      name: 'Rocket Launcher',
      icon: '🚀',
      price: 500,
      damage: 90,
      fireRate: 0.85,
      bulletSpeed: 10,
      bulletCount: 1,
      spread: 0.02,
      bulletColor: '#ef4444',
      bulletSize: 6,
      isExplosive: true,
      explosionRadius: 85,
      piercing: 1,
      knockback: 10,
      sound: 'rocket',
      tier: 1,
      maxTier: 5,
      upgradeCost: 350
    },
    {
      id: 'laser',
      name: 'Tesla Cannon',
      icon: '🔋',
      price: 800,
      damage: 45,
      fireRate: 0.3,
      bulletSpeed: 20,
      bulletCount: 1,
      spread: 0.01,
      bulletColor: '#c084fc',
      bulletSize: 5,
      piercing: 4,
      knockback: 3,
      sound: 'laser',
      tier: 1,
      maxTier: 5,
      upgradeCost: 500
    }
  ];

  // Perk Card Catalog for Level-Up
  const PERK_CATALOG = [
    { id: 'multishot', name: 'Multi-Shot', icon: '🏹', desc: 'Adds +1 extra projectile to your weapon spread.' },
    { id: 'rapidfire', name: 'Rapid Trigger', icon: '⚡', desc: 'Increases weapon fire rate by +25%.' },
    { id: 'damage', name: 'Hollow Points', icon: '💥', desc: 'Increases all bullet damage by +25%.' },
    { id: 'speed', name: 'Adrenaline Boots', icon: '🥾', desc: 'Increases survivor movement speed by +20%.' },
    { id: 'shield', name: 'Energy Barrier', icon: '🛡️', desc: 'Grants +1 protective energy shield charge.' },
    { id: 'frost', name: 'Cryo Freeze', icon: '❄️', desc: 'Bullets chill enemies, slowing their speed by 40%.' },
    { id: 'orb', name: 'Plasma Sentinel', icon: '🔮', desc: 'Spawns an orbiting energy orb that zaps nearby foes.' },
    { id: 'regen', name: 'Nano Medic', icon: '🩸', desc: 'Restores +15 HP instantly and heals +2 HP every 4s.' }
  ];

  // Game Arena World Bounds
  const WORLD_WIDTH = 1300;
  const WORLD_HEIGHT = 1000;

  // State
  let hero = {
    x: WORLD_WIDTH / 2,
    y: WORLD_HEIGHT / 2,
    vx: 0,
    vy: 0,
    radius: 16,
    angle: 0,
    speed: 4.2,
    hp: 100,
    maxHp: 100,
    shield: 0,
    dashCooldown: 0,
    dashTimer: 0,
    isDashing: false,
    level: 1,
    xp: 0,
    xpNext: 100
  };

  let equippedWeaponId = 'pistols';
  let unlockedWeapons = ['pistols'];
  let weaponTiers = { pistols: 1, shotgun: 1, smg: 1, rocket: 1, laser: 1 };
  let passiveArmor = 0;
  let passiveMaxHpLevel = 0;
  let passiveSpeedLevel = 0;

  // Active In-Run Perks
  let runPerks = {
    multishot: 0,
    rapidfire: 0,
    damage: 0,
    speed: 0,
    frost: false,
    orbCount: 0,
    regen: false
  };

  let currentWave = 1;
  let waveTimer = 0;
  let waveDuration = 25; // seconds per wave
  let isWaveTransition = false;
  let waveZombiesToSpawn = 12;
  let waveZombiesSpawned = 0;
  let spawnTimer = 0;

  let score = 0;
  let bestScore = 0;
  let coins = 0;
  let runCoins = 0;
  let kills = 0;
  let shootTimer = 0;
  let autoFire = true;
  let isGameOver = false;
  let isPaused = false;
  let soundEnabled = true;

  // Entity Pools
  let bullets = [];
  let enemyBullets = [];
  let zombies = [];
  let gems = [];
  let explosiveBarrels = [];
  let medkits = [];
  let bloodDecals = [];
  let particles = [];
  let floatingTexts = [];
  let orbitingOrbs = [];
  let screenShake = 0;

  // Camera View
  let camera = { x: 0, y: 0, width: 600, height: 440 };

  // Inputs
  const keys = {};
  let mousePos = { x: 0, y: 0, isDown: false };
  let touchMove = { x: 0, y: 0, active: false };
  let touchAim = { x: 0, y: 0, active: false };

  // DOM Elements
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const wrapper = document.getElementById('canvas-wrapper');
  const gameContainer = document.getElementById('game-container');

  const hpBarFill = document.getElementById('hp-bar-fill');
  const hpText = document.getElementById('hp-text');
  const shieldBadge = document.getElementById('shield-badge');
  const dashBadge = document.getElementById('dash-badge');
  const waveBadge = document.getElementById('wave-badge');
  const xpLvlTag = document.getElementById('xp-lvl-tag');
  const xpBarFill = document.getElementById('xp-bar-fill');
  const hudCoins = document.getElementById('hud-coins');
  const hudKills = document.getElementById('hud-kills');
  const dockWeaponIcon = document.getElementById('dock-weapon-icon');
  const dockWeaponName = document.getElementById('dock-weapon-name');
  const btnAutofire = document.getElementById('btn-autofire');
  const waveAlert = document.getElementById('wave-alert');
  const alertContent = document.getElementById('alert-content');

  // Modals
  const levelupModal = document.getElementById('levelup-modal');
  const perkCardsGrid = document.getElementById('perk-cards-grid');
  const armoryModal = document.getElementById('armory-modal');
  const armoryCoins = document.getElementById('armory-coins');
  const armoryWeaponsGrid = document.getElementById('armory-weapons-grid');
  const armoryStatsGrid = document.getElementById('armory-stats-grid');
  const armoryTabBtns = document.querySelectorAll('.armory-tab-btn');
  const btnArmory = document.getElementById('btn-armory');
  const btnArmoryClose = document.getElementById('btn-armory-close');

  const gameoverModal = document.getElementById('gameover-modal');
  const gameoverIcon = document.getElementById('gameover-icon');
  const gameoverTitle = document.getElementById('gameover-title');
  const gameoverDesc = document.getElementById('gameover-desc');
  const statWave = document.getElementById('stat-wave');
  const statKills = document.getElementById('stat-kills');
  const statCoins = document.getElementById('stat-coins');
  const statScore = document.getElementById('stat-score');
  const statNewBest = document.getElementById('stat-new-best');
  const btnModalRestart = document.getElementById('btn-modal-restart');
  const btnModalArmory = document.getElementById('btn-modal-armory');

  const btnSound = document.getElementById('sound-toggle-btn');
  const btnFullscreen = document.getElementById('btn-fullscreen');
  const touchControls = document.getElementById('touch-controls');
  const btnTouchDash = document.getElementById('btn-touch-dash');

  // Load Saved Data
  function loadSavedData() {
    try {
      bestScore = parseInt(localStorage.getItem('nexus_zombie_best') || '0', 10);
      coins = parseInt(localStorage.getItem('nexus_zombie_coins') || '0', 10);
      const savedUnlocks = localStorage.getItem('nexus_zombie_unlocked');
      if (savedUnlocks) unlockedWeapons = JSON.parse(savedUnlocks);
      const savedEquipped = localStorage.getItem('nexus_zombie_equipped');
      if (savedEquipped && unlockedWeapons.includes(savedEquipped)) equippedWeaponId = savedEquipped;
      const savedTiers = localStorage.getItem('nexus_zombie_tiers');
      if (savedTiers) weaponTiers = JSON.parse(savedTiers);
      passiveArmor = parseInt(localStorage.getItem('nexus_zombie_armor') || '0', 10);
      passiveMaxHpLevel = parseInt(localStorage.getItem('nexus_zombie_maxhp') || '0', 10);
      passiveSpeedLevel = parseInt(localStorage.getItem('nexus_zombie_speed') || '0', 10);
    } catch (e) {}
    updateHUD();
  }

  function saveGameData() {
    try {
      localStorage.setItem('nexus_zombie_best', bestScore.toString());
      localStorage.setItem('nexus_zombie_coins', coins.toString());
      localStorage.setItem('nexus_zombie_unlocked', JSON.stringify(unlockedWeapons));
      localStorage.setItem('nexus_zombie_equipped', equippedWeaponId);
      localStorage.setItem('nexus_zombie_tiers', JSON.stringify(weaponTiers));
      localStorage.setItem('nexus_zombie_armor', passiveArmor.toString());
      localStorage.setItem('nexus_zombie_maxhp', passiveMaxHpLevel.toString());
      localStorage.setItem('nexus_zombie_speed', passiveSpeedLevel.toString());
    } catch (e) {}
  }

  // Web Audio Synthesizer
  let audioCtx = null;
  let noiseBuffer = null;

  function getAudioContext() {
    if (!audioCtx) {
      const AudioCtxClass = window.AudioContext || window.webkitAudioContext;
      if (AudioCtxClass) {
        audioCtx = new AudioCtxClass();
        const bufferSize = audioCtx.sampleRate * 1.0;
        noiseBuffer = audioCtx.createBuffer(1, bufferSize, audioCtx.sampleRate);
        const output = noiseBuffer.getChannelData(0);
        for (let i = 0; i < bufferSize; i++) {
          output[i] = Math.random() * 2 - 1;
        }
      }
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
      if (type === 'pistol') {
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(440, now);
        osc.frequency.exponentialRampToValueAtTime(110, now + 0.07);
        gain.gain.setValueAtTime(0.18, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.08);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.09);
      } else if (type === 'shotgun') {
        if (noiseBuffer) {
          const noise = ctxA.createBufferSource();
          noise.buffer = noiseBuffer;
          const filter = ctxA.createBiquadFilter();
          filter.type = 'lowpass';
          filter.frequency.setValueAtTime(800, now);
          filter.frequency.exponentialRampToValueAtTime(200, now + 0.14);
          const gain = ctxA.createGain();
          gain.gain.setValueAtTime(0.35, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.15);
          noise.connect(filter);
          filter.connect(gain);
          gain.connect(ctxA.destination);
          noise.start(now);
          noise.stop(now + 0.16);
        }
      } else if (type === 'smg') {
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(750, now);
        osc.frequency.exponentialRampToValueAtTime(280, now + 0.04);
        gain.gain.setValueAtTime(0.15, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.05);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.055);
      } else if (type === 'rocket' || type === 'barrel') {
        // Deep Explosion Boom
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'triangle';
        osc.frequency.setValueAtTime(120, now);
        osc.frequency.exponentialRampToValueAtTime(30, now + 0.25);
        gain.gain.setValueAtTime(0.45, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.26);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.27);
      } else if (type === 'splat') {
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(220, now);
        osc.frequency.exponentialRampToValueAtTime(90, now + 0.06);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.065);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.07);
      } else if (type === 'gem') {
        const osc = ctxA.createOscillator();
        const gain = ctxA.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, now);
        osc.frequency.exponentialRampToValueAtTime(1320, now + 0.05);
        gain.gain.setValueAtTime(0.12, now);
        gain.gain.exponentialRampToValueAtTime(0.001, now + 0.055);
        osc.connect(gain);
        gain.connect(ctxA.destination);
        osc.start(now);
        osc.stop(now + 0.06);
      } else if (type === 'levelup') {
        [523.25, 659.25, 783.99, 1046.50].forEach((f, i) => {
          const osc = ctxA.createOscillator();
          const gain = ctxA.createGain();
          osc.type = 'triangle';
          osc.frequency.setValueAtTime(f, now + i * 0.06);
          gain.gain.setValueAtTime(0.22, now + i * 0.06);
          gain.gain.exponentialRampToValueAtTime(0.01, now + i * 0.06 + 0.2);
          osc.connect(gain);
          gain.connect(ctxA.destination);
          osc.start(now + i * 0.06);
          osc.stop(now + i * 0.06 + 0.21);
        });
      }
    } catch (e) {}
  }

  // Update In-Game HUD Elements
  function updateHUD() {
    const hpPercent = Math.max(0, Math.min(100, (hero.hp / hero.maxHp) * 100));
    hpBarFill.style.width = `${hpPercent}%`;
    hpText.textContent = `${Math.ceil(hero.hp)} / ${hero.maxHp}`;

    shieldBadge.textContent = `🛡️ SHIELD: ${hero.shield}`;
    shieldBadge.style.color = hero.shield > 0 ? 'var(--sky)' : '#64748b';

    dashBadge.textContent = hero.dashCooldown <= 0 ? '⚡ DASH: READY' : `⚡ DASH: ${Math.ceil(hero.dashCooldown)}s`;
    dashBadge.style.color = hero.dashCooldown <= 0 ? 'var(--sunny)' : '#64748b';

    waveBadge.textContent = `🌊 WAVE ${currentWave}`;
    xpLvlTag.textContent = `LVL ${hero.level}`;
    const xpPercent = Math.min(100, (hero.xp / hero.xpNext) * 100);
    xpBarFill.style.width = `${xpPercent}%`;

    hudCoins.textContent = `💰 ${coins}`;
    hudKills.textContent = `💀 ${kills}`;

    const wep = WEAPONS.find(w => w.id === equippedWeaponId) || WEAPONS[0];
    dockWeaponIcon.textContent = wep.icon;
    dockWeaponName.textContent = wep.name;
    btnAutofire.textContent = `AUTO-FIRE: ${autoFire ? 'ON' : 'OFF'}`;
    btnAutofire.className = `btn-autofire ${autoFire ? '' : 'off'}`;
  }

  // Initialize Game Run
  function initRun() {
    isGameOver = false;
    isPaused = false;
    isWaveTransition = false;
    currentWave = 1;
    waveTimer = 0;
    waveZombiesToSpawn = 14;
    waveZombiesSpawned = 0;
    spawnTimer = 0;
    score = 0;
    kills = 0;
    runCoins = 0;

    // Apply permanent passive perks
    const extraHp = passiveMaxHpLevel * 25;
    hero.maxHp = 100 + extraHp;
    hero.hp = hero.maxHp;
    hero.shield = 0;
    hero.speed = 4.2 + (passiveSpeedLevel * 0.35);
    hero.dashCooldown = 0;
    hero.isDashing = false;
    hero.level = 1;
    hero.xp = 0;
    hero.xpNext = 100;
    hero.x = WORLD_WIDTH / 2;
    hero.y = WORLD_HEIGHT / 2;
    hero.vx = 0;
    hero.vy = 0;

    runPerks = {
      multishot: 0,
      rapidfire: 0,
      damage: 0,
      speed: 0,
      frost: false,
      orbCount: 0,
      regen: false
    };

    bullets = [];
    enemyBullets = [];
    zombies = [];
    gems = [];
    medkits = [];
    bloodDecals = [];
    particles = [];
    floatingTexts = [];
    orbitingOrbs = [];
    screenShake = 0;

    // Spawn initial explosive barrels across map
    explosiveBarrels = [];
    for (let i = 0; i < 8; i++) {
      spawnBarrel();
    }

    gameoverModal.style.display = 'none';
    levelupModal.style.display = 'none';
    armoryModal.style.display = 'none';

    showWaveBanner(`🌊 WAVE 1 START! 🌊`);
    updateHUD();
  }

  function spawnBarrel() {
    const margin = 100;
    const bx = margin + Math.random() * (WORLD_WIDTH - margin * 2);
    const by = margin + Math.random() * (WORLD_HEIGHT - margin * 2);
    explosiveBarrels.push({ x: bx, y: by, radius: 18, hp: 30, maxHp: 30 });
  }

  function showWaveBanner(text) {
    alertContent.textContent = text;
    waveAlert.style.display = 'block';
    setTimeout(() => { waveAlert.style.display = 'none'; }, 2200);
  }

  // Get Active Weapon Config with in-run & armory upgrades
  function getActiveWeaponStats() {
    const wep = WEAPONS.find(w => w.id === equippedWeaponId) || WEAPONS[0];
    const tier = weaponTiers[wep.id] || 1;
    const tierMultiplier = 1 + (tier - 1) * 0.25;

    const baseDmg = wep.damage * tierMultiplier;
    const perkDmgBonus = baseDmg * (runPerks.damage * 0.25);
    const finalDamage = Math.round(baseDmg + perkDmgBonus);

    const fireRateReduction = 1 - (runPerks.rapidfire * 0.2);
    const finalFireRate = Math.max(0.04, wep.fireRate * fireRateReduction);

    const finalBulletCount = wep.bulletCount + runPerks.multishot;

    return {
      ...wep,
      damage: finalDamage,
      fireRate: finalFireRate,
      bulletCount: finalBulletCount
    };
  }

  // Player Shoot
  function shoot() {
    const stats = getActiveWeaponStats();
    playSound(stats.sound);

    const baseAngle = hero.angle;
    const count = stats.bulletCount;

    for (let i = 0; i < count; i++) {
      let spreadOffset = 0;
      if (count > 1) {
        spreadOffset = (i - (count - 1) / 2) * (stats.spread || 0.15);
      } else {
        spreadOffset = (Math.random() - 0.5) * (stats.spread || 0.06);
      }

      const finalAng = baseAngle + spreadOffset;
      const muzzleDist = hero.radius + 12;
      const bx = hero.x + Math.cos(baseAngle) * muzzleDist;
      const by = hero.y + Math.sin(baseAngle) * muzzleDist;

      bullets.push({
        x: bx,
        y: by,
        vx: Math.cos(finalAng) * stats.bulletSpeed,
        vy: Math.sin(finalAng) * stats.bulletSpeed,
        damage: stats.damage,
        color: stats.bulletColor,
        size: stats.bulletSize,
        piercing: stats.piercing || 1,
        isExplosive: stats.isExplosive || false,
        explosionRadius: stats.explosionRadius || 80,
        knockback: stats.knockback || 2,
        frost: runPerks.frost,
        life: 80
      });
    }

    // Gun Muzzle Flash Particles
    for (let p = 0; p < 4; p++) {
      const pAng = baseAngle + (Math.random() - 0.5) * 0.6;
      particles.push({
        x: hero.x + Math.cos(baseAngle) * 22,
        y: hero.y + Math.sin(baseAngle) * 22,
        vx: Math.cos(pAng) * (2 + Math.random() * 4),
        vy: Math.sin(pAng) * (2 + Math.random() * 4),
        color: stats.bulletColor,
        size: 2.5,
        alpha: 1
      });
    }
  }

  // Perform Tactical Dash
  function performDash() {
    if (hero.dashCooldown > 0 || hero.isDashing) return;
    hero.isDashing = true;
    hero.dashTimer = 0.22; // 220ms invincible dash
    hero.dashCooldown = 3.0; // 3 second cooldown
    playSound('pistol');

    // Dash Ghost Particles
    for (let i = 0; i < 6; i++) {
      particles.push({
        x: hero.x + (Math.random() - 0.5) * 15,
        y: hero.y + (Math.random() - 0.5) * 15,
        vx: -hero.vx * 0.5,
        vy: -hero.vy * 0.5,
        color: '#38bdf8',
        size: 8,
        alpha: 0.8
      });
    }
  }

  // Spawn Zombie
  function spawnZombie(isBoss = false) {
    // Spawn around arena perimeter
    let zx, zy;
    if (Math.random() < 0.5) {
      zx = Math.random() < 0.5 ? -20 : WORLD_WIDTH + 20;
      zy = Math.random() * WORLD_HEIGHT;
    } else {
      zx = Math.random() * WORLD_WIDTH;
      zy = Math.random() < 0.5 ? -20 : WORLD_HEIGHT + 20;
    }

    if (isBoss) {
      // Wave Boss Zombie
      zombies.push({
        x: zx,
        y: zy,
        type: 'boss',
        name: currentWave === 5 ? 'MUTANT BUTCHER' : 'TITAN OVERLORD',
        radius: 36,
        hp: 450 + currentWave * 150,
        maxHp: 450 + currentWave * 150,
        speed: 2.2,
        damage: 28,
        color: '#dc2626',
        skinColor: '#991b1b',
        xpValue: 120,
        coinValue: 25,
        isBoss: true,
        shootCooldown: 2.5
      });
      showWaveBanner(`⚠️ BOSS ENCOUNTER: ${currentWave === 5 ? 'MUTANT BUTCHER' : 'TITAN OVERLORD'} ⚠️`);
      return;
    }

    // Normal Enemy Varieties
    const r = Math.random();
    if (r < 0.6) {
      // Walker (Standard)
      zombies.push({
        x: zx,
        y: zy,
        type: 'walker',
        radius: 14,
        hp: 35 + currentWave * 8,
        maxHp: 35 + currentWave * 8,
        speed: 1.8 + Math.random() * 0.6,
        damage: 10,
        color: '#22c55e',
        skinColor: '#16a34a',
        xpValue: 10,
        coinValue: 1,
        frostTimer: 0
      });
    } else if (r < 0.85) {
      // Runner / Stalker (Fast Dog / Leaper)
      zombies.push({
        x: zx,
        y: zy,
        type: 'runner',
        radius: 11,
        hp: 22 + currentWave * 5,
        maxHp: 22 + currentWave * 5,
        speed: 3.4 + Math.random() * 0.8,
        damage: 8,
        color: '#f97316',
        skinColor: '#ea580c',
        xpValue: 15,
        coinValue: 2,
        frostTimer: 0
      });
    } else {
      // Spitter (Ranged Acid Shooter)
      zombies.push({
        x: zx,
        y: zy,
        type: 'spitter',
        radius: 15,
        hp: 40 + currentWave * 6,
        maxHp: 40 + currentWave * 6,
        speed: 1.4,
        damage: 12,
        color: '#a855f7',
        skinColor: '#9333ea',
        xpValue: 25,
        coinValue: 3,
        shootCooldown: 2.0 + Math.random() * 1.5,
        frostTimer: 0
      });
    }
  }

  // Trigger Barrel Explosion
  function explodeBarrel(barrel) {
    playSound('barrel');
    screenShake = 12;

    const blastRadius = 140;
    const blastDmg = 160;

    // Fire & Smoke Particles
    for (let i = 0; i < 35; i++) {
      const ang = Math.random() * Math.PI * 2;
      const spd = 2 + Math.random() * 8;
      particles.push({
        x: barrel.x,
        y: barrel.y,
        vx: Math.cos(ang) * spd,
        vy: Math.sin(ang) * spd,
        color: Math.random() < 0.5 ? '#f97316' : '#ef4444',
        size: 6 + Math.random() * 6,
        alpha: 1
      });
    }

    // Damage all zombies in blast radius
    zombies.forEach(z => {
      const dist = Math.hypot(z.x - barrel.x, z.y - barrel.y);
      if (dist < blastRadius) {
        damageZombie(z, blastDmg, Math.atan2(z.y - barrel.y, z.x - barrel.x), 8);
      }
    });

    // Damage hero if too close
    const heroDist = Math.hypot(hero.x - barrel.x, hero.y - barrel.y);
    if (heroDist < blastRadius * 0.75) {
      damageHero(25);
    }
  }

  // Damage Zombie
  function damageZombie(z, dmg, hitAngle, knockback = 3) {
    z.hp -= dmg;
    z.x += Math.cos(hitAngle) * knockback;
    z.y += Math.sin(hitAngle) * knockback;

    // Damage floating text popup
    floatingTexts.push({
      x: z.x + (Math.random() - 0.5) * 10,
      y: z.y - 10,
      text: `-${Math.round(dmg)}`,
      color: dmg > 50 ? '#facc15' : '#ffffff',
      alpha: 1
    });

    // Splat Decal & particles
    for (let p = 0; p < 3; p++) {
      particles.push({
        x: z.x,
        y: z.y,
        vx: (Math.random() - 0.5) * 3,
        vy: (Math.random() - 0.5) * 3,
        color: z.color,
        size: 3,
        alpha: 1
      });
    }

    if (z.hp <= 0) {
      killZombie(z);
    }
  }

  // Kill Zombie
  function killZombie(z) {
    kills++;
    score += z.isBoss ? 250 : 15;
    coins += z.coinValue;
    runCoins += z.coinValue;
    saveGameData();
    playSound('splat');

    // Spawn Blood Decal on Ground
    if (bloodDecals.length > 50) bloodDecals.shift();
    bloodDecals.push({
      x: z.x,
      y: z.y,
      radius: z.radius * (1.2 + Math.random() * 0.6),
      color: z.color,
      alpha: 0.45
    });

    // Drop XP Gem
    gems.push({
      x: z.x,
      y: z.y,
      value: z.xpValue,
      color: z.xpValue >= 100 ? '#facc15' : (z.xpValue >= 25 ? '#c084fc' : '#38bdf8')
    });

    // Chance to drop Medkit
    if (Math.random() < 0.07) {
      medkits.push({ x: z.x, y: z.y, heal: 35 });
    }

    const idx = zombies.indexOf(z);
    if (idx !== -1) zombies.splice(idx, 1);
  }

  // Damage Hero
  function damageHero(dmg) {
    if (hero.isDashing || isGameOver) return;

    if (hero.shield > 0) {
      hero.shield--;
      playSound('smg');
      floatingTexts.push({ x: hero.x, y: hero.y - 15, text: 'BLOCKED!', color: '#38bdf8', alpha: 1 });
      return;
    }

    const armorReduction = 1 - (passiveArmor * 0.06);
    const actualDmg = Math.max(1, dmg * armorReduction);
    hero.hp -= actualDmg;
    screenShake = 7;
    playSound('splat');

    floatingTexts.push({ x: hero.x, y: hero.y - 15, text: `-${Math.round(actualDmg)}`, color: '#ef4444', alpha: 1 });

    if (hero.hp <= 0) {
      hero.hp = 0;
      handleGameOver();
    }
  }

  // Add XP to Hero
  function addXP(amount) {
    hero.xp += amount;
    playSound('gem');

    if (hero.xp >= hero.xpNext) {
      hero.xp -= hero.xpNext;
      hero.level++;
      hero.xpNext = Math.round(hero.xpNext * 1.35);
      showLevelUpModal();
    }
  }

  // Show Level Up Perk Modal
  function showLevelUpModal() {
    isPaused = true;
    playSound('levelup');

    // Pick 3 random distinct perks from catalog
    const shuffled = [...PERK_CATALOG].sort(() => 0.5 - Math.random());
    const choices = shuffled.slice(0, 3);

    perkCardsGrid.innerHTML = '';
    choices.forEach(perk => {
      const card = document.createElement('div');
      card.className = 'perk-card-item';
      card.innerHTML = `
        <div class="perk-card-icon">${perk.icon}</div>
        <div class="perk-card-info">
          <div class="perk-card-name">${perk.name}</div>
          <div class="perk-card-desc">${perk.desc}</div>
        </div>
      `;
      card.addEventListener('click', () => {
        applyPerk(perk.id);
        levelupModal.style.display = 'none';
        isPaused = false;
      });
      perkCardsGrid.appendChild(card);
    });

    levelupModal.style.display = 'flex';
  }

  // Apply In-Run Perk
  function applyPerk(perkId) {
    if (perkId === 'multishot') runPerks.multishot++;
    else if (perkId === 'rapidfire') runPerks.rapidfire++;
    else if (perkId === 'damage') runPerks.damage++;
    else if (perkId === 'speed') {
      runPerks.speed++;
      hero.speed += 0.8;
    } else if (perkId === 'shield') hero.shield += 2;
    else if (perkId === 'frost') runPerks.frost = true;
    else if (perkId === 'orb') {
      runPerks.orbCount++;
      orbitingOrbs.push({ angle: (Math.PI * 2 * orbitingOrbs.length) / 3, dist: 55 });
    } else if (perkId === 'regen') {
      runPerks.regen = true;
      hero.hp = Math.min(hero.maxHp, hero.hp + 20);
    }
    updateHUD();
  }

  // Handle Game Over
  function handleGameOver() {
    isGameOver = true;
    const isNewBest = score > bestScore;
    if (isNewBest) {
      bestScore = score;
      saveGameData();
    }

    statWave.textContent = currentWave;
    statKills.textContent = kills;
    statCoins.textContent = `💰 ${runCoins}`;
    statScore.textContent = score;
    statNewBest.style.display = isNewBest ? 'block' : 'none';

    gameoverModal.style.display = 'flex';
  }

  // Update Game Loop Step
  function update(dt) {
    if (isGameOver || isPaused) return;

    // 1. Hero Movement
    let mx = 0, my = 0;
    if (keys['KeyW'] || keys['ArrowUp']) my -= 1;
    if (keys['KeyS'] || keys['ArrowDown']) my += 1;
    if (keys['KeyA'] || keys['ArrowLeft']) mx -= 1;
    if (keys['KeyD'] || keys['ArrowRight']) mx += 1;

    // Mobile Virtual Touch Joystick
    if (touchMove.active) {
      mx = touchMove.x;
      my = touchMove.y;
    }

    const moveMag = Math.hypot(mx, my);
    if (moveMag > 0.1) {
      const speed = hero.isDashing ? hero.speed * 2.6 : hero.speed;
      hero.vx = (mx / (moveMag > 1 ? moveMag : 1)) * speed;
      hero.vy = (my / (moveMag > 1 ? moveMag : 1)) * speed;
    } else {
      hero.vx *= 0.75;
      hero.vy *= 0.75;
    }

    hero.x += hero.vx;
    hero.y += hero.vy;

    // Clamp inside world bounds
    hero.x = Math.max(hero.radius, Math.min(WORLD_WIDTH - hero.radius, hero.x));
    hero.y = Math.max(hero.radius, Math.min(WORLD_HEIGHT - hero.radius, hero.y));

    // Dash Timers
    if (hero.isDashing) {
      hero.dashTimer -= dt;
      if (hero.dashTimer <= 0) hero.isDashing = false;
    }
    if (hero.dashCooldown > 0) {
      hero.dashCooldown -= dt;
    }

    // 2. Hero Aim Direction
    if (touchAim.active) {
      hero.angle = Math.atan2(touchAim.y, touchAim.x);
    } else if (autoFire && !mousePos.isDown && !mousePos.hasMoved) {
      // Auto aim when player is idle and autofire is active
      let nearestZombie = null;
      let minDist = 450;
      zombies.forEach(z => {
        const d = Math.hypot(z.x - hero.x, z.y - hero.y);
        if (d < minDist) {
          minDist = d;
          nearestZombie = z;
        }
      });
      if (nearestZombie) {
        hero.angle = Math.atan2(nearestZombie.y - hero.y, nearestZombie.x - hero.x);
      }
    } else {
      // ALWAYS aim directly at mouse in world coordinates
      const worldMouseX = mousePos.x + camera.x;
      const worldMouseY = mousePos.y + camera.y;
      hero.angle = Math.atan2(worldMouseY - hero.y, worldMouseX - hero.x);
    }

    // 3. Shooting Logic
    const stats = getActiveWeaponStats();
    shootTimer += dt;

    const wantsToShoot = mousePos.isDown || touchAim.active || autoFire;
    if (wantsToShoot && shootTimer >= stats.fireRate) {
      shoot();
      shootTimer = 0;
    }

    // 4. Update Orbiting Orbs Perk
    orbitingOrbs.forEach(orb => {
      orb.angle += 3.5 * dt;
      const ox = hero.x + Math.cos(orb.angle) * orb.dist;
      const oy = hero.y + Math.sin(orb.angle) * orb.dist;

      zombies.forEach(z => {
        if (Math.hypot(z.x - ox, z.y - oy) < z.radius + 14) {
          damageZombie(z, 28 * dt * 6, orb.angle, 2);
        }
      });
    });

    // 5. Update Wave Progression
    waveTimer += dt;
    if (waveTimer >= waveDuration && !isWaveTransition) {
      // Wave Complete!
      isWaveTransition = true;
      currentWave++;
      showWaveBanner(`🎉 WAVE ${currentWave - 1} CLEARED! PREPARE FOR WAVE ${currentWave}!`);

      setTimeout(() => {
        waveTimer = 0;
        isWaveTransition = false;
        waveZombiesToSpawn = 12 + currentWave * 6;
        waveZombiesSpawned = 0;

        // Boss on every 5th wave!
        if (currentWave % 5 === 0) {
          spawnZombie(true);
        }
      }, 3000);
    }

    // Spawn Wave Zombies
    spawnTimer += dt;
    const spawnRate = Math.max(0.35, 1.4 - currentWave * 0.08);
    if (!isWaveTransition && waveZombiesSpawned < waveZombiesToSpawn && spawnTimer >= spawnRate) {
      spawnZombie(false);
      waveZombiesSpawned++;
      spawnTimer = 0;
    }

    // 6. Update Zombies AI
    zombies.forEach(z => {
      // Speed modifier (Frost)
      if (z.frostTimer > 0) z.frostTimer -= dt;
      const currentSpeed = z.frostTimer > 0 ? z.speed * 0.6 : z.speed;

      const toHeroAngle = Math.atan2(hero.y - z.y, hero.x - z.x);
      z.x += Math.cos(toHeroAngle) * currentSpeed;
      z.y += Math.sin(toHeroAngle) * currentSpeed;

      // Contact attack
      const dist = Math.hypot(hero.x - z.x, hero.y - z.y);
      if (dist < hero.radius + z.radius) {
        damageHero(z.damage);
      }

      // Spitter ranged attack
      if (z.type === 'spitter' || z.type === 'boss') {
        z.shootCooldown = (z.shootCooldown || 2) - dt;
        if (z.shootCooldown <= 0 && dist < 420) {
          enemyBullets.push({
            x: z.x,
            y: z.y,
            vx: Math.cos(toHeroAngle) * 5.5,
            vy: Math.sin(toHeroAngle) * 5.5,
            damage: z.damage,
            radius: z.type === 'boss' ? 7 : 4,
            color: '#a855f7'
          });
          z.shootCooldown = z.type === 'boss' ? 1.8 : 2.5;
        }
      }
    });

    // 7. Update Bullets
    for (let i = bullets.length - 1; i >= 0; i--) {
      const b = bullets[i];
      b.x += b.vx;
      b.y += b.vy;
      b.life--;

      if (b.life <= 0 || b.x < 0 || b.x > WORLD_WIDTH || b.y < 0 || b.y > WORLD_HEIGHT) {
        bullets.splice(i, 1);
        continue;
      }

      // Check hit with Explosive Barrels
      for (const barrel of explosiveBarrels) {
        if (Math.hypot(b.x - barrel.x, b.y - barrel.y) < barrel.radius + b.size) {
          barrel.hp -= b.damage;
          if (barrel.hp <= 0) {
            explodeBarrel(barrel);
            explosiveBarrels.splice(explosiveBarrels.indexOf(barrel), 1);
          }
          bullets.splice(i, 1);
          break;
        }
      }

      // Check hit with Zombies
      for (const z of zombies) {
        if (Math.hypot(b.x - z.x, b.y - z.y) < z.radius + b.size) {
          const hitAngle = Math.atan2(b.vy, b.vx);
          damageZombie(z, b.damage, hitAngle, b.knockback);

          if (b.frost) z.frostTimer = 3.0;

          if (b.isExplosive) {
            // Rocket AOE explosion
            playSound('rocket');
            screenShake = 6;
            zombies.forEach(otherZ => {
              if (otherZ !== z && Math.hypot(otherZ.x - b.x, otherZ.y - b.y) < b.explosionRadius) {
                damageZombie(otherZ, b.damage * 0.75, Math.atan2(otherZ.y - b.y, otherZ.x - b.x), 5);
              }
            });
          }

          b.piercing--;
          if (b.piercing <= 0) {
            bullets.splice(i, 1);
            break;
          }
        }
      }
    }

    // 8. Update Enemy Bullets
    for (let i = enemyBullets.length - 1; i >= 0; i--) {
      const eb = enemyBullets[i];
      eb.x += eb.vx;
      eb.y += eb.vy;

      if (Math.hypot(eb.x - hero.x, eb.y - hero.y) < hero.radius + eb.radius) {
        damageHero(eb.damage);
        enemyBullets.splice(i, 1);
        continue;
      }

      if (eb.x < 0 || eb.x > WORLD_WIDTH || eb.y < 0 || eb.y > WORLD_HEIGHT) {
        enemyBullets.splice(i, 1);
      }
    }

    // 9. Magnet & Collect XP Gems
    for (let i = gems.length - 1; i >= 0; i--) {
      const g = gems[i];
      const dist = Math.hypot(hero.x - g.x, hero.y - g.y);
      if (dist < 140) {
        // Magnet suction towards hero
        const ang = Math.atan2(hero.y - g.y, hero.x - g.x);
        g.x += Math.cos(ang) * 9;
        g.y += Math.sin(ang) * 9;
      }
      if (dist < hero.radius + 12) {
        addXP(g.value);
        gems.splice(i, 1);
      }
    }

    // 10. Collect Medkits
    for (let i = medkits.length - 1; i >= 0; i--) {
      const med = medkits[i];
      if (Math.hypot(hero.x - med.x, hero.y - med.y) < hero.radius + 16) {
        hero.hp = Math.min(hero.maxHp, hero.hp + med.heal);
        playSound('gem');
        floatingTexts.push({ x: hero.x, y: hero.y - 15, text: `+${med.heal} HP`, color: '#4ade80', alpha: 1 });
        medkits.splice(i, 1);
      }
    }

    // 11. Passive Regen Perk
    if (runPerks.regen && Math.random() < 0.015) {
      hero.hp = Math.min(hero.maxHp, hero.hp + 1);
    }

    // 12. Floating Text & Particles Update
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const ft = floatingTexts[i];
      ft.y -= 0.8;
      ft.alpha -= 0.025;
      if (ft.alpha <= 0) floatingTexts.splice(i, 1);
    }

    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.alpha -= 0.03;
      if (p.alpha <= 0) particles.splice(i, 1);
    }

    // 13. Smooth Camera Follow
    camera.x += (hero.x - camera.width / 2 - camera.x) * 0.12;
    camera.y += (hero.y - camera.height / 2 - camera.y) * 0.12;
    camera.x = Math.max(0, Math.min(WORLD_WIDTH - camera.width, camera.x));
    camera.y = Math.max(0, Math.min(WORLD_HEIGHT - camera.height, camera.y));

    if (screenShake > 0) screenShake *= 0.82;

    updateHUD();
  }

  // Render Game Scene
  function render() {
    const dpr = window.devicePixelRatio || 1;
    ctx.save();
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, camera.width, camera.height);

    if (screenShake > 0.5) {
      ctx.translate((Math.random() - 0.5) * screenShake, (Math.random() - 0.5) * screenShake);
    }

    // Camera Translate
    ctx.translate(-camera.x, -camera.y);

    // 1. Arena Floor Grid & Boundary
    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // Grid Lines
    ctx.strokeStyle = '#1e293b';
    ctx.lineWidth = 2;
    const gridSize = 60;
    for (let gx = 0; gx <= WORLD_WIDTH; gx += gridSize) {
      ctx.beginPath();
      ctx.moveTo(gx, 0); ctx.lineTo(gx, WORLD_HEIGHT);
      ctx.stroke();
    }
    for (let gy = 0; gy <= WORLD_HEIGHT; gy += gridSize) {
      ctx.beginPath();
      ctx.moveTo(0, gy); ctx.lineTo(WORLD_WIDTH, gy);
      ctx.stroke();
    }

    // Arena Perimeter Wall
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 6;
    ctx.strokeRect(0, 0, WORLD_WIDTH, WORLD_HEIGHT);

    // 2. Blood Decals on Ground
    bloodDecals.forEach(b => {
      ctx.save();
      ctx.globalAlpha = b.alpha;
      ctx.fillStyle = b.color;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 3. Medkits & Crates
    medkits.forEach(med => {
      ctx.fillStyle = '#ffffff';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.roundRect(med.x - 12, med.y - 12, 24, 24, 5);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#ef4444';
      ctx.font = '16px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('➕', med.x, med.y);
    });

    // 4. Explosive Barrels
    explosiveBarrels.forEach(bar => {
      ctx.save();
      ctx.fillStyle = '#dc2626';
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bar.x, bar.y, bar.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Hazard Stripes
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(bar.x, bar.y, bar.radius * 0.6, 0, Math.PI * 2);
      ctx.stroke();

      ctx.font = '14px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      ctx.fillText('🔥', bar.x, bar.y);
      ctx.restore();
    });

    // 5. XP Gems
    gems.forEach(g => {
      ctx.save();
      ctx.fillStyle = g.color;
      ctx.shadowColor = g.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.moveTo(g.x, g.y - 7);
      ctx.lineTo(g.x + 6, g.y);
      ctx.lineTo(g.x, g.y + 7);
      ctx.lineTo(g.x - 6, g.y);
      ctx.closePath();
      ctx.fill();
      ctx.restore();
    });

    // 6. Dynamic Flashlight Cone & Hero Shadow
    ctx.save();
    ctx.fillStyle = 'rgba(254, 240, 138, 0.12)';
    ctx.beginPath();
    ctx.moveTo(hero.x, hero.y);
    ctx.arc(hero.x, hero.y, 220, hero.angle - 0.45, hero.angle + 0.45);
    ctx.closePath();
    ctx.fill();
    ctx.restore();

    // 7. Zombies Rendering
    zombies.forEach(z => {
      ctx.save();
      ctx.translate(z.x, z.y);

      // Frost slow glow
      if (z.frostTimer > 0) {
        ctx.strokeStyle = '#38bdf8';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.arc(0, 0, z.radius + 3, 0, Math.PI * 2);
        ctx.stroke();
      }

      // Zombie Body
      ctx.fillStyle = z.color;
      ctx.strokeStyle = '#0f172a';
      ctx.lineWidth = z.isBoss ? 4 : 2.5;
      ctx.beginPath();
      ctx.arc(0, 0, z.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Zombie Arms / Face
      const toHero = Math.atan2(hero.y - z.y, hero.x - z.x);
      ctx.rotate(toHero);

      ctx.fillStyle = z.skinColor;
      ctx.beginPath();
      ctx.arc(z.radius * 0.6, -z.radius * 0.4, z.radius * 0.25, 0, Math.PI * 2);
      ctx.arc(z.radius * 0.6, z.radius * 0.4, z.radius * 0.25, 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();

      // Boss Health Bar on top
      if (z.isBoss) {
        ctx.rotate(-toHero);
        ctx.fillStyle = '#334155';
        ctx.fillRect(-z.radius, -z.radius - 12, z.radius * 2, 6);
        ctx.fillStyle = '#ef4444';
        ctx.fillRect(-z.radius, -z.radius - 12, (z.hp / z.maxHp) * (z.radius * 2), 6);
      }

      ctx.restore();
    });

    // 8. Bullets
    bullets.forEach(b => {
      ctx.save();
      ctx.fillStyle = b.color;
      ctx.shadowColor = b.color;
      ctx.shadowBlur = 6;
      ctx.beginPath();
      ctx.arc(b.x, b.y, b.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    enemyBullets.forEach(eb => {
      ctx.save();
      ctx.fillStyle = eb.color;
      ctx.shadowColor = eb.color;
      ctx.shadowBlur = 8;
      ctx.beginPath();
      ctx.arc(eb.x, eb.y, eb.radius, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 9. Orbiting Orbs
    orbitingOrbs.forEach(orb => {
      const ox = hero.x + Math.cos(orb.angle) * orb.dist;
      const oy = hero.y + Math.sin(orb.angle) * orb.dist;
      ctx.save();
      ctx.fillStyle = '#38bdf8';
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 12;
      ctx.beginPath();
      ctx.arc(ox, oy, 9, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    // 10. Hero Survivor
    ctx.save();
    ctx.translate(hero.x, hero.y);

    // Energy Shield Bubble
    if (hero.shield > 0) {
      ctx.strokeStyle = '#38bdf8';
      ctx.lineWidth = 3;
      ctx.shadowColor = '#38bdf8';
      ctx.shadowBlur = 10;
      ctx.beginPath();
      ctx.arc(0, 0, hero.radius + 6, 0, Math.PI * 2);
      ctx.stroke();
    }

    ctx.rotate(hero.angle);

    // Survivor Body
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(0, 0, hero.radius, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Survivor Hands & Gun Barrel
    ctx.fillStyle = '#475569';
    ctx.fillRect(hero.radius * 0.4, -4, 14, 8);
    ctx.strokeStyle = '#0f172a';
    ctx.strokeRect(hero.radius * 0.4, -4, 14, 8);

    ctx.restore();

    // 11. Particles & Floating Texts
    particles.forEach(p => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, p.alpha);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    });

    floatingTexts.forEach(ft => {
      ctx.save();
      ctx.globalAlpha = Math.max(0, ft.alpha);
      ctx.fillStyle = ft.color;
      ctx.font = 'bold 14px "Fredoka", sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(ft.text, ft.x, ft.y);
      ctx.restore();
    });

    // 12. Laser Sight & Crosshair Reticle
    if (!touchAim.active) {
      const worldMouseX = mousePos.x + camera.x;
      const worldMouseY = mousePos.y + camera.y;

      // Laser aiming guide line
      ctx.save();
      ctx.strokeStyle = 'rgba(239, 68, 68, 0.35)';
      ctx.lineWidth = 1.5;
      ctx.setLineDash([4, 4]);
      ctx.beginPath();
      ctx.moveTo(hero.x, hero.y);
      ctx.lineTo(worldMouseX, worldMouseY);
      ctx.stroke();

      // Crosshair Reticle
      ctx.strokeStyle = '#ef4444';
      ctx.lineWidth = 2;
      ctx.setLineDash([]);
      ctx.beginPath();
      ctx.arc(worldMouseX, worldMouseY, 8, 0, Math.PI * 2);
      ctx.stroke();

      ctx.beginPath();
      ctx.arc(worldMouseX, worldMouseY, 2, 0, Math.PI * 2);
      ctx.fillStyle = '#ef4444';
      ctx.fill();
      ctx.restore();
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

  // Armory Shop UI
  function openArmory() {
    isPaused = true;
    armoryCoins.textContent = `💰 ${coins}`;

    // Render Weapons Tab
    armoryWeaponsGrid.innerHTML = '';
    WEAPONS.forEach(wep => {
      const isUnlocked = unlockedWeapons.includes(wep.id);
      const isEquipped = equippedWeaponId === wep.id;
      const tier = weaponTiers[wep.id] || 1;

      const item = document.createElement('div');
      item.className = `armory-item ${isEquipped ? 'equipped' : ''}`;
      item.innerHTML = `
        <div class="armory-item-left">
          <span class="armory-item-icon">${wep.icon}</span>
          <div>
            <div class="armory-item-name">${wep.name}</div>
            <div class="armory-item-tier">⭐ TIER ${tier}/${wep.maxTier} (DMG: ${Math.round(wep.damage * (1 + (tier - 1) * 0.25))})</div>
          </div>
        </div>
        <button class="armory-btn-buy ${isEquipped ? 'equipped-btn' : ''}" id="buy-${wep.id}">
          ${isEquipped ? 'EQUIPPED' : (isUnlocked ? (tier < wep.maxTier ? `UPGRADE 💰${wep.upgradeCost * tier}` : 'EQUIP') : `UNLOCK 💰${wep.price}`)}
        </button>
      `;

      item.querySelector(`#buy-${wep.id}`).addEventListener('click', () => {
        if (isEquipped) {
          if (tier < wep.maxTier && coins >= wep.upgradeCost * tier) {
            coins -= wep.upgradeCost * tier;
            weaponTiers[wep.id] = tier + 1;
            saveGameData();
            openArmory();
            playSound('levelup');
          }
        } else if (isUnlocked) {
          equippedWeaponId = wep.id;
          saveGameData();
          openArmory();
          updateHUD();
        } else if (coins >= wep.price) {
          coins -= wep.price;
          unlockedWeapons.push(wep.id);
          equippedWeaponId = wep.id;
          saveGameData();
          openArmory();
          updateHUD();
          playSound('levelup');
        }
      });

      armoryWeaponsGrid.appendChild(item);
    });

    // Render Stats Tab
    armoryStatsGrid.innerHTML = `
      <div class="armory-item">
        <div class="armory-item-left">
          <span class="armory-item-icon">❤️</span>
          <div>
            <div class="armory-item-name">Max Health (+25 HP)</div>
            <div class="armory-item-tier">LVL ${passiveMaxHpLevel}/5</div>
          </div>
        </div>
        <button class="armory-btn-buy" id="btn-up-hp">UPGRADE 💰${(passiveMaxHpLevel + 1) * 75}</button>
      </div>
      <div class="armory-item">
        <div class="armory-item-left">
          <span class="armory-item-icon">🛡️</span>
          <div>
            <div class="armory-item-name">Body Armor (+6% Reduc)</div>
            <div class="armory-item-tier">LVL ${passiveArmor}/5</div>
          </div>
        </div>
        <button class="armory-btn-buy" id="btn-up-armor">UPGRADE 💰${(passiveArmor + 1) * 90}</button>
      </div>
      <div class="armory-item">
        <div class="armory-item-left">
          <span class="armory-item-icon">🥾</span>
          <div>
            <div class="armory-item-name">Running Speed</div>
            <div class="armory-item-tier">LVL ${passiveSpeedLevel}/5</div>
          </div>
        </div>
        <button class="armory-btn-buy" id="btn-up-spd">UPGRADE 💰${(passiveSpeedLevel + 1) * 80}</button>
      </div>
    `;

    armoryStatsGrid.querySelector('#btn-up-hp')?.addEventListener('click', () => {
      const cost = (passiveMaxHpLevel + 1) * 75;
      if (passiveMaxHpLevel < 5 && coins >= cost) {
        coins -= cost;
        passiveMaxHpLevel++;
        saveGameData();
        openArmory();
        playSound('levelup');
      }
    });

    armoryStatsGrid.querySelector('#btn-up-armor')?.addEventListener('click', () => {
      const cost = (passiveArmor + 1) * 90;
      if (passiveArmor < 5 && coins >= cost) {
        coins -= cost;
        passiveArmor++;
        saveGameData();
        openArmory();
        playSound('levelup');
      }
    });

    armoryStatsGrid.querySelector('#btn-up-spd')?.addEventListener('click', () => {
      const cost = (passiveSpeedLevel + 1) * 80;
      if (passiveSpeedLevel < 5 && coins >= cost) {
        coins -= cost;
        passiveSpeedLevel++;
        saveGameData();
        openArmory();
        playSound('levelup');
      }
    });

    armoryModal.style.display = 'flex';
  }

  // Resize Handler
  function handleResize() {
    const rect = canvas.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    camera.width = rect.width || wrapper.clientWidth || 600;
    camera.height = rect.height || wrapper.clientHeight || 440;

    canvas.width = Math.floor(camera.width * dpr);
    canvas.height = Math.floor(camera.height * dpr);
  }

  // Fullscreen Toggle
  function toggleFullscreen() {
    document.body.classList.toggle('is-fullscreen');
    setTimeout(handleResize, 100);
  }

  // Event Listeners: Keyboard & Mouse
  window.addEventListener('keydown', (e) => {
    keys[e.code] = true;
    if (e.code === 'Space') {
      e.preventDefault();
      performDash();
    }
  });

  window.addEventListener('keyup', (e) => {
    keys[e.code] = false;
  });

  function updateMouse(e) {
    const rect = canvas.getBoundingClientRect();
    if (rect.width > 0 && rect.height > 0) {
      mousePos.x = (e.clientX - rect.left) * (camera.width / rect.width);
      mousePos.y = (e.clientY - rect.top) * (camera.height / rect.height);
      mousePos.hasMoved = true;
    }
  }

  window.addEventListener('mousemove', updateMouse);

  window.addEventListener('mousedown', (e) => {
    if (e.target === canvas || wrapper.contains(e.target)) {
      if (e.button === 0) {
        mousePos.isDown = true;
        updateMouse(e);
      }
    }
  });

  window.addEventListener('mouseup', () => {
    mousePos.isDown = false;
  });

  // Mobile Virtual Touch Joystick Setup
  const isTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0;
  if (isTouch) {
    touchControls.style.display = 'block';
  }

  const joyLeft = document.getElementById('joystick-left');
  const knobLeft = document.getElementById('stick-knob-left');

  function handleTouchJoystick(zone, knob, state) {
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
          const maxDist = 38;
          const angle = Math.atan2(dy, dx);
          const clampedDist = Math.min(dist, maxDist);

          knob.style.transform = `translate(${Math.cos(angle) * clampedDist}px, ${Math.sin(angle) * clampedDist}px)`;
          state.x = Math.cos(angle) * (clampedDist / maxDist);
          state.y = Math.sin(angle) * (clampedDist / maxDist);
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

  handleTouchJoystick(joyLeft, knobLeft, touchMove);

  const joyRight = document.getElementById('joystick-right');
  const knobRight = document.getElementById('stick-knob-right');
  handleTouchJoystick(joyRight, knobRight, touchAim);

  btnTouchDash.addEventListener('click', performDash);

  // Armory Tab Switching
  armoryTabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      armoryTabBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const tab = btn.dataset.tab;
      armoryWeaponsGrid.style.display = tab === 'weapons' ? 'flex' : 'none';
      armoryStatsGrid.style.display = tab === 'stats' ? 'flex' : 'none';
    });
  });

  btnArmory.addEventListener('click', openArmory);
  btnModalArmory.addEventListener('click', () => {
    gameoverModal.style.display = 'none';
    openArmory();
  });
  btnArmoryClose.addEventListener('click', () => {
    armoryModal.style.display = 'none';
    if (!isGameOver) isPaused = false;
  });

  btnAutofire.addEventListener('click', () => {
    autoFire = !autoFire;
    updateHUD();
  });

  btnSound.addEventListener('click', () => {
    soundEnabled = !soundEnabled;
    btnSound.textContent = soundEnabled ? '🔊' : '🔇';
  });

  btnFullscreen.addEventListener('click', toggleFullscreen);
  btnModalRestart.addEventListener('click', initRun);

  window.addEventListener('resize', handleResize);
  setTimeout(handleResize, 50);

  // Initialize Run
  loadSavedData();
  initRun();
  requestAnimationFrame(gameLoop);
})();
