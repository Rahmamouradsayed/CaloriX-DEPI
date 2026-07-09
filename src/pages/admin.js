// ═══════════════════════════════════════════
// CALORIX — ADMIN PAGE
// ═══════════════════════════════════════════

function renderAdmin() {
  const page = document.createElement('div');

  if (!Store.isLoggedIn() || !Store.isAdmin()) {
    setTimeout(() => {
      showToast('Admin access required', 'error');
      Router.navigate('/');
    }, 0);
    return page;
  }

  let activeTab = 'users';
  let users = [];
  let recipes = [];
  const currentUserId = Store.getUser()?.id;

  page.innerHTML = `
    <div class="tracker-header">
      <div class="container">
        <span class="section-eyebrow">Admin</span>
        <h1 class="anim-fade-up">Control <em style="color:var(--saffron)">Panel</em></h1>
        <p class="anim-fade-up delay-1">Manage users and the recipe database.</p>
      </div>
    </div>

    <div class="container" style="padding:1rem 0 4rem">
      <div class="recipes-filters" style="margin-bottom:1.5rem">
        <button class="filter-pill active" id="tab-users" onclick="setAdminTab('users')">👥 Users</button>
        <button class="filter-pill" id="tab-recipes" onclick="setAdminTab('recipes')">🍽️ Recipes</button>
      </div>

      <div id="admin-panel"><div class="spinner" style="margin:2rem auto"></div></div>
    </div>
  `;

  // ── USERS TAB ──
  async function loadUsers() {
    const panel = page.querySelector('#admin-panel');
    panel.innerHTML = `<div class="spinner" style="margin:2rem auto"></div>`;
    try {
      users = await BackendAdmin.listUsers();
      panel.innerHTML = `
        <div class="log-card">
          <h3>👥 All Users (${users.length})</h3>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.86rem">
              <thead>
                <tr style="text-align:left;border-bottom:2px solid var(--border)">
                  <th style="padding:0.7rem 0.5rem">ID</th>
                  <th style="padding:0.7rem 0.5rem">Email</th>
                  <th style="padding:0.7rem 0.5rem">Name</th>
                  <th style="padding:0.7rem 0.5rem">Role</th>
                  <th style="padding:0.7rem 0.5rem">Joined</th>
                  <th style="padding:0.7rem 0.5rem">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${users.map(u => `
                  <tr style="border-bottom:1px solid var(--border)" data-user-id="${u.id}">
                    <td style="padding:0.7rem 0.5rem;color:var(--text3)">${u.id}</td>
                    <td style="padding:0.7rem 0.5rem">${escHtml(u.email)}</td>
                    <td style="padding:0.7rem 0.5rem">${escHtml(u.name || '—')}</td>
                    <td style="padding:0.7rem 0.5rem">
                      <span class="tag ${u.is_admin ? 'tag-accent' : ''}">${u.is_admin ? '🛠️ Admin' : 'User'}</span>
                    </td>
                    <td style="padding:0.7rem 0.5rem;color:var(--text3)">${new Date(u.created_at).toLocaleDateString()}</td>
                    <td style="padding:0.7rem 0.5rem;white-space:nowrap">
                      ${u.id === currentUserId ? `<span style="color:var(--text3);font-size:0.78rem">(you)</span>` : `
                        <button class="btn btn-ghost btn-sm" onclick="toggleUserAdmin(${u.id}, ${!u.is_admin})">${u.is_admin ? 'Demote' : 'Promote'}</button>
                        <button class="btn btn-ghost btn-sm" style="color:var(--terracotta);border-color:rgba(200,97,74,0.3)" onclick="deleteUserRow(${u.id})">Delete</button>
                      `}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      panel.innerHTML = `<p style="color:var(--terracotta)">⚠️ ${escHtml(err.message || 'Failed to load users')}</p>`;
    }
  }

  window.toggleUserAdmin = async (id, makeAdmin) => {
    try {
      await BackendAdmin.updateUser(id, { is_admin: makeAdmin });
      showToast(makeAdmin ? 'User promoted to admin' : 'Admin access removed', 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to update user', 'error');
    }
  };

  window.deleteUserRow = async (id) => {
    if (!confirm('Delete this user? This also deletes their meals, goals, and chat history.')) return;
    try {
      await BackendAdmin.deleteUser(id);
      showToast('User deleted', 'success');
      loadUsers();
    } catch (err) {
      showToast(err.message || 'Failed to delete user', 'error');
    }
  };

  // ── RECIPES TAB ──
  function emptyRecipeForm() {
    return { name:'', name_ar:'', emoji:'🍽️', category:'', cuisine:'', difficulty:'Easy',
      calories:0, protein:0, carbs:0, fat:0, fiber:0, time:15, goal:'', tags:'',
      health:50, vegan:false, vegetarian:false, allergens:'None', rating:0, reviews:0 };
  }

  async function loadRecipes() {
    const panel = page.querySelector('#admin-panel');
    panel.innerHTML = `<div class="spinner" style="margin:2rem auto"></div>`;
    try {
      recipes = await BackendRecipes.list();
      panel.innerHTML = `
        <div class="log-card">
          <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:1rem">
            <h3 style="margin:0">🍽️ All Recipes (${recipes.length})</h3>
            <button class="btn btn-accent btn-sm" onclick="openRecipeForm()">+ Add Recipe</button>
          </div>
          <div style="overflow-x:auto">
            <table style="width:100%;border-collapse:collapse;font-size:0.86rem">
              <thead>
                <tr style="text-align:left;border-bottom:2px solid var(--border)">
                  <th style="padding:0.7rem 0.5rem">ID</th>
                  <th style="padding:0.7rem 0.5rem">Name</th>
                  <th style="padding:0.7rem 0.5rem">Category</th>
                  <th style="padding:0.7rem 0.5rem">Calories</th>
                  <th style="padding:0.7rem 0.5rem">Health</th>
                  <th style="padding:0.7rem 0.5rem">Actions</th>
                </tr>
              </thead>
              <tbody>
                ${recipes.map(r => `
                  <tr style="border-bottom:1px solid var(--border)">
                    <td style="padding:0.7rem 0.5rem;color:var(--text3)">${r.id}</td>
                    <td style="padding:0.7rem 0.5rem">${r.emoji || ''} ${escHtml(r.name)}</td>
                    <td style="padding:0.7rem 0.5rem">${escHtml(r.category || '—')}</td>
                    <td style="padding:0.7rem 0.5rem">${r.calories ?? '—'} kcal</td>
                    <td style="padding:0.7rem 0.5rem">${r.health ?? '—'}</td>
                    <td style="padding:0.7rem 0.5rem;white-space:nowrap">
                      <button class="btn btn-ghost btn-sm" onclick='openRecipeForm(${JSON.stringify(r)})'>Edit</button>
                      <button class="btn btn-ghost btn-sm" style="color:var(--terracotta);border-color:rgba(200,97,74,0.3)" onclick="deleteRecipeRow(${r.id})">Delete</button>
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        </div>
      `;
    } catch (err) {
      panel.innerHTML = `<p style="color:var(--terracotta)">⚠️ ${escHtml(err.message || 'Failed to load recipes')}</p>`;
    }
  }

  window.openRecipeForm = (recipe = null) => {
    const r = recipe || emptyRecipeForm();
    const isEdit = !!recipe;

    Modal.show(`
      <div class="modal-header">
        <h2 style="font-size:1.3rem">${isEdit ? 'Edit' : 'Add'} Recipe</h2>
        <button class="modal-close-btn" onclick="Modal.close()">✕</button>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:0.8rem">
        <div class="input-wrap"><label>Name</label><input class="input" id="rf-name" value="${escHtml(r.name)}"></div>
        <div class="input-wrap"><label>Arabic Name</label><input class="input" id="rf-name-ar" value="${escHtml(r.name_ar || '')}"></div>
        <div class="input-wrap"><label>Emoji</label><input class="input" id="rf-emoji" value="${escHtml(r.emoji || '')}"></div>
        <div class="input-wrap"><label>Category</label><input class="input" id="rf-category" value="${escHtml(r.category || '')}"></div>
        <div class="input-wrap"><label>Cuisine</label><input class="input" id="rf-cuisine" value="${escHtml(r.cuisine || '')}"></div>
        <div class="input-wrap"><label>Difficulty</label><input class="input" id="rf-difficulty" value="${escHtml(r.difficulty || '')}"></div>
        <div class="input-wrap"><label>Calories</label><input class="input" type="number" id="rf-calories" value="${r.calories ?? 0}"></div>
        <div class="input-wrap"><label>Protein (g)</label><input class="input" type="number" id="rf-protein" value="${r.protein ?? 0}"></div>
        <div class="input-wrap"><label>Carbs (g)</label><input class="input" type="number" id="rf-carbs" value="${r.carbs ?? 0}"></div>
        <div class="input-wrap"><label>Fat (g)</label><input class="input" type="number" id="rf-fat" value="${r.fat ?? 0}"></div>
        <div class="input-wrap"><label>Fiber (g)</label><input class="input" type="number" id="rf-fiber" value="${r.fiber ?? 0}"></div>
        <div class="input-wrap"><label>Time (min)</label><input class="input" type="number" id="rf-time" value="${r.time ?? 0}"></div>
        <div class="input-wrap"><label>Goal</label><input class="input" id="rf-goal" value="${escHtml(r.goal || '')}"></div>
        <div class="input-wrap"><label>Health Score</label><input class="input" type="number" id="rf-health" value="${r.health ?? 0}"></div>
        <div class="input-wrap" style="grid-column:1/-1"><label>Tags (comma-separated)</label><input class="input" id="rf-tags" value="${escHtml(r.tags || '')}"></div>
        <div class="input-wrap"><label>Allergens</label><input class="input" id="rf-allergens" value="${escHtml(r.allergens || 'None')}"></div>
        <div class="input-wrap" style="display:flex;gap:1.2rem;align-items:center;padding-top:1.4rem">
          <label style="display:flex;align-items:center;gap:0.4rem;text-transform:none;font-size:0.85rem"><input type="checkbox" id="rf-vegan" ${r.vegan ? 'checked' : ''}> Vegan</label>
          <label style="display:flex;align-items:center;gap:0.4rem;text-transform:none;font-size:0.85rem"><input type="checkbox" id="rf-vegetarian" ${r.vegetarian ? 'checked' : ''}> Vegetarian</label>
        </div>
      </div>
      <div class="modal-footer">
        <button class="btn btn-primary" onclick="saveRecipeForm(${isEdit ? r.id : 'null'})">Save Recipe</button>
        <button class="btn btn-ghost" onclick="Modal.close()">Cancel</button>
      </div>
    `, { wide: true });
  };

  window.saveRecipeForm = async (recipeId) => {
    const payload = {
      name: document.getElementById('rf-name')?.value?.trim(),
      name_ar: document.getElementById('rf-name-ar')?.value?.trim() || null,
      emoji: document.getElementById('rf-emoji')?.value?.trim() || null,
      category: document.getElementById('rf-category')?.value?.trim() || null,
      cuisine: document.getElementById('rf-cuisine')?.value?.trim() || null,
      difficulty: document.getElementById('rf-difficulty')?.value?.trim() || null,
      calories: parseFloat(document.getElementById('rf-calories')?.value) || 0,
      protein: parseFloat(document.getElementById('rf-protein')?.value) || 0,
      carbs: parseFloat(document.getElementById('rf-carbs')?.value) || 0,
      fat: parseFloat(document.getElementById('rf-fat')?.value) || 0,
      fiber: parseFloat(document.getElementById('rf-fiber')?.value) || 0,
      time: parseInt(document.getElementById('rf-time')?.value) || 0,
      goal: document.getElementById('rf-goal')?.value?.trim() || null,
      tags: document.getElementById('rf-tags')?.value?.trim() || '',
      health: parseFloat(document.getElementById('rf-health')?.value) || 0,
      vegan: document.getElementById('rf-vegan')?.checked || false,
      vegetarian: document.getElementById('rf-vegetarian')?.checked || false,
      allergens: document.getElementById('rf-allergens')?.value?.trim() || 'None',
      rating: 0,
      reviews: 0,
    };

    if (!payload.name) {
      showToast('Recipe name is required', 'error');
      return;
    }

    try {
      if (recipeId) {
        await BackendAdmin.updateRecipe(recipeId, payload);
        showToast('Recipe updated', 'success');
      } else {
        await BackendAdmin.createRecipe(payload);
        showToast('Recipe created', 'success');
      }
      Modal.close();
      loadRecipes();
    } catch (err) {
      showToast(err.message || 'Failed to save recipe', 'error');
    }
  };

  window.deleteRecipeRow = async (id) => {
    if (!confirm('Delete this recipe permanently?')) return;
    try {
      await BackendAdmin.deleteRecipe(id);
      showToast('Recipe deleted', 'success');
      loadRecipes();
    } catch (err) {
      showToast(err.message || 'Failed to delete recipe', 'error');
    }
  };

  // ── TAB SWITCHING ──
  window.setAdminTab = (tab) => {
    activeTab = tab;
    page.querySelector('#tab-users').classList.toggle('active', tab === 'users');
    page.querySelector('#tab-recipes').classList.toggle('active', tab === 'recipes');
    if (tab === 'users') loadUsers(); else loadRecipes();
  };

  loadUsers();

  return page;
}