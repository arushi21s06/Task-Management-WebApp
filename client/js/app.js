/* ============================================
   TASKFLOW — Application Entry Point
   ============================================ */

import { initTheme } from './theme.js';
import { isAuthenticated } from './api.js';
import { renderAuth } from './auth.js';
import { renderDashboard, refreshDashboard } from './dashboard.js';
import { openTaskModal } from './tasks.js';
import { icons } from './utils.js';

const appContainer = document.getElementById('app');

/**
 * Initialize application
 */
function init() {
  initTheme();
  setupGlobalEvents();
  
  // Render animated background (static part)
  const bg = document.createElement('div');
  bg.className = 'animated-bg';
  bg.setAttribute('aria-hidden', 'true');
  bg.innerHTML = `
    <div class="blob blob--1"></div>
    <div class="blob blob--2"></div>
    <div class="blob blob--3"></div>
  `;
  document.body.prepend(bg);

  // Check auth and route
  route();
}

/**
 * Handle routing between auth and dashboard views
 */
function route() {
  // Clear container with fade out if it has content
  if (appContainer.children.length > 0) {
    const currentView = appContainer.firstElementChild;
    currentView.classList.add('view-exit');
    
    currentView.addEventListener('animationend', () => {
      renderView();
    }, { once: true });
    
    // Fallback
    setTimeout(() => {
      if (appContainer.contains(currentView)) {
        renderView();
      }
    }, 300);
  } else {
    renderView();
  }
}

function renderView() {
  if (isAuthenticated()) {
    renderDashboard(appContainer);
  } else {
    renderAuth(appContainer);
  }
}

/**
 * Setup global event listeners for cross-module communication
 */
function setupGlobalEvents() {
  // Auth events
  window.addEventListener('auth:success', () => {
    route();
  });

  window.addEventListener('auth:expired', () => {
    route();
  });

  // Task events
  window.addEventListener('tasks:refresh', () => {
    refreshDashboard();
  });

  window.addEventListener('task:openModal', (e) => {
    const task = e.detail?.task || null;
    openTaskModal(task);
  });
}

// Start app
document.addEventListener('DOMContentLoaded', init);
