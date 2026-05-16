// Base API URL — đổi 1 chỗ này khi deploy
export const API = 'https://duylongtech-project-master.onrender.com/api'

// Helpers
export const apiFetch = (path, opts = {}) =>
  fetch(`${API}${path}`, { headers: { 'Content-Type': 'application/json' }, ...opts })

export const apiPost = (path, body) =>
  apiFetch(path, { method: 'POST', body: JSON.stringify(body) })

export const apiPut = (path, body) =>
  apiFetch(path, { method: 'PUT', body: JSON.stringify(body) })

export const apiDelete = (path) =>
  apiFetch(path, { method: 'DELETE' })
