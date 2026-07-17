import { api, showToast, showSpinner, hideSpinner } from './utils.js';
import Validators from './validators.js';

// If already logged in, go to dashboard
(async () => {
  try {
    const res = await api('/api/auth/me');
    if (res && res.data) {
      sessionStorage.setItem('usuario', JSON.stringify(res.data));
      window.location.href = '/pages/dashboard.html';
    }
  } catch (_) {}
})();

document.getElementById('login-form')?.addEventListener('submit', async (e) => {
  e.preventDefault();
  Validators.clearAllErrors('login-form');

  const correo = document.getElementById('correo').value;
  const password = document.getElementById('password').value;

  const { valid, errors } = Validators.validateForm({
    correo: [{ type: 'required', value: correo, message: 'El correo es obligatorio' },
             { type: 'email', value: correo, message: 'Correo inválido' }],
    password: [{ type: 'required', value: password, message: 'La contraseña es obligatoria' }]
  });

  if (!valid) {
    Object.entries(errors).forEach(([field, msg]) => Validators.showFieldError(field, msg));
    return;
  }

  const errorDiv = document.getElementById('login-error');
  errorDiv.classList.add('d-none');
  errorDiv.textContent = '';

  showSpinner();
  try {
    const res = await api('/api/auth/login', {
      method: 'POST',
      body: JSON.stringify({ correo, password })
    });
    if (res && res.data) {
      sessionStorage.setItem('usuario', JSON.stringify(res.data));
      window.location.href = '/pages/dashboard.html';
    }
  } catch (err) {
    errorDiv.textContent = err.message || 'Credenciales incorrectas';
    errorDiv.classList.remove('d-none');
  } finally {
    hideSpinner();
  }
});
