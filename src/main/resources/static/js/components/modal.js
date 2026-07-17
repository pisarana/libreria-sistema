function createModal({ id, title, bodyHtml, onSave, saveLabel = 'Guardar' }) {
  const existing = document.getElementById(id);
  if (existing) existing.remove();

  document.body.insertAdjacentHTML('beforeend', `
    <div class="modal fade" id="${id}" tabindex="-1" aria-labelledby="${id}-label">
      <div class="modal-dialog modal-lg">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="${id}-label">${title}</h5>
            <button type="button" class="btn-close" data-bs-dismiss="modal"></button>
          </div>
          <div class="modal-body">${bodyHtml}</div>
          <div class="modal-footer">
            <button type="button" class="btn btn-secondary" data-bs-dismiss="modal">Cancelar</button>
            <button type="button" class="btn btn-primary" id="${id}-save">${saveLabel}</button>
          </div>
        </div>
      </div>
    </div>
  `);

  const modalEl = document.getElementById(id);
  const modal = new bootstrap.Modal(modalEl);

  document.getElementById(`${id}-save`).addEventListener('click', () => {
    onSave(modal);
  });

  modalEl.addEventListener('hidden.bs.modal', () => {
    modalEl.remove();
  });

  modal.show();
  return modal;
}

function destroyModal(id) {
  const el = document.getElementById(id);
  if (el) {
    const instance = bootstrap.Modal.getInstance(el);
    if (instance) instance.hide();
    el.remove();
  }
}

export { createModal, destroyModal };
