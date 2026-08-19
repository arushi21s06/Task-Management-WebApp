/* ============================================
   TASKFLOW — Task CRUD & Card Rendering Module
   ============================================ */

import {
  fetchTasks,
  createTask,
  updateTask,
  deleteTask,
  updateTaskStatus,
} from './api.js';
import { showToast } from './toast.js';
import {
  icons,
  escapeHTML,
  formatDate,
  formatDateForInput,
  isOverdue,
  formatStatus,
  capitalize,
} from './utils.js';

let allTasks = [];
let editingTaskId = null;

/**
 * Get all loaded tasks
 */
export function getTasks() {
  return allTasks;
}

/**
 * Load tasks from API
 */
export async function loadTasks(filters = {}) {
  try {
    const params = {};
    if (filters.search) params.search = filters.search;
    if (filters.status && filters.status !== 'all') params.status = filters.status;
    if (filters.priority && filters.priority !== 'all') params.priority = filters.priority;
    if (filters.sort) params.sort = filters.sort;

    const data = await fetchTasks(params);
    allTasks = data.tasks || [];
    return allTasks;
  } catch (err) {
    showToast(err.message, 'error');
    return [];
  }
}

/**
 * Render tasks into a container
 */
export function renderTasks(container, tasks, view = 'grid') {
  if (tasks.length === 0) {
    container.innerHTML = renderEmptyState();
    return;
  }

  const containerClass = view === 'list' ? 'tasks-list' : 'tasks-grid';

  container.innerHTML = `
    <div class="${containerClass}" id="tasks-grid">
      ${tasks.map((task, i) => renderTaskCard(task, i, view)).join('')}
    </div>
  `;

  setupCardEvents(container);
}

function renderTaskCard(task, index, view) {
  const isCompleted = task.status === 'completed';
  const dueText = formatDate(task.dueDate);
  const overdue = !isCompleted && isOverdue(task.dueDate);

  return `
    <div class="task-card ${isCompleted ? 'completed' : ''}" data-id="${task._id}" style="animation-delay: ${index * 50}ms">
      <div class="task-card-header">
        <label class="task-checkbox" data-tooltip="${isCompleted ? 'Mark as pending' : 'Mark as completed'}">
          <input
            type="checkbox"
            ${isCompleted ? 'checked' : ''}
            data-action="toggle-status"
            data-id="${task._id}"
            aria-label="Toggle task completion"
          />
          <span class="checkmark">
            ${icons.check}
          </span>
        </label>
        <span class="task-card-title">${escapeHTML(task.title)}</span>
      </div>

      ${task.description ? `<div class="task-card-desc">${escapeHTML(task.description)}</div>` : ''}

      <div class="task-card-meta">
        <span class="badge badge--${task.priority}">${capitalize(task.priority)}</span>
        <span class="badge badge--${task.status}">${formatStatus(task.status)}</span>
        ${dueText ? `
          <span class="task-card-due ${overdue ? 'overdue' : ''}">
            ${icons.calendar}
            ${dueText}
          </span>
        ` : ''}
        ${task.category ? `
          <span class="task-card-category">
            ${icons.tag}
            ${escapeHTML(task.category)}
          </span>
        ` : ''}
      </div>

      <div class="task-card-footer">
        <button class="task-action-btn task-action-btn--edit" data-action="edit" data-id="${task._id}" data-tooltip="Edit task">
          ${icons.edit}
        </button>
        <button class="task-action-btn task-action-btn--delete" data-action="delete" data-id="${task._id}" data-tooltip="Delete task">
          ${icons.trash}
        </button>
      </div>
    </div>
  `;
}

function renderEmptyState() {
  return `
    <div class="empty-state">
      <div class="empty-state-icon">
        ${icons.clipboard}
      </div>
      <h3>No tasks yet</h3>
      <p>Create your first task and start being productive.</p>
      <button class="btn btn--primary" id="empty-add-btn">
        ${icons.plus}
        Add Task
      </button>
    </div>
  `;
}

/**
 * Render skeleton loading cards
 */
export function renderSkeletons(container, count = 6) {
  container.innerHTML = `
    <div class="tasks-grid">
      ${Array(count)
        .fill(0)
        .map(
          () => `
        <div class="skeleton skeleton--card"></div>
      `
        )
        .join('')}
    </div>
  `;
}

