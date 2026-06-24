// contact.html-specific wiring: pre-select service dropdown from query param, form submission.
(function prefillServiceFromQuery() {
  const params = new URLSearchParams(window.location.search);
  const service = params.get('service');
  if (!service) return;
  const select = document.getElementById('ct-service');
  if (!select) return;
  const match = Array.from(select.options).find(
    (opt) => opt.value.toLowerCase() === service.toLowerCase()
  );
  if (match) select.value = match.value;
})();

const contactForm = document.getElementById('form-contact');
if (contactForm) window.LEMForms.handleFormSubmit(contactForm);
