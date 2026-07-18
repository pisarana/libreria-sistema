import { api, showSpinner, hideSpinner, formatDate } from './utils.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';

const BASE = '/api/dashboard';
let chartInstance = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const usuario = await checkSession();
  renderSidebar(usuario);
  renderNavbar('Dashboard', usuario);
  await loadStats();
}

async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    const usuario = res.data;
    sessionStorage.setItem('usuario', JSON.stringify(usuario));
    return usuario;
  } catch (_) {
    window.location.href = '/index.html';
  }
}

async function loadStats() {
  showSpinner();
  try {
    const res = await api(`${BASE}/stats`);
    const stats = res.data;
    renderStatCards(stats);
    renderUltimosPrestamos(stats.ultimosPrestamos || []);
    renderLibrosBajoStock(stats.librosBajoStock || []);
    renderGrafico(stats.prestamosPorMes || []);
  } catch (err) {
    console.error('Error al cargar estadísticas:', err);
  } finally {
    hideSpinner();
  }
}

function renderStatCards(stats) {
  const cards = [
    { id: 'stat-libros',      value: stats.totalLibros,      label: 'Total Libros',      icon: 'bi-book',              color: 'blue' },
    { id: 'stat-usuarios',    value: stats.totalUsuarios,    label: 'Usuarios',           icon: 'bi-people',            color: 'green' },
    { id: 'stat-autores',     value: stats.totalAutores,     label: 'Autores',            icon: 'bi-person-lines-fill', color: 'purple' },
    { id: 'stat-categorias',  value: stats.totalCategorias,  label: 'Categorías',         icon: 'bi-tags',              color: 'teal' },
    { id: 'stat-prestamos',   value: stats.totalPrestamos,   label: 'Total Préstamos',    icon: 'bi-arrow-left-right',  color: 'orange' },
    { id: 'stat-activos',     value: stats.prestamosActivos, label: 'Préstamos Activos',  icon: 'bi-clock-history',     color: 'red' },
  ];
  cards.forEach(({ id, value, label, icon, color }) => {
    const el = document.getElementById(id);
    if (el) {
      el.querySelector('.stat-value').textContent = value ?? 0;
      el.querySelector('.stat-label').textContent = label;
      el.querySelector('.stat-icon').className = `stat-icon ${color}`;
      el.querySelector('.stat-icon i').className = `bi ${icon}`;
    }
  });
}

function renderUltimosPrestamos(prestamos) {
  const tbody = document.getElementById('tbody-ultimos-prestamos');
  if (!tbody) return;
  if (!prestamos.length) {
    tbody.innerHTML = '<tr><td colspan="5" class="empty-state"><i class="bi bi-inbox"></i>Sin préstamos recientes</td></tr>';
    return;
  }
  tbody.innerHTML = prestamos.map(p => `
    <tr>
      <td>#${p.id}</td>
      <td>${p.usuarioNombre ?? '-'}</td>
      <td>${formatDate(p.fechaPrestamo)}</td>
      <td>${formatDate(p.fechaDevolucion)}</td>
      <td><span class="badge badge-${p.estado?.toLowerCase()}">${p.estado}</span></td>
    </tr>
  `).join('');
}

function renderLibrosBajoStock(libros) {
  const tbody = document.getElementById('tbody-bajo-stock');
  if (!tbody) return;
  if (!libros.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Sin libros con bajo stock</td></tr>';
    return;
  }
  tbody.innerHTML = libros.map(l => `
    <tr>
      <td>${l.titulo}</td>
      <td>${l.autorNombre ?? '-'}</td>
      <td><span class="badge bg-danger">${l.stock}</span></td>
      <td>${l.categoriaNombre ?? '-'}</td>
    </tr>
  `).join('');
}

function renderGrafico(data) {
  const canvas = document.getElementById('chart-prestamos');
  if (!canvas) return;
  if (chartInstance) { chartInstance.destroy(); chartInstance = null; }

  const labels = data.map(d => d.mes ?? '');
  const values = data.map(d => d.total ?? 0);

  chartInstance = new Chart(canvas, {
    type: 'bar',
    data: {
      labels,
      datasets: [{
        label: 'Préstamos',
        data: values,
        backgroundColor: 'rgba(37, 99, 235, 0.8)',
        borderColor: '#2563EB',
        borderWidth: 1,
        borderRadius: 6,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: { callbacks: { label: ctx => ` ${ctx.parsed.y} préstamos` } }
      },
      scales: {
        y: { beginAtZero: true, ticks: { stepSize: 1 }, grid: { color: '#F1F5F9' } },
        x: { grid: { display: false } }
      }
    }
  });
}
