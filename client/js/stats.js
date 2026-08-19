/* ============================================
   TASKFLOW — Stats Module
   ============================================ */

import { fetchTaskStats } from './api.js';
import { animateNumber, icons } from './utils.js';

/**
 * Render stats cards section
 */
export function renderStats(container) {
  container.innerHTML = `
    <div class="stats-section" id="stats-section">
      <div class="stats-grid" id="stats-grid">
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon--total">${icons.clipboard}</div>
          </div>
          <div class="stat-label">Total Tasks</div>
          <div class="stat-value" id="stat-total">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon--completed">${icons.checkCircle}</div>
          </div>
          <div class="stat-label">Completed</div>
          <div class="stat-value" id="stat-completed">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon--pending">${icons.clock}</div>
          </div>
          <div class="stat-label">Pending</div>
          <div class="stat-value" id="stat-pending">0</div>
        </div>
        <div class="stat-card">
          <div class="stat-header">
            <div class="stat-icon stat-icon--high">${icons.flag}</div>
          </div>
          <div class="stat-label">High Priority</div>
          <div class="stat-value" id="stat-high">0</div>
        </div>
      </div>
    </div>
  `;
}

/**
 * Load stats from API and animate numbers
 */
export async function loadStats() {
  try {
    const { stats } = await fetchTaskStats();

    animateNumber(document.getElementById('stat-total'), stats.total);
    animateNumber(document.getElementById('stat-completed'), stats.completed);
    animateNumber(document.getElementById('stat-pending'), stats.pending + (stats.inProgress || 0));
    animateNumber(document.getElementById('stat-high'), stats.highPriority);

    return stats;
  } catch (err) {
    console.error('Failed to load stats:', err);
    return null;
  }
}

/**
 * Render progress section
 */
export function renderProgress(container, stats) {
  const percentage = stats ? stats.completionPercentage : 0;
  const completed = stats ? stats.completed : 0;
  const total = stats ? stats.total : 0;
  const remaining = total - completed;
  const circumference = 2 * Math.PI * 45; // r=45
  const offset = circumference - (percentage / 100) * circumference;

  container.innerHTML = `
    <div class="section-title">
      ${icons.trendingUp}
      Your Productivity
    </div>
    <div class="progress-content">
      <div class="progress-ring">
        <svg width="140" height="140" viewBox="0 0 140 140">
          <circle class="progress-ring__bg" cx="70" cy="70" r="45" stroke-width="10" />
          <circle
            class="progress-ring__fill"
            cx="70" cy="70" r="45"
            stroke-width="10"
            stroke-dasharray="${circumference}"
            stroke-dashoffset="${circumference}"
            id="progress-ring-fill"
          />
        </svg>
        <div class="progress-ring__text">
          <span class="progress-ring__percent" id="progress-percent">0</span>
          <span class="progress-ring__label">%</span>
        </div>
      </div>
      <div class="progress-details">
        <div class="progress-bar-container">
          <div class="progress-bar-label">
            <span>Completion</span>
            <span id="progress-bar-pct">${percentage}%</span>
          </div>
          <div class="progress-bar">
            <div class="progress-bar-fill" id="progress-bar-fill"></div>
          </div>
        </div>
        <div class="progress-stats">
          <div class="progress-stat">
            <span class="progress-stat-value">${completed}</span>
            <span class="progress-stat-label">Completed</span>
          </div>
          <div class="progress-stat">
            <span class="progress-stat-value">${remaining}</span>
            <span class="progress-stat-label">Remaining</span>
          </div>
          <div class="progress-stat">
            <span class="progress-stat-value">${total}</span>
            <span class="progress-stat-label">Total</span>
          </div>
        </div>
      </div>
    </div>
  `;

  // Animate after render
  requestAnimationFrame(() => {
    setTimeout(() => {
      const ring = document.getElementById('progress-ring-fill');
      const bar = document.getElementById('progress-bar-fill');
      const pctEl = document.getElementById('progress-percent');

      if (ring) ring.style.strokeDashoffset = offset;
      if (bar) bar.style.width = percentage + '%';
      if (pctEl) animateNumber(pctEl, percentage, 1000);
    }, 300);
  });
}
