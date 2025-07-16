import './style.css';

const STORAGE_KEY = 'dnd-board-state';

const columns = [
  { key: 'todo', title: 'To Do' },
  { key: 'inprogress', title: 'In Progress' },
  { key: 'done', title: 'Done' }
];

function loadBoard() {
  const data = localStorage.getItem(STORAGE_KEY);
  if (data) return JSON.parse(data);
  return {
    todo: [],
    inprogress: [],
    done: []
  };
}

function saveBoard(board) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(board));
}

let board = loadBoard();
let dragData = null;
let placeholder = null;

function createCardElement(card, colKey, idx) {
  const cardEl = document.createElement('div');
  cardEl.className = 'card';
  cardEl.draggable = true;
  cardEl.textContent = card.text;

  // Крестик для удаления (появляется только при наведении)
  const delBtn = document.createElement('span');
  delBtn.className = 'delete-btn';
  delBtn.textContent = '×';
  delBtn.onclick = (e) => {
    e.stopPropagation();
    board[colKey].splice(idx, 1);
    saveBoard(board);
    renderBoard();
  };
  cardEl.append(delBtn);

  cardEl.addEventListener('dragstart', (e) => {
    dragData = { fromCol: colKey, fromIdx: idx };
    setTimeout(() => cardEl.classList.add('dragging'), 0);
    placeholder = document.createElement('div');
    placeholder.className = 'card placeholder';
    placeholder.style.height = `${cardEl.offsetHeight}px`;
    placeholder.style.boxSizing = 'border-box';
  });

  cardEl.addEventListener('dragend', () => {
    cardEl.classList.remove('dragging');
    dragData = null;
    placeholder = null;
    renderBoard();
  });

  return cardEl;
}

function renderBoard() {
  const app = document.getElementById('app');
  app.innerHTML = '';
  const boardEl = document.createElement('div');
  boardEl.className = 'board';

  columns.forEach(col => {
    const colEl = document.createElement('div');
    colEl.className = 'column';
    colEl.dataset.column = col.key;

    const title = document.createElement('div');
    title.className = 'column-title';
    title.textContent = col.title;
    colEl.append(title);

    const cardsEl = document.createElement('div');
    cardsEl.className = 'cards';

    // Dragover/drop для пустой колонки
    cardsEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      if (!dragData) return;
      // Если нет карточек, просто добавляем placeholder
      if (!cardsEl.querySelector('.placeholder')) {
        cardsEl.append(placeholder);
      }
    });

    cardsEl.addEventListener('drop', (e) => {
      e.preventDefault();
      if (!dragData) return;
      let toIdx = Array.from(cardsEl.children).indexOf(placeholder);
      if (toIdx === -1) toIdx = board[col.key].length;
      const [card] = board[dragData.fromCol].splice(dragData.fromIdx, 1);
      board[col.key].splice(toIdx, 0, card);
      saveBoard(board);
      dragData = null;
      placeholder = null;
      renderBoard();
    });

    cardsEl.addEventListener('dragleave', (e) => {
      // Удаляем placeholder только если курсор ушёл за пределы cardsEl
      if (e.relatedTarget && !cardsEl.contains(e.relatedTarget)) {
        if (placeholder && cardsEl.contains(placeholder)) {
          cardsEl.removeChild(placeholder);
        }
      }
    });

    board[col.key].forEach((card, idx) => {
      const cardEl = createCardElement(card, col.key, idx);

      // Dragover для каждой карточки
      cardEl.addEventListener('dragover', (e) => {
        e.preventDefault();
        if (!dragData) return;
        const bounding = cardEl.getBoundingClientRect();
        const offset = e.clientY - bounding.top;
        const insertBefore = offset < bounding.height / 2;
        cardsEl.querySelectorAll('.placeholder').forEach(p => p.remove());
        if (insertBefore) {
          cardsEl.insertBefore(placeholder, cardEl);
        } else {
          cardsEl.insertBefore(placeholder, cardEl.nextSibling);
        }
      });
      cardsEl.append(cardEl);
    });

    colEl.append(cardsEl);

    // Кнопка добавления карточки
    const addBtn = document.createElement('button');
    addBtn.className = 'add-btn';
    addBtn.textContent = 'Add another card';
    addBtn.onclick = () => {
      addBtn.style.display = 'none';
      const form = document.createElement('div');
      form.className = 'add-card-form';
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Card text';
      const confirmBtn = document.createElement('button');
      confirmBtn.textContent = 'Добавить';
      confirmBtn.onclick = () => {
        if (input.value.trim()) {
          board[col.key].push({ text: input.value.trim() });
          saveBoard(board);
          renderBoard();
        }
      };
      form.append(input);
      form.append(confirmBtn);
      colEl.append(form);
      input.focus();
    };
    colEl.append(addBtn);

    boardEl.append(colEl);
  });

  app.append(boardEl);
}

document.addEventListener('DOMContentLoaded', () => {
  renderBoard();
});