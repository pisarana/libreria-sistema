const MENU_ITEMS = [
  { href: '/pages/dashboard.html', icon: 'bi-speedometer2', label: 'Dashboard' },
  { href: '/pages/libros.html', icon: 'bi-book', label: 'Libros' },
  { href: '/pages/autores.html', icon: 'bi-person-lines-fill', label: 'Autores' },
  { href: '/pages/categorias.html', icon: 'bi-tags', label: 'Categorías' },
  { href: '/pages/prestamos.html', icon: 'bi-arrow-left-right', label: 'Préstamos' },
  { href: '/pages/inventario.html', icon: 'bi-boxes', label: 'Inventario' },
  { href: '/pages/usuarios.html', icon: 'bi-people', label: 'Usuarios', role: 'ADMIN' },
];

function renderSidebar(usuario) {
  const currentPath = window.location.pathname;
  const items = MENU_ITEMS
    .filter(item => !item.role || (usuario && usuario.rol === item.role))
    .map(item => {
      const isActive = currentPath.endsWith(item.href.replace('/', '')) || currentPath === item.href;
      return `
        <li class="nav-item">
          <a href="${item.href}" class="nav-link ${isActive ? 'active' : ''}">
            <i class="bi ${item.icon}"></i>
            <span>${item.label}</span>
          </a>
        </li>`;
    }).join('');

  const html = `
    <div class="sidebar-brand">
      <img src="/assets/img/logo.svg" alt="Logo" onerror="this.style.display='none'">
      <span style="color:#fff;font-weight:700;font-size:1.05rem;margin-left:0.5rem;">Librería</span>
    </div>
    <nav class="sidebar-nav">
      <p class="sidebar-section-title">Menú principal</p>
      <ul class="nav flex-column list-unstyled">${items}</ul>
    </nav>
  `;

  const container = document.getElementById('sidebar-container');
  if (container) container.innerHTML = html;

  // Hamburger toggle for mobile
  const toggler = document.getElementById('sidebar-toggler');
  const sidebar = document.querySelector('.sidebar');
  if (toggler && sidebar) {
    toggler.addEventListener('click', () => sidebar.classList.toggle('open'));
  }
}

export { renderSidebar };
