// ═══════════════════════════════════════════
// CALORIX — APP BOOTSTRAP
// ═══════════════════════════════════════════

document.addEventListener('DOMContentLoaded', () => {

  // 1. Initialize components
  initNavbar();
  initToasts();

  // 2. Register routes
  Router.register('/',         renderHome);
  Router.register('/recipes',  renderRecipes);
  Router.register('/tracker',  renderTracker);
  Router.register('/chat',     renderChat);
  Router.register('/login',    renderLogin);
  Router.register('/signup',   renderSignup);
  Router.register('/profile',  renderProfile);
  Router.register('/admin',    renderAdmin);

  // 3. Start router
  Router.init();

  // 4. Intercept all internal nav clicks
  document.addEventListener('click', e => {
    const a = e.target.closest('a[href^="#"]');
    if (!a) return;
    const path = a.getAttribute('href').slice(1);
    if (path !== window.location.hash.slice(1)) {
      e.preventDefault();
      Router.navigate(path);
    }
  });

  // 5. Smooth scroll to top on route change
  window.addEventListener('hashchange', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });

  console.log('%cCaloriX 🥗', 'font-size:24px;font-weight:900;color:#E8873A;font-family:serif');
  console.log('%cNutrition Intelligence Platform · Built by Team DEPI', 'color:#8B6F5E');
});
