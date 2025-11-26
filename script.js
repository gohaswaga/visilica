// Константы
const MAX_ATTEMPTS = 10;
const ALPHABET = [
  'А','Б','В','Г','Д','Е','Ё','Ж','З','И','Й',
  'К','Л','М','Н','О','П','Р','С','Т','У','Ф',
  'Х','Ц','Ч','Ш','Щ','Ъ','Ы','Ь','Э','Ю','Я'
];
const THEMES = {
  animals: ['ЛЕВ','ТИГР','КОРОВА','ПИНГВИН','ЖИРАФ','СОБАКА','КОШКА','МЕДВЕДЬ'],
  cities: ['МИНСК','МОСКВА','ПАРИЖ','ЛОНДОН','БЕРЛИН','РИГА','КИЕВ'],
  tech: ['АЛГОРИТМ','БРАУЗЕР','СЕРВЕР','ИНТЕРНЕТ','ФРЕЙМВОРК','ДАННЫЕ']
};

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

const hangmanStages = [
  'hg-knot','hg-head','hg-body','hg-armL','hg-armR',
  'hg-legL','hg-legR','hg-eyeL','hg-eyeR','hg-mouth'
].map(id => document.getElementById(id));

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

  hangmanStages.forEach(el => { el.classList.add('hide'); el.classList.remove('show'); });

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
  while(hangmanProgress()<MAX_ATTEMPTS) revealHangmanStage(true);
  finish(false);
}

function updateAttempts() {
  attemptsEl.textContent = attemptsLeft;
}

function hangmanProgress() {
  return hangmanStages.filter(el=>el.classList.contains('show')).length;
}

function revealHangmanStage(force=false) {
  const progress = hangmanProgress();
  if (progress>=hangmanStages.length) return;
  const el = hangmanStages[progress];
  el.classList.remove('hide');
  el.classList.add('show');
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
  if (!win) hangmanStages.forEach(el=>{el.classList.remove('hide'); el.classList.add('show');});
}

document.querySelectorAll('.card').forEach(card=>{
  card.addEventListener('click',()=>startGame(card.dataset.theme));
});
hintBtn.addEventListener('click',useHint);
giveUpBtn.addEventListener('click',giveUp);
newGameBtn.addEventListener('click',()=>showScreen(screenThemes));

window.addEventListener('keydown',e=>{
  if (!screenGame.classList.contains('active') || gameOver) return;
  const letter = e.key.toUpperCase();
  if (ALPHABET.includes(letter)) {
    const btn = [...keyboardEl.querySelectorAll('button.key')].find(b=>b.textContent===letter);
    if (btn && !btn.disabled) btn.click();
  }
});
