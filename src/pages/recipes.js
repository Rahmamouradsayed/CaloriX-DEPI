// ═══════════════════════════════════════════
// CALORIX — RECIPES PAGE
// Recipe list comes from the backend `recipes` table — i.e. whatever
// the admin has added/edited/deleted via the Admin panel. The static
// src/data/recipes.js RECIPES_DB is no longer used here (it's still used
// as a quick-add helper list in the tracker's meal-name suggestions).
//
// Logged-in users: bookmarks are saved to the backend (per account).
// Guests: bookmarks fall back to localStorage (Store) as before.
// ═══════════════════════════════════════════

function renderRecipes() {
  const page = document.createElement('div');
  const loggedIn = Store.isLoggedIn();

  const FILTER_PILLS = ['All', 'Breakfast', 'Main Course', 'Salad', 'Soup', 'Snack', 'Lunch'];
  const GOAL_OPTS = ['All Goals', 'High Protein', 'Weight Loss', 'Vegan', 'Keto', 'Balanced'];
  const SORT_OPTS = ['Default', 'Calories ↑', 'Calories ↓', 'Protein ↓', 'Cook Time ↑', 'Health Score ↓'];

  let activeCategory = 'All';
  let activeGoal     = 'All Goals';
  let searchQuery    = '';
  let sortBy         = 'Default';
  let calorieMax     = 999;

  // Loaded from the backend on init — this is the admin-managed recipe list.
  let recipes = [];
  let loadFailed = false;

  // Backend-synced bookmark set (only used when logged in)
  let savedIds = new Set();

  page.innerHTML = `
    <div class="recipes-header">
      <div class="container">
        <span class="section-eyebrow">Database</span>
        <h1 class="anim-fade-up">Recipe <em style="color:var(--saffron)">Explorer</em></h1>
        <p class="anim-fade-up delay-1" style="max-width:500px" id="recipes-intro">Loading recipes…${loggedIn ? '' : ' Log in to save bookmarks to your account.'}</p>

        <div class="recipes-search-bar anim-fade-up delay-2">
          <div class="search-field">
            <span class="search-icon">🔍</span>
            <input class="input" id="recipe-search" placeholder="Search by name, cuisine, tag…" oninput="handleRecipeSearch(this.value)" />
          </div>
          <select class="input" style="max-width:180px" id="goal-filter" onchange="handleGoalFilter(this.value)">
            ${GOAL_OPTS.map(g => `<option>${g}</option>`).join('')}
          </select>
          <select class="input" style="max-width:160px" id="sort-select" onchange="handleRecipeSort(this.value)">
            ${SORT_OPTS.map(s => `<option>${s}</option>`).join('')}
          </select>
          <select class="input" style="max-width:180px" id="calorie-filter" onchange="handleCalorieFilter(this.value)">
            <option value="999">Any calories</option>
            <option value="200">Under 200 kcal</option>
            <option value="300">Under 300 kcal</option>
            <option value="400">Under 400 kcal</option>
            <option value="500">Under 500 kcal</option>
          </select>
        </div>

        <div class="recipes-filters anim-fade-up delay-3" id="filter-pills">
          ${FILTER_PILLS.map(f => `
            <button class="filter-pill ${f === 'All' ? 'active' : ''}" onclick="handleCategoryFilter('${f}')" data-cat="${f}">
              ${f}
            </button>
          `).join('')}
        </div>
      </div>
    </div>

    <div class="container recipes-grid">
      <p class="recipes-count" id="recipes-count">Loading…</p>
      <div class="auto-grid" id="recipes-grid"><div class="spinner" style="margin:3rem auto"></div></div>
    </div>
  `;

  // ── Map backend RecipeOut → the shape this page's UI expects ──
  function mapRecipe(r) {
    return {
      id: r.id,
      name: r.name,
      nameAr: r.name_ar || '',
      emoji: r.emoji || '🍽️',
      category: r.category || 'Other',
      cuisine: r.cuisine || '—',
      difficulty: r.difficulty || 'Easy',
      calories: r.calories || 0,
      protein: r.protein || 0,
      carbs: r.carbs || 0,
      fat: r.fat || 0,
      fiber: r.fiber || 0,
      time: r.time || 0,
      goal: r.goal || '',
      tags: (r.tags || '').split(',').map(t => t.trim()).filter(Boolean),
      health: r.health || 0,
      vegan: !!r.vegan,
      vegetarian: !!r.vegetarian,
      allergens: r.allergens || 'None',
      rating: r.rating || 0,
      reviews: r.reviews || 0,
    };
  }

  async function loadRecipes() {
    try {
      const data = await BackendRecipes.list();
      recipes = data.map(mapRecipe);
      loadFailed = false;
      const intro = document.getElementById('recipes-intro');
      if (intro) intro.textContent = recipes.length
        ? `Discover ${recipes.length} recipe${recipes.length === 1 ? '' : 's'} curated by our admin team, with full nutritional data, health scores, and dietary tags.${loggedIn ? '' : ' Log in to save bookmarks to your account.'}`
        : `No recipes have been added yet — check back soon!`;
      renderGrid();
    } catch (err) {
      loadFailed = true;
      const intro = document.getElementById('recipes-intro');
      if (intro) intro.textContent = 'Could not load recipes from the server.';
      const grid = document.getElementById('recipes-grid');
      if (grid) grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:5rem;color:var(--text3)">
          <div style="font-size:4rem;margin-bottom:1rem">⚠️</div>
          <h3>Couldn't reach the CaloriX server</h3>
          <p>${escHtml(err.message || 'Make sure the backend is running.')}</p>
        </div>`;
      const count = document.getElementById('recipes-count');
      if (count) count.textContent = '';
    }
  }

  function isSaved(id) {
    return loggedIn ? savedIds.has(id) : Store.isSaved(id);
  }

  function getFiltered() {
    let list = [...recipes];

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      list = list.filter(r =>
        r.name.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.category.toLowerCase().includes(q)
      );
    }
    if (activeCategory !== 'All') {
      list = list.filter(r => r.category === activeCategory);
    }
    if (activeGoal !== 'All Goals') {
      const g = activeGoal.toLowerCase();
      list = list.filter(r => r.goal.toLowerCase().includes(g) || r.tags.some(t => t.toLowerCase().includes(g.replace(' ','-'))));
    }
    list = list.filter(r => r.calories <= calorieMax);

    // Sort
    if (sortBy === 'Calories ↑') list.sort((a,b) => a.calories - b.calories);
    else if (sortBy === 'Calories ↓') list.sort((a,b) => b.calories - a.calories);
    else if (sortBy === 'Protein ↓') list.sort((a,b) => b.protein - a.protein);
    else if (sortBy === 'Cook Time ↑') list.sort((a,b) => a.time - b.time);
    else if (sortBy === 'Health Score ↓') list.sort((a,b) => b.health - a.health);

    return list;
  }

  function renderGrid() {
    if (loadFailed) return;
    const list = getFiltered();
    const grid = document.getElementById('recipes-grid');
    const count = document.getElementById('recipes-count');
    if (!grid) return;

    count.textContent = `Showing ${list.length} of ${recipes.length} recipes`;

    if (list.length === 0) {
      grid.innerHTML = `
        <div style="grid-column:1/-1;text-align:center;padding:5rem;color:var(--text3)">
          <div style="font-size:4rem;margin-bottom:1rem">😔</div>
          <h3>${recipes.length === 0 ? 'No recipes yet' : 'No recipes found'}</h3>
          <p>${recipes.length === 0 ? 'The admin hasn\'t added any recipes yet.' : 'Try adjusting your search or filters'}</p>
          ${recipes.length > 0 ? `<button class="btn btn-ghost" style="margin-top:1.5rem" onclick="resetFilters()">Reset Filters</button>` : ''}
        </div>`;
      return;
    }

    grid.innerHTML = list.map((r, i) => {
      const saved = isSaved(r.id);
      const diffColor = { 'Very Easy': 'sage', 'Easy': 'sage', 'Medium': 'gold', 'Hard': 'orange' };
      return `
        <div class="recipe-card hover-lift anim-fade-up" style="animation-delay:${Math.min(i * 0.05, 0.4)}s" onclick="showRecipeDetail(${r.id})">
          <div class="recipe-card-img" style="background:${getCardBg(r.category)}">
            <span class="recipe-card-emoji">${r.emoji}</span>
            <div class="recipe-card-badges">
              <span class="tag tag-${diffColor[r.difficulty] || 'accent'}">${r.difficulty}</span>
              ${r.vegan ? '<span class="tag tag-sage">🌱 Vegan</span>' : ''}
            </div>
            <button class="recipe-card-bookmark ${saved ? 'saved' : ''}" onclick="event.stopPropagation();toggleBookmark(${r.id},this)" title="${saved ? 'Remove bookmark' : 'Bookmark'}">
              ${saved ? '🔖' : '🤍'}
            </button>
          </div>
          <div class="recipe-card-body">
            <h3>${r.name}</h3>
            <p class="cuisine">${r.cuisine} · ${r.category}</p>
            <div style="display:flex;gap:0.5rem;flex-wrap:wrap;margin-top:0.7rem">
              <span class="tag tag-accent">🔥 ${r.calories} kcal</span>
              <span class="tag">⏱ ${fmtTime(r.time)}</span>
              <span class="tag">❤️ ${r.health}/100</span>
            </div>
            <div class="recipe-card-macros">
              <div class="macro-item">
                <div class="macro-val" style="color:#5B8CF0">${r.protein}g</div>
                <div class="macro-name">Protein</div>
              </div>
              <div class="macro-item">
                <div class="macro-val" style="color:var(--gold)">${r.carbs}g</div>
                <div class="macro-name">Carbs</div>
              </div>
              <div class="macro-item">
                <div class="macro-val" style="color:#E87A5A">${r.fat}g</div>
                <div class="macro-name">Fat</div>
              </div>
              <div class="macro-item">
                <div class="macro-val">${r.fiber}g</div>
                <div class="macro-name">Fiber</div>
              </div>
            </div>
          </div>
        </div>
      `;
    }).join('');
  }

  function getCardBg(cat) {
    const map = { Breakfast:'#FFF8F0', 'Main Course':'#F5F9F0', Salad:'#F0F9F4', Soup:'#FFF5F0', Snack:'#F8F0FF', Lunch:'#F0F5FF', Dessert:'#FFF0F5' };
    return map[cat] || '#FAF6EF';
  }

  // Expose handlers to window
  window.handleRecipeSearch = (v) => { searchQuery = v; renderGrid(); };
  window.handleCategoryFilter = (cat) => {
    activeCategory = cat;
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === cat));
    renderGrid();
  };
  window.handleGoalFilter = (g) => { activeGoal = g; renderGrid(); };
  window.handleRecipeSort  = (s) => { sortBy = s; renderGrid(); };
  window.handleCalorieFilter = (v) => { calorieMax = parseInt(v); renderGrid(); };
  window.resetFilters = () => {
    searchQuery = ''; activeCategory = 'All'; activeGoal = 'All Goals'; sortBy = 'Default'; calorieMax = 999;
    document.getElementById('recipe-search').value = '';
    document.getElementById('goal-filter').value = 'All Goals';
    document.getElementById('sort-select').value = 'Default';
    document.getElementById('calorie-filter').value = '999';
    document.querySelectorAll('.filter-pill').forEach(p => p.classList.toggle('active', p.dataset.cat === 'All'));
    renderGrid();
  };

  window.toggleBookmark = async (id, btn) => {
    if (loggedIn) {
      try {
        const res = await BackendRecipes.toggleSaved(id);
        if (res.saved) savedIds.add(id); else savedIds.delete(id);
        btn.textContent = res.saved ? '🔖' : '🤍';
        btn.classList.toggle('saved', res.saved);
        showToast(res.saved ? 'Recipe bookmarked!' : 'Bookmark removed', 'success');
      } catch (err) {
        showToast(err.message || 'Failed to update bookmark', 'error');
      }
    } else {
      const savedNow = Store.toggleSaved(id);
      btn.textContent = savedNow ? '🔖' : '🤍';
      btn.classList.toggle('saved', savedNow);
      showToast(savedNow ? 'Recipe bookmarked!' : 'Bookmark removed', 'success');
    }
  };

  window.showRecipeDetail = (id) => {
    const r = recipes.find(x => x.id === id);
    if (!r) return;

    Modal.show(`
      <div class="modal-header">
        <h2 style="font-size:1.4rem">${r.emoji} ${r.name}</h2>
        <button class="modal-close-btn" onclick="Modal.close()">✕</button>
      </div>

      <div style="display:flex;gap:0.6rem;flex-wrap:wrap;margin-bottom:1.5rem">
        <span class="tag tag-accent">🔥 ${r.calories} kcal</span>
        <span class="tag">⏱ ${fmtTime(r.time)}</span>
        <span class="tag">${r.difficulty}</span>
        <span class="tag">${r.cuisine}</span>
        ${r.vegan ? '<span class="tag tag-sage">🌱 Vegan</span>' : ''}
        ${r.vegetarian && !r.vegan ? '<span class="tag tag-sage">🥚 Vegetarian</span>' : ''}
      </div>

      <div class="recipe-macros-grid">
        <div class="recipe-macro-box">
          <div class="val" style="color:var(--saffron)">${r.calories}</div>
          <div class="lbl">Calories</div>
        </div>
        <div class="recipe-macro-box">
          <div class="val" style="color:#5B8CF0">${r.protein}g</div>
          <div class="lbl">Protein</div>
        </div>
        <div class="recipe-macro-box">
          <div class="val" style="color:var(--gold)">${r.carbs}g</div>
          <div class="lbl">Carbs</div>
        </div>
        <div class="recipe-macro-box">
          <div class="val" style="color:#E87A5A">${r.fat}g</div>
          <div class="lbl">Fat</div>
        </div>
      </div>

      <div class="health-bar-row">
        <div class="health-bar-label">
          <span>Health Score</span>
          <strong style="color:${r.health >= 70 ? 'var(--sage)' : r.health >= 50 ? 'var(--gold)' : 'var(--terracotta)'}">${r.health}/100</strong>
        </div>
        <div class="progress-track">
          <div class="progress-fill calories" style="width:${r.health}%;background:${r.health >= 70 ? 'var(--sage)' : r.health >= 50 ? 'var(--gold)' : 'var(--terracotta)'}"></div>
        </div>
      </div>

      <div style="margin-bottom:1rem">
        <p style="font-size:0.82rem;font-weight:600;color:var(--text3);margin-bottom:0.5rem">DIETARY GOAL</p>
        <p style="font-size:0.9rem;color:var(--text2)">🎯 ${r.goal || '—'}</p>
      </div>

      ${r.allergens !== 'None' ? `
      <div style="background:rgba(200,97,74,0.06);border:1px solid rgba(200,97,74,0.2);border-radius:12px;padding:0.8rem 1rem;margin-bottom:1rem">
        <p style="font-size:0.82rem;margin:0">⚠️ <strong>Allergens:</strong> ${r.allergens}</p>
      </div>` : ''}

      ${r.tags.length ? `
      <div style="margin-bottom:1.5rem">
        <p style="font-size:0.82rem;font-weight:600;color:var(--text3);margin-bottom:0.6rem">TAGS</p>
        <div style="display:flex;flex-wrap:wrap;gap:0.4rem">
          ${r.tags.map(t => `<span class="tag">#${t}</span>`).join('')}
        </div>
      </div>` : ''}

      ${r.nameAr ? `<p style="font-size:0.8rem;color:var(--text3);margin-bottom:0.3rem">Arabic name: <strong>${r.nameAr}</strong></p>` : ''}

      <div class="modal-footer">
        <button class="btn btn-primary" onclick="logRecipeToTracker(${r.id})" style="flex:1;justify-content:center">+ Log to Tracker</button>
        <button class="btn btn-ghost" onclick="Modal.close()" style="flex:0 0 auto;padding:0.9rem 1.4rem">Close</button>
      </div>
    `, { wide: true });
  };

  // Queue this recipe's macros to be logged as a meal, then jump to the tracker
  // (works for both logged-in accounts and guest/localStorage mode).
  window.logRecipeToTracker = (id) => {
    const r = recipes.find(x => x.id === id);
    if (!r) return;
    Store.set('pendingMealLog', { name: r.name, kcal: r.calories, protein: r.protein, carbs: r.carbs, fat: r.fat });
    Modal.close();
    Router.navigate('/tracker');
  };

  // ── INIT ──
  loadRecipes().then(() => {
    // For logged-in users, fetch bookmarks from the backend, then re-render
    // bookmark state on top of the already-visible grid.
    if (loggedIn && !loadFailed) {
      BackendRecipes.savedList()
        .then(list => {
          savedIds = new Set(list.map(r => r.id));
          renderGrid();
        })
        .catch(() => { /* silently keep bookmarks unmarked if this fails */ });
    }
  });

  return page;
}
