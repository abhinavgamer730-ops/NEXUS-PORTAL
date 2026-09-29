// Zebra Deduction Logic
const CATEGORIES = {
  nationality: ['Red Brit', 'Swedish', 'Danish', 'Norwegian', 'German'],
  color: ['Red', 'Green', 'White', 'Yellow', 'Blue'],
  drink: ['Tea', 'Coffee', 'Milk', 'Beer', 'Water'],
  pet: ['Dog', 'Birds', 'Cats', 'Horse', 'Zebra'],
  snack: ['Pall Mall', 'Dunhill', 'Blend', 'BlueMaster', 'Prince']
};

const CLUES = [
  "1. The Brit lives in the Red house.",
  "2. The Swede keeps Dogs as pets.",
  "3. The Dane drinks Tea.",
  "4. The Green house is immediately to the left of the White house.",
  "5. The owner of the Green house drinks Coffee.",
  "6. The person who smokes Pall Mall rears Birds.",
  "7. The owner of the Yellow house smokes Dunhill.",
  "8. The man living in the center house drinks Milk.",
  "9. The Norwegian lives in the 1st house.",
  "10. The man who smokes Blend lives next to the one who keeps Cats.",
  "11. The man who keeps Horses lives next to the man who smokes Dunhill.",
  "12. The owner who smokes BlueMaster drinks Beer.",
  "13. The German smokes Prince.",
  "14. The Norwegian lives next to the Blue house.",
  "15. The man who smokes Blend has a neighbor who drinks Water."
];

const SOLUTION = {
  1: { color: 'Yellow', nationality: 'Norwegian', drink: 'Water', snack: 'Dunhill', pet: 'Cats' },
  2: { color: 'Blue', nationality: 'Danish', drink: 'Tea', snack: 'Blend', pet: 'Horse' },
  3: { color: 'Red', nationality: 'Red Brit', drink: 'Milk', snack: 'Pall Mall', pet: 'Birds' },
  4: { color: 'Green', nationality: 'German', drink: 'Coffee', snack: 'Prince', pet: 'Zebra' },
  5: { color: 'White', nationality: 'Swedish', drink: 'Beer', snack: 'BlueMaster', pet: 'Dog' }
};

const matrixBody = document.getElementById('matrix-body');
const clueListEl = document.getElementById('clue-list');

// Populate Clues
CLUES.forEach(c => {
  const item = document.createElement('div');
  item.className = 'clue-item';
  item.textContent = c;
  clueListEl.appendChild(item);
});

// Render Table Rows
Object.keys(CATEGORIES).forEach(cat => {
  const tr = document.createElement('tr');
  const th = document.createElement('th');
  th.textContent = cat.toUpperCase();
  tr.appendChild(th);

  for (let h = 1; h <= 5; h++) {
    const td = document.createElement('td');
    const select = document.createElement('select');
    select.dataset.house = h;
    select.dataset.category = cat;

    const defaultOpt = document.createElement('option');
    defaultOpt.value = '';
    defaultOpt.textContent = '--';
    select.appendChild(defaultOpt);

    CATEGORIES[cat].forEach(optVal => {
      const opt = document.createElement('option');
      opt.value = optVal;
      opt.textContent = optVal;
      select.appendChild(opt);
    });

    td.appendChild(select);
    tr.appendChild(td);
  }

  matrixBody.appendChild(tr);
});

const startOverlayEl = document.getElementById('start-overlay');
const btnStartEl = document.getElementById('btn-start');
const btnResetEl = document.getElementById('btn-reset');

if (btnStartEl) {
  btnStartEl.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.add('hidden');
  });
}

if (btnResetEl) {
  btnResetEl.addEventListener('click', () => {
    if (startOverlayEl) startOverlayEl.classList.remove('hidden');
  });
}

document.getElementById('btn-submit').addEventListener('click', () => {
  let correct = 0;
  let total = 25;

  document.querySelectorAll('select').forEach(sel => {
    const h = sel.dataset.house;
    const cat = sel.dataset.category;
    const val = sel.value;

    if (val && SOLUTION[h][cat] === val) {
      correct++;
    }
  });

  if (correct === total) {
    if (typeof confetti === 'function') {
      confetti({ particleCount: 90, spread: 80, origin: { y: 0.6 } });
    }
    alert('🎉 EINSTEIN LEVEL GENIUS! You solved the Zebra Deduction Riddle! 🥳🦓');
  } else {
    alert(`💡 You have ${correct} out of ${total} correct entries! Keep deducing!`);
  }
});