function setupCardEvents(container) {
  // Toggle status (checkbox)
  container.querySelectorAll('[data-action="toggle-status"]').forEach((cb) => {
    cb.addEventListener('change', async (e) => {
      const id = e.target.dataset.id;
      const newStatus = e.target.checked ? 'completed' : 'pending';

      try {
        await updateTaskStatus(id, newStatus);
        showToast(
          e.target.checked ? 'Task marked as completed' : 'Task marked as pending',
          'success'
        );
        window.dispatchEvent(new CustomEvent('tasks:refresh'));
      } catch (err) {
        e.target.checked = !e.target.checked;
        showToast(err.message, 'error');
      }
    });
  });

  // Edit
  container.querySelectorAll('[data-action="edit"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const task = allTasks.find((t) => t._id === id);
      if (task) openTaskModal(task);
    });
  });

  // Delete
  container.querySelectorAll('[data-action="delete"]').forEach((btn) => {
    btn.addEventListener('click', () => {
      const id = btn.dataset.id;
      const task = allTasks.find((t) => t._id === id);
      if (task) showDeleteConfirm(task);
    });
  });

  // Empty state add button
  const emptyBtn = container.querySelector('#empty-add-btn');
  if (emptyBtn) {
    emptyBtn.addEventListener('click', () => {
      window.dispatchEvent(new CustomEvent('task:openModal'));
    });
  }
}

/* ============ TASK MODAL ============ */

/**
 * Open the task create/edit modal
 */
