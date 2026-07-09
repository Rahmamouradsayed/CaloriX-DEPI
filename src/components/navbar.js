// ═══════════════════════════════════════════
// CALORIX — NAVBAR COMPONENT
// ═══════════════════════════════════════════

function initNavbar() {
  const nav = document.getElementById('navbar');
  const loggedIn = Store.isLoggedIn();
  const isAdmin = Store.isAdmin();
  const user = Store.getUser();

  const authLinkDesktop = loggedIn
    ? `<li><a href="#/profile" onclick="Router.navigate('/profile')">👤 ${user?.name || user?.email || 'Profile'}</a></li>`
    : `<li><a href="#/login" onclick="Router.navigate('/login')">Log In</a></li>`;

  const authLinkMobile = loggedIn
    ? `<a href="#/profile" onclick="Router.navigate('/profile');closeMobileMenu()">👤 Profile</a>`
    : `<a href="#/login" onclick="Router.navigate('/login');closeMobileMenu()">🔑 Log In</a>`;

  const adminLinkDesktop = isAdmin
    ? `<li><a href="#/admin" onclick="Router.navigate('/admin')">🛠️ Admin</a></li>`
    : '';
  const adminLinkMobile = isAdmin
    ? `<a href="#/admin" onclick="Router.navigate('/admin');closeMobileMenu()">🛠️ Admin</a>`
    : '';

  nav.innerHTML = `
    <a href="#/" class="nav-logo" onclick="Router.navigate('/')">
      Calori<span style="color:var(--saffron)">X</span>
      <span class="logo-dot"></span>
    </a>

    <ul class="nav-links">
      <li><a href="#/" onclick="Router.navigate('/')">Home</a></li>
      <li><a href="#/recipes" onclick="Router.navigate('/recipes')">Recipes</a></li>
      <li><a href="#/tracker" onclick="Router.navigate('/tracker')">Tracker</a></li>
      <li><a href="#/chat" onclick="Router.navigate('/chat')" class="nav-cta">AI Chat ✦</a></li>
      ${adminLinkDesktop}
      ${authLinkDesktop}
    </ul>

    <button class="nav-hamburger" id="hamburger" onclick="toggleMobileMenu()" aria-label="Menu">
      <span></span><span></span><span></span>
    </button>
  `;

  // Insert mobile menu after navbar
  document.getElementById('mobileMenu')?.remove();
  const mobileMenu = document.createElement('div');
  mobileMenu.className = 'nav-mobile';
  mobileMenu.id = 'mobileMenu';
  mobileMenu.innerHTML = `
    <a href="#/" onclick="Router.navigate('/');closeMobileMenu()">🏠 Home</a>
    <a href="#/recipes" onclick="Router.navigate('/recipes');closeMobileMenu()">🍽️ Recipes</a>
    <a href="#/tracker" onclick="Router.navigate('/tracker');closeMobileMenu()">📊 Tracker</a>
    <a href="#/chat" onclick="Router.navigate('/chat');closeMobileMenu()" style="color:var(--saffron);font-weight:700">✦ AI Chat</a>
    ${adminLinkMobile}
    ${authLinkMobile}
  `;
  document.getElementById('app').insertBefore(mobileMenu, document.getElementById('page-container'));

  // Scroll behavior
  window.addEventListener('scroll', () => {
    nav.classList.toggle('scrolled', window.scrollY > 20);
  });

  // Cursor glow
  document.addEventListener('mousemove', e => {
    const glow = document.getElementById('cursor-glow');
    if (glow) { glow.style.left = e.clientX + 'px'; glow.style.top = e.clientY + 'px'; }
  });
}

function handleLogout() {
  BackendAuth.logout();
  showToast('Logged out', 'info');
  initNavbar();
  Router.navigate('/');
}

function toggleMobileMenu() {
  const menu = document.getElementById('mobileMenu');
  const btn = document.getElementById('hamburger');
  menu.classList.toggle('open');
  btn.classList.toggle('open');
}
function closeMobileMenu() {
  document.getElementById('mobileMenu')?.classList.remove('open');
  document.getElementById('hamburger')?.classList.remove('open');
}