// ═══════════════════════════════════════════
// CALORIX — APP STATE STORE
// Simple localStorage-based state management
// ═══════════════════════════════════════════

const Store = {
  _cache: {},

  get(key) {
    if (key in this._cache) return this._cache[key];
    try {
      const val = localStorage.getItem('calorix_' + key);
      return val ? JSON.parse(val) : null;
    } catch { return null; }
  },

  set(key, value) {
    this._cache[key] = value;
    try { localStorage.setItem('calorix_' + key, JSON.stringify(value)); } catch {}
  },

  remove(key) {
    delete this._cache[key];
    try { localStorage.removeItem('calorix_' + key); } catch {}
  },

  // Specific accessors
  getMeals()     { return this.get('meals') || []; },
  setMeals(m)    { this.set('meals', m); },
  getGoal()      { return this.get('calorieGoal') || 2000; },
  setGoal(g)     { this.set('calorieGoal', g); },
  getDietGoal()  { return this.get('dietGoal') || 'Weight Loss'; },
  setDietGoal(d) { this.set('dietGoal', d); },
  getSaved()     { return this.get('savedRecipes') || []; },
  toggleSaved(id) {
    const saved = this.getSaved();
    const idx = saved.indexOf(id);
    if (idx > -1) saved.splice(idx, 1); else saved.push(id);
    this.set('savedRecipes', saved);
    return saved.includes(id);
  },
  isSaved(id) { return this.getSaved().includes(id); },

  // Auth (JWT from the FastAPI backend)
  getToken()   { return this.get('authToken') || null; },
  setToken(t)  { this.set('authToken', t); },
  getUser()    { return this.get('authUser') || null; },
  setUser(u)   { this.set('authUser', u); },
  isLoggedIn() { return !!this.getToken(); },
  isAdmin()    { return !!this.getUser()?.is_admin; },
  clearAuth()  { this.remove('authToken'); this.remove('authUser'); }
};

// Format helpers
function fmtTime(min) {
  if (min < 60) return min + 'm';
  return Math.floor(min/60) + 'h ' + (min%60 ? (min%60)+'m' : '');
}
function fmtKcal(n) { return n.toLocaleString() + ' kcal'; }
function fmtNow() {
  return new Date().toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' });
}
function stars(n) {
  const full = Math.floor(n); const half = n % 1 >= 0.5 ? 1 : 0;
  return '★'.repeat(full) + (half ? '½' : '') + '☆'.repeat(5 - full - half);
}
function escHtml(s) {
  return String(s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
}

// Markdown-lite formatter for chat messages
function formatMd(text) {
  return text
    .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.*?)\*/g, '<em>$1</em>')
    .replace(/^• (.+)$/gm, '<li>$1</li>')
    .replace(/(<li>.*<\/li>\n?)+/g, s => `<ul>${s}</ul>`)
    .replace(/\n/g, '<br>');
}