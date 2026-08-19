/* ============================================
   TASKFLOW — Toast Notification System
   ============================================ */

import { icons } from './utils.js';

let toastContainer = null;

function ensureContainer() {
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.className = 'toast-container';
    toastContainer.setAttribute('aria-live', 'polite');
    toastContainer.setAttribute('aria-atomic', 'true');
    document.body.appendChild(toastContainer);
  }
  return toastContainer;
}

const typeConfig = {
  success: { icon: icons.checkCircle, title: 'Success' },
  error: { icon: icons.alertCircle, title: 'Error' },
  warning: { icon: icons.warning, title: 'Warning' },
  info: { icon: icons.info, title: 'Info' },
};

/**
 * Show a toast notification
 * @param {string} message
 * @param {'success'|'error'|'warning'|'info'} type
 * @param {number} duration - ms
 */
export function showToast(message, type = 'info', duration = 4000) {
  const container = ensureContainer();
  const config = typeConfig[type] || typeConfig.info;

  const toast = document.createElement('div');
  toast.className = `toast toast--${type}`;
  toast.setAttribute('role', 'alert');

  toast.innerHTML = `
    <span class="toast-icon">${config.icon}</span>
    <div class="toast-content">
      <div class="toast-title">${config.title}</div>
      <div class="toast-message">${message}</div>
    </div>
    <button class="toast-close" aria-label="Dismiss">${icons.x}</button>
    <div class="toast-progress" style="width: 100%"></div>
  `;

  container.appendChild(toast);

  const closeBtn = toast.querySelector('.toast-close');
  const progressBar = toast.querySelector('.toast-progress');

  // Animate progress bar
  requestAnimationFrame(() => {
    progressBar.style.transitionDuration = duration + 'ms';
    progressBar.style.width = '0%';
  });

  // Auto dismiss
  const timeout = setTimeout(() => dismissToast(toast), duration);

  // Close button
  closeBtn.addEventListener('click', () => {
    clearTimeout(timeout);
    dismissToast(toast);
  });
}

function dismissToast(toast) {
  if (toast.classList.contains('toast-exit')) return;
  toast.classList.add('toast-exit');
  
  const removeToast = () => toast.remove();
  toast.addEventListener('animationend', removeToast);
  // Fallback in case animationend doesn't fire (e.g. reduced motion or tab inactive)
  setTimeout(removeToast, 400);
}

export default { showToast };
