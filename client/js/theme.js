/* ============================================
   TASKFLOW — Theme Manager
   ============================================ */

import { icons } from './utils.js';

const STORAGE_KEY = 'taskflow_theme';

/**
 * Initialize theme from storage or system preference
 */
export function initTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
  const theme = stored || (prefersDark ? 'dark' : 'light');

  applyTheme(theme);

  // Listen for system theme changes
  window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
    if (!localStorage.getItem(STORAGE_KEY)) {
      applyTheme(e.matches ? 'dark' : 'light');
    }
  });
}

/**
 * Apply a theme to the document
 */
function applyTheme(theme) {
  document.documentElement.setAttribute('data-theme', theme);
  updateToggleIcon(theme);
}

/**
 * Toggle between dark and light
 */
export function toggleTheme() {
  const current = document.documentElement.getAttribute('data-theme') || 'light';
  const next = current === 'dark' ? 'light' : 'dark';
  applyTheme(next);
  localStorage.setItem(STORAGE_KEY, next);
}

/**
 * Update the theme toggle button icon
 */
function updateToggleIcon(theme) {
  const btn = document.getElementById('theme-toggle');
  if (!btn) return;
  btn.innerHTML = theme === 'dark' ? icons.sun : icons.moon;
  btn.setAttribute('data-tooltip', theme === 'dark' ? 'Light mode' : 'Dark mode');
}

/**
 * Get current theme
 */
export function getCurrentTheme() {
  return document.documentElement.getAttribute('data-theme') || 'light';
}
