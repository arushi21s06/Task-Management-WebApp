/* ============================================
   TASKFLOW — Dashboard Orchestrator
   ============================================ */

import { getStoredUser, logoutUser } from './api.js';
import { loadStats, renderStats, renderProgress } from './stats.js';
import { renderCalendar } from './calendar.js';
import { getFilters, renderFilters, setFilterCallback, setupSearch } from './filters.js';
import { loadTasks, renderTasks, renderSkeletons, getTasks } from './tasks.js';
import { toggleTheme, getCurrentTheme } from './theme.js';
import { icons } from './utils.js';

let isRefreshing = false;

/**
 * Render the dashboard view
 */
export function renderDashboard(container) {
  const user = getStoredUser();
  if (!user) {
    window.dispatchEvent(new CustomEvent('auth:expired'));
    return;
  }

  const initialTheme = getCurrentTheme();

  container.innerHTML = `
    <div class="dashboard-layout" id="dashboard-layout">
      <header class="app-header">
        <div class="header-inner">
          <a href="#" class="header-brand">
            <div class="header-logo">
              ${icons.clipboard}
            </div>
            <div class="header-brand-name">TaskFlow</div>
          </a>

          <div class="header-search">
            ${icons.search}
            <input type="text" id="global-search" placeholder="Search tasks, descriptions, categories..." aria-label="Search" />
          </div>

          <div class="header-actions">
            <button class="theme-toggle" id="theme-toggle" aria-label="Toggle theme" data-tooltip="${initialTheme === 'dark' ? 'Light mode' : 'Dark mode'}">
              ${initialTheme === 'dark' ? icons.sun : icons.moon}
            </button>

            <div class="user-menu" id="user-menu">
              <button class="user-menu-btn" id="user-menu-btn" aria-expanded="false" aria-haspopup="true">
                <div class="user-avatar">${user.avatar || 'U'}</div>
                <div class="user-name">${user.name || 'User'}</div>
                <div class="user-menu-chevron">${icons.chevronDown}</div>
              </button>
              
              <div class="user-dropdown" id="user-dropdown" role="menu">
                <div class="user-dropdown-header">
                  <div class="user-dropdown-name">${user.name || 'User'}</div>
                  <div class="user-dropdown-email">${user.email || ''}</div>
                </div>
                <button class="user-dropdown-item user-dropdown-item--danger" id="logout-btn" role="menuitem">
                  ${icons.logout}
                  <span>Sign Out</span>
                </button>
              </div>
            </div>

            <button class="mobile-menu-btn" id="mobile-menu-btn" aria-label="Menu">
              ${icons.menu}
            </button>
          </div>
        </div>
      </header>

      <main class="dashboard-view view-enter">
        <div id="stats-container"></div>
        <div id="filters-container"></div>
        <div id="tasks-container" class="tasks-container"></div>
        
        <div class="dashboard-grid">
          <div class="section-card" id="progress-container"></div>
          <div class="section-card" id="calendar-container"></div>
        </div>
      </main>

      <button class="add-task-floating hidden" id="add-task-floating" aria-label="Add Task">
        ${icons.plus}
      </button>
    </div>
  `;

  setupDashboardEvents();
  initDashboard();
}

function setupDashboardEvents() {
  // Theme toggle
  document.getElementById('theme-toggle')?.addEventListener('click', toggleTheme);

  // User menu
  const menuBtn = document.getElementById('user-menu-btn');
  const dropdown = document.getElementById('user-dropdown');
  
  if (menuBtn && dropdown) {
    menuBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = dropdown.classList.contains('open');
      dropdown.classList.toggle('open', !isOpen);
      menuBtn.classList.toggle('open', !isOpen);
      menuBtn.setAttribute('aria-expanded', !isOpen);
    });

    document.addEventListener('click', (e) => {
      if (!dropdown.contains(e.target) && !menuBtn.contains(e.target)) {
        dropdown.classList.remove('open');
        menuBtn.classList.remove('open');
        menuBtn.setAttribute('aria-expanded', 'false');
      }
    });
  }

  // Logout
  document.getElementById('logout-btn')?.addEventListener('click', () => {
    logoutUser();
    window.dispatchEvent(new CustomEvent('auth:expired'));
  });

  // Search
  setupSearch('global-search');

  // Filter callbacks
  setFilterCallback(() => {
    refreshTasksOnly();
  });

  // Mobile add button
  const floatingBtn = document.getElementById('add-task-floating');
  if (floatingBtn) {
    // Show only on mobile
    const checkMobile = () => {
      floatingBtn.classList.toggle('hidden', window.innerWidth > 768);
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);

    floatingBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('task:openModal'));
    });
  }
}

/**
 * Initial dashboard load (everything)
 */
async function initDashboard() {
  const statsContainer = document.getElementById('stats-container');
  const filtersContainer = document.getElementById('filters-container');
  const tasksContainer = document.getElementById('tasks-container');
  const progressContainer = document.getElementById('progress-container');
  const calendarContainer = document.getElementById('calendar-container');

  // Render static parts
  renderStats(statsContainer);
  renderFilters(filtersContainer);
  
  // Show skeletons
  renderSkeletons(tasksContainer);

  try {
    // Load data in parallel
    const [stats, tasks] = await Promise.all([
      loadStats(),
      loadTasks(getFilters())
    ]);

    // Render data
    renderTasks(tasksContainer, tasks, getFilters().view);
    renderProgress(progressContainer, stats);
    renderCalendar(calendarContainer, tasks);
  } catch (err) {
    console.error('Error initializing dashboard', err);
  }
}

/**
 * Refresh only tasks list (e.g. after filtering)
 */
async function refreshTasksOnly() {
  if (isRefreshing) return;
  isRefreshing = true;

  const tasksContainer = document.getElementById('tasks-container');
  renderSkeletons(tasksContainer);

  try {
    const tasks = await loadTasks(getFilters());
    renderTasks(tasksContainer, tasks, getFilters().view);
  } finally {
    isRefreshing = false;
  }
}

/**
 * Refresh everything (e.g. after CRUD action)
 */
export async function refreshDashboard() {
  if (isRefreshing) return;
  isRefreshing = true;

  const tasksContainer = document.getElementById('tasks-container');
  const progressContainer = document.getElementById('progress-container');
  const calendarContainer = document.getElementById('calendar-container');

  try {
    const [stats, tasks] = await Promise.all([
      loadStats(),
      loadTasks(getFilters())
    ]);

    renderTasks(tasksContainer, tasks, getFilters().view);
    renderProgress(progressContainer, stats);
    // Note: We use getTasks() here instead of the filtered tasks so calendar sees all upcoming
    renderCalendar(calendarContainer, getTasks());
  } finally {
    isRefreshing = false;
  }
}
