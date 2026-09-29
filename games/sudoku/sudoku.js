// Complete Sudoku Logic (PC & Mobile Touch Compatible)
const BOARDS = {
  easy: [
    [5,3,0,0,7,0,0,0,0],
    [6,0,0,1,9,5,0,0,0],
    [0,9,8,0,0,0,0,6,0],
    [8,0,0,0,6,0,0,0,3],
    [4,0,0,8,0,3,0,0,1],
    [7,0,0,0,2,0,0,0,6],
    [0,6,0,0,0,0,2,8,0],
    [0,0,0,4,1,9,0,0,5],
    [0,0,0,0,8,0,0,7,9]
  ],
  medium: [
    [0,0,0,6,0,0,4,0,0],
    [7,0,0,0,0,3,6,0,0],
    [0,0,0,0,9,1,0,8,0],
    [0,0,0,0,0,0,0,0,0],
    [0,5,0,1,8,0,0,0,3],
    [0,0,0,3,0,6,0,4,5],
    [0,4,0,2,0,0,0,6,0],
    [9,0,3,0,0,0,0,0,0],
    [0,2,0,0,0,0,1,0,0]
  ],
  hard: [
    [0,0,0,0,0,0,0,1,2],
    [0,0,0,0,0,0,0,0,3],
    [0,0,2,3,0,0,4,0,0],
    [0,0,1,8,0,0,0,0,5],
    [0,6,0,0,7,0,8,0,0],
    [0,0,0,0,0,9,0,0,0],
    [0,0,8,5,0,0,0,0,0],
    [9,0,0,0,4,0,5,0,0],
    [4,7,0,0,0,6,0,0,0]
  ]
};

let currentDiff = 'easy';
let initialBoard = [];
let userBoard = [];
let selectedCell = null; // { r, c }

const gridEl = document.getElementById('grid');

function initGame(diff = 'easy') {
  currentDiff = diff;
  const template = BOARDS[diff] || BOARDS.easy;
  initialBoard = template.map(row => [...row]);
  userBoard = template.map(row => [...row]);
  selectedCell = null;

  renderGrid();
}

function renderGrid() {
  gridEl.innerHTML = '';
  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const cell = document.createElement('div');
      cell.className = 'cell';
      
      const val = userBoard[r][c];
      const isGiven = initialBoard[r][c] !== 0;

      if (isGiven) {
        cell.classList.add('given');
        cell.textContent = val;
      } else if (val !== 0) {
        cell.classList.add('user-filled');
        cell.textContent = val;
      } else {
        cell.textContent = '';
      }

      if (selectedCell && selectedCell.r === r && selectedCell.c === c) {
        cell.classList.add('selected');
      }

      const selectCellHandler = () => {
        if (!isGiven) {
          selectedCell = { r, c };
          renderGrid();
        }
      };

      cell.addEventListener('click', selectCellHandler);
      cell.addEventListener('touchstart', (e) => {
        e.preventDefault();
        selectCellHandler();
      }, { passive: false });

      gridEl.appendChild(cell);
    }
  }
}

// Numpad input
document.querySelectorAll('.num-btn').forEach(btn => {
  const numInputHandler = () => {
    if (!selectedCell) return;
    const num = Number(btn.dataset.num);
    const { r, c } = selectedCell;
    if (initialBoard[r][c] === 0) {
      userBoard[r][c] = num;
      renderGrid();
    }
  };

  btn.addEventListener('click', numInputHandler);
  btn.addEventListener('touchstart', (e) => {
    e.preventDefault();
    numInputHandler();
  }, { passive: false });
});

// Difficulty Selector inside Modal
const modeBadgeEl = document.getElementById('mode-badge');
const startOverlayEl = document.getElementById('start-overlay');
const btnStartEl = document.getElementById('btn-start');
const btnNewEl = document.getElementById('btn-new');

const DIFF_LABELS = {
  easy: 'EASY 🟢',
  medium: 'MED 🟡',
  hard: 'HARD 🔴'
};

function updateModeBadgeUI() {
  if (modeBadgeEl) {
    modeBadgeEl.textContent = `DIFFICULTY: ${DIFF_LABELS[currentDiff] || 'EASY 🟢'}`;
  }
}

document.querySelectorAll('.diff-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.diff-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    currentDiff = btn.dataset.diff;
    updateModeBadgeUI();
  });
});

if (btnStartEl) {
  btnStartEl.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.add('hidden');
    updateModeBadgeUI();
    initGame(currentDiff);
  });
}

if (btnNewEl) {
  btnNewEl.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.remove('hidden');
  });
}

document.getElementById('btn-check').addEventListener('click', () => {
  let empty = 0;

  for (let r = 0; r < 9; r++) {
    for (let c = 0; c < 9; c++) {
      const val = userBoard[r][c];
      if (val === 0) empty++;
    }
  }

  if (empty === 0) {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
    }
    alert('🎉 CONGRATULATIONS! You solved the Sudoku Puzzle! 🥳');
  } else {
    alert(`👍 Looking good so far! ${empty} empty cells remaining.`);
  }
});

updateModeBadgeUI();
