export type User = {
  id: string;
  firstName: string;
  lastName: string;
  age: number;
  email: string;
  createdAt: string;
  updatedAt?: string;
};

declare global {
  interface ImportMeta {
    readonly env: {
      readonly VITE_API_BASE_URL?: string;
    };
  }
}

const BASE_URL = (import.meta.env.VITE_API_BASE_URL as string) || '/api';

function buildUrl(path: string): string {
  const base = (BASE_URL || '').replace(/\/$/, '');
  const p = path.startsWith('/') ? path : `/${path}`;
  if (!BASE_URL) {
    // Helpful hint during local dev if env is missing
    // eslint-disable-next-line no-console
    console.warn('[api] VITE_API_BASE_URL is not set. Using http://localhost:3000/api');
  }
  return `${base}${p}`;
}

async function http<T>(path: string, init?: RequestInit): Promise<T> {
  const url = buildUrl(path);
  const method = (init?.method || 'GET').toString();
  const shouldDebug = (path.includes('/auth/password/forgot') || path.includes('/auth/password/reset') || path.includes('/auth/password/verify'));
  const startedAt = Date.now();
  if (shouldDebug) {
    // eslint-disable-next-line no-console
    console.log('[api:http] ->', method, url);
  }
  const controller = new AbortController();
  const timeoutMs = path.includes('/auth/password/') ? 60000 : 15000;
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  let res: Response;
  try {
    res = await fetch(url, {
      // Avoid sending cookies for public endpoints to reduce CORS/preflight issues
      credentials: path.includes('/auth/password/') ? 'omit' : 'include',
      headers: { 'Content-Type': 'application/json', ...(init?.headers || {}) },
      signal: controller.signal,
      ...init,
    });
  } catch (err: any) {
    clearTimeout(timeoutId);
    if (shouldDebug) {
      // eslint-disable-next-line no-console
      console.error('[api:http] network error <-', err?.message || err);
    }
    throw { status: 0, message: err?.name === 'AbortError' ? 'Tiempo de espera agotado' : 'Error de red' } as { status: number; message: string };
  }
  clearTimeout(timeoutId);
  if (shouldDebug) {
    // eslint-disable-next-line no-console
    console.log('[api:http] <-', res.status, res.statusText, `${Date.now() - startedAt}ms`);
  }
  // Accept 2xx status codes including 202 (Accepted)
  if (res.status < 200 || res.status >= 300) {
    // Try to parse error message
    let message = 'Error inesperado';
    try {
      const data = await res.json();
      if (data?.message) message = data.message;
    } catch {
      /* ignore */
    }
    throw { status: res.status, message } as { status: number; message: string };
  }
  // 204 no content
  if (res.status === 204) return undefined as unknown as T;
  try {
    const json = (await res.json()) as T;
    if (shouldDebug) {
      // eslint-disable-next-line no-console
      console.log('[api:http] body <-', json);
    }
    return json;
  } catch {
    // No JSON body (e.g., 204), just return undefined
    return undefined as unknown as T;
  }
}

export const api = {
  signup(payload: { firstName: string; lastName: string; age: number; email: string; password: string }) {
    // backend expects firstname/lastname keys; normalize here
    const body = {
      firstname: payload.firstName,
      lastname: payload.lastName,
      age: payload.age,
      email: payload.email,
      password: payload.password,
    };
    return http<{ user: User }>(`/auth/signup`, { method: 'POST', body: JSON.stringify(body) });
  },

  login(payload: { email: string; password: string }) {
    return http<{ user: User }>(`/auth/login`, { method: 'POST', body: JSON.stringify(payload) });
  },

  logout() {
    return http<{ message: string }>(`/auth/logout`, { method: 'POST' });
  },

  getProfile() {
    return http<User>(`/auth/users/me`, { method: 'GET' });
  },

  updateProfile(payload: { firstName: string; lastName: string; age: number; email: string }) {
    const body = {
      firstname: payload.firstName,
      lastname: payload.lastName,
      age: payload.age,
      email: payload.email,
    };
    return http<User>(`/auth/users/me`, { method: 'PUT', body: JSON.stringify(body) });
  },

  deleteMe(payload: { password: string; confirmation: string }) {
    return http<void>(`/auth/users/me`, { method: 'DELETE', body: JSON.stringify(payload) });
  },

  forgotPassword(payload: { email: string }) {
    const form = new URLSearchParams();
    form.set('email', payload.email);
    return http<{ message: string }>(`/auth/password/forgot`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  },

  verifyResetToken(token: string) {
    return http<{ valid: boolean }>(`/auth/password/verify?token=${encodeURIComponent(token)}`, { method: 'GET' });
  },

  resetPassword(payload: { token: string; newPassword: string }) {
    const form = new URLSearchParams();
    form.set('token', payload.token);
    form.set('newPassword', payload.newPassword);
    return http<{ message: string }>(`/auth/password/reset`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: form.toString(),
    });
  },
};

export function isValidEmail(email: string): boolean {
  const re = /^(?:[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+(?:\.[a-zA-Z0-9_'^&+\-`{}~!#$%*?\/|=]+)*)@(?:[a-zA-Z0-9-]+\.)+[a-zA-Z]{2,}$/;
  return re.test(email);
}

export function isStrongPassword(pwd: string): boolean {
  // 8+, lowercase, uppercase, digit, special
  return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/.test(pwd);
}