export function openTaskModal(task = null) {
  editingTaskId = task ? task._id : null;
  const isEdit = !!task;

  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'task-modal-overlay';

  overlay.innerHTML = `
    <div class="modal" role="dialog" aria-labelledby="modal-title" aria-modal="true">
      <div class="modal-header">
        <h2 class="modal-title" id="modal-title">${isEdit ? 'Edit Task' : 'Create New Task'}</h2>
        <button class="modal-close" id="modal-close-btn" aria-label="Close">
          ${icons.x}
        </button>
      </div>
      <form id="task-form" novalidate>
        <div class="modal-body">
          <div class="form-group">
            <label class="form-label" for="task-title">Title *</label>
            <input
              class="form-input"
              type="text"
              id="task-title"
              placeholder="What needs to be done?"
              value="${isEdit ? escapeHTML(task.title) : ''}"
              required
            />
          </div>

          <div class="form-group">
            <label class="form-label" for="task-desc">Description</label>
            <textarea
              class="form-textarea form-input"
              id="task-desc"
              placeholder="Add some details..."
              rows="3"
            >${isEdit ? escapeHTML(task.description || '') : ''}</textarea>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div class="form-group">
              <label class="form-label" for="task-priority">Priority</label>
              <select class="form-select" id="task-priority">
                <option value="low" ${isEdit && task.priority === 'low' ? 'selected' : ''}>Low</option>
                <option value="medium" ${(!isEdit || task.priority === 'medium') ? 'selected' : ''}>Medium</option>
                <option value="high" ${isEdit && task.priority === 'high' ? 'selected' : ''}>High</option>
              </select>
            </div>

            <div class="form-group">
              <label class="form-label" for="task-status">Status</label>
              <select class="form-select" id="task-status">
                <option value="pending" ${(!isEdit || task.status === 'pending') ? 'selected' : ''}>Pending</option>
                <option value="in-progress" ${isEdit && task.status === 'in-progress' ? 'selected' : ''}>In Progress</option>
                <option value="completed" ${isEdit && task.status === 'completed' ? 'selected' : ''}>Completed</option>
              </select>
            </div>
          </div>

          <div style="display: grid; grid-template-columns: 1fr 1fr; gap: var(--space-4);">
            <div class="form-group">
              <label class="form-label" for="task-due">Due Date</label>
              <input
                class="form-input"
                type="date"
                id="task-due"
                value="${isEdit ? formatDateForInput(task.dueDate) : ''}"
              />
            </div>

            <div class="form-group">
              <label class="form-label" for="task-category">Category</label>
              <input
                class="form-input"
                type="text"
                id="task-category"
                placeholder="e.g. Work, Personal"
                value="${isEdit ? escapeHTML(task.category || '') : ''}"
              />
            </div>
          </div>
        </div>

        <div class="modal-footer">
          <button type="button" class="btn btn--secondary" id="modal-cancel-btn">Cancel</button>
          <button type="submit" class="btn btn--primary" id="modal-submit-btn">
            ${isEdit ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Focus the title input
  setTimeout(() => {
    document.getElementById('task-title')?.focus();
  }, 100);

  // Events
  overlay.querySelector('#modal-close-btn').addEventListener('click', closeTaskModal);
  overlay.querySelector('#modal-cancel-btn').addEventListener('click', closeTaskModal);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) closeTaskModal();
  });

  // ESC key
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      closeTaskModal();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);

  // Form submit
  overlay.querySelector('#task-form').addEventListener('submit', handleTaskSubmit);
}

function closeTaskModal() {
  const overlay = document.getElementById('task-modal-overlay');
  if (!overlay) return;

  overlay.classList.add('closing');
  document.body.style.overflow = '';

  overlay.addEventListener('animationend', () => {
    overlay.remove();
  });

  // Fallback removal
  setTimeout(() => {
    overlay.remove();
  }, 400);
}

async function handleTaskSubmit(e) {
  e.preventDefault();

  const title = document.getElementById('task-title').value.trim();
  const description = document.getElementById('task-desc').value.trim();
  const priority = document.getElementById('task-priority').value;
  const status = document.getElementById('task-status').value;
  const dueDate = document.getElementById('task-due').value || null;
  const category = document.getElementById('task-category').value.trim();

  if (!title) {
    const titleInput = document.getElementById('task-title');
    titleInput.classList.add('form-input--error');
    titleInput.focus();
    showToast('Please enter a task title', 'warning');
    return;
  }

  const submitBtn = document.getElementById('modal-submit-btn');
  const originalText = submitBtn.textContent;
  submitBtn.disabled = true;
  submitBtn.innerHTML = '<div class="btn-spinner"></div> Saving...';

  const taskData = { title, description, priority, status, dueDate, category };

  try {
    if (editingTaskId) {
      await updateTask(editingTaskId, taskData);
      showToast('Task updated successfully', 'success');
    } else {
      await createTask(taskData);
      showToast('Task created successfully', 'success');
    }

    closeTaskModal();
    window.dispatchEvent(new CustomEvent('tasks:refresh'));
  } catch (err) {
    showToast(err.message, 'error');
    submitBtn.disabled = false;
    submitBtn.textContent = originalText;
  }
}

/* ============ DELETE CONFIRM ============ */

function showDeleteConfirm(task) {
  const overlay = document.createElement('div');
  overlay.className = 'modal-overlay';
  overlay.id = 'delete-modal-overlay';

  overlay.innerHTML = `
    <div class="modal" style="max-width: 400px;">
      <div class="confirm-dialog">
        <div class="confirm-icon">
          ${icons.trash}
        </div>
        <h3>Delete Task</h3>
        <p>Are you sure you want to delete "<strong>${escapeHTML(task.title)}</strong>"? This action cannot be undone.</p>
        <div class="confirm-actions">
          <button class="btn btn--secondary" id="confirm-cancel">Cancel</button>
          <button class="btn btn--danger" id="confirm-delete">Delete</button>
        </div>
      </div>
    </div>
  `;

  document.body.appendChild(overlay);
  document.body.style.overflow = 'hidden';

  // Close
  const close = () => {
    overlay.classList.add('closing');
    document.body.style.overflow = '';
    overlay.addEventListener('animationend', () => overlay.remove());
    setTimeout(() => overlay.remove(), 400);
  };

  overlay.querySelector('#confirm-cancel').addEventListener('click', close);
  overlay.addEventListener('click', (e) => {
    if (e.target === overlay) close();
  });

  // Delete
  overlay.querySelector('#confirm-delete').addEventListener('click', async () => {
    const deleteBtn = overlay.querySelector('#confirm-delete');
    deleteBtn.disabled = true;
    deleteBtn.innerHTML = '<div class="btn-spinner"></div>';

    try {
      // Animate card out
      const card = document.querySelector(`.task-card[data-id="${task._id}"]`);
      if (card) card.classList.add('exiting');

      await deleteTask(task._id);
      showToast('Task deleted successfully', 'success');
      close();

      // Wait for card exit animation then refresh
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('tasks:refresh'));
      }, 300);
    } catch (err) {
      showToast(err.message, 'error');
      deleteBtn.disabled = false;
      deleteBtn.textContent = 'Delete';
    }
  });

  // ESC key
  const handleEsc = (e) => {
    if (e.key === 'Escape') {
      close();
      document.removeEventListener('keydown', handleEsc);
    }
  };
  document.addEventListener('keydown', handleEsc);
}
