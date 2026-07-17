import { showToast, showSpinner, hideSpinner, confirmDelete, renderPagination, formatCurrency } from './utils.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import Validators from './validators.js';
import LibroService from './services/libroService.js';
import AutorService from './services/autorService.js';
import CategoriaService from './services/categoriaService.js';
import { api } from './utils.js';

// ── Estado del módulo ─────────────────────────────────────────
let state = { page: 0, size: 10, busqueda: '', autorId: '', categoriaId: '', totalPages: 0 };
let editingId = null;
let modalInstance = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const usuario = await checkSession();
  renderSidebar(usuario);
  renderNavbar('Gestión de Libros', usuario);
  await Promise.all([loadLibros(), cargarSelectores()]);
  setupListeners(usuario);
}

async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    sessionStorage.setItem('usuario', JSON.stringify(res.data));
    return res.data;
  } catch (_) { window.location.href = '/index.html'; }
}

// ── Carga de datos ────────────────────────────────────────────
async function loadLibros() {
  showSpinner();
  try {
    const params = { page: state.page, size: state.size };
    if (state.busqueda) params.busqueda = state.busqueda;
    if (state.autorId)  params.autorId  = state.autorId;
    if (state.categoriaId) params.categoriaId = state.categoriaId;
    const res = await LibroService.listar(params);
    const data = res.data;
    renderTabla(data.content ?? []);
    state.totalPages = data.totalPages ?? 1;
    renderPagination('paginacion', state.page, state.totalPages, (p) => { state.page = p; loadLibros(); });
    document.getElementById('info-pagina').textContent =
      `Mostrando ${data.numberOfElements ?? 0} de ${data.totalElements ?? 0} libros`;
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
}

async function cargarSelectores() {
  try {
    const [autores, categorias] = await Promise.all([
      AutorService.listarTodos(),
      CategoriaService.listarTodos(),
    ]);
    llenarSelect('filtro-autor', autores.data ?? [], 'Todos los autores');
    llenarSelect('filtro-categoria', categorias.data ?? [], 'Todas las categorías');
    llenarSelect('form-autorId', autores.data ?? [], 'Seleccionar autor');
    llenarSelect('form-categoriaId', categorias.data ?? [], 'Seleccionar categoría');
  } catch (_) {}
}

function llenarSelect(selectId, items, placeholder) {
  const sel = document.getElementById(selectId);
  if (!sel) return;
  sel.innerHTML = `<option value="">${placeholder}</option>` +
    items.map(i => `<option value="${i.id}">${i.nombre} ${i.apellido ?? ''}</option>`).join('');
}

// ── Renderizado de tabla ──────────────────────────────────────
function renderTabla(libros) {
  const tbody = document.getElementById('tbody-libros');
  if (!tbody) return;
  if (!libros.length) {
    tbody.innerHTML = `<tr><td colspan="9">
      <div class="empty-state"><i class="bi bi-book"></i>No se encontraron libros</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = libros.map(l => {
    const stockBadge = l.stock <= 5
      ? `<span class="badge bg-danger">${l.stock}</span>`
      : `<span class="badge bg-success">${l.stock}</span>`;
    return `<tr>
      <td class="text-muted">#${l.id}</td>
      <td><strong>${l.titulo}</strong></td>
      <td>${l.autorNombre ?? '-'}</td>
      <td>${l.categoriaNombre ?? '-'}</td>
      <td><code>${l.isbn}</code></td>
      <td>${formatCurrency(l.precio)}</td>
      <td>${stockBadge}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirEditar(${l.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminar(${l.id}, '${l.titulo.replace(/'/g, "\\'")}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
}

// ── Modal ─────────────────────────────────────────────────────
window.abrirNuevo = function() {
  editingId = null;
  document.getElementById('modal-titulo').textContent = 'Nuevo Libro';
  document.getElementById('form-libro').reset();
  Validators.clearAllErrors('form-libro');
  modalInstance?.show();
};

window.abrirEditar = async function(id) {
  try {
    showSpinner();
    const res = await LibroService.buscarPorId(id);
    const l = res.data;
    editingId = id;
    document.getElementById('modal-titulo').textContent = 'Editar Libro';
    document.getElementById('form-titulo').value    = l.titulo;
    document.getElementById('form-isbn').value      = l.isbn;
    document.getElementById('form-precio').value    = l.precio;
    document.getElementById('form-stock').value     = l.stock;
    document.getElementById('form-descripcion').value = l.descripcion ?? '';
    document.getElementById('form-autorId').value      = l.autorId ?? '';
    document.getElementById('form-categoriaId').value  = l.categoriaId ?? '';
    Validators.clearAllErrors('form-libro');
    modalInstance?.show();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
};

window.eliminar = async function(id, titulo) {
  const ok = await confirmDelete(titulo);
  if (!ok) return;
  try {
    await LibroService.eliminar(id);
    showToast('Libro eliminado correctamente');
    loadLibros();
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

async function guardarLibro() {
  const titulo     = document.getElementById('form-titulo').value.trim();
  const isbn       = document.getElementById('form-isbn').value.trim();
  const precio     = document.getElementById('form-precio').value;
  const stock      = document.getElementById('form-stock').value;
  const descripcion = document.getElementById('form-descripcion').value.trim();
  const autorId    = document.getElementById('form-autorId').value;
  const categoriaId = document.getElementById('form-categoriaId').value;

  Validators.clearAllErrors('form-libro');
  const { valid, errors } = Validators.validateForm({
    'form-titulo':    [{ type: 'required', value: titulo,    message: 'El título es obligatorio' }],
    'form-isbn':      [{ type: 'required', value: isbn,      message: 'El ISBN es obligatorio' },
                       { type: 'isbn',     value: isbn,      message: 'ISBN inválido (10-20 caracteres)' }],
    'form-precio':    [{ type: 'positiveNumber', value: precio, message: 'Precio inválido' }],
    'form-stock':     [{ type: 'positiveInt',    value: stock,  message: 'Stock inválido' }],
    'form-autorId':   [{ type: 'required', value: autorId,   message: 'Selecciona un autor' }],
    'form-categoriaId': [{ type: 'required', value: categoriaId, message: 'Selecciona una categoría' }],
  });

  if (!valid) {
    Object.entries(errors).forEach(([f, m]) => Validators.showFieldError(f, m));
    return;
  }

  const payload = { titulo, isbn, precio: parseFloat(precio), stock: parseInt(stock), descripcion, autorId: parseInt(autorId), categoriaId: parseInt(categoriaId) };
  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  try {
    if (editingId) {
      await LibroService.actualizar(editingId, payload);
      showToast('Libro actualizado correctamente');
    } else {
      await LibroService.crear(payload);
      showToast('Libro creado correctamente');
    }
    modalInstance?.hide();
    state.page = 0;
    loadLibros();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
  }
}

// ── Listeners ─────────────────────────────────────────────────
function setupListeners(usuario) {
  const modalEl = document.getElementById('modal-libro');
  if (modalEl) modalInstance = new bootstrap.Modal(modalEl);

  document.getElementById('btn-nuevo')?.addEventListener('click', () => window.abrirNuevo());
  document.getElementById('btn-guardar')?.addEventListener('click', guardarLibro);

  let timer;
  document.getElementById('input-busqueda')?.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.busqueda = e.target.value; state.page = 0; loadLibros(); }, 400);
  });

  document.getElementById('filtro-autor')?.addEventListener('change', (e) => {
    state.autorId = e.target.value; state.page = 0; loadLibros();
  });
  document.getElementById('filtro-categoria')?.addEventListener('change', (e) => {
    state.categoriaId = e.target.value; state.page = 0; loadLibros();
  });

  // Ocultar botón eliminar si no es ADMIN
  if (usuario?.rol !== 'ADMIN') {
    document.querySelectorAll('.admin-only').forEach(el => el.remove());
  }
}
