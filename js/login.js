import { loadProfile, saveProfile } from './storage.js';

const tabs           = document.querySelectorAll('.login-tab');
const signinForm     = document.getElementById('signin-form');
const registerForm   = document.getElementById('register-form');
const forgotPanel    = document.getElementById('forgot-panel');
const forgotForm     = document.getElementById('forgot-form');
const forgotLink     = document.getElementById('forgot-link');
const forgotBack     = document.getElementById('forgot-back');
const loginCard      = document.querySelector('.login-card');
const loggedInCard   = document.getElementById('logged-in-card');
const signoutBtn     = document.getElementById('signout-btn');

const siEmail        = document.getElementById('signin-email');
const siPassword     = document.getElementById('signin-password');
const siRemember     = document.getElementById('signin-remember');
const siEmailErr     = document.getElementById('signin-email-error');
const siPasswordErr  = document.getElementById('signin-password-error');
const siFeedback     = document.getElementById('signin-feedback');

const regName        = document.getElementById('reg-name');
const regEmail       = document.getElementById('reg-email');
const regPassword    = document.getElementById('reg-password');
const regConfirm     = document.getElementById('reg-confirm');
const regTerms       = document.getElementById('reg-terms');
const regNameErr     = document.getElementById('reg-name-error');
const regEmailErr    = document.getElementById('reg-email-error');
const regPasswordErr = document.getElementById('reg-password-error');
const regConfirmErr  = document.getElementById('reg-confirm-error');
const regTermsErr    = document.getElementById('reg-terms-error');
const regFeedback    = document.getElementById('register-feedback');

const forgotEmail    = document.getElementById('forgot-email');
const forgotEmailErr = document.getElementById('forgot-email-error');
const forgotFeedback = document.getElementById('forgot-feedback');

const liAvatar       = document.getElementById('li-avatar');
const liName         = document.getElementById('li-name');
const liEmail        = document.getElementById('li-email');

const SESSION_KEY    = 'bookshelf_session';

function isValidEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

function setError(inputEl, errorEl, message) {
  inputEl.classList.add('login-form__input--error');
  errorEl.textContent = message;
}

function clearError(inputEl, errorEl) {
  inputEl.classList.remove('login-form__input--error');
  errorEl.textContent = '';
}

function showFeedback(el, message, type) {
  el.textContent = message;
  el.className = `login-form__feedback login-form__feedback--${type}`;
  el.hidden = false;
}

function switchTab(targetTab) {
  tabs.forEach(t => {
    t.classList.remove('login-tab--active');
    t.setAttribute('aria-selected', 'false');
  });
  targetTab.classList.add('login-tab--active');
  targetTab.setAttribute('aria-selected', 'true');

  const isSignin = targetTab.dataset.tab === 'signin';
  signinForm.hidden   = !isSignin;
  registerForm.hidden = isSignin;
  forgotPanel.hidden  = true;
}

tabs.forEach(tab => tab.addEventListener('click', () => switchTab(tab)));

function makePasswordToggle(toggleBtn, inputEl) {
  toggleBtn.addEventListener('click', () => {
    const isHidden = inputEl.type === 'password';
    inputEl.type = isHidden ? 'text' : 'password';
    toggleBtn.textContent = isHidden ? '🙈' : '👁';
  });
}

makePasswordToggle(document.getElementById('toggle-signin-pw'), siPassword);
makePasswordToggle(document.getElementById('toggle-reg-pw'), regPassword);

forgotLink.addEventListener('click', (e) => {
  e.preventDefault();
  signinForm.hidden  = true;
  forgotPanel.hidden = false;
});

forgotBack.addEventListener('click', () => {
  forgotPanel.hidden = false;
  signinForm.hidden  = false;
  forgotPanel.hidden = true;
});

forgotForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const val = forgotEmail.value;
  if (!val || !isValidEmail(val)) {
    setError(forgotEmail, forgotEmailErr, 'Please enter a valid email.');
    return;
  }
  clearError(forgotEmail, forgotEmailErr);

  showFeedback(forgotFeedback, `Reset link sent to ${val} (simulated — no real backend).`, 'success');
});

function showLoggedIn(user) {
  loginCard.hidden    = true;
  loggedInCard.hidden = false;
  liAvatar.textContent = (user.name || user.email)[0].toUpperCase();
  liName.textContent   = user.name  || '—';
  liEmail.textContent  = user.email || '—';
}

signinForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  if (!siEmail.value || !isValidEmail(siEmail.value)) {
    setError(siEmail, siEmailErr, 'Please enter a valid email.');
    valid = false;
  } else {
    clearError(siEmail, siEmailErr);
  }

  if (!siPassword.value || siPassword.value.length < 6) {
    setError(siPassword, siPasswordErr, 'Password must be at least 6 characters.');
    valid = false;
  } else {
    clearError(siPassword, siPasswordErr);
  }

  if (!valid) return;

  // Look up registered user in localStorage
  const registered = JSON.parse(localStorage.getItem('bookshelf_users') || '[]');
  const match = registered.find(
    u => u.email === siEmail.value && u.password === siPassword.value
  );

  if (!match) {
    showFeedback(siFeedback, 'Incorrect email or password.', 'error');
    return;
  }

  const session = { name: match.name, email: match.email };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));

  const profile = loadProfile() || {};
  if (!profile.name) {
    saveProfile({ ...profile, name: match.name, email: match.email });
  }

  showFeedback(siFeedback, 'Signed in! Redirecting…', 'success');
  setTimeout(() => showLoggedIn(session), 900);
});

registerForm.addEventListener('submit', (e) => {
  e.preventDefault();
  let valid = true;

  if (!regName.value.trim() || regName.value.trim().length < 2) {
    setError(regName, regNameErr, 'Name must be at least 2 characters.');
    valid = false;
  } else { clearError(regName, regNameErr); }

  if (!regEmail.value || !isValidEmail(regEmail.value)) {
    setError(regEmail, regEmailErr, 'Please enter a valid email.');
    valid = false;
  } else { clearError(regEmail, regEmailErr); }

  if (!regPassword.value || regPassword.value.length < 6) {
    setError(regPassword, regPasswordErr, 'Password must be at least 6 characters.');
    valid = false;
  } else { clearError(regPassword, regPasswordErr); }

  if (regConfirm.value !== regPassword.value) {
    setError(regConfirm, regConfirmErr, 'Passwords do not match.');
    valid = false;
  } else { clearError(regConfirm, regConfirmErr); }

  if (!regTerms.checked) {
    regTermsErr.textContent = 'You must agree to the terms.';
    valid = false;
  } else { regTermsErr.textContent = ''; }

  if (!valid) return;

  const users = JSON.parse(localStorage.getItem('bookshelf_users') || '[]');
  if (users.find(u => u.email === regEmail.value)) {
    showFeedback(regFeedback, 'An account with that email already exists.', 'error');
    return;
  }

  users.push({
    name:     regName.value.trim(),
    email:    regEmail.value.trim(),
    password: regPassword.value,
  });
  localStorage.setItem('bookshelf_users', JSON.stringify(users));

  const session = { name: regName.value.trim(), email: regEmail.value.trim() };
  localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  saveProfile({ name: session.name, email: session.email });

  showFeedback(regFeedback, 'Account created! Welcome to Bookshelf 🎉', 'success');
  setTimeout(() => showLoggedIn(session), 1000);
});

signoutBtn.addEventListener('click', () => {
  localStorage.removeItem(SESSION_KEY);
  loggedInCard.hidden = true;
  loginCard.hidden    = false;
});

(function init() {
  const session = JSON.parse(localStorage.getItem(SESSION_KEY) || 'null');
  if (session) {
    showLoggedIn(session);
  }
})();