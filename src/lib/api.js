// Thin fetch client. In dev, Vite proxies /api to the backend; in prod set VITE_API_URL.
const BASE = (import.meta.env.VITE_API_URL ?? '').replace(/\/$/, '');
const TOKEN_KEY = 'kinetiq.token';

export const tokenStore = {
  get: () => localStorage.getItem(TOKEN_KEY),
  set: (t) => localStorage.setItem(TOKEN_KEY, t),
  clear: () => localStorage.removeItem(TOKEN_KEY),
};

export class ApiError extends Error {
  constructor(status, message, fields) {
    super(message);
    this.status = status;
    this.fields = fields;
  }
}

const listeners = new Set();
/** Subscribe to 401s so the auth layer can sign the user out. */
export const onUnauthorized = (fn) => (listeners.add(fn), () => listeners.delete(fn));

async function request(path, { method = 'GET', body, signal, raw = false } = {}) {
  const headers = {};
  const token = tokenStore.get();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let res;
  try {
    res = await fetch(`${BASE}${path}`, { method, headers, body: body === undefined ? undefined : JSON.stringify(body), signal });
  } catch (err) {
    if (err.name === 'AbortError') throw err;
    throw new ApiError(0, 'Can’t reach the Kinetiq server. Check your connection.');
  }

  if (res.status === 401 && token) listeners.forEach((fn) => fn());
  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(res.status, data.message || `Request failed (${res.status})`, data.errors);
  }
  if (raw) return res;
  if (res.status === 204) return null;
  return res.json();
}

export const api = {
  get: (p, o) => request(p, o),
  post: (p, body, o) => request(p, { ...o, method: 'POST', body }),
  put: (p, body, o) => request(p, { ...o, method: 'PUT', body }),
  patch: (p, body, o) => request(p, { ...o, method: 'PATCH', body }),
  del: (p, o) => request(p, { ...o, method: 'DELETE' }),

  /** POST and stream a text/plain response, calling onChunk with the full text so far. */
  async stream(path, body, { onChunk, signal } = {}) {
    const res = await request(path, { method: 'POST', body, signal, raw: true });
    const reader = res.body.getReader();
    const decoder = new TextDecoder();
    let text = '';
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      text += decoder.decode(value, { stream: true });
      onChunk?.(text);
    }
    return text;
  },
};
