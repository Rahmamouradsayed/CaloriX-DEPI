// ═══════════════════════════════════════════
// CALORIX — SIGN UP PAGE
// ═══════════════════════════════════════════

function renderSignup() {
  const page = document.createElement('div');
  page.className = 'auth-layout';

  page.innerHTML = `
    <div class="auth-card anim-fade-up">
      <h1 style="font-size:1.8rem;margin-bottom:0.3rem">Calori<span style="color:var(--saffron)">X</span></h1>
      <p style="margin-bottom:2rem;color:var(--text3)">Create an account to get started.</p>

      <form id="signup-form">
        <div class="input-wrap" style="margin-bottom:1rem">
          <label>Name</label>
          <input class="input" id="signup-name" type="text" placeholder="Your name" />
        </div>

        <div class="input-wrap" style="margin-bottom:1rem">
          <label>Email</label>
          <input class="input" id="signup-email" type="email" placeholder="you@example.com" required />
        </div>

        <div class="input-wrap" style="margin-bottom:0.5rem">
          <label>Password</label>
          <input class="input" id="signup-password" type="password" placeholder="••••••••" required minlength="6" />
        </div>
        <p style="font-size:0.78rem;color:var(--text3);margin-bottom:1.5rem">At least 6 characters.</p>

        <button class="btn btn-accent" type="submit" style="width:100%;justify-content:center" id="signup-submit-btn">
          Create Account
        </button>
      </form>

      <p style="margin-top:1.5rem;text-align:center;font-size:0.88rem;color:var(--text3)">
        Already have an account?
        <a href="#/login" onclick="Router.navigate('/login')" style="color:var(--saffron);font-weight:600">Log in</a>
      </p>
    </div>
  `;

  page.querySelector('#signup-form').addEventListener('submit', handleSignupSubmit);

  async function handleSignupSubmit(e) {
    e.preventDefault();
    const name = page.querySelector('#signup-name')?.value?.trim();
    const email = page.querySelector('#signup-email')?.value?.trim();
    const password = page.querySelector('#signup-password')?.value;

    if (!email || !password) {
      showToast('Please fill in email and password', 'error');
      return;
    }
    if (password.length < 6) {
      showToast('Password must be at least 6 characters', 'error');
      return;
    }

    const btn = page.querySelector('#signup-submit-btn');
    btn.disabled = true;
    btn.textContent = 'Creating account…';

    try {
      const user = await BackendAuth.register(email, password, name);
      showToast(`Welcome to CaloriX${user.name ? ', ' + user.name : ''}!`, 'success');
      initNavbar();
      Router.navigate('/');
    } catch (err) {
      showToast(err.message || 'Something went wrong. Please try again.', 'error');
    } finally {
      btn.disabled = false;
      btn.textContent = 'Create Account';
    }
  }

  return page;
}
