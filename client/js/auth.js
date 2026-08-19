/* ============================================
   TASKFLOW — Auth UI Module
   ============================================ */

import { registerUser, loginUser } from './api.js';
import { showToast } from './toast.js';
import { icons, escapeHTML } from './utils.js';

let currentTab = 'login';

/**
 * Render the auth view
 */
export function renderAuth(container) {
  container.innerHTML = `
    <div class="auth-view" id="auth-view">
      <div class="auth-container">
        <div class="auth-brand">
          <div class="auth-brand-logo">
            ${icons.clipboard}
          </div>
          <h1>TaskFlow</h1>
          <p>Organize your work, amplify your productivity</p>
        </div>

        <div class="auth-card">
          <div class="auth-tabs">
            <button class="auth-tab active" data-tab="login" id="tab-login">Sign In</button>
            <button class="auth-tab" data-tab="register" id="tab-register">Sign Up</button>
          </div>

          <div id="auth-error" class="auth-error hidden" role="alert">
            ${icons.alertCircle}
            <span id="auth-error-msg"></span>
          </div>

          <form id="auth-form" class="auth-form" novalidate>
            <!-- Name field (register only) -->
            <div class="form-group hidden" id="name-group">
              <label class="form-label" for="auth-name">Full Name</label>
              <input
                class="form-input"
                type="text"
                id="auth-name"
                name="name"
                placeholder="Enter your name"
                autocomplete="name"
              />
            </div>

            <!-- Email -->
            <div class="form-group">
              <label class="form-label" for="auth-email">Email Address</label>
              <input
                class="form-input"
                type="email"
                id="auth-email"
                name="email"
                placeholder="Enter your email"
                autocomplete="email"
                required
              />
            </div>

            <!-- Password -->
            <div class="form-group">
              <label class="form-label" for="auth-password">Password</label>
              <div class="input-wrapper">
                <input
                  class="form-input"
                  type="password"
                  id="auth-password"
                  name="password"
                  placeholder="Enter your password"
                  autocomplete="current-password"
                  required
                />
                <button type="button" class="input-toggle-pw" id="toggle-pw" aria-label="Show password">
                  ${icons.eye}
                </button>
              </div>
            </div>

            <!-- Confirm Password (register only) -->
            <div class="form-group hidden" id="confirm-pw-group">
              <label class="form-label" for="auth-confirm-pw">Confirm Password</label>
              <div class="input-wrapper">
                <input
                  class="form-input"
                  type="password"
                  id="auth-confirm-pw"
                  name="confirmPassword"
                  placeholder="Confirm your password"
                  autocomplete="new-password"
                />
                <button type="button" class="input-toggle-pw" id="toggle-confirm-pw" aria-label="Show password">
                  ${icons.eye}
                </button>
              </div>
            </div>

            <button type="submit" class="btn btn--primary btn--lg" id="auth-submit-btn">
              Sign In
            </button>
          </form>
        </div>

        <div class="auth-footer">
          <p>TaskFlow &copy; ${new Date().getFullYear()} — Built with ❤️</p>
        </div>
      </div>
    </div>
  `;

  setupAuthEvents();
}

function setupAuthEvents() {
  // Tab switching
  document.querySelectorAll('.auth-tab').forEach((tab) => {
    tab.addEventListener('click', () => switchTab(tab.dataset.tab));
  });

  // Form submit
  document.getElementById('auth-form').addEventListener('submit', handleSubmit);

  // Password visibility toggles
  setupPasswordToggle('toggle-pw', 'auth-password');
  setupPasswordToggle('toggle-confirm-pw', 'auth-confirm-pw');
}

function setupPasswordToggle(toggleId, inputId) {
  const toggle = document.getElementById(toggleId);
  const input = document.getElementById(inputId);
  if (!toggle || !input) return;

  toggle.addEventListener('click', () => {
    const isPassword = input.type === 'password';
    input.type = isPassword ? 'text' : 'password';
    toggle.innerHTML = isPassword ? icons.eyeOff : icons.eye;
    toggle.setAttribute('aria-label', isPassword ? 'Hide password' : 'Show password');
  });
}

function switchTab(tab) {
  currentTab = tab;
  const nameGroup = document.getElementById('name-group');
  const confirmGroup = document.getElementById('confirm-pw-group');
  const submitBtn = document.getElementById('auth-submit-btn');

  // Update active tab
  document.querySelectorAll('.auth-tab').forEach((t) => {
    t.classList.toggle('active', t.dataset.tab === tab);
  });

  // Toggle fields
  if (tab === 'register') {
    nameGroup.classList.remove('hidden');
    confirmGroup.classList.remove('hidden');
    submitBtn.textContent = 'Create Account';
    document.getElementById('auth-password').autocomplete = 'new-password';
  } else {
    nameGroup.classList.add('hidden');
    confirmGroup.classList.add('hidden');
    submitBtn.textContent = 'Sign In';
    document.getElementById('auth-password').autocomplete = 'current-password';
  }

  // Clear error
  hideError();
}

async function handleSubmit(e) {
  e.preventDefault();
  hideError();

  const email = document.getElementById('auth-email').value.trim();
  const password = document.getElementById('auth-password').value;

  // Basic validation
  if (!email || !password) {
    showError('Please fill in all required fields');
    return;
  }

  if (!isValidEmail(email)) {
    showError('Please enter a valid email address');
    return;
  }

  if (password.length < 6) {
    showError('Password must be at least 6 characters');
    return;
  }

  const submitBtn = document.getElementById('auth-submit-btn');
  const originalText = submitBtn.textContent;

  if (currentTab === 'register') {
    const name = document.getElementById('auth-name').value.trim();
    const confirmPw = document.getElementById('auth-confirm-pw').value;

    if (!name) {
      showError('Please enter your name');
      return;
    }

    if (password !== confirmPw) {
      showError('Passwords do not match');
      return;
    }

    // Submit
    setLoading(submitBtn, true);
    try {
      await registerUser(name, email, password);
      showToast('Account created successfully! Welcome to TaskFlow.', 'success');
      window.dispatchEvent(new CustomEvent('auth:success'));
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(submitBtn, false, originalText);
    }
  } else {
    // Login
    setLoading(submitBtn, true);
    try {
      await loginUser(email, password);
      showToast('Welcome back!', 'success');
      window.dispatchEvent(new CustomEvent('auth:success'));
    } catch (err) {
      showError(err.message);
    } finally {
      setLoading(submitBtn, false, originalText);
    }
  }
}

function showError(msg) {
  const errorEl = document.getElementById('auth-error');
  const errorMsg = document.getElementById('auth-error-msg');
  if (!errorEl || !errorMsg) return;
  errorMsg.textContent = msg;
  errorEl.classList.remove('hidden');
}

function hideError() {
  const errorEl = document.getElementById('auth-error');
  if (errorEl) errorEl.classList.add('hidden');
}

function setLoading(btn, loading, text = '') {
  if (loading) {
    btn.disabled = true;
    btn.innerHTML = '<div class="btn-spinner"></div> Please wait...';
  } else {
    btn.disabled = false;
    btn.textContent = text;
  }
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}
