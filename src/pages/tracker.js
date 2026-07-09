// ═══════════════════════════════════════════
// CALORIX — CALORIE TRACKER PAGE
// Logged-in users: meals & goals are read from and written to
// the FastAPI backend (per-account data).
// Guests: falls back to localStorage (Store) exactly as before.
// ═══════════════════════════════════════════

function renderTracker() {
  const page = document.createElement('div');
  const loggedIn = Store.isLoggedIn();

  const QUICK_MEALS = [
    { name:'Grilled Chicken', kcal:323, protein:34, carbs:4, fat:13 },
    { name:'Egg Omelette', kcal:185, protein:23, carbs:4, fat:6 },
    { name:'Greek Salad', kcal:180, protein:5, carbs:12, fat:13 },
    { name:'Lentil Soup', kcal:240, protein:18, carbs:38, fat:3 },
    { name:'Avocado Toast', kcal:290, protein:8, carbs:28, fat:18 },
    { name:'Overnight Oats', kcal:310, protein:10, carbs:55, fat:6 },
    { name:'Tuna Salad', kcal:220, protein:30, carbs:5, fat:9 },
    { name:'Salmon Asparagus', kcal:420, protein:42, carbs:8, fat:24 },
  ];

  const DIET_TIPS = {
    'Weight Loss': 'Aim for a 300–500 kcal deficit. High protein keeps you satiated.',
    'Muscle Gain': 'Eat 200–500 kcal above maintenance. Target 1.8–2.2g protein/kg body weight.',
    'Maintenance': 'Balance macros: ~30% protein, 40% carbs, 30% fats.',
    'Keto': 'Keep carbs under 50g/day. Fat should be 65–70% of calories.',
  };

  const MACRO_TARGETS = {
    'Weight Loss': { protein:140, carbs:150, fat:55 },
    'Muscle Gain': { protein:170, carbs:300, fat:70 },
    'Maintenance': { protein:120, carbs:250, fat:65 },
    'Keto':        { protein:130, carbs:50, fat:150 },
  };

  const CIRCUMFERENCE = 2 * Math.PI * 72; // SVG circle r=72

  // ── Local session state (mirrors backend for logged-in users) ──
  let meals = loggedIn ? [] : Store.getMeals();
  let calorieGoal = Store.getGoal();
  let dietGoal = Store.getDietGoal();
  let dataReady = !loggedIn; // guests are ready immediately

  function getMacroTargets() {
    return MACRO_TARGETS[dietGoal] || MACRO_TARGETS['Weight Loss'];
  }

  function getTotals() {
    return meals.reduce((acc, m) => {
      acc.kcal    += m.kcal    || 0;
      acc.protein += m.protein || 0;
      acc.carbs   += m.carbs   || 0;
      acc.fat     += m.fat     || 0;
      return acc;
    }, { kcal:0, protein:0, carbs:0, fat:0 });
  }

  page.innerHTML = `
    <div class="tracker-header">
      <div class="container">
        <span class="section-eyebrow">Daily Log</span>
        <h1 class="anim-fade-up">Calorie <em style="color:var(--saffron)">Tracker</em></h1>
        <p class="anim-fade-up delay-1">${loggedIn ? 'Your meals and goals are saved to your CaloriX account.' : 'Log your meals and track your macros in real-time. Log in to save this data to your account.'}</p>
      </div>
    </div>

    <div class="container">
      <!-- Mini stats row -->
      <div class="mini-stats-row anim-fade-up delay-2" style="margin-bottom:2rem" id="mini-stats"></div>

      <div class="tracker-layout">
        <!-- LEFT COLUMN -->
        <div class="tracker-left">

          <!-- Donut chart card -->
          <div class="donut-card anim-fade-up delay-2">
            <h3>Today's Calories</h3>
            <div class="donut-container" style="width:200px;height:200px;margin:0 auto">
              <svg width="200" height="200" viewBox="0 0 200 200" style="transform:rotate(-90deg)">
                <!-- Background track -->
                <circle cx="100" cy="100" r="72" fill="none" stroke="var(--cream-dark)" stroke-width="18"/>
                <!-- Protein arc -->
                <circle cx="100" cy="100" r="72" fill="none" stroke="#5B8CF0" stroke-width="18"
                  id="arc-protein" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${CIRCUMFERENCE}"
                  stroke-linecap="round" style="transition:stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1)"/>
                <!-- Carbs arc -->
                <circle cx="100" cy="100" r="72" fill="none" stroke="var(--gold)" stroke-width="18"
                  id="arc-carbs" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${CIRCUMFERENCE}"
                  stroke-linecap="round" style="transition:stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) 0.15s"/>
                <!-- Fat arc -->
                <circle cx="100" cy="100" r="72" fill="none" stroke="#E87A5A" stroke-width="18"
                  id="arc-fat" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${CIRCUMFERENCE}"
                  stroke-linecap="round" style="transition:stroke-dashoffset 1s cubic-bezier(0.4,0,0.2,1) 0.3s"/>
                <!-- Total progress -->
                <circle cx="100" cy="100" r="72" fill="none" stroke="var(--saffron)" stroke-width="4"
                  id="arc-total" stroke-dasharray="${CIRCUMFERENCE}" stroke-dashoffset="${CIRCUMFERENCE}"
                  opacity="0.3" style="transition:stroke-dashoffset 1.2s ease"/>
              </svg>
              <div class="donut-label" id="donut-label">
                <div class="donut-main" id="donut-kcal">0</div>
                <div class="donut-sub">/ <span id="donut-goal">${calorieGoal}</span> kcal</div>
              </div>
            </div>

            <div class="macro-breakdown" id="macro-breakdown"></div>
          </div>

          <!-- Goal Settings -->
          <div class="goal-card anim-fade-up delay-3">
            <h3>⚙️ Daily Goals</h3>
            <div class="goal-row">
              <label>Calorie Goal</label>
              <input type="number" class="input" id="calorie-goal-input" value="${calorieGoal}" min="500" max="5000" step="50" onchange="updateGoalSettings()">
            </div>
            <div class="goal-row">
              <label>Diet Type</label>
              <select class="input" id="diet-goal-select" onchange="updateGoalSettings()">
                ${['Weight Loss','Muscle Gain','Maintenance','Keto'].map(g =>
                  `<option ${dietGoal === g ? 'selected' : ''}>${g}</option>`
                ).join('')}
              </select>
            </div>
            <div id="diet-tip" style="background:rgba(232,135,58,0.08);border:1px solid rgba(232,135,58,0.2);border-radius:12px;padding:0.8rem 1rem;font-size:0.82rem;color:var(--text2);margin-top:0.5rem">
              💡 ${DIET_TIPS[dietGoal] || ''}
            </div>
          </div>
        </div>

        <!-- RIGHT COLUMN -->
        <div class="tracker-right">

          <!-- Log a meal -->
          <div class="log-card anim-fade-up delay-2">
            <h3>🍽️ Log a Meal</h3>
            <div class="log-form">
              <input type="text" class="input" id="meal-name-input" placeholder="Meal name…" list="meal-suggestions">
              <datalist id="meal-suggestions">
                ${RECIPES_DB.map(r => `<option value="${r.name} (${r.calories} kcal)">`).join('')}
              </datalist>
              <input type="number" class="input kcal-input" id="meal-kcal-input" placeholder="kcal" min="0">
              <input type="number" class="input prot-input" id="meal-prot-input" placeholder="protein g" min="0">
              <button class="btn btn-accent" onclick="addMealLog()" style="white-space:nowrap">+ Add</button>
            </div>

            <p style="font-size:0.8rem;font-weight:600;color:var(--text3);margin-bottom:0.6rem;text-transform:uppercase;letter-spacing:0.06em">Quick Add</p>
            <div class="quick-add-row">
              ${QUICK_MEALS.map(m =>
                `<button class="quick-add-chip" onclick="quickAddMeal('${escHtml(m.name)}',${m.kcal},${m.protein},${m.carbs},${m.fat})">${m.name}</button>`
              ).join('')}
            </div>

            <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:0.8rem">
              <p style="font-size:0.85rem;font-weight:700;color:var(--text)">Today's Meals</p>
              <button class="btn btn-ghost btn-sm" onclick="clearAllMeals()" style="font-size:0.75rem;padding:0.4rem 0.8rem">Clear All</button>
            </div>
            <div class="meal-list" id="meal-list"><div class="spinner" style="margin:1rem auto"></div></div>
          </div>

          <!-- Macros breakdown -->
          <div class="log-card anim-fade-up delay-3">
            <h3>📊 Macro Breakdown</h3>
            <div id="macro-bars" style="display:flex;flex-direction:column;gap:1.2rem"></div>
          </div>
        </div>
      </div>
    </div>
  `;

  // ── BACKEND SYNC HELPERS ──

  // Backend Meal shape: {id, name, kcal, protein, carbs, fat, logged_at}
  // Local display shape: {name, kcal, protein, carbs, fat, time, id?}
  function toLocalMeal(m) {
    return {
      id: m.id,
      name: m.name,
      kcal: m.kcal,
      protein: m.protein,
      carbs: m.carbs,
      fat: m.fat,
      time: new Date(m.logged_at).toLocaleTimeString('en-US', { hour:'2-digit', minute:'2-digit' }),
    };
  }

  async function loadFromBackend() {
    try {
      const [backendMeals, goal] = await Promise.all([
        BackendMeals.list(),
        BackendGoals.get(),
      ]);
      meals = backendMeals.map(toLocalMeal);
      calorieGoal = goal.calorie_goal;
      dietGoal = goal.diet_type;
      dataReady = true;

      // Reflect loaded goal in the goal inputs
      const goalInput = document.getElementById('calorie-goal-input');
      const dietSelect = document.getElementById('diet-goal-select');
      if (goalInput) goalInput.value = calorieGoal;
      if (dietSelect) dietSelect.value = dietGoal;
      const tip = document.getElementById('diet-tip');
      if (tip) tip.innerHTML = `💡 ${DIET_TIPS[dietGoal] || ''}`;

      updateAll();
      maybeLogPendingRecipe();
    } catch (err) {
      const list = document.getElementById('meal-list');
      if (list) list.innerHTML = `<p style="color:var(--terracotta);font-size:0.85rem;padding:1rem">⚠️ ${escHtml(err.message || 'Could not load your data')}</p>`;
    }
  }

  // If the recipes page queued a "log this recipe" request, apply it now
  function maybeLogPendingRecipe() {
    const pending = Store.get('pendingMealLog');
    if (!pending) return;
    Store.remove('pendingMealLog');
    window.quickAddMeal(pending.name, pending.kcal, pending.protein, pending.carbs, pending.fat);
  }

  // ── RENDER LOGIC ──

  function updateAll() {
    const totals = getTotals();
    const goal   = calorieGoal;
    const mt     = getMacroTargets();
    const pct    = Math.min(1, totals.kcal / goal);
    const remaining = Math.max(0, goal - totals.kcal);

    // Mini stats
    const mini = document.getElementById('mini-stats');
    if (mini) mini.innerHTML = `
      <div class="mini-stat">
        <div class="val" style="color:var(--saffron)">${totals.kcal}</div>
        <div class="lbl">Consumed</div>
      </div>
      <div class="mini-stat">
        <div class="val" style="color:var(--sage)">${remaining}</div>
        <div class="lbl">Remaining</div>
      </div>
      <div class="mini-stat">
        <div class="val">${meals.length}</div>
        <div class="lbl">Meals</div>
      </div>
    `;

    // Donut arcs
    const totalArc = document.getElementById('arc-total');
    if (totalArc) {
      totalArc.style.strokeDashoffset = CIRCUMFERENCE * (1 - pct);
      totalArc.style.stroke = pct > 1 ? 'var(--terracotta)' : pct > 0.85 ? 'var(--gold)' : 'var(--saffron)';
    }
    const protArc = document.getElementById('arc-protein');
    if (protArc) protArc.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(totals.protein/mt.protein, 1));
    const carbsArc = document.getElementById('arc-carbs');
    if (carbsArc) carbsArc.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(totals.carbs/mt.carbs, 1));
    const fatArc = document.getElementById('arc-fat');
    if (fatArc) fatArc.style.strokeDashoffset = CIRCUMFERENCE * (1 - Math.min(totals.fat/mt.fat, 1));

    // Donut label
    const lbl = document.getElementById('donut-kcal');
    if (lbl) lbl.textContent = totals.kcal;
    const goalLbl = document.getElementById('donut-goal');
    if (goalLbl) goalLbl.textContent = goal;

    // Macro breakdown in donut card
    const breakdown = document.getElementById('macro-breakdown');
    if (breakdown) breakdown.innerHTML = `
      <div class="macro-row">
        <div class="macro-dot" style="background:#5B8CF0"></div>
        <span class="macro-row-label">Protein</span>
        <div style="flex:1"><div class="progress-track"><div class="progress-fill protein" style="width:${Math.min(100,totals.protein/mt.protein*100)}%"></div></div></div>
        <span class="macro-row-val">${totals.protein}g</span>
      </div>
      <div class="macro-row">
        <div class="macro-dot" style="background:var(--gold)"></div>
        <span class="macro-row-label">Carbs</span>
        <div style="flex:1"><div class="progress-track"><div class="progress-fill carbs" style="width:${Math.min(100,totals.carbs/mt.carbs*100)}%"></div></div></div>
        <span class="macro-row-val">${totals.carbs}g</span>
      </div>
      <div class="macro-row">
        <div class="macro-dot" style="background:#E87A5A"></div>
        <span class="macro-row-label">Fat</span>
        <div style="flex:1"><div class="progress-track"><div class="progress-fill fat" style="width:${Math.min(100,totals.fat/mt.fat*100)}%"></div></div></div>
        <span class="macro-row-val">${totals.fat}g</span>
      </div>
    `;

    // Macro bars card
    const bars = document.getElementById('macro-bars');
    if (bars) {
      const macros = [
        { name:'Protein', val:totals.protein, target:mt.protein, color:'#5B8CF0', kcal: totals.protein*4 },
        { name:'Carbohydrates', val:totals.carbs, target:mt.carbs, color:'var(--gold)', kcal: totals.carbs*4 },
        { name:'Fat', val:totals.fat, target:mt.fat, color:'#E87A5A', kcal: totals.fat*9 },
      ];
      bars.innerHTML = macros.map(m => `
        <div>
          <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:0.5rem">
            <span style="font-size:0.85rem;font-weight:600">${m.name}</span>
            <div style="display:flex;gap:0.6rem;align-items:center">
              <span style="font-size:0.8rem;color:var(--text3)">${m.kcal} kcal</span>
              <span style="font-weight:700;font-size:0.9rem">${m.val}g <span style="color:var(--text3);font-weight:400">/ ${m.target}g</span></span>
            </div>
          </div>
          <div class="progress-track" style="height:12px">
            <div style="height:100%;border-radius:99px;background:${m.color};width:${Math.min(100,m.val/m.target*100)}%;transition:width 1s ease"></div>
          </div>
        </div>
      `).join('');
    }

    renderMealList();
  }

  function renderMealList() {
    const list = document.getElementById('meal-list');
    if (!list) return;

    if (meals.length === 0) {
      list.innerHTML = `<div style="text-align:center;padding:2rem;color:var(--text3);font-size:0.85rem">No meals logged yet. Start adding! 🍽️</div>`;
      return;
    }

    list.innerHTML = meals.map((m, i) => `
      <div class="meal-entry">
        <span class="meal-entry-name">${escHtml(m.name)}</span>
        <span class="meal-entry-kcal">${m.kcal} kcal</span>
        <span class="meal-entry-time">${m.time}</span>
        <button class="meal-entry-remove" onclick="removeMealEntry(${i})" title="Remove">✕</button>
      </div>
    `).join('');
  }

  // ── MUTATIONS (backend-aware) ──

  async function persistAddMeal(meal) {
    if (loggedIn) {
      const saved = await BackendMeals.log({ name: meal.name, kcal: meal.kcal, protein: meal.protein, carbs: meal.carbs, fat: meal.fat });
      meals.push(toLocalMeal(saved));
    } else {
      meals.push(meal);
      Store.setMeals(meals);
    }
  }

  window.addMealLog = async () => {
    const name  = document.getElementById('meal-name-input')?.value?.trim();
    const kcal  = parseInt(document.getElementById('meal-kcal-input')?.value) || 0;
    const prot  = parseInt(document.getElementById('meal-prot-input')?.value) || 0;

    if (!name || kcal <= 0) { showToast('Enter a meal name and calories', 'error'); return; }

    const meal = { name, kcal, protein:prot, carbs:Math.round(kcal*0.4/4), fat:Math.round(kcal*0.3/9), time:fmtNow() };

    try {
      await persistAddMeal(meal);
      document.getElementById('meal-name-input').value = '';
      document.getElementById('meal-kcal-input').value = '';
      document.getElementById('meal-prot-input').value = '';
      updateAll();
      showToast(`${name} added! (${kcal} kcal)`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to log meal', 'error');
    }
  };

  window.quickAddMeal = async (name, kcal, protein, carbs, fat) => {
    const meal = { name, kcal, protein, carbs, fat, time:fmtNow() };
    try {
      await persistAddMeal(meal);
      updateAll();
      showToast(`${name} added!`, 'success');
    } catch (err) {
      showToast(err.message || 'Failed to log meal', 'error');
    }
  };

  window.removeMealEntry = async (idx) => {
    const removed = meals[idx];
    try {
      if (loggedIn && removed.id) {
        await BackendMeals.remove(removed.id);
      }
      meals.splice(idx, 1);
      if (!loggedIn) Store.setMeals(meals);
      updateAll();
      showToast(`Removed ${removed.name}`, 'info');
    } catch (err) {
      showToast(err.message || 'Failed to remove meal', 'error');
    }
  };

  window.clearAllMeals = async () => {
    if (!confirm('Clear all meals for today?')) return;
    try {
      if (loggedIn) {
        await BackendMeals.clearToday();
      }
      meals = [];
      if (!loggedIn) Store.setMeals([]);
      updateAll();
      showToast('All meals cleared', 'info');
    } catch (err) {
      showToast(err.message || 'Failed to clear meals', 'error');
    }
  };

  window.updateGoalSettings = async () => {
    const goal = parseInt(document.getElementById('calorie-goal-input')?.value) || 2000;
    const diet = document.getElementById('diet-goal-select')?.value || 'Weight Loss';
    calorieGoal = goal;
    dietGoal = diet;
    document.getElementById('diet-tip').innerHTML = `💡 ${DIET_TIPS[diet] || ''}`;

    try {
      if (loggedIn) {
        await BackendGoals.update({ calorie_goal: goal, diet_type: diet });
      } else {
        Store.setGoal(goal);
        Store.setDietGoal(diet);
      }
      updateAll();
      showToast('Goals updated!', 'success');
    } catch (err) {
      showToast(err.message || 'Failed to update goals', 'error');
    }
  };

  // ── INIT ──
  if (loggedIn) {
    loadFromBackend();
  } else {
    setTimeout(() => { updateAll(); maybeLogPendingRecipe(); }, 100);
  }

  return page;
}
