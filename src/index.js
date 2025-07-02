import './style.css';

// Ключ для хранения состояния
const STORAGE_KEY = 'dnd-board-state';

// Сохранить состояние
function saveBoardState(board) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

// Получить состояние
function loadBoardState() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) {
    return JSON.parse(data);
  }
  // Если данных нет, возвращаем пустую доску
  return {
    todo: [],
    inprogress: [],
    done: []
  };
}

let board = loadBoardState();

// После добавления карточки:
function addCard(column, text) {
  board[column].push({ text });
  saveBoardState(board);
  renderBoard();
}

// После удаления карточки:
function deleteCard(column, index) {
  board[column].splice(index, 1);
  saveBoardState(board);
  renderBoard();
}

document.addEventListener('DOMContentLoaded', () => {
  board = loadBoardState();
  renderBoard();
});