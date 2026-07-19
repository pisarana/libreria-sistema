const MENU_ITEMS = [
  { href: '/pages/dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
  { href: '/pages/libros.html',    icon: 'bi-book',           label: 'Libros' },
  { href: '/pages/autores.html',   icon: 'bi-person-lines-fill', label: 'Autores' },
  { href: '/pages/categorias.html',icon: 'bi-tags',           label: 'Categorías' },
  { href: '/pages/prestamos.html', icon: 'bi-arrow-left-right', label: 'Préstamos' },
  { href: '/pages/inventario.html',icon: 'bi-boxes',          label: 'Inventario' },
  { href: '/pages/usuarios.html',  icon: 'bi-people',         label: 'Usuarios', role: 'ADMIN' },
];

function renderSidebar(usuario) {
  const currentPath = window.location.pathname;

  const items = MENU_ITEMS
    .filter(item => !item.role || (usuario && usuario.rol === item.role))
    .map(item => {
      const isActive = currentPath === item.href || currentPath.endsWith(item.href);
      return `
        <li class="nav-item">
          <a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}">
            <i class="bi ${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        </li>`;
    }).join('');

  const initials = usuario
    ? (usuario.nombre?.[0] ?? '') + (usuario.apellido?.[0] ?? '')
    : '?';

  const html = `
    <div class="sidebar-brand">
      <div style="width:36px;height:36px;border-radius:10px;background:linear-gradient(135deg,rgba(59,130,246,0.35),rgba(99,102,241,0.35));border:1px solid rgba(255,255,255,0.15);display:flex;align-items:center;justify-content:center;flex-shrink:0">
        <i class="bi bi-book-half" style="color:#93c5fd;font-size:1.1rem;"></i>
      </div>
      <span class="sidebar-brand-name">Librería</span>
    </div>

    <nav class="sidebar-nav">
      <p class="sidebar-section-title">Navegación</p>
      <ul class="nav flex-column list-unstyled">${items}</ul>
    </nav>

    <div style="position:absolute;bottom:0;left:0;right:0;padding:1rem 0.875rem;border-top:1px solid rgba(255,255,255,0.07);">
      <div style="display:flex;align-items:center;gap:0.75rem;padding:0.625rem 0.625rem;border-radius:10px;cursor:pointer;transition:background 150ms;" onmouseenter="this.style.background='rgba(255,255,255,0.07)'" onmouseleave="this.style.background='transparent'">
        <div style="width:34px;height:34px;border-radius:50%;background:linear-gradient(135deg,#2563eb,#60a5fa);display:flex;align-items:center;justify-content:center;font-weight:700;font-size:0.8125rem;color:#fff;flex-shrink:0;box-shadow:0 2px 8px rgba(37,99,235,0.3)">
          ${initials.toUpperCase()}
        </div>
        <div style="overflow:hidden;flex:1">
          <div style="font-size:0.8125rem;font-weight:600;color:rgba(255,255,255,0.9);white-space:nowrap;overflow:hidden;text-overflow:ellipsis">
            ${usuario ? usuario.nombre + ' ' + usuario.apellido : 'Usuario'}
          </div>
          <div style="font-size:0.6875rem;color:rgba(255,255,255,0.4);font-weight:500">
            ${usuario?.rol === 'ADMIN' ? '⬤ Administrador' : '⬤ Empleado'}
          </div>
        </div>
        <button onclick="logout()" title="Cerrar sesión" style="background:none;border:none;color:rgba(255,255,255,0.3);font-size:1rem;cursor:pointer;padding:0.25rem;border-radius:6px;transition:all 150ms;flex-shrink:0" onmouseenter="this.style.color='rgba(239,68,68,0.8)';this.style.background='rgba(239,68,68,0.1)'" onmouseleave="this.style.color='rgba(255,255,255,0.3)';this.style.background='none'">
          <i class="bi bi-box-arrow-right"></i>
        </button>
      </div>
    </div>
  `;

  const container = document.getElementById('sidebar-container');
  if (container) container.innerHTML = html;

  // Mobile hamburger toggle
  const toggler = document.getElementById('sidebar-toggler');
  const sidebar = document.querySelector('.sidebar');
  if (toggler && sidebar) {
    toggler.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

async function logout() {
  try {
    await fetch('/api/auth/logout', { method: 'POST', credentials: 'include' });
  } catch (_) {}
  sessionStorage.clear();
  window.location.href = '/index.html';
}

export { renderSidebar };
