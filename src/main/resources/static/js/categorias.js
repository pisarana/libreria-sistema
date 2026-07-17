import { api, showToast, showSpinner, hideSpinner, confirmDelete, renderPagination } from './utils.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import Validators from './validators.js';
import CategoriaService from './services/categoriaService.js';

let state = { page: 0, size: 10, totalPages: 0 };
let editingId = null;
let modalInstance = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const usuario = await checkSession();
  renderSidebar(usuario);
  renderNavbar('Gestión de Categorías', usuario);
  await loadCategorias();
  setupListeners();
}

async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    sessionStorage.setItem('usuario', JSON.stringify(res.data));
    return res.data;
  } catch (_) { window.location.href = '/index.html'; }
}

async function loadCategorias() {
  showSpinner();
  try {
    const res = await CategoriaService.listar({ page: state.page, size: state.size });
    const data = res.data;
    renderTabla(data.content ?? []);
    state.totalPages = data.totalPages ?? 1;
    renderPagination('paginacion', state.page, state.totalPages, (p) => { state.page = p; loadCategorias(); });
    document.getElementById('info-pagina').textContent =
      `Mostrando ${data.numberOfElements ?? 0} de ${data.totalElements ?? 0} categorías`;
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
}

function renderTabla(categorias) {
  const tbody = document.getElementById('tbody-categorias');
  if (!tbody) return;
  if (!categorias.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state"><i class="bi bi-tags"></i>No se encontraron categorías</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = categorias.map(c => `<tr>
    <td class="text-muted">#${c.id}</td>
    <td><strong>${c.nombre}</strong></td>
    <td>${c.descripcion ?? '-'}</td>
    <td><span class="badge bg-secondary">${c.totalLibros ?? 0} libros</span></td>
    <td>
      <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirEditar(${c.id})">
        <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger" onclick="eliminar(${c.id}, '${c.nombre.replace(/'/g, "\\'")}')">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  </tr>`).join('');
}

window.abrirNuevo = function() {
  editingId = null;
  document.getElementById('modal-titulo').textContent = 'Nueva Categoría';
  document.getElementById('form-categoria').reset();
  Validators.clearAllErrors('form-categoria');
  modalInstance?.show();
};

window.abrirEditar = async function(id) {
  try {
    showSpinner();
    const res = await CategoriaService.buscarPorId(id);
    const c = res.data;
    editingId = id;
    document.getElementById('modal-titulo').textContent = 'Editar Categoría';
    document.getElementById('form-nombre').value      = c.nombre;
    document.getElementById('form-descripcion').value = c.descripcion ?? '';
    Validators.clearAllErrors('form-categoria');
    modalInstance?.show();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
};

window.eliminar = async function(id, nombre) {
  const ok = await confirmDelete(nombre);
  if (!ok) return;
  try {
    await CategoriaService.eliminar(id);
    showToast('Categoría eliminada correctamente');
    loadCategorias();
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

async function guardarCategoria() {
  const nombre      = document.getElementById('form-nombre').value.trim();
  const descripcion = document.getElementById('form-descripcion').value.trim();

  Validators.clearAllErrors('form-categoria');
  const { valid, errors } = Validators.validateForm({
    'form-nombre': [{ type: 'required', value: nombre, message: 'El nombre es obligatorio' }],
  });
  if (!valid) { Object.entries(errors).forEach(([f, m]) => Validators.showFieldError(f, m)); return; }

  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  try {
    const payload = { nombre, descripcion };
    if (editingId) {
      await CategoriaService.actualizar(editingId, payload);
      showToast('Categoría actualizada correctamente');
    } else {
      await CategoriaService.crear(payload);
      showToast('Categoría creada correctamente');
    }
    modalInstance?.hide();
    state.page = 0;
    loadCategorias();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
  }
}

function setupListeners() {
  const modalEl = document.getElementById('modal-categoria');
  if (modalEl) modalInstance = new bootstrap.Modal(modalEl);
  document.getElementById('btn-nuevo')?.addEventListener('click', () => window.abrirNuevo());
  document.getElementById('btn-guardar')?.addEventListener('click', guardarCategoria);
}
