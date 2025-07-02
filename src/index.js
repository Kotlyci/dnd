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
    colEl.appendChild(title);

    const cardsEl = document.createElement('div');
    cardsEl.className = 'cards';

    board[col.key].forEach((card, idx) => {
      const cardEl = document.createElement('div');
      cardEl.className = 'card';
      cardEl.draggable = true;
      cardEl.textContent = card.text;

      // Крестик для удаления
      const delBtn = document.createElement('span');
      delBtn.className = 'delete-btn';
      delBtn.textContent = '×';
      delBtn.onclick = (e) => {
        e.stopPropagation();
        board[col.key].splice(idx, 1);
        saveBoard(board);
        renderBoard();
      };
      cardEl.appendChild(delBtn);

      // Drag events
      cardEl.addEventListener('dragstart', (e) => {
        e.dataTransfer.setData('text/plain', JSON.stringify({ fromCol: col.key, fromIdx: idx }));
        setTimeout(() => cardEl.classList.add('dragging'), 0);
      });
      cardEl.addEventListener('dragend', () => {
        cardEl.classList.remove('dragging');
      });

      cardsEl.appendChild(cardEl);
    });

    // Dragover для вставки карточки
    cardsEl.addEventListener('dragover', (e) => {
      e.preventDefault();
      cardsEl.classList.add('dragover');
    });
    cardsEl.addEventListener('dragleave', () => {
      cardsEl.classList.remove('dragover');
    });
    cardsEl.addEventListener('drop', (e) => {
      e.preventDefault();
      cardsEl.classList.remove('dragover');
      const data = JSON.parse(e.dataTransfer.getData('text/plain'));
      if (data.fromCol === col.key) return; // не перемещаем в ту же колонку
      const card = board[data.fromCol].splice(data.fromIdx, 1)[0];
      board[col.key].push(card);
      saveBoard(board);
      renderBoard();
    });

    colEl.appendChild(cardsEl);

    // Кнопка добавления карточки
    const addBtn = document.createElement('button');
    addBtn.textContent = 'Add another card';
    addBtn.onclick = () => {
      addBtn.style.display = 'none';
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
      colEl.appendChild(input);
      colEl.appendChild(confirmBtn);
      input.focus();
    };
    colEl.appendChild(addBtn);

    boardEl.appendChild(colEl);
  });

  app.appendChild(boardEl);
}

document.addEventListener('DOMContentLoaded', () => {
  renderBoard();
});