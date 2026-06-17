const SHELF_KEY   = 'bookshelf_shelves';
const PROFILE_KEY = 'bookshelf_profile';


export function loadShelves() {
  try {
    return JSON.parse(localStorage.getItem(SHELF_KEY) || '[]');
  } catch {
    return [];
  }
}

export function saveShelves(shelves) {
  localStorage.setItem(SHELF_KEY, JSON.stringify(shelves));
}

export function addToShelf(book, shelfName) {
  const shelves = loadShelves();
  const existing = shelves.findIndex(b => b.id === book.id);
  if (existing !== -1) {
    shelves[existing].shelf = shelfName;
  } else {
    shelves.push({ ...book, shelf: shelfName });
  }
  saveShelves(shelves);
}

export function removeFromShelf(bookId) {
  const shelves = loadShelves().filter(b => b.id !== bookId);
  saveShelves(shelves);
}

export function getBookShelf(bookId) {
  const shelves = loadShelves();
  const found = shelves.find(b => b.id === bookId);
  return found ? found.shelf : null;
}

export function getShelfCounts() {
  const shelves = loadShelves();
  return {
    want:     shelves.filter(b => b.shelf === 'want').length,
    reading:  shelves.filter(b => b.shelf === 'reading').length,
    finished: shelves.filter(b => b.shelf === 'finished').length,
  };
}


export function loadProfile() {
  try {
    return JSON.parse(localStorage.getItem(PROFILE_KEY) || 'null');
  } catch {
    return null;
  }
}

export function saveProfile(profile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile));
}
