import { api, showToast, showSpinner, hideSpinner, renderPagination, formatCurrency } from './utils.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import Validators from './validators.js';
import InventarioService from './services/inventarioService.js';

let state = { page: 0, size: 15, busqueda: '', totalPages: 0 };
let ajustandoId = null;
let modalInstance = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const usuario = await checkSession();
  renderSidebar(usuario);
  renderNavbar('Inventario', usuario);
  await Promise.all([loadInventario(), loadAlertas()]);
  setupListeners(usuario);
}

async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    sessionStorage.setItem('usuario', JSON.stringify(res.data));
    return res.data;
  } catch (_) { window.location.href = '/index.html'; }
}

async function loadInventario() {
  showSpinner();
  try {
    const params = { page: state.page, size: state.size };
    if (state.busqueda) params.busqueda = state.busqueda;
    const res = await InventarioService.listar(params);
    const data = res.data;
    renderTabla(data.content ?? []);
    state.totalPages = data.totalPages ?? 1;
    renderPagination('paginacion', state.page, state.totalPages, (p) => { state.page = p; loadInventario(); });
    document.getElementById('info-pagina').textContent =
      `Mostrando ${data.numberOfElements ?? 0} de ${data.totalElements ?? 0} libros`;
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
}

async function loadAlertas() {
  try {
    const res = await InventarioService.alertas();
    const libros = res.data ?? [];
    renderAlertas(libros);
  } catch (_) {}
}

function renderAlertas(libros) {
  const container = document.getElementById('alertas-container');
  if (!container) return;
  if (!libros.length) {
    container.innerHTML = '<div class="alert alert-success"><i class="bi bi-check-circle me-2"></i>Todos los libros tienen stock suficiente.</div>';
    return;
  }
  container.innerHTML = `
    <div class="alert alert-warning d-flex align-items-center mb-3">
      <i class="bi bi-exclamation-triangle-fill me-2 fs-5"></i>
      <strong>${libros.length} libro(s) con stock bajo (≤ 5 unidades)</strong>
    </div>
    <div class="row g-2 mb-3">
      ${libros.map(l => `
        <div class="col-6 col-md-4 col-lg-3">
          <div class="card p-2 border-warning">
            <div class="fw-semibold small text-truncate" title="${l.titulo}">${l.titulo}</div>
            <div class="d-flex align-items-center gap-1 mt-1">
              <span class="badge bg-danger">${l.stock} unid.</span>
              <small class="text-muted">${l.autorNombre ?? ''}</small>
            </div>
          </div>
        </div>
      `).join('')}
    </div>
  `;
}

function renderTabla(libros) {
  const tbody = document.getElementById('tbody-inventario');
  if (!tbody) return;
  if (!libros.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state"><i class="bi bi-boxes"></i>No se encontraron libros</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = libros.map(l => {
    const minimo = l.stockMinimo ?? 3;
    const pct = Math.min(100, (l.stock / 20) * 100);
    const barColor = l.stock <= minimo ? 'bg-danger' : l.stock <= minimo * 2 ? 'bg-warning' : 'bg-success';
    const stockBadge = l.stock <= minimo
      ? `<span class="badge bg-danger me-1">${l.stock}</span><span class="badge bg-secondary">Stock bajo</span>`
      : `<span class="fw-bold">${l.stock}</span>`;
    return `<tr>
      <td class="text-muted">#${l.id}</td>
      <td><strong>${l.titulo}</strong></td>
      <td>${l.autorNombre ?? '-'}</td>
      <td>${l.categoriaNombre ?? '-'}</td>
      <td>
        <div class="d-flex align-items-center gap-2">
          ${stockBadge}
          <div class="progress flex-grow-1" style="height:8px">
            <div class="progress-bar ${barColor}" style="width:${pct}%"></div>
          </div>
        </div>
      </td>
      <td>${formatCurrency(l.precio)}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary" onclick="abrirAjuste(${l.id}, '${l.titulo.replace(/'/g,"\\'")}', ${l.stock})">
          <i class="bi bi-sliders"></i> Ajustar
        </button>
      </td>
    </tr>`;
  }).join('');
}

window.abrirAjuste = function(id, titulo, stockActual) {
  ajustandoId = id;
  document.getElementById('ajuste-titulo').textContent = titulo;
  document.getElementById('ajuste-stock-actual').textContent = stockActual;
  document.getElementById('form-ajuste').reset();
  Validators.clearAllErrors('form-ajuste');
  modalInstance?.show();
};

async function guardarAjuste() {
  const cantidad = document.getElementById('ajuste-cantidad').value;
  const motivo   = document.getElementById('ajuste-motivo').value.trim();

  Validators.clearAllErrors('form-ajuste');
  const { valid, errors } = Validators.validateForm({
    'ajuste-cantidad': [{ type: 'required', value: cantidad, message: 'La cantidad es obligatoria' }],
    'ajuste-motivo':   [{ type: 'required', value: motivo,   message: 'El motivo es obligatorio' }],
  });
  if (!valid) { Object.entries(errors).forEach(([f, m]) => Validators.showFieldError(f, m)); return; }

  const btn = document.getElementById('btn-guardar-ajuste');
  btn.disabled = true;
  try {
    await InventarioService.ajustarStock(ajustandoId, parseInt(cantidad), motivo);
    showToast('Stock actualizado correctamente');
    modalInstance?.hide();
    await Promise.all([loadInventario(), loadAlertas()]);
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
  }
}

function setupListeners(usuario) {
  const modalEl = document.getElementById('modal-ajuste');
  if (modalEl) modalInstance = new bootstrap.Modal(modalEl);
  document.getElementById('btn-guardar-ajuste')?.addEventListener('click', guardarAjuste);

  let timer;
  document.getElementById('input-busqueda')?.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.busqueda = e.target.value; state.page = 0; loadInventario(); }, 400);
  });

  // Solo ADMIN puede ajustar stock
  if (usuario?.rol !== 'ADMIN') {
    document.querySelectorAll('.admin-action').forEach(el => el.remove());
  }
}
