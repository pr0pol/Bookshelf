import { loadProfile, saveProfile, getShelfCounts } from './storage.js';


const form          = document.getElementById('profile-form');
const nameInput     = document.getElementById('pf-name');
const emailInput    = document.getElementById('pf-email');
const bioInput      = document.getElementById('pf-bio');
const bioCount      = document.getElementById('pf-bio-count');
const goalInput     = document.getElementById('pf-reading-goal');
const nameError     = document.getElementById('pf-name-error');
const emailError    = document.getElementById('pf-email-error');
const feedback      = document.getElementById('profile-feedback');
const clearBtn      = document.getElementById('clear-profile-btn');
const avatarEl      = document.getElementById('profile-avatar');
const nameDisplay   = document.getElementById('profile-name-display');
const bioDisplay    = document.getElementById('profile-bio-display');
const goalBar       = document.getElementById('goal-bar');
const goalLabel     = document.getElementById('goal-label');

function validateName(value) {
  if (!value.trim()) return 'Name is required.';
  if (value.trim().length < 2) return 'Name must be at least 2 characters.';
  return '';
}

function validateEmail(value) {
  if (!value.trim()) return 'Email is required.';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)) return 'Please enter a valid email.';
  return '';
}

function setFieldError(inputEl, errorEl, message) {
  inputEl.classList.add('profile-form__input--error');
  errorEl.textContent = message;
}

function clearFieldError(inputEl, errorEl) {
  inputEl.classList.remove('profile-form__input--error');
  errorEl.textContent = '';
}

function getSelectedGenres() {
  return Array.from(form.querySelectorAll('input[name="genre"]:checked'))
    .map(cb => cb.value);
}

function showFeedback(message, type) {
  feedback.textContent = message;
  feedback.className = `profile-form__feedback profile-form__feedback--${type}`;
  feedback.hidden = false;
  setTimeout(() => { feedback.hidden = true; }, 3500);
}

function updatePreview(profile) {
  if (!profile) return;
  nameDisplay.textContent = profile.name || 'Reader';
  bioDisplay.textContent  = profile.bio  || 'No bio yet.';
  avatarEl.textContent    = (profile.name || 'R')[0].toUpperCase();
}
function updateGoalProgress(profile) {
  if (!profile || !profile.readingGoal) {
    goalBar.style.width = '0%';
    goalLabel.textContent = 'Save your profile to track progress.';
    return;
  }
  const counts   = getShelfCounts();
  const finished = counts.finished;
  const goal     = parseInt(profile.readingGoal, 10);
  const pct      = Math.min(Math.round((finished / goal) * 100), 100);
  goalBar.style.width   = pct + '%';
  goalLabel.textContent = `${finished} of ${goal} books finished this year — ${pct}%`;
}

function populateForm(profile) {
  if (!profile) return;
  nameInput.value  = profile.name  || '';
  emailInput.value = profile.email || '';
  bioInput.value   = profile.bio   || '';
  goalInput.value  = profile.readingGoal || '';
  bioCount.textContent = `${(profile.bio || '').length} / 200`;

  form.querySelectorAll('input[name="genre"]').forEach(cb => {
    cb.checked = (profile.genres || []).includes(cb.value);
  });

  const format = profile.format || 'print';
  const formatRadio = form.querySelector(`input[name="format"][value="${format}"]`);
  if (formatRadio) formatRadio.checked = true;
}

function handleSubmit(e) {
  e.preventDefault();
  let valid = true;

  const nameVal  = nameInput.value;
  const emailVal = emailInput.value;

  const nameErr  = validateName(nameVal);
  const emailErr = validateEmail(emailVal);

  if (nameErr) {
    setFieldError(nameInput, nameError, nameErr);
    valid = false;
  } else {
    clearFieldError(nameInput, nameError);
  }

  if (emailErr) {
    setFieldError(emailInput, emailError, emailErr);
    valid = false;
  } else {
    clearFieldError(emailInput, emailError);
  }

  if (!valid) {
    showFeedback('Please fix the errors above.', 'error');
    return;
  }

  const profile = {
    name:        nameVal.trim(),
    email:       emailVal.trim(),
    bio:         bioInput.value.trim(),
    readingGoal: goalInput.value,
    genres:      getSelectedGenres(),
    format:      (form.querySelector('input[name="format"]:checked') || {}).value || 'print',
  };

  saveProfile(profile);
  updatePreview(profile);
  updateGoalProgress(profile);
  showFeedback('Profile saved!', 'success');
}

function handleClearAll() {
  if (!confirm('This will delete your profile and all shelves. Are you sure?')) return;
  localStorage.clear();
  location.reload();
}

bioInput.addEventListener('input', () => {
  bioCount.textContent = `${bioInput.value.length} / 200`;
});


form.addEventListener('submit', handleSubmit);

clearBtn.addEventListener('click', handleClearAll);

nameInput.addEventListener('input', () => {
  clearFieldError(nameInput, nameError);
  const val = nameInput.value.trim();
  if (val) {
    nameDisplay.textContent = val;
    avatarEl.textContent    = val[0].toUpperCase();
  }
});

emailInput.addEventListener('change', () => clearFieldError(emailInput, emailError));

const saved = loadProfile();
populateForm(saved);
updatePreview(saved);
updateGoalProgress(saved);
