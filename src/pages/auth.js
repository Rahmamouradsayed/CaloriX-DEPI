// ═══════════════════════════════════════════
// CALORIX — LOGIN / REGISTER PAGE
// ═══════════════════════════════════════════

function renderAuth() {
  const page = document.createElement('div');
  page.className = 'auth-layout';

  let mode = 'login'; // 'login' | 'register'
  let isLoading = false;

  function template() {
    const isLogin = mode === 'login';
    return `
      <div class="auth-card anim-fade-up">
        <h1 style="font-size:1.8rem;margin-bottom:0.3rem">Calori<span style="color:var(--saffron)">X</span></h1>
        <p style="margin-bottom:2rem;color:var(--text3)">${isLogin ? 'Welcome back! Log in to continue.' : 'Create an account to get started.'}</p>

        <form id="auth-form">
          ${!isLogin ? `
          <div class="input-wrap" style="margin-bottom:1rem">
            <label>Name</label>
            <input class="input" id="auth-name" type="text" placeholder="Your name" />
          </div>` : ''}

          <div class="input-wrap" style="margin-bottom:1rem">
            <label>Email</label>
            <input class="input" id="auth-email" type="email" placeholder="you@example.com" required />
          </div>

          <div class="input-wrap" style="margin-bottom:1.5rem">
            <label>Password</label>
            <input class="input" id="auth-password" type="password" placeholder="••••••••" required minlength="6" />
          </div>

          <button class="btn btn-accent" type="submit" style="width:100%;justify-content:center" id="auth-submit-btn">
            ${isLogin ? 'Log In' : 'Create Account'}
          </button>
        </form>

        <p style="margin-top:1.5rem;text-align:center;font-size:0.88rem;color:var(--text3)">
          ${isLogin ? "Don't have an account?" : 'Already have an account?'}
          <a href="#" id="auth-toggle" style="color:var(--saffron);font-weight:600">${isLogin ? 'Sign up' : 'Log in'}</a>
        </p>
      </div>
    `;
  }

  function render() {
    page.innerHTML = template();
    page.querySelector('#auth-toggle').addEventListener('click', (e) => {
      e.preventDefault();
      mode = mode === 'login' ? 'register' : 'login';
      render();
    });
    page.querySelector('#auth-form').addEventListener('submit', handleSubmit);
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (isLoading) return;

    const email = page.querySelector('#auth-email')?.value?.trim();
    const password = page.querySelector('#auth-password')?.value;
    const name = page.querySelector('#auth-name')?.value?.trim();

    if (!email || !password) {
      showToast('Please fill in all fields', 'error');
      return;
    }

    isLoading = true;
    const btn = page.querySelector('#auth-submit-btn');
    btn.disabled = true;
    btn.textContent = mode === 'login' ? 'Logging in…' : 'Creating account…';

    try {
      const user = mode === 'login'
        ? await BackendAuth.login(email, password)
        : await BackendAuth.register(email, password, name);

      showToast(`Welcome${user.name ? ', ' + user.name : ''}!`, 'success');
      initNavbar(); // refresh navbar to show logged-in state
      Router.navigate('/');
    } catch (err) {
      const msg = err.message?.includes('Cannot reach')
        ? err.message
        : (err.message || 'Something went wrong. Please try again.');
      showToast(msg, 'error');
    } finally {
      isLoading = false;
      if (btn) {
        btn.disabled = false;
        btn.textContent = mode === 'login' ? 'Log In' : 'Create Account';
      }
    }
  }

  render();
  return page;
}
