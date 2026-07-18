import { api, showToast, showSpinner, hideSpinner, confirmDelete, renderPagination } from './utils.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import Validators from './validators.js';
import AutorService from './services/autorService.js';

let state = { page: 0, size: 10, busqueda: '', totalPages: 0 };
let editingId = null;
let modalInstance = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const usuario = await checkSession();
  renderSidebar(usuario);
  renderNavbar('Gestión de Autores', usuario);
  await loadAutores();
  setupListeners(usuario);
}

async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    sessionStorage.setItem('usuario', JSON.stringify(res.data));
    return res.data;
  } catch (_) { window.location.href = '/index.html'; }
}

async function loadAutores() {
  showSpinner();
  try {
    const params = { page: state.page, size: state.size };
    if (state.busqueda) params.busqueda = state.busqueda;
    const res = await AutorService.listar(params);
    const data = res.data;
    renderTabla(data.content ?? []);
    state.totalPages = data.totalPages ?? 1;
    renderPagination('paginacion', state.page, state.totalPages, (p) => { state.page = p; loadAutores(); });
    document.getElementById('info-pagina').textContent =
      `Mostrando ${data.numberOfElements ?? 0} de ${data.totalElements ?? 0} autores`;
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
}

function renderTabla(autores) {
  const tbody = document.getElementById('tbody-autores');
  if (!tbody) return;
  if (!autores.length) {
    tbody.innerHTML = `<tr><td colspan="5">
      <div class="empty-state"><i class="bi bi-person-lines-fill"></i>No se encontraron autores</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = autores.map(a => `<tr>
    <td class="text-muted">#${a.id}</td>
    <td><strong>${a.nombre} ${a.apellido}</strong></td>
    <td>${a.nacionalidad ?? '-'}</td>
    <td><span class="badge bg-secondary">${a.totalLibros ?? 0} libros</span></td>
    <td>
      <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirEditar(${a.id})">
        <i class="bi bi-pencil"></i>
      </button>
      <button class="btn btn-sm btn-outline-danger" onclick="eliminar(${a.id}, '${(a.nombre + ' ' + a.apellido).replace(/'/g, "\\'")}')">
        <i class="bi bi-trash"></i>
      </button>
    </td>
  </tr>`).join('');
}

window.abrirNuevo = function() {
  editingId = null;
  document.getElementById('modal-titulo').textContent = 'Nuevo Autor';
  document.getElementById('form-autor').reset();
  Validators.clearAllErrors('form-autor');
  modalInstance?.show();
};

window.abrirEditar = async function(id) {
  try {
    showSpinner();
    const res = await AutorService.buscarPorId(id);
    const a = res.data;
    editingId = id;
    document.getElementById('modal-titulo').textContent = 'Editar Autor';
    document.getElementById('form-nombre').value      = a.nombre;
    document.getElementById('form-apellido').value    = a.apellido;
    document.getElementById('form-nacionalidad').value = a.nacionalidad ?? '';
    Validators.clearAllErrors('form-autor');
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
    await AutorService.eliminar(id);
    showToast('Autor eliminado correctamente');
    loadAutores();
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

async function guardarAutor() {
  const nombre      = document.getElementById('form-nombre').value.trim();
  const apellido    = document.getElementById('form-apellido').value.trim();
  const nacionalidad = document.getElementById('form-nacionalidad').value.trim();

  Validators.clearAllErrors('form-autor');
  const { valid, errors } = Validators.validateForm({
    'form-nombre':   [{ type: 'required', value: nombre,   message: 'El nombre es obligatorio' }],
    'form-apellido': [{ type: 'required', value: apellido, message: 'El apellido es obligatorio' }],
  });
  if (!valid) { Object.entries(errors).forEach(([f, m]) => Validators.showFieldError(f, m)); return; }

  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  try {
    const payload = { nombre, apellido, nacionalidad };
    if (editingId) {
      await AutorService.actualizar(editingId, payload);
      showToast('Autor actualizado correctamente');
    } else {
      await AutorService.crear(payload);
      showToast('Autor creado correctamente');
    }
    modalInstance?.hide();
    state.page = 0;
    loadAutores();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
  }
}

function setupListeners() {
  const modalEl = document.getElementById('modal-autor');
  if (modalEl) modalInstance = new bootstrap.Modal(modalEl);
  document.getElementById('btn-nuevo')?.addEventListener('click', () => window.abrirNuevo());
  document.getElementById('btn-guardar')?.addEventListener('click', guardarAutor);
  let timer;
  document.getElementById('input-busqueda')?.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.busqueda = e.target.value; state.page = 0; loadAutores(); }, 400);
  });
}
