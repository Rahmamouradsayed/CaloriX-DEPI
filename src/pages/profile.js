// ═══════════════════════════════════════════
// CALORIX — PROFILE PAGE
// ═══════════════════════════════════════════

function renderProfile() {
  const page = document.createElement('div');

  // Guard: must be logged in
  if (!Store.isLoggedIn()) {
    setTimeout(() => {
      showToast('Please log in to view your profile', 'info');
      Router.navigate('/login');
    }, 0);
    return page;
  }

  const user = Store.getUser() || {};

  page.innerHTML = `
    <div class="tracker-header">
      <div class="container">
        <span class="section-eyebrow">Account</span>
        <h1 class="anim-fade-up">Your <em style="color:var(--saffron)">Profile</em></h1>
        <p class="anim-fade-up delay-1">Manage your account details and nutrition goals.</p>
      </div>
    </div>

    <div class="container" style="padding:2rem 0 4rem;max-width:640px">
      <div class="log-card anim-fade-up delay-2" style="margin-bottom:1.5rem">
        <h3>👤 Account Details</h3>
        <div class="input-wrap" style="margin-bottom:1rem">
          <label>Email</label>
          <input class="input" id="profile-email" type="email" value="${escHtml(user.email || '')}" disabled style="opacity:0.6" />
        </div>
        <div class="input-wrap" style="margin-bottom:1rem">
          <label>Name</label>
          <input class="input" id="profile-name" type="text" value="${escHtml(user.name || '')}" placeholder="Your name" />
        </div>
        <button class="btn btn-primary" id="save-name-btn">Save Changes</button>
      </div>

      <div class="log-card anim-fade-up delay-3" style="margin-bottom:1.5rem">
        <h3>🔒 Change Password</h3>
        <div class="input-wrap" style="margin-bottom:1rem">
          <label>Current Password</label>
          <input class="input" id="profile-current-pw" type="password" placeholder="••••••••" />
        </div>
        <div class="input-wrap" style="margin-bottom:1rem">
          <label>New Password</label>
          <input class="input" id="profile-new-pw" type="password" placeholder="At least 6 characters" minlength="6" />
        </div>
        <button class="btn btn-ghost" id="save-pw-btn">Update Password</button>
      </div>

      <div class="log-card anim-fade-up delay-4" style="margin-bottom:1.5rem">
        <h3>🎯 Nutrition Goals</h3>
        <div id="goal-section">
          <div class="spinner" style="margin:1rem auto"></div>
        </div>
      </div>

      <button class="btn btn-ghost" id="profile-logout-btn" style="border-color:rgba(200,97,74,0.3);color:var(--terracotta)">
        🚪 Log Out
      </button>
    </div>
  `;

  // ── Save name ──
  page.querySelector('#save-name-btn').addEventListener('click', async () => {
    const name = page.querySelector('#profile-name')?.value?.trim();
    const btn = page.querySelector('#save-name-btn');
    btn.disabled = true;
    btn.textContent = 'Saving…';
    try {
      const updated = await BackendAuth.updateMe({ name });
      showToast('Profile updated!', 'success');
      initNavbar();
      user.name = updated.name;
    } catch (err) {
      showToast(err.message || 'Failed to update profile', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Save Changes';
    }
  });

  // ── Change password ──
  page.querySelector('#save-pw-btn').addEventListener('click', async () => {
    const current_password = page.querySelector('#profile-current-pw')?.value;
    const new_password = page.querySelector('#profile-new-pw')?.value;

    if (!current_password || !new_password) {
      showToast('Please fill in both password fields', 'error');
      return;
    }
    if (new_password.length < 6) {
      showToast('New password must be at least 6 characters', 'error');
      return;
    }

    const btn = page.querySelector('#save-pw-btn');
    btn.disabled = true;
    btn.textContent = 'Updating…';
    try {
      await BackendAuth.updateMe({ current_password, new_password });
      showToast('Password updated!', 'success');
      page.querySelector('#profile-current-pw').value = '';
      page.querySelector('#profile-new-pw').value = '';
    } catch (err) {
      showToast(err.message || 'Failed to update password', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Update Password';
    }
  });

  // ── Logout ──
  page.querySelector('#profile-logout-btn').addEventListener('click', () => {
    handleLogout();
  });

  // ── Load & render goals from the backend DB ──
  async function loadGoals() {
    const section = page.querySelector('#goal-section');
    try {
      const goal = await BackendGoals.get();
      section.innerHTML = `
        <div class="goal-row">
          <label>Calorie Goal</label>
          <input type="number" class="input" id="profile-goal-input" value="${goal.calorie_goal}" min="500" max="5000" step="50">
        </div>
        <div class="goal-row">
          <label>Diet Type</label>
          <select class="input" id="profile-diet-select">
            ${['Weight Loss','Muscle Gain','Maintenance','Keto'].map(g =>
              `<option ${goal.diet_type === g ? 'selected' : ''}>${g}</option>`
            ).join('')}
          </select>
        </div>
        <button class="btn btn-primary" id="save-goal-btn" style="margin-top:0.5rem">Save Goal</button>
      `;

      section.querySelector('#save-goal-btn').addEventListener('click', async () => {
        const calorie_goal = parseInt(section.querySelector('#profile-goal-input')?.value) || 2000;
        const diet_type = section.querySelector('#profile-diet-select')?.value || 'Weight Loss';
        const btn = section.querySelector('#save-goal-btn');
        btn.disabled = true;
        btn.textContent = 'Saving…';
        try {
          await BackendGoals.update({ calorie_goal, diet_type });
          showToast('Goals updated!', 'success');
        } catch (err) {
          showToast(err.message || 'Failed to update goals', 'error');
        } finally {
          btn.disabled = false;
          btn.textContent = 'Save Goal';
        }
      });
    } catch (err) {
      section.innerHTML = `<p style="color:var(--terracotta);font-size:0.85rem">⚠️ ${escHtml(err.message || 'Could not load goals')}</p>`;
    }
  }

  loadGoals();

  return page;
}
