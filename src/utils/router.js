// ═══════════════════════════════════════════
// CALORIX — CLIENT-SIDE ROUTER
// Hash-based SPA routing
// ═══════════════════════════════════════════

const Router = (() => {
  const routes = {};
  let currentRoute = null;

  function register(path, renderer) {
    routes[path] = renderer;
  }

  function navigate(path, pushState = true) {
    if (pushState) {
      window.location.hash = path;
    }
    render(path);
  }

  function render(path) {
    const renderer = routes[path] || routes['/'];
    if (!renderer) return;

    const container = document.getElementById('page-container');
    if (!container) return;

    // Exit animation on old content
    if (currentRoute !== path && container.firstChild) {
      container.firstChild.classList?.add('page-exit');
    }

    setTimeout(() => {
      container.innerHTML = '';
      const pageEl = renderer();
      if (pageEl) {
        pageEl.classList?.add('page-enter');
        container.appendChild(pageEl);
      }
      currentRoute = path;
      // Update nav active state
      updateNavActive(path);
      // Initialize scroll reveal
      initScrollReveal();
    }, currentRoute ? 80 : 0);
  }

  function getPath() {
    return window.location.hash.slice(1) || '/';
  }

  function init() {
    window.addEventListener('hashchange', () => render(getPath()));
    render(getPath());
  }

  function updateNavActive(path) {
    document.querySelectorAll('.nav-links a, .nav-mobile a').forEach(a => {
      a.classList.remove('active');
      const href = a.getAttribute('href') || '';
      if (href === '#' + path || (path === '/' && href === '#/')) {
        a.classList.add('active');
      }
    });
  }

  return { register, navigate, init, getPath };
})();

// Scroll reveal observer
function initScrollReveal() {
  const observer = new IntersectionObserver((entries) => {
    entries.forEach(e => {
      if (e.isIntersecting) {
        e.target.classList.add('visible');
        observer.unobserve(e.target);
      }
    });
  }, { threshold: 0.1 });

  document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => {
    observer.observe(el);
  });
}

// Counter animation helper
function animateCounter(el, target, duration = 1800, suffix = '') {
  const start = performance.now();
  const update = (time) => {
    const elapsed = time - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    el.textContent = Math.floor(eased * target) + suffix;
    if (progress < 1) requestAnimationFrame(update);
  };
  requestAnimationFrame(update);
}
