import { getCoverUrl } from './api.js';
import { addToShelf, removeFromShelf, getBookShelf } from './storage.js';

export function showElement(el) {
  el.hidden = false;
}

export function hideElement(el) {
  el.hidden = true;
}

export function showLoader(loaderEl) {
  showElement(loaderEl);
}

export function hideLoader(loaderEl) {
  hideElement(loaderEl);
}

export function showError(errorEl, message) {
  errorEl.textContent = message;
  showElement(errorEl);
}

export function clearError(errorEl) {
  errorEl.textContent = '';
  hideElement(errorEl);
}

export function createBookCard(book, mode = 'search', onShelfChange = null) {
  const card = document.createElement('article');
  card.className = 'book-card';
  card.dataset.bookId = book.id;


  const coverUrl = getCoverUrl(book.coverId, 'M');
  if (coverUrl) {
    const img = document.createElement('img');
    img.className = 'book-card__cover';
    img.src = coverUrl;
    img.alt = `Cover of ${book.title}`;
    img.loading = 'lazy';
    img.addEventListener('error', () => {
      img.replaceWith(buildPlaceholder());
    });
    card.appendChild(img);
  } else {
    card.appendChild(buildPlaceholder());
  }

  const body = document.createElement('div');
  body.className = 'book-card__body';

  const title = document.createElement('p');
  title.className = 'book-card__title';
  title.textContent = book.title;

  const author = document.createElement('p');
  author.className = 'book-card__author';
  author.textContent = book.authors.length ? book.authors.join(', ') : 'Unknown author';

  const year = document.createElement('p');
  year.className = 'book-card__year';
  year.textContent = book.year || '';

  body.appendChild(title);
  body.appendChild(author);
  body.appendChild(year);

  if (mode === 'shelf') {
    const badge = document.createElement('span');
    badge.className = `book-card__shelf-badge book-card__shelf-badge--${book.shelf}`;
    badge.textContent = shelfLabel(book.shelf);
    body.appendChild(badge);
  }

  card.appendChild(body);

  const actions = document.createElement('div');
  actions.className = 'book-card__actions';

  const currentShelf = getBookShelf(book.id);

  const select = buildShelfSelect(currentShelf || book.shelf || '');
  select.addEventListener('change', (e) => {
    const chosen = e.target.value;
    if (chosen) {
      addToShelf(book, chosen);
    }
    if (onShelfChange) onShelfChange(book.id, chosen);
  });
  actions.appendChild(select);

  if (mode === 'shelf') {
    const removeBtn = document.createElement('button');
    removeBtn.className = 'book-card__remove-btn';
    removeBtn.type = 'button';
    removeBtn.textContent = '✕ Remove from shelves';
    // Closure: removeBtn handler closes over book.id
    removeBtn.addEventListener('click', () => {
      removeFromShelf(book.id);
      card.remove();
      if (onShelfChange) onShelfChange(book.id, null);
    });
    actions.appendChild(removeBtn);
  }

  card.appendChild(actions);
  return card;
}


function buildPlaceholder() {
  const div = document.createElement('div');
  div.className = 'book-card__cover-placeholder';
  div.setAttribute('aria-hidden', 'true');
  div.textContent = '📖';
  return div;
}

function buildShelfSelect(currentShelf) {
  const select = document.createElement('select');
  select.className = 'book-card__shelf-select';
  select.setAttribute('aria-label', 'Add to shelf');

  const options = [
    { value: '',         label: '+ Add to shelf' },
    { value: 'want',     label: 'Want to read' },
    { value: 'reading',  label: 'Reading' },
    { value: 'finished', label: 'Finished' },
  ];

  options.forEach(({ value, label }) => {
    const opt = document.createElement('option');
    opt.value = value;
    opt.textContent = label;
    if (value === currentShelf) opt.selected = true;
    select.appendChild(opt);
  });

  return select;
}

function shelfLabel(shelf) {
  const map = { want: 'Want to read', reading: 'Reading', finished: 'Finished' };
  return map[shelf] || shelf;
}

export function renderBookGrid(books, container, mode = 'search', onShelfChange = null) {
  container.innerHTML = '';
  books.forEach(book => {
    const card = createBookCard(book, mode, onShelfChange);
    container.appendChild(card);
  });
}
