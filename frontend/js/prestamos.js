import { api, showToast, showSpinner, hideSpinner, confirmDelete, renderPagination, formatDate } from './utils.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import Validators from './validators.js';
import PrestamoService from './services/prestamoService.js';
import UsuarioService from './services/usuarioService.js';
import LibroService from './services/libroService.js';

// ── Estado ────────────────────────────────────────────────────
let histState = { page: 0, size: 10, estado: '', totalPages: 0 };
let carrito = [];   // [{ libroId, titulo, isbn, stock, cantidad }]
let usuariosCache = [];
let usuarioActual = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  usuarioActual = await checkSession();
  renderSidebar(usuarioActual);
  renderNavbar('Gestión de Préstamos', usuarioActual);
  await Promise.all([cargarUsuariosSelect(), loadHistorial()]);
  setupListeners();
}

async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    sessionStorage.setItem('usuario', JSON.stringify(res.data));
    return res.data;
  } catch (_) { window.location.href = '/index.html'; }
}

// ── Tab Nuevo Préstamo ────────────────────────────────────────
async function cargarUsuariosSelect() {
  try {
    const res = await UsuarioService.listar({ page: 0, size: 100 });
    usuariosCache = res.data?.content ?? [];
    const sel = document.getElementById('select-usuario');
    if (!sel) return;
    sel.innerHTML = '<option value="">Seleccionar usuario...</option>' +
      usuariosCache.filter(u => u.estado).map(u =>
        `<option value="${u.id}">${u.nombre} ${u.apellido} — ${u.correo}</option>`
      ).join('');
  } catch (_) {}
}

