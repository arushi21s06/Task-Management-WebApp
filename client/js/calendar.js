/* ============================================
   TASKFLOW — Calendar / Upcoming Tasks Module
   ============================================ */

import { icons, formatDate, isOverdue, isToday, isTomorrow, escapeHTML, formatStatus } from './utils.js';

/**
 * Render upcoming tasks section
 */
export function renderCalendar(container, tasks) {
  // Filter tasks with due dates, exclude completed, sort by date
  const upcoming = tasks
    .filter((t) => t.dueDate && t.status !== 'completed')
    .sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate))
    .slice(0, 10);

  container.innerHTML = `
    <div class="section-title">
      ${icons.calendar}
      Upcoming Tasks
    </div>
    <div class="upcoming-list" id="upcoming-list">
      ${upcoming.length === 0 ? renderEmptyUpcoming() : renderUpcomingGroups(upcoming)}
    </div>
  `;
}

function renderEmptyUpcoming() {
  return `
    <div style="text-align: center; padding: 2rem 0; color: var(--text-tertiary); font-size: var(--font-size-sm);">
      ${icons.calendar}
      <p style="margin-top: 0.5rem;">No upcoming tasks</p>
    </div>
  `;
}

function renderUpcomingGroups(tasks) {
  // Group by formatted date
  const groups = {};
  tasks.forEach((task) => {
    const label = getDateLabel(task.dueDate);
    if (!groups[label]) groups[label] = [];
    groups[label].push(task);
  });

  return Object.entries(groups)
    .map(
      ([label, items]) => `
      <div class="upcoming-group">
        <div class="upcoming-date">
          <span class="upcoming-date-dot ${getDotClass(items[0].dueDate)}"></span>
          ${label}
        </div>
        ${items
          .map(
            (task) => `
          <div class="upcoming-item ${isOverdue(task.dueDate) ? 'overdue' : ''}">
            <span>${escapeHTML(task.title)}</span>
            <span class="badge badge--${task.priority}">${task.priority}</span>
          </div>
        `
          )
          .join('')}
      </div>
    `
    )
    .join('');
}

function getDateLabel(dateStr) {
  if (isToday(dateStr)) return 'Today';
  if (isTomorrow(dateStr)) return 'Tomorrow';
  if (isOverdue(dateStr)) return 'Overdue';
  return formatDate(dateStr);
}

function getDotClass(dateStr) {
  if (isOverdue(dateStr)) return 'overdue';
  if (isToday(dateStr)) return 'today';
  return '';
}
