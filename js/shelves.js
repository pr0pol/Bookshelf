import { loadShelves, getShelfCounts } from './storage.js';
import { renderBookGrid } from './ui.js';

const tabs        = document.querySelectorAll('.shelf-tab');
const grid        = document.getElementById('shelf-grid');
const emptyState  = document.getElementById('shelf-empty');
const filterInput = document.getElementById('shelf-search');
const statWant    = document.getElementById('stat-want');
const statReading = document.getElementById('stat-reading');
const statFinished= document.getElementById('stat-finished');

let allShelved = [];
let activeShelf = 'want';


function renderStats() {
  const counts = getShelfCounts();
  statWant.textContent     = counts.want;
  statReading.textContent  = counts.reading;
  statFinished.textContent = counts.finished;
}

function filterByQuery(books, query) {
  if (!query.trim()) return books;
  const q = query.toLowerCase();
  return books.filter(book =>
    book.title.toLowerCase().includes(q) ||
    book.authors.some(a => a.toLowerCase().includes(q))
  );
}

function renderShelf() {
  allShelved = loadShelves(); // re-load from localStorage each render
  const onShelf   = allShelved.filter(b => b.shelf === activeShelf);
  const query     = filterInput.value;
  const displayed = filterByQuery(onShelf, query);

  if (displayed.length === 0) {
    grid.innerHTML = '';
    emptyState.hidden = false;
  } else {
    emptyState.hidden = true;
    renderBookGrid(displayed, grid, 'shelf', handleShelfChange);
  }
  renderStats();
}

function handleShelfChange() {
  renderShelf(); // re-render everything
}

function handleTabClick(tab) {
  tabs.forEach(t => {
    t.classList.remove('shelf-tab--active');
    t.setAttribute('aria-selected', 'false');
  });
  tab.classList.add('shelf-tab--active');
  tab.setAttribute('aria-selected', 'true');
  activeShelf = tab.dataset.shelf;
  renderShelf();
}

function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

const debouncedFilter = debounce(renderShelf, 250);

tabs.forEach(tab => {
  tab.addEventListener('click', () => handleTabClick(tab));
});

filterInput.addEventListener('input', debouncedFilter);

filterInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    filterInput.value = '';
    renderShelf();
  }
});

renderShelf();