// Buscar libro para agregar al carrito
async function buscarLibroParaAgregar() {
  const termino = document.getElementById('input-buscar-libro').value.trim();
  if (!termino) return;
  showSpinner();
  try {
    const res = await LibroService.listar({ busqueda: termino, page: 0, size: 10 });
    const libros = res.data?.content ?? [];
    renderResultadosBusqueda(libros);
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
}

function renderResultadosBusqueda(libros) {
  const container = document.getElementById('resultados-busqueda');
  if (!container) return;
  if (!libros.length) {
    container.innerHTML = '<div class="text-muted p-2 small">Sin resultados</div>';
    return;
  }
  container.innerHTML = libros.map(l => `
    <div class="d-flex align-items-center justify-content-between p-2 border-bottom resultado-item"
         style="cursor:pointer" onclick="agregarAlCarrito(${l.id}, '${l.titulo.replace(/'/g,"\\'")}', '${l.isbn}', ${l.stock})">
      <div>
        <div class="fw-semibold small">${l.titulo}</div>
        <div class="text-muted" style="font-size:0.75rem">ISBN: ${l.isbn} | Stock: ${l.stock}</div>
      </div>
      <i class="bi bi-plus-circle text-primary"></i>
    </div>
  `).join('');
}

window.agregarAlCarrito = function(libroId, titulo, isbn, stock) {
  document.getElementById('resultados-busqueda').innerHTML = '';
  document.getElementById('input-buscar-libro').value = '';

  if (carrito.find(i => i.libroId === libroId)) {
    showToast('Este libro ya está en el préstamo', 'warning'); return;
  }
  if (stock <= 0) {
    showToast('Sin stock disponible', 'danger'); return;
  }
  carrito.push({ libroId, titulo, isbn, stock, cantidad: 1 });
  renderCarrito();
};

function renderCarrito() {
  const tbody = document.getElementById('tbody-carrito');
  const resumen = document.getElementById('resumen-carrito');
  if (!tbody) return;

  if (!carrito.length) {
    tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-3">Agrega libros al préstamo</td></tr>';
    if (resumen) resumen.textContent = '0 libro(s)';
    return;
  }

  tbody.innerHTML = carrito.map((item, idx) => `<tr>
    <td>${item.titulo}</td>
    <td><code>${item.isbn}</code></td>
    <td>
      <div class="input-group input-group-sm" style="width:100px">
        <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${idx}, -1)">-</button>
        <input type="number" class="form-control text-center" value="${item.cantidad}" min="1" max="${item.stock}"
          onchange="setCantidad(${idx}, this.value)">
        <button class="btn btn-outline-secondary" onclick="cambiarCantidad(${idx}, 1)">+</button>
      </div>
    </td>
    <td>
      <button class="btn btn-sm btn-outline-danger" onclick="quitarDelCarrito(${idx})">
        <i class="bi bi-x"></i>
      </button>
    </td>
  </tr>`).join('');

  if (resumen) resumen.textContent = `${carrito.length} libro(s)`;
}

window.cambiarCantidad = function(idx, delta) {
  const item = carrito[idx];
  const nueva = Math.max(1, Math.min(item.stock, item.cantidad + delta));
  carrito[idx].cantidad = nueva;
  renderCarrito();
};

window.setCantidad = function(idx, val) {
  const item = carrito[idx];
  const nueva = Math.max(1, Math.min(item.stock, parseInt(val) || 1));
  carrito[idx].cantidad = nueva;
  renderCarrito();
};

window.quitarDelCarrito = function(idx) {
  carrito.splice(idx, 1);
  renderCarrito();
};

async function registrarPrestamo() {
  const usuarioId = document.getElementById('select-usuario').value;
  const fechaDevolucion = document.getElementById('fecha-devolucion').value;
  const observaciones   = document.getElementById('observaciones').value.trim();

  if (!usuarioId) { showToast('Selecciona un usuario', 'warning'); return; }
  if (!carrito.length) { showToast('Agrega al menos un libro', 'warning'); return; }

  const btn = document.getElementById('btn-registrar');
  btn.disabled = true;
  showSpinner();
  try {
    const payload = {
      usuarioId: parseInt(usuarioId),
      fechaDevolucion: fechaDevolucion || null,
      observaciones,
      detalles: carrito.map(i => ({ libroId: i.libroId, cantidad: i.cantidad }))
    };
    await PrestamoService.crear(payload);
    showToast('Préstamo registrado correctamente');
    carrito = [];
    renderCarrito();
    document.getElementById('form-prestamo').reset();
    // Cambiar a tab historial y recargar
    const tabHistorial = document.getElementById('tab-historial');
    if (tabHistorial) new bootstrap.Tab(tabHistorial).show();
    histState.page = 0;
    await loadHistorial();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
    hideSpinner();
  }
}

// ── Tab Historial ─────────────────────────────────────────────
async function loadHistorial() {
  showSpinner();
  try {
    const params = { page: histState.page, size: histState.size };
    if (histState.estado) params.estado = histState.estado;
    const res = await PrestamoService.listar(params);
    const data = res.data;
    renderHistorial(data.content ?? []);
    histState.totalPages = data.totalPages ?? 1;
    renderPagination('paginacion-hist', histState.page, histState.totalPages, (p) => { histState.page = p; loadHistorial(); });
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
}

function renderHistorial(prestamos) {
  const tbody = document.getElementById('tbody-historial');
  if (!tbody) return;
  if (!prestamos.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state"><i class="bi bi-arrow-left-right"></i>Sin préstamos registrados</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = prestamos.map(p => {
    const libros = (p.detalles ?? []).map(d => d.libroTitulo).join(', ') || '-';
    const estadoClass = { ACTIVO: 'badge-activo', DEVUELTO: 'badge-devuelto', VENCIDO: 'badge-vencido' }[p.estado] ?? '';
    const puedeDev = p.estado === 'ACTIVO';
    const puedeElim = usuarioActual?.rol === 'ADMIN';
    return `<tr>
      <td class="text-muted">#${p.id}</td>
      <td>${p.usuarioNombre ?? '-'}</td>
      <td><small>${libros}</small></td>
      <td>${formatDate(p.fechaPrestamo)}</td>
      <td>${formatDate(p.fechaDevolucion)}</td>
      <td><span class="badge ${estadoClass}">${p.estado}</span></td>
      <td>
        ${puedeDev ? `<button class="btn btn-sm btn-outline-success me-1" onclick="devolver(${p.id})">
          <i class="bi bi-arrow-return-left"></i> Devolver
        </button>` : ''}
        ${puedeElim ? `<button class="btn btn-sm btn-outline-danger" onclick="eliminarPrestamo(${p.id})">
          <i class="bi bi-trash"></i>
        </button>` : ''}
      </td>
    </tr>`;
  }).join('');
}

window.devolver = async function(id) {
  try {
    await PrestamoService.devolver(id);
    showToast('Préstamo marcado como devuelto');
    loadHistorial();
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

window.eliminarPrestamo = async function(id) {
  const ok = await confirmDelete(`Préstamo #${id}`);
  if (!ok) return;
  try {
    await PrestamoService.eliminar(id);
    showToast('Préstamo eliminado');
    loadHistorial();
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

// ── Listeners ─────────────────────────────────────────────────
function setupListeners() {
  document.getElementById('btn-buscar-libro')?.addEventListener('click', buscarLibroParaAgregar);
  document.getElementById('input-buscar-libro')?.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') { e.preventDefault(); buscarLibroParaAgregar(); }
  });
  document.getElementById('btn-registrar')?.addEventListener('click', registrarPrestamo);
  document.getElementById('filtro-estado')?.addEventListener('change', (e) => {
    histState.estado = e.target.value; histState.page = 0; loadHistorial();
  });
}
