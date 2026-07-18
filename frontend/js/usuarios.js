import { api, showToast, showSpinner, hideSpinner, confirmDelete, renderPagination, formatDate } from './utils.js';
import { renderSidebar } from './components/sidebar.js';
import { renderNavbar } from './components/navbar.js';
import Validators from './validators.js';
import UsuarioService from './services/usuarioService.js';

let state = { page: 0, size: 10, busqueda: '', totalPages: 0 };
let editingId = null;
let modalInstance = null;

document.addEventListener('DOMContentLoaded', init);

async function init() {
  const usuario = await checkSession();
  // Solo ADMIN puede acceder
  if (usuario?.rol !== 'ADMIN') {
    window.location.href = '/pages/dashboard.html';
    return;
  }
  renderSidebar(usuario);
  renderNavbar('Gestión de Usuarios', usuario);
  await loadUsuarios();
  setupListeners();
}

async function checkSession() {
  try {
    const res = await api('/api/auth/me');
    sessionStorage.setItem('usuario', JSON.stringify(res.data));
    return res.data;
  } catch (_) { window.location.href = '/index.html'; }
}

async function loadUsuarios() {
  showSpinner();
  try {
    const params = { page: state.page, size: state.size };
    if (state.busqueda) params.busqueda = state.busqueda;
    const res = await UsuarioService.listar(params);
    const data = res.data;
    renderTabla(data.content ?? []);
    state.totalPages = data.totalPages ?? 1;
    renderPagination('paginacion', state.page, state.totalPages, (p) => { state.page = p; loadUsuarios(); });
    document.getElementById('info-pagina').textContent =
      `Mostrando ${data.numberOfElements ?? 0} de ${data.totalElements ?? 0} usuarios`;
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
}

function renderTabla(usuarios) {
  const tbody = document.getElementById('tbody-usuarios');
  if (!tbody) return;
  if (!usuarios.length) {
    tbody.innerHTML = `<tr><td colspan="7">
      <div class="empty-state"><i class="bi bi-people"></i>No se encontraron usuarios</div>
    </td></tr>`;
    return;
  }
  tbody.innerHTML = usuarios.map(u => {
    const rolBadge    = u.rol === 'ADMIN'
      ? '<span class="badge badge-admin">ADMIN</span>'
      : '<span class="badge badge-empleado">EMPLEADO</span>';
    const estadoBadge = u.estado
      ? '<span class="badge bg-success">Activo</span>'
      : '<span class="badge bg-secondary">Inactivo</span>';
    return `<tr>
      <td class="text-muted">#${u.id}</td>
      <td><strong>${u.nombre} ${u.apellido}</strong></td>
      <td>${u.correo}</td>
      <td>${rolBadge}</td>
      <td>${estadoBadge}</td>
      <td>${formatDate(u.fechaCreacion)}</td>
      <td>
        <button class="btn btn-sm btn-outline-primary me-1" onclick="abrirEditar(${u.id})">
          <i class="bi bi-pencil"></i>
        </button>
        <button class="btn btn-sm btn-outline-${u.estado ? 'warning' : 'success'} me-1"
          onclick="toggleEstado(${u.id}, ${u.estado})" title="${u.estado ? 'Desactivar' : 'Activar'}">
          <i class="bi bi-${u.estado ? 'person-dash' : 'person-check'}"></i>
        </button>
        <button class="btn btn-sm btn-outline-danger" onclick="eliminar(${u.id}, '${(u.nombre + ' ' + u.apellido).replace(/'/g, "\\'")}')">
          <i class="bi bi-trash"></i>
        </button>
      </td>
    </tr>`;
  }).join('');
}

window.abrirNuevo = function() {
  editingId = null;
  document.getElementById('modal-titulo').textContent = 'Nuevo Usuario';
  document.getElementById('form-usuario').reset();
  document.getElementById('campo-password').style.display = 'block';
  document.getElementById('form-password').required = true;
  Validators.clearAllErrors('form-usuario');
  modalInstance?.show();
};

window.abrirEditar = async function(id) {
  try {
    showSpinner();
    const res = await UsuarioService.buscarPorId(id);
    const u = res.data;
    editingId = id;
    document.getElementById('modal-titulo').textContent = 'Editar Usuario';
    document.getElementById('form-nombre').value   = u.nombre;
    document.getElementById('form-apellido').value = u.apellido;
    document.getElementById('form-correo').value   = u.correo;
    document.getElementById('form-rol').value      = u.rol;
    document.getElementById('form-estado').checked = u.estado;
    // Contraseña opcional en edición
    document.getElementById('campo-password').style.display = 'block';
    document.getElementById('form-password').required = false;
    document.getElementById('form-password').value = '';
    Validators.clearAllErrors('form-usuario');
    modalInstance?.show();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    hideSpinner();
  }
};

window.toggleEstado = async function(id, estadoActual) {
  try {
    await UsuarioService.cambiarEstado(id, !estadoActual);
    showToast(`Usuario ${estadoActual ? 'desactivado' : 'activado'} correctamente`);
    loadUsuarios();
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

window.eliminar = async function(id, nombre) {
  const ok = await confirmDelete(nombre);
  if (!ok) return;
  try {
    await UsuarioService.eliminar(id);
    showToast('Usuario eliminado correctamente');
    loadUsuarios();
  } catch (err) {
    showToast(err.message, 'danger');
  }
};

async function guardarUsuario() {
  const nombre    = document.getElementById('form-nombre').value.trim();
  const apellido  = document.getElementById('form-apellido').value.trim();
  const correo    = document.getElementById('form-correo').value.trim();
  const password  = document.getElementById('form-password').value;
  const rol       = document.getElementById('form-rol').value;
  const estado    = document.getElementById('form-estado').checked;

  Validators.clearAllErrors('form-usuario');
  const rules = {
    'form-nombre':   [{ type: 'required', value: nombre,   message: 'El nombre es obligatorio' }],
    'form-apellido': [{ type: 'required', value: apellido, message: 'El apellido es obligatorio' }],
    'form-correo':   [{ type: 'required', value: correo,   message: 'El correo es obligatorio' },
                      { type: 'email',    value: correo,   message: 'Correo inválido' }],
    'form-rol':      [{ type: 'required', value: rol,      message: 'Selecciona un rol' }],
  };
  if (!editingId || password) {
    rules['form-password'] = [
      { type: 'required',  value: password, message: 'La contraseña es obligatoria' },
      { type: 'minLength', value: password, extra: 6, message: 'Mínimo 6 caracteres' },
    ];
  }

  const { valid, errors } = Validators.validateForm(rules);
  if (!valid) { Object.entries(errors).forEach(([f, m]) => Validators.showFieldError(f, m)); return; }

  const btn = document.getElementById('btn-guardar');
  btn.disabled = true;
  try {
    const payload = { nombre, apellido, correo, rol, estado };
    if (password) payload.password = password;
    if (editingId) {
      await UsuarioService.actualizar(editingId, payload);
      showToast('Usuario actualizado correctamente');
    } else {
      await UsuarioService.crear(payload);
      showToast('Usuario creado correctamente');
    }
    modalInstance?.hide();
    state.page = 0;
    loadUsuarios();
  } catch (err) {
    showToast(err.message, 'danger');
  } finally {
    btn.disabled = false;
  }
}

function setupListeners() {
  const modalEl = document.getElementById('modal-usuario');
  if (modalEl) modalInstance = new bootstrap.Modal(modalEl);
  document.getElementById('btn-nuevo')?.addEventListener('click', () => window.abrirNuevo());
  document.getElementById('btn-guardar')?.addEventListener('click', guardarUsuario);
  let timer;
  document.getElementById('input-busqueda')?.addEventListener('input', (e) => {
    clearTimeout(timer);
    timer = setTimeout(() => { state.busqueda = e.target.value; state.page = 0; loadUsuarios(); }, 400);
  });
}
