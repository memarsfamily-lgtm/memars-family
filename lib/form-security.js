const getTurnstileSiteKey = () => window.MEMARS_SUPABASE_CONFIG?.turnstileSiteKey || "";
const getTurnstileToken = (form) => form.querySelector('[name="cf-turnstile-response"]')?.value || "";
const showInlineStatus = (form, message, type = "error") => {
  let status = form.querySelector('[data-form-status]');
  if (!status) {
    status = document.createElement('div');
    status.setAttribute('data-form-status', '');
    status.setAttribute('role', 'status');
    status.setAttribute('aria-live', 'polite');
    form.appendChild(status);
  }
  status.className = `form-status ${type}`;
  status.textContent = message;
};
const enhanceProtectedForms = () => {
  const siteKey = getTurnstileSiteKey();
  document.querySelectorAll('[data-protected-form]').forEach((form) => {
    if (!siteKey) {
      form.dataset.turnstileConfigured = 'false';
      return;
    }
    form.dataset.turnstileConfigured = 'true';
    if (form.querySelector('.cf-turnstile')) return;
    const widget = document.createElement('div');
    widget.className = 'cf-turnstile';
    widget.dataset.sitekey = siteKey;
    widget.dataset.theme = 'light';
    const submit = form.querySelector('button[type="submit"], button:not([type])');
    form.insertBefore(widget, submit || null);
  });
};
window.MemarsFormSecurity = { getTurnstileSiteKey, getTurnstileToken, showInlineStatus, enhanceProtectedForms };
document.addEventListener('DOMContentLoaded', enhanceProtectedForms);
