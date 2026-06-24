// index.html-specific wiring: service area map, reviews carousel, form submission.
(function initServiceMap() {
  const mapEl = document.getElementById('service-map');
  if (!mapEl || typeof L === 'undefined') return;

  const cities = [
    { name: 'Houston',       lat: 29.7601, lng: -95.3701, dir: 'top' },
    { name: 'Katy',          lat: 29.7858, lng: -95.8245, dir: 'left' },
    { name: 'Sugar Land',    lat: 29.6196, lng: -95.6349, dir: 'bottom' },
    { name: 'Pearland',      lat: 29.5635, lng: -95.2861, dir: 'bottom' },
    { name: 'The Woodlands', lat: 30.1658, lng: -95.4613, dir: 'top' },
    { name: 'Cypress',       lat: 29.9691, lng: -95.6972, dir: 'left' },
    { name: 'Spring',        lat: 30.0799, lng: -95.4172, dir: 'right' },
    { name: 'Pasadena',      lat: 29.6911, lng: -95.2091, dir: 'right' },
    { name: 'Baytown',       lat: 29.7355, lng: -94.9774, dir: 'right' },
    { name: 'Cleveland',     lat: 30.3416, lng: -94.9869, dir: 'top' },
    { name: 'Conroe',        lat: 30.3119, lng: -95.4561, dir: 'left' },
    { name: 'Waller',        lat: 30.0588, lng: -95.9419, dir: 'top' },
    { name: 'Dayton',        lat: 30.0497, lng: -94.8830, dir: 'bottom' },
    { name: 'Humble',        lat: 29.9988, lng: -95.2622, dir: 'left' },
    { name: 'Aldine',        lat: 29.9119, lng: -95.3805, dir: 'bottom' },
    { name: 'Texas City',    lat: 29.3838, lng: -94.9027, dir: 'bottom' },
    { name: 'Galveston',     lat: 29.3013, lng: -94.7977, dir: 'right' },
  ];

  const map = L.map('service-map', {
    scrollWheelZoom: false,
    attributionControl: true,
  }).setView([29.86, -95.45], 9);

  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>',
    subdomains: 'abcd',
    maxZoom: 19,
  }).addTo(map);

  const pinIcon = L.divIcon({
    className: 'service-pin',
    html: '<span></span>',
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  const pinIconPrimary = L.divIcon({
    className: 'service-pin service-pin--primary',
    html: '<span></span>',
    iconSize: [20, 20],
    iconAnchor: [10, 10],
  });

  const markers = cities.map((city) => {
    const isHouston = city.name === 'Houston';
    const marker = L.marker([city.lat, city.lng], { icon: isHouston ? pinIconPrimary : pinIcon, title: city.name }).addTo(map);
    const offsets = { top: [0, -10], bottom: [0, 10], left: [-10, 0], right: [10, 0] };
    marker.bindTooltip(city.name + (isHouston ? ' (HQ)' : ''), {
      permanent: true,
      direction: city.dir,
      offset: offsets[city.dir],
      className: 'service-pin-label' + (isHouston ? ' service-pin-label--primary' : ''),
    });
    return marker;
  });

  const bounds = L.latLngBounds(cities.map((c) => [c.lat, c.lng]));
  map.fitBounds(bounds, { padding: [40, 40] });
})();

(function initReviewsCarousel() {
  const track = document.getElementById('reviews-track');
  const prevBtn = document.getElementById('reviews-prev');
  const nextBtn = document.getElementById('reviews-next');
  if (!track || !prevBtn || !nextBtn) return;

  function cardStep() {
    const card = track.querySelector('figure');
    const gap = parseFloat(getComputedStyle(track).columnGap) || 20;
    return card ? card.getBoundingClientRect().width + gap : track.clientWidth;
  }

  function updateButtons() {
    const maxScroll = track.scrollWidth - track.clientWidth - 1;
    prevBtn.disabled = track.scrollLeft <= 0;
    nextBtn.disabled = track.scrollLeft >= maxScroll;
  }

  prevBtn.addEventListener('click', () => {
    track.scrollBy({ left: -cardStep(), behavior: 'smooth' });
  });
  nextBtn.addEventListener('click', () => {
    track.scrollBy({ left: cardStep(), behavior: 'smooth' });
  });
  track.addEventListener('scroll', updateButtons, { passive: true });
  window.addEventListener('resize', updateButtons);
  updateButtons();
})();

['form-quick-quote', 'form-contact'].forEach((id) => {
  const form = document.getElementById(id);
  if (form) window.LEMForms.handleFormSubmit(form);
});
