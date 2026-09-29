// Grid Pop 100! - Deterministic Procedural Level Generator
// Guarantees 100% solvability for all 100 levels

function seededRandom(seed) {
  let s = seed % 2147483647;
  if (s <= 0) s += 2147483646;
  return function () {
    s = (s * 16807) % 2147483647;
    return (s - 1) / 2147483646;
  };
}

// Toggle helper for matrix (flips cell and 4 orthogonal neighbors)
function applyToggle(matrix, rows, cols, r, c) {
  const neighbors = [
    [r, c],
    [r - 1, c],
    [r + 1, c],
    [r, c - 1],
    [r, c + 1]
  ];
  neighbors.forEach(([nr, nc]) => {
    if (nr >= 0 && nr < rows && nc >= 0 && nc < cols) {
      matrix[nr][nc] = matrix[nr][nc] === 1 ? 0 : 1;
    }
  });
}

function countActiveLights(matrix) {
  let count = 0;
  for (let r = 0; r < matrix.length; r++) {
    for (let c = 0; c < matrix[r].length; c++) {
      if (matrix[r][c] === 1) count++;
    }
  }
  return count;
}

export function generate100Levels() {
  const levels = [];

  for (let lvl = 1; lvl <= 100; lvl++) {
    const rng = seededRandom(lvl * 7919 + 1337);

    // Grid size progression
    let rows = 3;
    let cols = 3;
    if (lvl >= 61) {
      rows = 5;
      cols = 5;
    } else if (lvl >= 21) {
      rows = 4;
      cols = 4;
    }

    // Number of random toggles (complexity curve)
    let minMoves = 1;
    if (lvl === 1 || lvl === 2) {
      minMoves = 1;
    } else if (lvl <= 5) {
      minMoves = 2;
    } else if (lvl <= 10) {
      minMoves = 3;
    } else if (lvl <= 20) {
      minMoves = 4 + Math.floor(rng() * 3); // 4-6
    } else if (lvl <= 40) {
      minMoves = 5 + Math.floor(rng() * 4); // 5-8
    } else if (lvl <= 60) {
      minMoves = 8 + Math.floor(rng() * 5); // 8-12
    } else if (lvl <= 80) {
      minMoves = 10 + Math.floor(rng() * 6); // 10-15
    } else {
      minMoves = 14 + Math.floor(rng() * 7); // 14-20
    }

    // Start with all-off matrix
    const matrix = Array.from({ length: rows }, () => Array(cols).fill(0));

    // Apply K distinct simulation toggles to ensure 100% solvability
    let movesApplied = 0;
    const toggledCoords = new Set();

    while (movesApplied < minMoves) {
      const r = Math.floor(rng() * rows);
      const c = Math.floor(rng() * cols);
      const key = `${r},${c}`;

      if (!toggledCoords.has(key)) {
        toggledCoords.add(key);
        applyToggle(matrix, rows, cols, r, c);
        movesApplied++;
      }
    }

    // Ensure grid is not completely empty
    if (countActiveLights(matrix) === 0) {
      const r = Math.floor(rng() * rows);
      const c = Math.floor(rng() * cols);
      applyToggle(matrix, rows, cols, r, c);
    }

    // Assign fun level theme colors from the animal game palette
    const colorThemes = ['bubblegum', 'sunny', 'mint', 'sky', 'purple'];
    const theme = colorThemes[(lvl - 1) % colorThemes.length];

    levels.push({
      id: lvl,
      cols,
      rows,
      matrix,
      targetMoves: Math.max(1, toggledCoords.size),
      theme
    });
  }

  return levels;
}

// Generate the master list of 100 levels
export const ALL_LEVELS = generate100Levels();
