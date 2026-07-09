// ═══════════════════════════════════════════
// CALORIX — LOGIN PAGE
// ═══════════════════════════════════════════

function renderLogin() {
  const page = document.createElement('div');
  page.className = 'auth-layout';

  page.innerHTML = `
    <div class="auth-card anim-fade-up">
      <h1 style="font-size:1.8rem;margin-bottom:0.3rem">Calori<span style="color:var(--saffron)">X</span></h1>
      <p style="margin-bottom:2rem;color:var(--text3)">Welcome back! Log in to continue.</p>

      <form id="login-form">
        <div class="input-wrap" style="margin-bottom:1rem">
          <label>Email</label>
          <input class="input" id="login-email" type="email" placeholder="you@example.com" required />
        </div>

        <div class="input-wrap" style="margin-bottom:1.5rem">
          <label>Password</label>
          <input class="input" id="login-password" type="password" placeholder="••••••••" required minlength="6" />
        </div>

        <button class="btn btn-accent" type="submit" style="width:100%;justify-content:center" id="login-submit-btn">
          Log In
        </button>
      </form>

      <p style="margin-top:1.5rem;text-align:center;font-size:0.88rem;color:var(--text3)">
        Don't have an account?
        <a href="#/signup" onclick="Router.navigate('/signup')" style="color:var(--saffron);font-weight:600">Sign up</a>
      </p>
    </div>
  `;

  page.querySelector('#login-form').addEventListener('submit', handleLoginSubmit);

  async function handleLoginSubmit(e) {
    e.preventDefault();
    const email = page.querySelector('#login-email')?.value?.trim();
    const password = page.querySelector('#login-password')?.value;

    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    const btn = page.querySelector('#login-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Logging in…';

    try {
      const user = await BackendAuth.login(email, password);
      showToast(`Welcome back${user.name ? ', ' + user.name : ''}!`, 'success');
      initNavbar();
      Router.navigate('/');
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Log In';
    }
  }

  return page;
}
