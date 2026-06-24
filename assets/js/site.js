// Shared across every page: mobile menu, scroll-reveal animations, footer year.
(function () {
  // ===== Mobile menu =====
  const menuToggle = document.getElementById('menu-toggle');
  const mobileMenu = document.getElementById('mobile-menu');
  const iconOpen = document.getElementById('icon-open');
  const iconClose = document.getElementById('icon-close');

  if (menuToggle && mobileMenu && iconOpen && iconClose) {
    function closeMenu() {
      mobileMenu.classList.add('hidden');
      menuToggle.setAttribute('aria-expanded', 'false');
      iconOpen.classList.remove('hidden');
      iconClose.classList.add('hidden');
    }
    function openMenu() {
      mobileMenu.classList.remove('hidden');
      menuToggle.setAttribute('aria-expanded', 'true');
      iconOpen.classList.add('hidden');
      iconClose.classList.remove('hidden');
    }
    menuToggle.addEventListener('click', () => {
      const isOpen = menuToggle.getAttribute('aria-expanded') === 'true';
      isOpen ? closeMenu() : openMenu();
    });
    document.querySelectorAll('.mobile-nav-link').forEach((link) => {
      link.addEventListener('click', closeMenu);
    });
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') closeMenu();
    });
  }

  // ===== Scroll reveal =====
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const revealOnceEls = document.querySelectorAll('.reveal');
  const revealToggleEls = document.querySelectorAll('.reveal-toggle');

  if (reduceMotion) {
    revealOnceEls.forEach((el) => el.classList.add('is-visible'));
    revealToggleEls.forEach((el) => el.classList.add('is-visible'));
  } else if ('IntersectionObserver' in window) {
    const onceObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          onceObserver.unobserve(entry.target);
        }
      });
    }, { threshold: 0.12 });
    revealOnceEls.forEach((el) => onceObserver.observe(el));

    // Toggle observer: glides in when entering the viewport, out when leaving (either direction)
    const toggleObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        entry.target.classList.toggle('is-visible', entry.isIntersecting);
      });
    }, { threshold: 0.12 });
    revealToggleEls.forEach((el) => toggleObserver.observe(el));
  } else {
    revealOnceEls.forEach((el) => el.classList.add('is-visible'));
    revealToggleEls.forEach((el) => el.classList.add('is-visible'));
  }

  // ===== Footer year =====
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();
})();
