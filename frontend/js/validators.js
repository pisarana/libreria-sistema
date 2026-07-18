const Validators = {
  required: (val) => val != null && String(val).trim().length > 0,
  email: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val),
  minLength: (val, min) => val != null && String(val).length >= min,
  maxLength: (val, max) => val != null && String(val).length <= max,
  isbnFormat: (val) => /^[0-9\-]{10,20}$/.test(val),
  positiveNumber: (val) => !isNaN(val) && Number(val) >= 0,
  positiveInt: (val) => Number.isInteger(Number(val)) && Number(val) >= 0,

  validateForm(rules) {
    const errors = {};
    let valid = true;
    for (const [field, fieldRules] of Object.entries(rules)) {
      for (const rule of fieldRules) {
        const { type, value, message } = rule;
        let passed = true;
        if (type === 'required') passed = Validators.required(value);
        else if (type === 'email') passed = Validators.email(value);
        else if (type === 'minLength') passed = Validators.minLength(value, rule.min);
        else if (type === 'maxLength') passed = Validators.maxLength(value, rule.max);
        else if (type === 'isbnFormat') passed = Validators.isbnFormat(value);
        else if (type === 'positiveNumber') passed = Validators.positiveNumber(value);
        else if (type === 'positiveInt') passed = Validators.positiveInt(value);
        if (!passed) {
          errors[field] = message || `Campo ${field} inválido`;
          valid = false;
          break;
        }
      }
    }
    return { valid, errors };
  },

  showFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.add('is-invalid');
    let fb = field.nextElementSibling;
    if (!fb || !fb.classList.contains('invalid-feedback')) {
      fb = document.createElement('div');
      fb.className = 'invalid-feedback';
      field.parentNode.insertBefore(fb, field.nextSibling);
    }
    fb.textContent = message;
  },

  clearFieldError(fieldId) {
    const field = document.getElementById(fieldId);
    if (!field) return;
    field.classList.remove('is-invalid');
    const fb = field.nextElementSibling;
    if (fb && fb.classList.contains('invalid-feedback')) fb.textContent = '';
  },

  clearAllErrors(formId) {
    const form = document.getElementById(formId);
    if (!form) return;
    form.querySelectorAll('.is-invalid').forEach(el => el.classList.remove('is-invalid'));
    form.querySelectorAll('.invalid-feedback').forEach(el => el.textContent = '');
  }
};

export default Validators;
