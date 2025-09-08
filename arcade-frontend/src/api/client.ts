export type ApiResult<T> = { data?: T; error?: string };

const BASE_URL = import.meta.env.VITE_BACKEND_URL || 'http://localhost:5050';

function getAuthToken(): string | null {
  try { return localStorage.getItem('authToken'); } catch { return null; }
}

async function request<T>(path: string, options: RequestInit = {}): Promise<ApiResult<T>> {
  try {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    const token = getAuthToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
    const res = await fetch(`${BASE_URL}${path}`, { ...options, headers });
    const json = await res.json().catch(() => ({}));
    if (!res.ok) {
      const err = (json as any)?.error;
      let message = `HTTP ${res.status}`;
      if (typeof err === 'string') message = err;
      else if (Array.isArray(err)) message = err.map((e) => e?.message || e?.code || 'Invalid').join(', ');
      else if (err && typeof err === 'object') message = err.message || JSON.stringify(err);
      return { error: message };
    }
    return { data: json } as ApiResult<T>;
  } catch (e: any) {
    return { error: e?.message || 'Network error' };
  }
}

export const api = {
  // Auth
  register: (username: string, password: string) =>
    request<{ token: string; user: { id: string; username: string } }>(`/auth/register`, {
      method: 'POST', body: JSON.stringify({ username, password })
    }),
  login: (username: string, password: string) =>
    request<{ token: string; user: { id: string; username: string } }>(`/auth/login`, {
      method: 'POST', body: JSON.stringify({ username, password })
    }),
  me: () => request<{ user: { id: string; username: string } }>(`/auth/me`),

  // Game
  startGame: () => request<{ sessionId: string }>(`/game/start`, { method: 'POST' }),
  roll: () => request<{ r1: number; r2: number }>(`/game/roll`, { method: 'POST' }),
  recordWin: (game: string, points: number = 50) =>
    request<{ ok: true; awarded: number }>(`/game/win`, { method: 'POST', body: JSON.stringify({ game, points }) }),

  // Leaderboard
  leaderboard: () => request<{ leaders: Array<{ user_id: string; username: string; total_points: number }> }>(`/leaderboard`),
  myPoints: () => request<{ user_id: string; username: string; total_points: number }>(`/leaderboard/me`),
};


