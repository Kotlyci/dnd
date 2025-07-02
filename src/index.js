import './style.css';

// Инициализация доски и карточек
const board = document.querySelector('.board');
const cards = document.querySelectorAll('.card');

// Обработчик начала перетаскивания
cards.forEach(card => {
  card.addEventListener('dragstart', (e) => {
    e.dataTransfer.setData('text/plain', card.id);
  });
});

// Обработчик перетаскивания на доске
board.addEventListener('dragover', (e) => {
  e.preventDefault(); // Разрешить сброс
});

// Обработчик сброса карточки на доске
board.addEventListener('drop', (e) => {
  e.preventDefault();
  const cardId = e.dataTransfer.getData('text/plain');
  const card = document.getElementById(cardId);
  board.appendChild(card); // Перемещаем карточку
});

