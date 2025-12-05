const MAX_ATTEMPTS = 6;
const ALPHABET = [
  'А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й',
  'К','Л','М','Н','О','П','Р','С','Т','У','Ф',
  'Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я'
];
const THEMES = {
  animals: ['ЛЕВ','ТИГР','КОРОВА','ПИНГВИН','ЖИРАФ','СОБАКА','КОШКА','МЕДВЕДЬ'],
  cities: ['МИНСК','МОСКВА','ПАРИЖ','ЛОНДОН','БЕРЛИН','РИГА','КОПЕНГАГЕН'],
  tech: ['АЛГОРИТМ','БРАУЗЕР','СЕРВЕР','ИНТЕРНЕТ','ФРЕЙМВОРК','ДАННЫЕ']
};


const hangmanImages = [
  "https://upload.wikimedia.org/wikipedia/commons/8/8b/Hangman-0.png",
  "https://upload.wikimedia.org/wikipedia/commons/3/30/Hangman-1.png",
  "https://upload.wikimedia.org/wikipedia/commons/7/70/Hangman-2.png",
  "https://upload.wikimedia.org/wikipedia/commons/9/97/Hangman-3.png",
  "https://upload.wikimedia.org/wikipedia/commons/2/27/Hangman-4.png",
  "https://upload.wikimedia.org/wikipedia/commons/6/6b/Hangman-5.png",
  "https://upload.wikimedia.org/wikipedia/commons/d/d6/Hangman-6.png"
];

let secretWord = '';
let revealed = [];
let attemptsLeft = MAX_ATTEMPTS;
let usedLetters = new Set();
let gameOver = false;

const screenThemes = document.getElementById('screen-themes');
const screenGame = document.getElementById('screen-game');
const screenResult = document.getElementById('screen-result');
const attemptsEl = document.getElementById('attempts');
const wordEl = document.getElementById('word');
const keyboardEl = document.getElementById('keyboard');
const hintBtn = document.getElementById('hintBtn');
const giveUpBtn = document.getElementById('giveUpBtn');
const statusEl = document.getElementById('status');
const wordRevealEl = document.getElementById('wordReveal');
const newGameBtn = document.getElementById('newGameBtn');
const hangmanImgEl = document.getElementById('hangmanImage');

function showScreen(el) {
  [screenThemes, screenGame, screenResult].forEach(s => s.classList.remove('active'));
  el.classList.add('active');
}

function startGame(themeKey) {
  const words = THEMES[themeKey];
  secretWord = words[Math.floor(Math.random() * words.length)];
  revealed = Array(secretWord.length).fill(false);
  attemptsLeft = MAX_ATTEMPTS;
  usedLetters.clear();
  gameOver = false;

  hangmanImgEl.src = hangmanImages[0];

  renderWord();
  renderKeyboard();
  updateAttempts();
  showScreen(screenGame);
}

function renderWord() {
  wordEl.innerHTML = '';
  for (let i = 0; i < secretWord.length; i++) {
    const span = document.createElement('div');
    span.className = 'char' + (revealed[i] ? ' revealed' : '');
    span.textContent = revealed[i] ? secretWord[i] : '';
    wordEl.appendChild(span);
  }
}

function renderKeyboard() {
  keyboardEl.innerHTML = '';
  ALPHABET.forEach(letter => {
    const btn = document.createElement('button');
    btn.className = 'key';
    btn.textContent = letter;
    btn.disabled = usedLetters.has(letter) || gameOver;
    btn.addEventListener('click', () => onLetterClick(letter, btn));
    keyboardEl.appendChild(btn);
  });
}

function onLetterClick(letter, btn) {
  if (gameOver || usedLetters.has(letter)) return;
  usedLetters.add(letter);

  let found = false;
  for (let i = 0; i < secretWord.length; i++) {
    if (secretWord[i] === letter) {
      revealed[i] = true;
      found = true;
    }
  }
  btn.disabled = true;

  if (!found) {
    attemptsLeft--;
    revealHangmanStage();
  }

  renderWord();
  updateAttempts();
  checkWinLose();
}

function useHint() {
  if (gameOver) return;
  const hidden = revealed.map((v,i)=>!v?i:null).filter(i=>i!==null);
  if (hidden.length === 0) return;
  const idx = hidden[Math.floor(Math.random()*hidden.length)];
  const letter = secretWord[idx];
  for (let i=0;i<secretWord.length;i++) if(secretWord[i]===letter) revealed[i]=true;
  usedLetters.add(letter);
  renderKeyboard();
  renderWord();
  checkWinLose();
}

function giveUp() {
  gameOver = true;
  attemptsLeft = 0;
  updateAttempts();
  hangmanImgEl.src = hangmanImages[hangmanImages.length - 1];
  finish(false);
}

function updateAttempts() {
  attemptsEl.textContent = attemptsLeft;
}

function hangmanProgress() {
  return MAX_ATTEMPTS - attemptsLeft;
}

function revealHangmanStage() {
  const progress = hangmanProgress();
  if (progress >= hangmanImages.length) return;
  hangmanImgEl.src = hangmanImages[progress];
}

function checkWinLose() {
  if (revealed.every(v=>v)) { gameOver=true; finish(true); }
  else if (attemptsLeft<=0) { gameOver=true; finish(false); }
}

function finish(win) {
  showScreen(screenResult);
  statusEl.className = 'status ' + (win?'win':'lose');
  statusEl.textContent = win ? 'Победа!' : 'Поражение';
  wordRevealEl.textContent = 'Загаданное слово: ' + secretWord;
  if (!win) hangmanImgEl.src = hangmanImages[hangmanImages.length - 1];
}

document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('click',()=>startGame(card.dataset.theme));
});
hintBtn.addEventListener('click',useHint);
giveUpBtn.addEventListener('click',giveUp);
newGameBtn.addEventListener('click',()=>showScreen(screenThemes));

window.addEventListener('keydown', e => {
  if (!screenGame.classList.contains('active') || gameOver) return;
  const letter = e.key.toUpperCase();
  if (ALPHABET.includes(letter)) {
    const btn = [...keyboardEl.querySelectorAll('button.key')]
      .find(b => b.textContent === letter);
    if (btn && !btn.disabled) btn.click();
  }
});
