async function api(url, options = {}) {
  const method = (options.method || 'GET').toUpperCase();
  const csrfToken = document.cookie
    .split('; ')
    .find(row => row.startsWith('XSRF-TOKEN='))
    ?.split('=')[1];
  const defaults = {
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include'
  };
  const config = {
    ...defaults,
    ...options,
    headers: {
      ...defaults.headers,
      ...(csrfToken && !['GET', 'HEAD', 'OPTIONS'].includes(method)
        ? { 'X-XSRF-TOKEN': decodeURIComponent(csrfToken) }
        : {}),
      ...(options.headers || {})
    }
  };
  const res = await fetch(url, config);
  if (res.status === 401) {
    window.location.href = '/index.html';
    return;
  }
  let json;
  try { json = await res.json(); } catch { json = {}; }
  if (!res.ok) throw new Error(json.message || 'Error del servidor');
  return json;
}

function showToast(message, type = 'success') {
  let container = document.querySelector('.toast-container');
  if (!container) {
    container = document.createElement('div');
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  const id = 'toast-' + Date.now();
  const bg = type === 'success' ? 'bg-success' : type === 'danger' ? 'bg-danger' : 'bg-warning';
  container.insertAdjacentHTML('beforeend', `
    <div id="${id}" class="toast align-items-center text-white ${bg} border-0 show mb-2" role="alert">
      <div class="d-flex">
        <div class="toast-body">${message}</div>
        <button type="button" class="btn-close btn-close-white me-2 m-auto" onclick="document.getElementById('${id}').remove()"></button>
      </div>
    </div>
  `);
  setTimeout(() => { const t = document.getElementById(id); if (t) t.remove(); }, 3500);
}

function showSpinner() {
  let overlay = document.getElementById('spinner-overlay');
  if (!overlay) {
    overlay = document.createElement('div');
    overlay.id = 'spinner-overlay';
    overlay.className = 'spinner-overlay';
    overlay.innerHTML = '<div class="spinner-border text-primary" style="width:3rem;height:3rem;"></div>';
    document.body.appendChild(overlay);
  }
  overlay.style.display = 'flex';
}

function hideSpinner() {
  const overlay = document.getElementById('spinner-overlay');
  if (overlay) overlay.style.display = 'none';
}

function confirmDelete(nombre) {
  return new Promise((resolve) => {
    const id = 'confirm-modal-' + Date.now();
    document.body.insertAdjacentHTML('beforeend', `
      <div class="modal fade" id="${id}" tabindex="-1">
        <div class="modal-dialog modal-sm">
          <div class="modal-content">
            <div class="modal-header">
              <h6 class="modal-title">Confirmar eliminación</h6>
              <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
            </div>
            <div class="modal-body">¿Eliminar <strong>${nombre}</strong>? Esta acción no se puede deshacer.</div>
            <div class="modal-footer">
              <button type="button" class="btn btn-secondary btn-sm" data-bs-dismiss="modal">Cancelar</button>
              <button type="button" class="btn btn-danger btn-sm" id="${id}-confirm">Eliminar</button>
            </div>
          </div>
        </div>
      </div>
    `);
    const modalEl = document.getElementById(id);
    const modal = new bootstrap.Modal(modalEl);
    modal.show();
    document.getElementById(`${id}-confirm`).addEventListener('click', () => {
      modal.hide();
      resolve(true);
    });
    modalEl.addEventListener('hidden.bs.modal', () => {
      resolve(false);
      modalEl.remove();
    });
  });
}

function renderPagination(containerId, page, totalPages, onPageChange) {
  const container = document.getElementById(containerId);
  if (!container) return;
  if (totalPages <= 1) { container.innerHTML = ''; return; }
  let html = '<nav><ul class="pagination pagination-sm mb-0">';
  html += `<li class="page-item ${page === 0 ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${page - 1}">‹</a></li>`;
  for (let i = 0; i < totalPages; i++) {
    html += `<li class="page-item ${i === page ? 'active' : ''}">
      <a class="page-link" href="#" data-page="${i}">${i + 1}</a></li>`;
  }
  html += `<li class="page-item ${page === totalPages - 1 ? 'disabled' : ''}">
    <a class="page-link" href="#" data-page="${page + 1}">›</a></li>`;
  html += '</ul></nav>';
  container.innerHTML = html;
  container.querySelectorAll('[data-page]').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const p = parseInt(link.dataset.page);
      if (p >= 0 && p < totalPages) onPageChange(p);
    });
  });
}

function formatDate(dateStr) {
  if (!dateStr) return '-';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function formatCurrency(num) {
  if (num == null) return 'S/ 0.00';
  return 'S/ ' + Number(num).toFixed(2);
}

export { api, showToast, showSpinner, hideSpinner, confirmDelete, renderPagination, formatDate, formatCurrency };
