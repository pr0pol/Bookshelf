import { searchBooks } from './api.js';
import { renderBookGrid } from './ui.js';
import { showElement, hideElement, showError, clearError, showLoader, hideLoader } from './ui.js';


const form        = document.getElementById('search-form');
const queryInput  = document.getElementById('search-query');
const typeSelect  = document.getElementById('search-type');
const limitSelect = document.getElementById('search-limit');
const filterEbook = document.getElementById('filter-ebook');
const filterCover = document.getElementById('filter-cover');
const loader      = document.getElementById('loader');
const errorMsg    = document.getElementById('error-msg');
const resultsMeta = document.getElementById('results-meta');
const metaText    = document.getElementById('results-meta-text');
const grid        = document.getElementById('book-grid');
const queryError  = document.getElementById('query-error');

let searchResults = [];

function debounce(fn, wait) {
  let timer;
  return function (...args) {
    clearTimeout(timer);
    timer = setTimeout(() => fn.apply(this, args), wait);
  };
}

function validateQuery(value) {
  if (!value.trim()) return 'Please enter a search term.';
  if (value.trim().length < 2) return 'Search term must be at least 2 characters.';
  return '';
}

function showFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('search-form__input--error');
  errorEl.textContent = message;
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('search-form__input--error');
  errorEl.textContent = '';
}

function applyFilters(books) {
  return books.filter(book => {
    if (filterEbook.checked && !book.hasEbook) return false;
    if (filterCover.checked && !book.coverId)  return false;
    return true;
  });
}

async function performSearch(query) {
  clearError(errorMsg);
  hideElement(resultsMeta);
  grid.innerHTML = '';
  showLoader(loader);

  try {
    const raw = await searchBooks({
      query,
      type:  typeSelect.value,
      limit: parseInt(limitSelect.value, 10),
    });

    searchResults = raw; // persist to module-level array
    const filtered = applyFilters(raw);

    hideLoader(loader);
    showElement(resultsMeta);
    metaText.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''} for "${query}"`;
    renderBookGrid(filtered, grid, 'search');

  } catch (err) {
    hideLoader(loader);
    showError(errorMsg, `Search failed: ${err.message}`);
  }
}

function handleFilterChange() {
  if (!searchResults.length) return;
  const filtered = applyFilters(searchResults);
  metaText.textContent = `${filtered.length} result${filtered.length !== 1 ? 's' : ''} shown`;
  renderBookGrid(filtered, grid, 'search');
}

const debouncedSearch = debounce((value) => {
  const error = validateQuery(value);
  if (!error) performSearch(value.trim());
}, 500);


form.addEventListener('submit', (e) => {
  e.preventDefault();
  const value = queryInput.value;
  const error = validateQuery(value);
  if (error) {
    showFieldError(queryInput, queryError, error);
    return;
  }
  clearFieldError(queryInput, queryError);
  performSearch(value.trim());
});

queryInput.addEventListener('input', (e) => {
  clearFieldError(queryInput, queryError);
  debouncedSearch(e.target.value);
});

filterEbook.addEventListener('change', handleFilterChange);
filterCover.addEventListener('change', handleFilterChange);

queryInput.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') {
    queryInput.value = '';
    clearFieldError(queryInput, queryError);
    clearError(errorMsg);
    hideElement(resultsMeta);
    grid.innerHTML = '';
    searchResults = [];
  }
});
