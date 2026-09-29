// Animal Master Data & Human Match Algorithms

export const ANIMALS = [
  {
    id: 'ant',
    name: 'Superhero Leafcutter Ant',
    emoji: '🐜',
    svgType: 'ant',
    category: 'Insect',
    tagline: 'Tiny but insanely superpowered strength!',
    color: '#ef4444', // Red
    bgColor: '#fee2e2',
    iq: 45,
    weightKg: 0.000005, // 5mg
    weightDisplay: '0.005 g',
    heightCm: 0.8,
    heightDisplay: '0.8 cm',
    lifespanYears: 1,
    deadliftKg: 0.00025, // 50x body weight!
    relativeStrength: 50, // x body weight
    pullingForceN: 0.05,
    topSpeedKmh: 0.3,
    jumpCm: 1.5,
    dailyCalories: 0.001,
    waterLiters: 0.0001,
    sleepHours: 4,
    dietType: 'Fungus & Nectar',
    dietFact: 'Ants farm fungus underground using chewed leafpaste! Leafcutters carry leaves 50x their weight with their jaws.',
    funFact: 'Relative to its body size, if an ant were human-sized, it could lift a school bus over its head!'
  },
  {
    id: 'flea',
    name: 'Bounce Champion Flea',
    emoji: '🪲',
    svgType: 'flea',
    category: 'Insect',
    tagline: 'The ultimate catapult of the animal kingdom!',
    color: '#854d0e',
    bgColor: '#fef3c7',
    iq: 10,
    weightKg: 0.0000005,
    weightDisplay: '0.0005 g',
    heightCm: 0.2,
    heightDisplay: '2 mm',
    lifespanYears: 0.3,
    deadliftKg: 0.00001,
    relativeStrength: 20,
    pullingForceN: 0.01,
    topSpeedKmh: 4.8,
    jumpCm: 18, // 100x body length!
    relativeJump: 90, // x body height
    dailyCalories: 0.0005,
    waterLiters: 0.0001,
    sleepHours: 1,
    dietType: 'Nutrient Drops',
    dietFact: 'Fleas jump up to 200 times per hour continuously searching for host meals.',
    funFact: 'Fleas store elastic protein called resilin in their knees like compressed springs to launch themselves into orbit!'
  },
  {
    id: 'hummingbird',
    name: 'Hyperdrive Hummingbird',
    emoji: '🐦',
    svgType: 'hummingbird',
    category: 'Bird',
    tagline: 'Heart beating 1,200 times per minute!',
    color: '#06b6d4',
    bgColor: '#cff4fc',
    iq: 75,
    weightKg: 0.004,
    weightDisplay: '4 g',
    heightCm: 8,
    heightDisplay: '8 cm',
    lifespanYears: 4,
    deadliftKg: 0.002,
    relativeStrength: 0.5,
    pullingForceN: 0.1,
    topSpeedKmh: 54,
    jumpCm: 5,
    dailyCalories: 10, // consumes 2x body weight in sugar water daily!
    waterLiters: 0.02,
    sleepHours: 12, // Torpor mode!
    dietType: 'Nectar & Bugs',
    dietFact: 'Hummingbirds eat every 10 to 15 minutes, consuming 200% of their body weight in sugar every single day!',
    funFact: 'At night, hummingbirds enter a state called torpor, slowing their heart rate from 1,200 bpm down to 50 bpm to avoid starving!'
  },
  {
    id: 'sloth',
    name: 'Chill Master Sloth',
    emoji: '🦥',
    svgType: 'sloth',
    category: 'Mammal',
    tagline: 'Slow, steady, and 100% unbothered!',
    color: '#d97706',
    bgColor: '#fef3c7',
    iq: 60,
    weightKg: 6,
    weightDisplay: '6 kg',
    heightCm: 60,
    heightDisplay: '60 cm',
    lifespanYears: 20,
    deadliftKg: 12,
    relativeStrength: 2,
    pullingForceN: 150,
    topSpeedKmh: 0.24, // 0.15 mph!
    jumpCm: 0, // Cannot jump!
    dailyCalories: 110, // Tiny calorie intake!
    waterLiters: 0.2,
    sleepHours: 18,
    dietType: 'Tree Leaves',
    dietFact: 'It takes a sloth up to 30 full days (1 month!) to digest a single mouthful of leaves.',
    funFact: 'Sloths swim 3 times faster in water than they can crawl on land!'
  },
  {
    id: 'crow',
    name: 'Genius Puzzle Crow',
    emoji: '🦅',
    svgType: 'crow',
    category: 'Bird',
    tagline: 'Solves complex multi-step mechanical puzzles!',
    color: '#334155',
    bgColor: '#e2e8f0',
    iq: 105,
    weightKg: 0.6,
    weightDisplay: '600 g',
    heightCm: 45,
    heightDisplay: '45 cm',
    lifespanYears: 14,
    deadliftKg: 0.3,
    relativeStrength: 0.5,
    pullingForceN: 15,
    topSpeedKmh: 60,
    jumpCm: 25,
    dailyCalories: 180,
    waterLiters: 0.05,
    sleepHours: 9,
    dietType: 'Nuts, Seeds & Grubs',
    dietFact: 'Crows drop hard nuts onto pedestrian crosswalks so passing cars crack them open, then wait for the walk signal to safely retrieve them!',
    funFact: 'Crows remember individual human faces for years and teach their friends which humans are nice vs mean!'
  },
  {
    id: 'cheetah',
    name: 'Turbo Speed Cheetah',
    emoji: '🐆',
    svgType: 'cheetah',
    category: 'Mammal',
    tagline: '0 to 60 mph in under 3 seconds!',
    color: '#eab308',
    bgColor: '#fef9c3',
    iq: 85,
    weightKg: 45,
    weightDisplay: '45 kg',
    heightCm: 90,
    heightDisplay: '90 cm',
    lifespanYears: 12,
    deadliftKg: 65,
    relativeStrength: 1.4,
    pullingForceN: 600,
    topSpeedKmh: 112, // 70 mph!
    jumpCm: 250, // 8.2 ft jump
    dailyCalories: 3500,
    waterLiters: 3,
    sleepHours: 12,
    dietType: 'Fresh Meat (Antelope)',
    dietFact: 'Cheetahs need to eat fast after a sprint hunt before bigger predators like lions try to steal their meal.',
    funFact: 'During full sprint, a cheetah’s flexible spine expands and contracts like a giant spring, spending more time airborne than touching the ground!'
  },
  {
    id: 'chimp',
    name: 'Clever Chimp',
    emoji: '🐒',
    svgType: 'chimp',
    category: 'Primate',
    tagline: 'Master of tools & quick pattern memory!',
    color: '#78350f',
    bgColor: '#fde68a',
    iq: 125,
    weightKg: 50,
    weightDisplay: '50 kg',
    heightCm: 120,
    heightDisplay: '120 cm',
    lifespanYears: 45,
    deadliftKg: 200, // 4x human muscle density per kg!
    relativeStrength: 4,
    pullingForceN: 2500,
    topSpeedKmh: 40,
    jumpCm: 140,
    dailyCalories: 2500,
    waterLiters: 2.5,
    sleepHours: 10,
    dietType: 'Fruit, Leaves & Insects',
    dietFact: 'Chimpanzees use stones as hammers to crack palm nuts and fashion leafy sponges to drink rainwater from tree hollows.',
    funFact: 'A adult chimpanzee has fast-twitch muscle fibers that make them up to 1.5x to 2x stronger than a human of identical body mass!'
  },
  {
    id: 'dolphin',
    name: 'Sonar Dolphin',
    emoji: '🐬',
    svgType: 'dolphin',
    category: 'Marine Mammal',
    tagline: 'Whistles in unique names & uses 3D echolocation!',
    color: '#0284c7',
    bgColor: '#e0f2fe',
    iq: 135,
    weightKg: 180,
    weightDisplay: '180 kg',
    heightCm: 250,
    heightDisplay: '2.5 meters',
    lifespanYears: 40,
    deadliftKg: 300,
    relativeStrength: 1.6,
    pullingForceN: 3500,
    topSpeedKmh: 54,
    jumpCm: 450, // 15 ft out of water!
    dailyCalories: 15000,
    waterLiters: 10, // Absorbs water from fish food!
    sleepHours: 8, // Sleeps with 1 brain hemisphere at a time!
    dietType: 'Fish & Squid',
    dietFact: 'Dolphins do not drink ocean seawater—they extract 100% of their hydration directly from the fresh fish they eat!',
    funFact: 'Dolphins sleep with only half of their brain at a time, keeping one eye open so they can keep breathing and watching for sharks!'
  },
  {
    id: 'kangaroo',
    name: 'Big Bouncer Kangaroo',
    emoji: '🦘',
    svgType: 'kangaroo',
    category: 'Marsupial',
    tagline: 'Powerful tail & spring-loaded legs!',
    color: '#ea580c',
    bgColor: '#ffedd5',
    iq: 70,
    weightKg: 85,
    weightDisplay: '85 kg',
    heightCm: 180,
    heightDisplay: '1.8 meters',
    lifespanYears: 20,
    deadliftKg: 170,
    relativeStrength: 2,
    pullingForceN: 2000,
    topSpeedKmh: 70,
    jumpCm: 300, // 10 ft vertical, 25 ft long jump!
    dailyCalories: 3000,
    waterLiters: 1.5,
    sleepHours: 10,
    dietType: 'Grasses & Shrubs',
    dietFact: 'Kangaroos can survive for months without drinking water because their digestive system recycles moisture from dry grasses.',
    funFact: 'When hopping at top speed, kangaroos actually use LESS energy than at slow speeds because their leg tendons bounce like giant pogo sticks!'
  },
  {
    id: 'gorilla',
    name: 'Mighty Silverback Gorilla',
    emoji: '🦍',
    svgType: 'gorilla',
    category: 'Primate',
    tagline: 'Absolute king of power, heart, and presence!',
    color: '#1e293b',
    bgColor: '#cbd5e1',
    iq: 130,
    weightKg: 180,
    weightDisplay: '180 kg',
    heightCm: 175,
    heightDisplay: '1.75 meters',
    lifespanYears: 40,
    deadliftKg: 900, // Up to 900kg (2000 lbs) deadlift force!
    relativeStrength: 5,
    pullingForceN: 9000,
    topSpeedKmh: 40,
    jumpCm: 120,
    dailyCalories: 18000, // Eats ~18-20 kg of fibrous veggies daily
    waterLiters: 5,
    sleepHours: 12,
    dietType: 'Bamboo, Bark & Fruit',
    dietFact: 'A Silverback Gorilla eats 18 kg (40 lbs) of bamboo shoots, stems, and leaves every single day!',
    funFact: 'A adult male Silverback Gorilla can deadlift up to 900 kg (2,000 lbs)—that is over 4 times the world record of most gym lifters!'
  },
  {
    id: 'panda',
    name: 'Bamboo King Panda',
    emoji: '🐼',
    svgType: 'panda',
    category: 'Mammal',
    tagline: 'Professional eater, tumbler, and nap enthusiast!',
    color: '#000000',
    bgColor: '#f1f5f9',
    iq: 80,
    weightKg: 110,
    weightDisplay: '110 kg',
    heightCm: 150,
    heightDisplay: '1.5 meters',
    lifespanYears: 20,
    deadliftKg: 250,
    relativeStrength: 2.2,
    pullingForceN: 2200,
    topSpeedKmh: 32,
    jumpCm: 60,
    dailyCalories: 12000,
    waterLiters: 8,
    sleepHours: 14,
    dietType: '100% Bamboo Leaves & Stems',
    dietFact: 'Pandas spend 12 to 16 hours EVERY day chewing bamboo, munching up to 38 kg (84 lbs) of green bamboo daily!',
    funFact: 'Pandas have a specialized "sixth thumb" wrist bone to help them grip slippery bamboo shoots with precision while eating!'
  },
  {
    id: 'elephant',
    name: 'Titan African Elephant',
    emoji: '🐘',
    svgType: 'elephant',
    category: 'Mammal',
    tagline: 'Trunk with 40,000 muscles & emotional intelligence!',
    color: '#475569',
    bgColor: '#e2e8f0',
    iq: 140,
    weightKg: 6000,
    weightDisplay: '6,000 kg (6 Tons)',
    heightCm: 330,
    heightDisplay: '3.3 meters',
    lifespanYears: 70,
    deadliftKg: 9000, // Trunk can lift 350kg; whole body push/lift multi-tons
    relativeStrength: 1.5,
    pullingForceN: 50000,
    topSpeedKmh: 40,
    jumpCm: 0, // Cannot jump! All 4 feet never leave ground at once
    dailyCalories: 70000,
    waterLiters: 200, // 200 liters of water a day!
    sleepHours: 3, // Only 2-3 hours of sleep!
    dietType: 'Grass, Tree Bark & Fruit',
    dietFact: 'Elephants drink up to 200 liters (53 gallons) of water per day and consume 150 kg of plant material every 24 hours.',
    funFact: 'An elephant’s trunk alone contains over 40,000 individual muscles (humans only have 600 in their entire body!).'
  },
  {
    id: 'bluewhale',
    name: 'Colossal Blue Whale',
    emoji: '🐋',
    svgType: 'bluewhale',
    category: 'Marine Giant',
    tagline: 'Largest creature to EVER inhabit Planet Earth!',
    color: '#1e3a8a',
    bgColor: '#dbeafe',
    iq: 110,
    weightKg: 150000, // 150 Tons
    weightDisplay: '150,000 kg (150 Tons)',
    heightCm: 3000,
    heightDisplay: '30 meters (100 ft)',
    lifespanYears: 90,
    deadliftKg: 100000,
    relativeStrength: 0.7,
    pullingForceN: 600000,
    topSpeedKmh: 50,
    jumpCm: 200, // Breaching out of water!
    dailyCalories: 1500000, // 1.5 MILLION calories!
    waterLiters: 500,
    sleepHours: 7,
    dietType: 'Krill (Tiny Shrimps)',
    dietFact: 'A Blue Whale eats 4 TONS (4,000 kg) of krill every day, gulping up to 1.5 million calories in a single giant mouthful!',
    funFact: 'A Blue Whale’s heart is the size of a small car (Bettle) and its heartbeat can be detected from 3 km (2 miles) away!'
  },
  {
    id: 'tortoise',
    name: 'Galapagos Ancient Tortoise',
    emoji: '🐢',
    svgType: 'tortoise',
    category: 'Reptile',
    tagline: 'Living to 175+ years with calm zen wisdom!',
    color: '#15803d',
    bgColor: '#dcfce7',
    iq: 55,
    weightKg: 250,
    weightDisplay: '250 kg',
    heightCm: 90,
    heightDisplay: '90 cm',
    lifespanYears: 175,
    deadliftKg: 100,
    relativeStrength: 0.4,
    pullingForceN: 800,
    topSpeedKmh: 0.3, // 0.2 mph!
    jumpCm: 0,
    dailyCalories: 800,
    waterLiters: 1,
    sleepHours: 16,
    dietType: 'Cactus, Grass & Fruit',
    dietFact: 'Galapagos tortoises can survive up to 1 full year without drinking any water or food by storing water in their bladders!',
    funFact: 'These gentle giants can live over 175 years! The oldest known tortoise, Jonathan, celebrated his 190th birthday!'
  }
];

