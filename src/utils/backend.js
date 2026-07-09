// ═══════════════════════════════════════════
// CALORIX — BACKEND API LAYER
// Talks to the FastAPI server (auth, meals, goals,
// recipes, chat) running at BACKEND_URL.
// ═══════════════════════════════════════════

const BACKEND_URL = (window.CALORIX_BACKEND_URL || 'http://127.0.0.1:8000').replace(/\/$/, '');

async function backendFetch(path, { method = 'GET', body, auth = true } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (auth) {
    const token = Store.getToken();
    if (!token) throw new Error('NOT_LOGGED_IN');
    headers['Authorization'] = `Bearer ${token}`;
  }

  let res;
  try {
    res = await fetch(`${BACKEND_URL}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
    });
  } catch (err) {
    throw new Error('Cannot reach the CaloriX server. Make sure the backend URL is correct and the API is running.');
  }

  if (res.status === 401) {
    Store.clearAuth();
    throw new Error('SESSION_EXPIRED');
  }

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err.detail || `HTTP ${res.status}`);
  }

  if (res.status === 204) return null;
  return res.json();
}

const BackendAuth = {
  async register(email, password, name) {
    const data = await backendFetch('/auth/register', {
      method: 'POST',
      auth: false,
      body: { email, password, name },
    });
    Store.setToken(data.access_token);
    Store.setUser(data.user);
    return data.user;
  },

  async login(email, password) {
    const data = await backendFetch('/auth/login', {
      method: 'POST',
      auth: false,
      body: { email, password },
    });
    Store.setToken(data.access_token);
    Store.setUser(data.user);
    return data.user;
  },

  async me() {
    const user = await backendFetch('/auth/me');
    Store.setUser(user);
    return user;
  },

  async updateMe({ name, current_password, new_password } = {}) {
    const user = await backendFetch('/auth/me', {
      method: 'PUT',
      body: { name, current_password, new_password },
    });
    Store.setUser(user);
    return user;
  },

  logout() {
    Store.clearAuth();
  },
};

const BackendMeals = {
  list()               { return backendFetch('/meals'); },
  log(meal)            { return backendFetch('/meals', { method: 'POST', body: meal }); },
  remove(id)           { return backendFetch(`/meals/${id}`, { method: 'DELETE' }); },
  clearToday()         { return backendFetch('/meals', { method: 'DELETE' }); },
};

const BackendGoals = {
  get()                { return backendFetch('/goals'); },
  update(goal)         { return backendFetch('/goals', { method: 'PUT', body: goal }); },
};

const BackendChat = {
  listModels()          { return backendFetch('/chat/models', { auth: false }); },
  send(messages, opts = {}) {
    return backendFetch('/chat/completions', {
      method: 'POST',
      body: {
        messages,
        provider: opts.provider || 'groq',
        max_tokens: opts.max_tokens || 800,
        temperature: opts.temperature || 0.7,
        save_history: opts.save_history !== false,
      },
    });
  },
  history()            { return backendFetch('/chat/history'); },
  clearHistory()       { return backendFetch('/chat/history', { method: 'DELETE' }); },
};

const BackendRecipes = {
  list(params = {})    {
    const qs = new URLSearchParams(params).toString();
    return backendFetch(`/recipes${qs ? '?' + qs : ''}`, { auth: false });
  },
  get(id)               { return backendFetch(`/recipes/${id}`, { auth: false }); },
  savedList()           { return backendFetch('/recipes/saved/list'); },
  toggleSaved(id)        { return backendFetch(`/recipes/saved/${id}`, { method: 'POST' }); },
};

const BackendAdmin = {
  listUsers()              { return backendFetch('/admin/users'); },
  updateUser(id, payload)  { return backendFetch(`/admin/users/${id}`, { method: 'PUT', body: payload }); },
  deleteUser(id)           { return backendFetch(`/admin/users/${id}`, { method: 'DELETE' }); },

  createRecipe(payload)    { return backendFetch('/admin/recipes', { method: 'POST', body: payload }); },
  updateRecipe(id, payload){ return backendFetch(`/admin/recipes/${id}`, { method: 'PUT', body: payload }); },
  deleteRecipe(id)         { return backendFetch(`/admin/recipes/${id}`, { method: 'DELETE' }); },
};