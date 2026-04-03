// Portable ERP — App Core
const ERPAPP = (() => {
  const USER_KEY = 'erp_user';
  const ROLE_KEY = 'erp_role';

  // Auth helpers
  function login(username, password) {
    if (typeof ERPDATA === 'undefined' || !ERPDATA.findUserForLogin) return false;
    const u = ERPDATA.findUserForLogin(username, password);
    if (!u) return false;
    const sessionUser = {
      username: u.username,
      fullName: u.fullName,
      email: u.email,
      department: u.department,
      role: u.role,
    };
    localStorage.setItem(USER_KEY, JSON.stringify(sessionUser));
    localStorage.setItem(ROLE_KEY, u.role);
    return true;
  }

  function logout() {
    localStorage.removeItem(USER_KEY);
    localStorage.removeItem(ROLE_KEY);
    window.location.href = 'login.html';
  }

  function requireAuth() {
    const user = getUser();
    if (!user) { window.location.href = 'login.html'; return null; }
    return user;
  }

  function getUser() {
    const stored = localStorage.getItem(USER_KEY);
    return stored ? JSON.parse(stored) : null;
  }

  function getRole() {
    return localStorage.getItem(ROLE_KEY) || 'operator';
  }

  function isAdmin() { return getRole() === 'admin'; }
  function isManager() { return ['admin','manager'].includes(getRole()); }

  // Toast notification
  function showToast(message, type = 'success') {
    let container = document.getElementById('erp-toast-container');
    if (!container) {
      container = document.createElement('div');
      container.id = 'erp-toast-container';
      container.style.cssText = 'position:fixed;top:1rem;right:1rem;z-index:9999;display:flex;flex-direction:column;gap:.5rem;';
      document.body.appendChild(container);
    }
    const icons = { success:'check-circle-fill', danger:'x-circle-fill', warning:'exclamation-triangle-fill', info:'info-circle-fill' };
    const toast = document.createElement('div');
    toast.className = `toast align-items-center text-bg-${type} border-0 show`;
    toast.setAttribute('role', 'alert');
    toast.innerHTML = `<div class="d-flex"><div class="toast-body d-flex align-items-center gap-2"><i class="bi bi-${icons[type]||'info-circle-fill'}"></i>${message}</div><button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="this.closest('.toast').remove()"></button></div>`;
    container.appendChild(toast);
    setTimeout(() => { if (toast.parentElement) toast.remove(); }, 3500);
  }

  // Layout initialisation
  function initLayout(activePage) {
    const user = requireAuth();
    if (!user) return;
    const role = user.role;

    // Populate user info in topbar
    const nameEl = document.getElementById('erp-username');
    const roleEl = document.getElementById('erp-role-badge');
    if (nameEl) nameEl.textContent = user.fullName || user.username;
    if (roleEl) {
      const labels = { admin: 'Administrator', manager: 'Manager', operator: 'Operator' };
      const label = labels[role] || role;
      roleEl.innerHTML = `<span class="erp-role-pill" data-role="${role}">${label}</span>`;
    }

    // Highlight active nav link
    const navLinks = document.querySelectorAll('[data-page]');
    navLinks.forEach(link => {
      if (link.dataset.page === activePage) link.classList.add('active');
    });

    // Hide restricted nav items for operators
    if (role === 'operator') {
      document.querySelectorAll('[data-erp-nav-restricted]').forEach(el => el.closest('li')?.remove());
    }

    // Profile link — hidden for administrators (use Users instead)
    if (role === 'admin') {
      document.querySelectorAll('[data-erp-nav-profile]').forEach(el => el.closest('li')?.remove());
    }

    // Admin-only nav (logs, etc.)
    if (role !== 'admin') {
      document.querySelectorAll('[data-erp-nav-admin]').forEach(el => el.closest('li')?.remove());
    } else {
      const logsCollapse = document.getElementById('nav-logs-sub');
      const logsToggle = document.querySelector('[data-erp-logs-toggle]');
      if (logsCollapse && ['logs-activity', 'logs-error'].includes(activePage)) {
        logsCollapse.classList.add('show');
        if (logsToggle) {
          logsToggle.classList.remove('collapsed');
          logsToggle.setAttribute('aria-expanded', 'true');
        }
      }
    }

    // Hide section headings with no links left (e.g. Analysis for operators)
    document.querySelectorAll('#erp-sidebar .nav-section-label').forEach(label => {
      const ul = label.nextElementSibling;
      if (!ul || !ul.matches('ul.nav')) return;
      if (!ul.querySelector(':scope > li.nav-item')) {
        label.classList.add('d-none');
        ul.classList.add('d-none');
      }
    });

    // Logout button
    const logoutBtn = document.getElementById('erp-logout');
    if (logoutBtn) logoutBtn.addEventListener('click', e => { e.preventDefault(); logout(); });

    // Mobile sidebar toggle
    const toggler = document.getElementById('sidebar-toggler');
    const sidebar = document.getElementById('erp-sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (toggler && sidebar) {
      toggler.addEventListener('click', () => {
        sidebar.classList.toggle('show');
        if (backdrop) backdrop.classList.toggle('show');
      });
    }
    if (backdrop) {
      backdrop.addEventListener('click', () => {
        sidebar.classList.remove('show');
        backdrop.classList.remove('show');
      });
    }
  }

  // Format helpers
  function fmt(n, decimals = 2) { return Number(n).toLocaleString('en-IN', { minimumFractionDigits: decimals, maximumFractionDigits: decimals }); }
  function fmtCurrency(n) { return '₹ ' + fmt(n); }
  function fmtDate(d) { if (!d) return '—'; return new Date(d).toLocaleDateString('en-IN', { day:'2-digit', month:'short', year:'numeric' }); }
  function fmtDateTime(d) { if (!d) return '—'; return new Date(d).toLocaleString('en-IN', { day:'2-digit', month:'short', year:'numeric', hour:'2-digit', minute:'2-digit' }); }

  function statusBadge(status) {
    const map = {
      pending: 'warning', received: 'success', cancelled: 'danger',
      shipped: 'info', delivered: 'success',
      planned: 'secondary', in_progress: 'primary', completed: 'success',
      adjustment: 'warning', purchase: 'success', sale: 'danger', job: 'primary',
    };
    const labels = { in_progress: 'In Progress' };
    const color = map[status] || 'secondary';
    const label = labels[status] || status.charAt(0).toUpperCase() + status.slice(1);
    return `<span class="badge bg-${color}-subtle text-${color}-emphasis border border-${color}-subtle">${label}</span>`;
  }

  function priorityBadge(priority) {
    const map = { high:'danger', medium:'warning', low:'success' };
    return `<span class="badge bg-${map[priority]||'secondary'}-subtle text-${map[priority]||'secondary'}-emphasis">${priority.charAt(0).toUpperCase()+priority.slice(1)}</span>`;
  }

  function escapeHtml(s) {
    if (s == null) return '';
    const d = document.createElement('div');
    d.textContent = String(s);
    return d.innerHTML;
  }

  let confirmModalEl = null;

  function ensureConfirmModal() {
    if (confirmModalEl) return;
    const el = document.createElement('div');
    el.id = 'erp-confirm-modal';
    el.className = 'modal fade';
    el.setAttribute('tabindex', '-1');
    el.setAttribute('aria-hidden', 'true');
    el.innerHTML = `
      <div class="modal-dialog modal-dialog-centered">
        <div class="modal-content border-0 shadow">
          <div class="modal-header border-bottom-0 pb-0">
            <h5 class="modal-title fw-semibold" id="erp-cf-title">Confirm</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close"></button>
          </div>
          <div class="modal-body pt-2 text-body" id="erp-cf-body"></div>
          <div class="modal-footer border-top-0 pt-0">
            <button type="button" class="btn btn-outline-secondary" id="erp-cf-cancel">Cancel</button>
            <button type="button" class="btn btn-primary" id="erp-cf-ok">OK</button>
          </div>
        </div>
      </div>`;
    document.body.appendChild(el);
    confirmModalEl = el;
    const modal = bootstrap.Modal.getOrCreateInstance(el);

    el.addEventListener('hidden.bs.modal', () => {
      const fn = el._erpConfirmResolve;
      if (fn) {
        el._erpConfirmResolve = null;
        fn(el._erpConfirmResult === true);
      }
      el._erpConfirmResult = undefined;
    });

    document.getElementById('erp-cf-ok').addEventListener('click', () => {
      el._erpConfirmResult = true;
      modal.hide();
    });
    document.getElementById('erp-cf-cancel').addEventListener('click', () => {
      el._erpConfirmResult = false;
      modal.hide();
    });
  }

  /**
   * SweetAlert-style confirmation (Bootstrap modal). Resolves true if user confirms.
   * @param {{ title?: string, message?: string, messageHtml?: string, confirmText?: string, cancelText?: string, danger?: boolean }} opts
   */
  function confirmAction(opts = {}) {
    return new Promise((resolve) => {
      ensureConfirmModal();
      confirmModalEl._erpConfirmResult = undefined;
      confirmModalEl._erpConfirmResolve = resolve;

      document.getElementById('erp-cf-title').textContent = opts.title || 'Confirm';
      const body = document.getElementById('erp-cf-body');
      if (opts.messageHtml) body.innerHTML = opts.messageHtml;
      else body.innerHTML = `<p class="mb-0 text-body-secondary">${escapeHtml(opts.message || '')}</p>`;

      const okBtn = document.getElementById('erp-cf-ok');
      okBtn.textContent = opts.confirmText || 'OK';
      okBtn.className = 'btn ' + (opts.danger ? 'btn-danger' : 'btn-primary');
      document.getElementById('erp-cf-cancel').textContent = opts.cancelText || 'Cancel';

      bootstrap.Modal.getOrCreateInstance(confirmModalEl).show();
    });
  }

  return { login, logout, requireAuth, getUser, getRole, isAdmin, isManager, showToast, initLayout, fmt, fmtCurrency, fmtDate, fmtDateTime, statusBadge, priorityBadge, escapeHtml, confirmAction };
})();
