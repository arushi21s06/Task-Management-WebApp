/* ============================================
   TASKFLOW — API Service Layer
   ============================================ */

const API_BASE = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1' 
  ? 'http://localhost:5000/api' 
  : '/api';

/**
 * Get stored JWT token
 */
function getToken() {
  return localStorage.getItem('taskflow_token');
}

/**
 * Make an authenticated API request
 */
async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const token = getToken();

  const config = {
    headers: {
      'Content-Type': 'application/json',
      ...(token && { Authorization: `Bearer ${token}` }),
      ...options.headers,
    },
    ...options,
  };

  try {
    const response = await fetch(url, config);
    const data = await response.json();

    if (!response.ok) {
      // Token expired or invalid — clear and redirect
      if (response.status === 401) {
        localStorage.removeItem('taskflow_token');
        localStorage.removeItem('taskflow_user');
        // Dispatch event for app to handle
        window.dispatchEvent(new CustomEvent('auth:expired'));
      }
      throw new Error(data.message || 'Something went wrong');
    }

    return data;
  } catch (error) {
    if (error.name === 'TypeError' && error.message.includes('fetch')) {
      throw new Error('Unable to connect to server. Please try again.');
    }
    throw error;
  }
}

/* ============ Auth API ============ */

export async function registerUser(name, email, password) {
  const data = await request('/auth/register', {
    method: 'POST',
    body: JSON.stringify({ name, email, password }),
  });

  if (data.success) {
    localStorage.setItem('taskflow_token', data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
  }

  return data;
}

export async function loginUser(email, password) {
  const data = await request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });

  if (data.success) {
    localStorage.setItem('taskflow_token', data.token);
    localStorage.setItem('taskflow_user', JSON.stringify(data.user));
  }

  return data;
}

export async function getMe() {
  return request('/auth/me');
}

export function logoutUser() {
  localStorage.removeItem('taskflow_token');
  localStorage.removeItem('taskflow_user');
}

export function isAuthenticated() {
  return !!getToken();
}

export function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('taskflow_user'));
  } catch {
    return null;
  }
}

/* ============ Tasks API ============ */

export async function fetchTasks(params = {}) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value && value !== 'all') {
      searchParams.append(key, value);
    }
  });

  const query = searchParams.toString();
  return request(`/tasks${query ? '?' + query : ''}`);
}

export async function fetchTask(id) {
  return request(`/tasks/${id}`);
}

export async function createTask(taskData) {
  return request('/tasks', {
    method: 'POST',
    body: JSON.stringify(taskData),
  });
}

export async function updateTask(id, taskData) {
  return request(`/tasks/${id}`, {
    method: 'PUT',
    body: JSON.stringify(taskData),
  });
}

export async function deleteTask(id) {
  return request(`/tasks/${id}`, {
    method: 'DELETE',
  });
}

export async function updateTaskStatus(id, status) {
  return request(`/tasks/${id}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export async function fetchTaskStats() {
  return request('/tasks/stats');
}
