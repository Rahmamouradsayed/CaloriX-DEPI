// ═══════════════════════════════════════════
// CALORIX — TOAST NOTIFICATIONS
// ═══════════════════════════════════════════

function initToasts() {
  const container = document.createElement('div');
  container.id = 'toast-container';
  document.body.appendChild(container);
}

function showToast(message, type = 'info', duration = 3000) {
  const icons = { success: '✓', error: '✕', info: '✦' };
  const container = document.getElementById('toast-container');
  const toast = document.createElement('div');
  toast.className = `toast toast-${type} toast-enter`;
  toast.innerHTML = `<span class="toast-icon">${icons[type]}</span><span>${message}</span>`;
  container.appendChild(toast);

  setTimeout(() => {
    toast.classList.remove('toast-enter');
    toast.classList.add('toast-exit');
    setTimeout(() => toast.remove(), 300);
  }, duration);
}

// ═══════════════════════════════════════════
// CALORIX — MODAL SYSTEM
// ═══════════════════════════════════════════

const Modal = {
  _overlay: null,

  show(contentHTML, options = {}) {
    this.close();
    const overlay = document.createElement('div');
    overlay.className = 'modal-overlay';
    overlay.id = 'modal-overlay';

    const box = document.createElement('div');
    box.className = 'modal-box';
    if (options.wide)   box.style.maxWidth = '640px';
    if (options.narrow) box.style.maxWidth = '380px';

    box.innerHTML = contentHTML;
    overlay.appendChild(box);
    document.body.appendChild(overlay);
    document.body.style.overflow = 'hidden';

    overlay.addEventListener('click', e => { if (e.target === overlay) this.close(); });
    const handler = e => { if (e.key === 'Escape') { this.close(); document.removeEventListener('keydown', handler); } };
    document.addEventListener('keydown', handler);

    this._overlay = overlay;
    return box;
  },

  close() {
    if (this._overlay) {
      this._overlay.remove();
      this._overlay = null;
      document.body.style.overflow = '';
    }
  }
};