// Calculation & Matching Helpers
export function getMascotMatch(userStats) {
  // Extract user stats with sensible fallbacks
  const iq = Number(userStats.iq) || 100;
  const weight = Number(userStats.weight) || 70; // kg
  const height = Number(userStats.height) || 170; // cm
  const age = Number(userStats.age) || 25; // years
  const deadlift = Number(userStats.deadlift) || 80; // kg
  const pullingForce = Number(userStats.pullingForce) || 500; // N

  // Calculate relative human strength ratio (deadlift / weight)
  const userRelStrength = deadlift / (weight || 1);

  // Match 1: Strength Mascot
  let strengthMascot = ANIMALS.find(a => a.id === 'chimp');
  if (userRelStrength > 4.0 || deadlift >= 450) {
    strengthMascot = ANIMALS.find(a => a.id === 'gorilla');
  } else if (userRelStrength >= 2.0 || deadlift >= 180) {
    strengthMascot = ANIMALS.find(a => a.id === 'kangaroo');
  } else if (deadlift >= 120) {
    strengthMascot = ANIMALS.find(a => a.id === 'chimp');
  } else if (deadlift < 25) {
    strengthMascot = ANIMALS.find(a => a.id === 'sloth');
  } else {
    strengthMascot = ANIMALS.find(a => a.id === 'panda');
  }

  // Match 2: IQ Mascot
  let iqMascot = ANIMALS.find(a => a.id === 'crow');
  if (iq >= 135) iqMascot = ANIMALS.find(a => a.id === 'dolphin');
  else if (iq >= 120) iqMascot = ANIMALS.find(a => a.id === 'gorilla');
  else if (iq >= 100) iqMascot = ANIMALS.find(a => a.id === 'crow');
  else if (iq >= 80) iqMascot = ANIMALS.find(a => a.id === 'cheetah');
  else iqMascot = ANIMALS.find(a => a.id === 'sloth');

  // Match 3: Weight/Size Mascot
  let weightMascot = ANIMALS[0];
  let minWeightDiff = Infinity;
  ANIMALS.forEach(animal => {
    const diff = Math.abs(animal.weightKg - weight);
    if (diff < minWeightDiff) {
      minWeightDiff = diff;
      weightMascot = animal;
    }
  });

  // Match 4: Lifespan / Age Mascot
  let ageMascot = ANIMALS.find(a => a.id === 'chimp');
  if (age > 70) ageMascot = ANIMALS.find(a => a.id === 'tortoise');
  else if (age > 45) ageMascot = ANIMALS.find(a => a.id === 'elephant');
  else if (age > 25) ageMascot = ANIMALS.find(a => a.id === 'dolphin');
  else ageMascot = ANIMALS.find(a => a.id === 'kangaroo');

  // Overall Champion Mascot computation
  let championMascot = strengthMascot;
  if (userRelStrength >= 3.0) championMascot = ANIMALS.find(a => a.id === 'gorilla');
  else if (iq >= 130 && deadlift >= 150) championMascot = ANIMALS.find(a => a.id === 'dolphin');
  else if (userRelStrength < 1.0 && iq < 95) championMascot = ANIMALS.find(a => a.id === 'sloth');

  return {
    strengthMascot,
    iqMascot,
    weightMascot,
    ageMascot,
    championMascot,
    userRelStrength: userRelStrength.toFixed(2),
    antMultiplier: (userRelStrength / 50).toFixed(4),
    gorillaMultiplier: (deadlift / 900).toFixed(2),
    elephantMultiplier: (deadlift / 350).toFixed(2) // Elephant trunk lift ~350kg
  };
}
