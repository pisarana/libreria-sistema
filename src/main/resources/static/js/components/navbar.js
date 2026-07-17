import { api, showToast } from '../utils.js';

function renderNavbar(titulo, usuario) {
  const nombre = usuario ? `${usuario.nombre} ${usuario.apellido}` : 'Usuario';
  const iniciales = usuario
    ? (usuario.nombre[0] + (usuario.apellido ? usuario.apellido[0] : '')).toUpperCase()
    : 'U';
  const rolBadge = usuario && usuario.rol === 'ADMIN'
    ? '<span class="badge-admin ms-1">ADMIN</span>'
    : '<span class="badge-empleado ms-1">EMPLEADO</span>';

  const html = `
    <div class="d-flex align-items-center gap-2">
      <button class="btn btn-sm btn-outline-secondary d-md-none border-0" id="sidebar-toggler">
        <i class="bi bi-list fs-5"></i>
      </button>
      <span class="topbar-title">${titulo}</span>
    </div>
    <div class="d-flex align-items-center gap-3">
      <div class="user-badge dropdown">
        <div class="d-flex align-items-center gap-2" data-bs-toggle="dropdown" style="cursor:pointer;">
          <div class="user-avatar">${iniciales}</div>
          <div class="d-none d-sm-block">
            <div style="font-size:0.85rem;font-weight:600;">${nombre}</div>
            <div style="font-size:0.75rem;">${rolBadge}</div>
          </div>
          <i class="bi bi-chevron-down" style="font-size:0.75rem;color:var(--color-muted);"></i>
        </div>
        <ul class="dropdown-menu dropdown-menu-end shadow">
          <li><span class="dropdown-item-text text-muted small">${usuario ? usuario.correo : ''}</span></li>
          <li><hr class="dropdown-divider"></li>
          <li><a class="dropdown-item text-danger" href="#" id="btn-logout">
            <i class="bi bi-box-arrow-right me-2"></i>Cerrar sesión
          </a></li>
        </ul>
      </div>
    </div>
  `;

  const container = document.getElementById('topbar-container');
  if (container) container.innerHTML = html;

  document.getElementById('btn-logout')?.addEventListener('click', async (e) => {
    e.preventDefault();
    try {
      await api('/api/auth/logout', { method: 'POST' });
    } catch (_) {}
    sessionStorage.removeItem('usuario');
    window.location.href = '/index.html';
  });
}

export { renderNavbar };
