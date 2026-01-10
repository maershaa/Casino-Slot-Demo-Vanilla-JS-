const startBtn = document.querySelector('.js-start');
const reels = document.querySelectorAll('.js-track'); //  барабаны

const currentBalanceEl = document.querySelector('.js-current-balance');

// Оверлей с модальным окном выигрыша
const overlay = document.querySelector('.js-win-overlay');
const closeBtn = document.querySelector('.js-close-modal');
const winScoreDisplay = document.querySelector('.js-win-score');

const noCashModal = document.querySelector('.js-noCash-overlay');
const rechargeBtn = document.querySelector('.js-recharge-btn');
const noCashСloseBtn = document.querySelector('.js-close-noCash');

const slotsArr = ['💎', '🍒', '7️⃣']; // Возможные символы слота

const SPIN_COST = 100;
const JACKPOT = 1000;

const ITEM_HEIGHT = 120; // высота одного символа
const SPIN_DURATION = 1500; // общая длительность прокрутки барабана
const REEL_DELAY = 200; // задержка между стартом каждого барабана

let balance = Number(sessionStorage.getItem('Balance')) || 500;

// Флаг, блокирующий повторный запуск спина во время анимации
let isSpinning = false;

// Инициализация баланса
currentBalanceEl.textContent = balance;

startBtn.addEventListener('click', onStartBtnClick);

function onStartBtnClick() {
  // Если барабаны уже крутятся — игнорируем клик
  console.log('🚀 ~ onStartBtnClick ~ isSpinning:', isSpinning);
  if (isSpinning) return; //!тут оно true?

  // Проверка на достаточность средств
  if (balance < SPIN_COST) {
    setTimeout(() => noCashModal.classList.add('is-open'), 600);
    return;
  }

  // Блокируем повторные запуски
  isSpinning = true;
  startBtn.disabled = true;

  // Списываем стоимость спина
  updateBalance(-SPIN_COST);

  // Здесь будем хранить итоговые индексы каждого барабана
  const results = [];

  // Счётчик завершённых барабанов
  let finishedReels = 0;

  // Запускаем анимацию для каждого барабана
  reels.forEach((reel, index) => {
    // Генерируем финальный символ для конкретного барабана
    const finalIndex = getRandomIndex(slotsArr);

    // Сохраняем результат (по индексу барабана)
    results[index] = finalIndex;

    // Небольшая задержка между стартами барабанов
    setTimeout(() => {
      spinReel(reel, finalIndex, () => {
        finishedReels++;

        // Когда все барабаны закончили вращение
        if (finishedReels === reels.length) {
          checkWin(results);
          isSpinning = false;
        }
      });
    }, index * REEL_DELAY);
  });
}

function getRandomIndex(arr) {
  return Math.floor(Math.random() * arr.length);
}

// анимация прокрутки одного барабана
function spinReel(trackEl, finalIndex, onFinish) {
  // Сбрасываем transform и transition перед стартом
  trackEl.style.transition = 'none';
  trackEl.style.transform = 'translateY(0)';
  trackEl.offsetHeight; // принудительный reflow

  // Финальная позиция случайного символа
  const finalOffset = finalIndex * ITEM_HEIGHT;

  // Плавная анимация до финального символа
  trackEl.style.transition = `transform ${SPIN_DURATION}ms ease-out`;
  trackEl.style.transform = `translateY(-${finalOffset}px)`;

  setTimeout(onFinish, SPIN_DURATION); //!не понимаю
}

function checkWin(resultIndexes) {
  const isWin = resultIndexes.every(index => index === resultIndexes[0]);

  if (isWin) {
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    });

    // Начисляем выигрыш
    updateBalance(JACKPOT);

    // Показываем модалку с небольшой задержкой
    setTimeout(() => showWinModal(JACKPOT), 600);
  } else {
    // Если проигрыш — разблокируем кнопку
    startBtn.disabled = false;
  }
}

function showWinModal(amount) {
  winScoreDisplay.textContent = amount;
  overlay.classList.add('is-open');
}

// Закрытие модалки выиграша по кнопке
closeBtn.addEventListener('click', () => {
  overlay.classList.remove('is-open');
  startBtn.disabled = false;
});

// Закрытие модалки выиграша по Esc
document.addEventListener('keydown', evt => {
  if (!overlay.classList.contains('is-open')) return;

  if (evt.code === 'Escape') {
    overlay.classList.remove('is-open');
    startBtn.disabled = false;
  }
});

function showNoCashModal(amount) {
  noCashModal.classList.add('is-open');
}
// Закрытие модалки недостаточности средств на счету по кнопке
noCashСloseBtn.addEventListener('click', () => {
  noCashModal.classList.remove('is-open');
});

rechargeBtn.addEventListener('click', () => {
  updateBalance(500);
  noCashModal.classList.remove('is-open');
});

function updateBalance(amount) {
  /*
    amount может быть:
    -SPIN_COST - списание
    +JACKPOT   - выигрыш
  */
  balance += amount;
  currentBalanceEl.textContent = balance;
  sessionStorage.setItem('Balance', balance);
}
