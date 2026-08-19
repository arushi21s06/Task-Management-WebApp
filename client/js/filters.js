/* ============================================
   TASKFLOW — Filter, Search & Sort Module
   ============================================ */

import { icons, debounce } from './utils.js';

let currentFilters = {
  search: '',
  status: 'all',
  priority: 'all',
  sort: 'newest',
  view: 'grid',
};

let onFilterChange = null;

/**
 * Get current filter state
 */
export function getFilters() {
  return { ...currentFilters };
}

/**
 * Set the filter change callback
 */
export function setFilterCallback(cb) {
  onFilterChange = cb;
}

/**
 * Render the filter toolbar
 */
export function renderFilters(container) {
  container.innerHTML = `
    <div class="toolbar" id="toolbar">
      <div class="toolbar-left">
        <div class="filter-pills" id="filter-pills">
          <button class="filter-pill active" data-filter="all">All</button>
          <button class="filter-pill" data-filter="pending" data-type="status">Pending</button>
          <button class="filter-pill" data-filter="in-progress" data-type="status">In Progress</button>
          <button class="filter-pill" data-filter="completed" data-type="status">Completed</button>
          <button class="filter-pill" data-filter="high" data-type="priority">High</button>
          <button class="filter-pill" data-filter="medium" data-type="priority">Medium</button>
          <button class="filter-pill" data-filter="low" data-type="priority">Low</button>
        </div>
      </div>
      <div class="toolbar-right">
        <select class="sort-select" id="sort-select" aria-label="Sort tasks">
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="dueDate">Due Date</option>
          <option value="priority">Priority</option>
        </select>
        <div class="view-toggle" id="view-toggle">
          <button class="view-toggle-btn active" data-view="grid" aria-label="Grid view" data-tooltip="Grid view">
            ${icons.grid}
          </button>
          <button class="view-toggle-btn" data-view="list" aria-label="List view" data-tooltip="List view">
            ${icons.list}
          </button>
        </div>
        <button class="btn btn--primary add-task-btn" id="add-task-btn">
          ${icons.plus}
          <span>Add Task</span>
        </button>
      </div>
    </div>
  `;

  setupFilterEvents();
}

function setupFilterEvents() {
  // Filter pills
  document.querySelectorAll('.filter-pill').forEach((pill) => {
    pill.addEventListener('click', () => {
      const filter = pill.dataset.filter;
      const type = pill.dataset.type;

      // Reset both status & priority when "All" is clicked
      if (filter === 'all') {
        currentFilters.status = 'all';
        currentFilters.priority = 'all';
      } else if (type === 'status') {
        currentFilters.status = filter;
        currentFilters.priority = 'all';
      } else if (type === 'priority') {
        currentFilters.priority = filter;
        currentFilters.status = 'all';
      }

      // Update active state
      document.querySelectorAll('.filter-pill').forEach((p) => p.classList.remove('active'));
      pill.classList.add('active');

      emitChange();
    });
  });

  // Sort
  document.getElementById('sort-select').addEventListener('change', (e) => {
    currentFilters.sort = e.target.value;
    emitChange();
  });

  // View toggle
  document.querySelectorAll('.view-toggle-btn').forEach((btn) => {
    btn.addEventListener('click', () => {
      currentFilters.view = btn.dataset.view;
      document.querySelectorAll('.view-toggle-btn').forEach((b) => b.classList.remove('active'));
      btn.classList.add('active');
      emitChange();
    });
  });

  // Add task button
  document.getElementById('add-task-btn').addEventListener('click', () => {
    window.dispatchEvent(new CustomEvent('task:openModal'));
  });
}

/**
 * Setup search input in header (called separately since header is rendered elsewhere)
 */
export function setupSearch(inputId) {
  const input = document.getElementById(inputId);
  if (!input) return;

  const debouncedSearch = debounce((value) => {
    currentFilters.search = value;
    emitChange();
  }, 300);

  input.addEventListener('input', (e) => {
    debouncedSearch(e.target.value.trim());
  });
}

function emitChange() {
  if (onFilterChange) onFilterChange(currentFilters);
}
