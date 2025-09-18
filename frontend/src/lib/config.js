// src/lib/config.js
const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000"; // dev fallback

export function apiUrl(path = "") {
  return `${API_BASE.replace(/\/+$/, "")}/${path.replace(/^\/+/, "")}`;
}

export { API_BASE };
