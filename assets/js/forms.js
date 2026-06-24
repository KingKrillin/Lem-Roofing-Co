// Shared Web3Forms handling — keeps the user on the page (no redirect), shows an inline
// confirmation message, then resets the form back to its original state after 15 seconds.
window.LEMForms = (function () {
  const WEB3FORMS_ACCESS_KEY = '501ea6dc-592c-4f31-8ed8-6bece4f32916';
  const WEB3FORMS_ENDPOINT = 'https://api.web3forms.com/submit';
  const RESET_DELAY_MS = 15000;

  function resetFormUI(form, statusEl, submitBtn, btnText, btnSpinner) {
    form.reset();
    form.classList.remove('opacity-60', 'pointer-events-none');
    if (submitBtn) submitBtn.disabled = false;
    if (btnText) btnText.classList.remove('opacity-0');
    if (btnSpinner) btnSpinner.classList.add('hidden');
    if (statusEl) {
      statusEl.textContent = '';
      statusEl.className = statusEl.dataset.baseClass || statusEl.className;
    }
  }

  function handleFormSubmit(form) {
    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const statusEl = form.querySelector('.form-status');
      const submitBtn = form.querySelector('button[type="submit"]');
      const btnText = submitBtn ? submitBtn.querySelector('.btn-text') : null;
      const btnSpinner = submitBtn ? submitBtn.querySelector('.btn-spinner') : null;

      if (statusEl && !statusEl.dataset.baseClass) {
        statusEl.dataset.baseClass = statusEl.className;
      }

      // Honeypot check — silently drop bot submissions
      const honeypot = form.querySelector('input[name="botcheck"]');
      if (honeypot && honeypot.checked) {
        return;
      }

      // Basic native validation
      if (!form.checkValidity()) {
        form.reportValidity();
        return;
      }

      if (submitBtn) submitBtn.disabled = true;
      if (btnText) btnText.classList.add('opacity-0');
      if (btnSpinner) btnSpinner.classList.remove('hidden');
      if (statusEl) {
        statusEl.textContent = '';
        statusEl.className = statusEl.dataset.baseClass;
      }

      const formData = new FormData(form);
      formData.append('access_key', WEB3FORMS_ACCESS_KEY);

      try {
        const response = await fetch(WEB3FORMS_ENDPOINT, {
          method: 'POST',
          headers: { Accept: 'application/json' },
          body: formData,
        });
        const result = await response.json();

        if (result.success) {
          form.reset();
          form.classList.add('opacity-60', 'pointer-events-none');
          if (statusEl) {
            statusEl.textContent = "Thank you for submitting your form! We'll be in touch shortly.";
            statusEl.classList.add('text-patriot');
          }
          setTimeout(() => {
            resetFormUI(form, statusEl, submitBtn, btnText, btnSpinner);
          }, RESET_DELAY_MS);
        } else {
          throw new Error(result.message || 'Submission failed');
        }
      } catch (err) {
        if (statusEl) {
          statusEl.textContent = 'Something went wrong. Please call us directly at 832-818-6557.';
          statusEl.classList.add('text-accent');
        }
        if (submitBtn) submitBtn.disabled = false;
        if (btnText) btnText.classList.remove('opacity-0');
        if (btnSpinner) btnSpinner.classList.add('hidden');
      }
    });
  }

  return { handleFormSubmit };
})();
