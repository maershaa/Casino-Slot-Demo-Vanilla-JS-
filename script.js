const startBtn = document.querySelector('.js-start');
const slotItemArr = document.querySelectorAll('.js-item');

const currentBalanceEl = document.querySelector('.current-balance-js');
const overlay = document.querySelector('.js-overlay');
const closeBtn = document.querySelector('.js-close-modal');
const winScoreDisplay = document.querySelector('.js-win-score');

const slotsArr = ['💎', '🍒', '7️⃣'];

const SPIN_COST = 100;
const JACKPOT = 1000;

let balance = Number(sessionStorage.getItem('Balance')) || 500;
currentBalanceEl.textContent = balance;

startBtn.addEventListener('click', onStartBtnClick);

function onStartBtnClick() {
  const DELAY = 1000;
  let isWinnerCombo = [];

  if (balance < SPIN_COST) {
    alert('Недостаточно средств');
    return;
  }

  updateBalance(-SPIN_COST);

  // отключаем кнопку, чтобы нельзя было "наспамить" кликов
  startBtn.disabled = true;

  slotItemArr.forEach((item, index) => {
    setTimeout(() => {
      const randomIndex = getRandomIndex(slotsArr);
      const symbol = slotsArr[randomIndex];

      item.textContent = symbol;
      isWinnerCombo.push(symbol);

      // Проверяем что всем 3 ячейкам присвоены картинки
      if (isWinnerCombo.length === slotItemArr.length) {
        // Вызываем проверку только когда ВСЕ данные собраны
        checkWin(isWinnerCombo);
      }
    }, DELAY * index);
  });
}

function getRandomIndex(arr) {
  const index = Math.floor(Math.random() * arr.length);
  return index;
}

function checkWin(arr) {
  const isAllSame = arr[0] === arr[1] && arr[1] === arr[2];
  //Проверяем, что первый символ — это не знак вопроса (значит и остальные тоже)
  const isNotDefault = arr[0] !== '❔';

  // Победа засчитывается только если оба условия верны
  if (isAllSame && isNotDefault) {
    startBtn.disabled = true;

    // Запускаем библиотеку с кофетти
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    updateBalance(JACKPOT);

    setTimeout(() => showWinModal(JACKPOT), 1000);
  } else {
    startBtn.disabled = false;
  }
}

// Функция вызова победы
function showWinModal(amount) {
  winScoreDisplay.textContent = amount;
  overlay.classList.add('is-open');
}

// Закрытие окна выиграша кликом на "Забрать выиграш"
closeBtn.addEventListener('click', () => {
  overlay.classList.remove('is-open');
  startBtn.disabled = false;
});

// Закрытие окна выиграша кнопкой клавиатуры
document.addEventListener('keydown', evt => {
  if (!overlay.classList.contains('is-open')) return;

  if (evt.code === 'Escape') {
    overlay.classList.remove('is-open');
    startBtn.disabled = false;
  }
});

function updateBalance(amount) {
  balance += amount; //amount может быть:
  // -SPIN_COST (списание)
  // +JACKPOT (выигрыш)
  currentBalanceEl.textContent = balance;
  sessionStorage.setItem('Balance', balance);
}
