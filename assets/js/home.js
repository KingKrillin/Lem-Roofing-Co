// index.html-specific wiring: service area map, reviews carousel, form submission.
(function initServiceMap() {
  const mapEl = document.getElementById('service-map');
  if (!mapEl || typeof maplibregl === 'undefined') return;

  // Houston is first so its label gets the first pick of open space.
  const cities = [
    { name: 'Houston',       lat: 29.7601, lng: -95.3701, dir: 'left' },
    { name: 'Aldine',        lat: 29.9119, lng: -95.3805, dir: 'left' },
    { name: 'Pasadena',      lat: 29.6911, lng: -95.2091, dir: 'bottom' },
    { name: 'Pearland',      lat: 29.5635, lng: -95.2861, dir: 'bottom' },
    { name: 'Spring',        lat: 30.0799, lng: -95.4172, dir: 'right' },
    { name: 'The Woodlands', lat: 30.1658, lng: -95.4613, dir: 'right' },
    { name: 'Humble',        lat: 29.9988, lng: -95.2622, dir: 'right' },
    { name: 'Cypress',       lat: 29.9691, lng: -95.6972, dir: 'left' },
    { name: 'Katy',          lat: 29.7858, lng: -95.8245, dir: 'left' },
    { name: 'Sugar Land',    lat: 29.6196, lng: -95.6349, dir: 'left' },
    { name: 'Baytown',       lat: 29.7355, lng: -94.9774, dir: 'right' },
    { name: 'Conroe',        lat: 30.3119, lng: -95.4561, dir: 'top' },
    { name: 'Waller',        lat: 30.0588, lng: -95.9419, dir: 'top' },
    { name: 'Cleveland',     lat: 30.3416, lng: -94.9869, dir: 'right' },
    { name: 'Dayton',        lat: 30.0497, lng: -94.8830, dir: 'right' },
    { name: 'Texas City',    lat: 29.3838, lng: -94.9027, dir: 'left' },
    { name: 'Galveston',     lat: 29.3013, lng: -94.7977, dir: 'bottom' },
  ];

  // Approximate outline drawn around the service cities above.
  const serviceArea = [
    [-94.98, 30.45], [-95.5, 30.43], [-96.05, 30.13], [-95.95, 29.7], [-95.72, 29.5],
    [-95.35, 29.45], [-94.98, 29.24], [-94.62, 29.15], [-94.6, 30.05], [-94.98, 30.45],
  ];

  const isPhone = mapEl.clientWidth < 500;
  let map;
  try {
    map = new maplibregl.Map({
      container: mapEl,
      style: 'https://tiles.openfreemap.org/styles/positron',
      bounds: [[-96.05, 29.15], [-94.6, 30.45]],
      fitBoundsOptions: {
        padding: isPhone
          ? { top: 24, right: 12, bottom: 64, left: 12 }
          : { top: 32, right: 48, bottom: 56, left: 48 },
      },
      attributionControl: { compact: false },
      dragRotate: false,
      pitchWithRotate: false,
      // One finger keeps scrolling the page on phones; two fingers move the map.
      cooperativeGestures: true,
    });
  } catch (e) {
    // No WebGL in this browser: drop the empty box. The city list above still shows the area.
    mapEl.parentElement.hidden = true;
    return;
  }
  map.touchZoomRotate.disableRotation();
  map.addControl(new maplibregl.NavigationControl({ showCompass: false }), 'top-left');

  const legend = document.createElement('div');
  legend.className = 'service-map-legend';
  legend.innerHTML = '<span><i class="is-hq"></i>Headquarters</span><span><i class="is-city"></i>Service city</span><span><i class="is-area"></i>Service area</span>';
  mapEl.appendChild(legend);

  const markers = cities.map((city) => {
    const el = document.createElement('div');
    el.className = 'service-marker' + (city.name === 'Houston' ? ' service-marker--hq' : '');
    const label = document.createElement('span');
    label.className = 'service-pin-label';
    label.textContent = city.name + (city.name === 'Houston' ? ' (HQ)' : '');
    el.appendChild(label);
    new maplibregl.Marker({ element: el }).setLngLat([city.lng, city.lat]).addTo(map);
    return { city, label };
  });

  // Gives each label the first open spot beside its pin, so none cover another label or pin.
  function placeLabels() {
    const gap = 11;
    const box = mapEl.getBoundingClientRect();
    const hits = (a, b) => a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h;
    const points = markers.map((m) => map.project([m.city.lng, m.city.lat]));
    const pins = points.map((p) => ({ x: p.x - 9, y: p.y - 9, w: 18, h: 18 }));
    const legendBox = legend.getBoundingClientRect();
    const placed = [{ x: legendBox.left - box.left, y: legendBox.top - box.top, w: legendBox.width, h: legendBox.height }];

    markers.forEach((m, i) => {
      const w = m.label.offsetWidth;
      const h = m.label.offsetHeight;
      const spots = {
        left: [-gap - w, -h / 2],
        right: [gap, -h / 2],
        top: [-w / 2, -gap - h],
        bottom: [-w / 2, gap],
        topLeft: [-gap - w, -gap - h / 2],
        topRight: [gap, -gap - h / 2],
        bottomLeft: [-gap - w, gap - h / 2],
        bottomRight: [gap, gap - h / 2],
      };
      const order = [m.city.dir, ...Object.keys(spots).filter((k) => k !== m.city.dir)];
      const fits = (key) => {
        const r = { x: points[i].x + spots[key][0], y: points[i].y + spots[key][1], w, h };
        const inside = r.x >= 4 && r.y >= 4 && r.x + w <= box.width - 4 && r.y + h <= box.height - 4;
        return inside
          && !placed.some((other) => hits(r, other))
          && !pins.some((pin, j) => j !== i && hits(r, pin));
      };
      const choice = order.find(fits) || m.city.dir;
      const [dx, dy] = spots[choice];
      m.label.style.transform = 'translate(' + dx + 'px,' + dy + 'px)';
      placed.push({ x: points[i].x + dx, y: points[i].y + dy, w, h });
    });
  }

  map.on('load', () => {
    const layers = map.getStyle().layers;

    // Our labels name the cities, so only the highway shields keep their text.
    const keepText = ['highway-shield-us-interstate', 'road_shield_us'];
    layers.forEach((layer) => {
      if (layer.type === 'symbol' && !keepText.includes(layer.id)) {
        map.setLayoutProperty(layer.id, 'visibility', 'none');
      }
    });
    map.setLayerZoomRange('highway-shield-us-interstate', 7, 24);
    map.setLayerZoomRange('road_shield_us', 8, 24);

    // Darker highways so the freeway network is easy to follow.
    ['highway_motorway_inner', 'highway_motorway_bridge_inner', 'tunnel_motorway_inner', 'highway_motorway_subtle'].forEach((id) => {
      map.setPaintProperty(id, 'line-color', '#6E7681');
      map.setPaintProperty(id, 'line-width', ['interpolate', ['linear'], ['zoom'], 7, 1.2, 10, 2.2, 14, 6]);
    });
    map.setPaintProperty('highway_major_subtle', 'line-color', '#AEB6C2');
    map.setPaintProperty('water', 'fill-color', '#BCD3E8');

    const firstText = layers.find((layer) => layer.type === 'symbol');
    map.addSource('service-area', {
      type: 'geojson',
      data: { type: 'Feature', geometry: { type: 'Polygon', coordinates: [serviceArea] } },
    });
    map.addLayer({
      id: 'service-area-fill',
      type: 'fill',
      source: 'service-area',
      paint: { 'fill-color': '#1E56B8', 'fill-opacity': 0.09 },
    }, firstText && firstText.id);
    map.addLayer({
      id: 'service-area-line',
      type: 'line',
      source: 'service-area',
      paint: { 'line-color': '#0D3B8E', 'line-width': 2, 'line-dasharray': [3, 3] },
    }, firstText && firstText.id);

    // The full metro is the farthest-out view; zooming beyond it would crowd the labels.
    map.setMinZoom(map.getZoom());
    placeLabels();
    mapEl.dataset.ready = 'true';
  });
  map.on('zoomend', placeLabels);
  map.on('resize', placeLabels);
  if (document.fonts && document.fonts.ready) document.fonts.ready.then(placeLabels);
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

(function initProjectGallery() {
  const dialog = document.getElementById('project-gallery');
  if (!dialog) return;

  // To add or remove a photo, edit these lists; the counts on the page update from them.
  const projects = {
    davinci: {
      title: 'DaVinci Roof Shingle Project',
      location: 'Sugar Land, TX',
      dir: 'assets/gallery/davinci-roof/',
      photos: [
        { file: '01-aerial-view.jpg', alt: 'Aerial view of a large Tudor-style home with a new slate-look shingle roof' },
        { file: '02-garage-roof.jpg', alt: 'Hip roof over the garage covered in slate-look shingles, with mature oak trees behind it' },
        { file: '03-backyard-view.jpg', alt: 'New roof with vents and a brick chimney, looking out over the backyard and gazebo' },
        { file: '04-skyline-view.jpg', alt: 'New slate-look roof with a city skyline in the distance' },
        { file: '05-ridge-and-chimney.jpg', alt: 'Close-up of ridge caps and shingles running toward a brick chimney' },
        { file: '06-rear-elevation.jpg', alt: 'Back of the brick home from the lawn, showing the finished roof above tall gable windows' },
      ],
    },
    cypress: {
      title: '30-Year Timberline HDZ Charcoal Architectural Shingle Roof',
      location: 'Spring, TX',
      dir: 'assets/gallery/cypress-shingle-roof/',
      photos: [
        { file: '01-ridge-vent.jpg', alt: 'Ridge vent and pipe flashing on a dark shingle roof above a residential street' },
        { file: '02-street-view.jpg', alt: 'Two dark shingle roof slopes meeting at a valley, seen from the top of the roof' },
        { file: '03-rear-slope.jpg', alt: 'Full slope of dark architectural shingles with a backyard pool and fence beyond' },
        { file: '04-long-slope.jpg', alt: 'Long run of dark architectural shingles with pipe flashings, looking down the street' },
        { file: '05-ridge-cap.jpg', alt: 'Overhead view of a ridge cap and vent on a dark shingle roof' },
      ],
    },
  };

  const track = document.getElementById('project-gallery-track');
  const thumbs = document.getElementById('project-gallery-thumbs');
  const prevBtn = document.getElementById('project-gallery-prev');
  const nextBtn = document.getElementById('project-gallery-next');
  const current = document.getElementById('project-gallery-current');
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  let photos = [];
  let loadedProject = null;
  let index = 0;
  let scrollTarget = null; // set while a button-driven smooth scroll is on its way

  document.querySelectorAll('[data-gallery-count]').forEach((el) => {
    el.textContent = projects[el.dataset.galleryCount].photos.length;
  });
  document.querySelectorAll('[data-gallery-more]').forEach((el) => {
    el.textContent = projects[el.dataset.galleryMore].photos.length - 3;
  });

  function loadProject(id) {
    if (id === loadedProject) return;
    loadedProject = id;
    const project = projects[id];
    photos = project.photos;
    document.getElementById('project-gallery-title').textContent = project.title;
    document.getElementById('project-gallery-location').textContent = project.location;
    document.getElementById('project-gallery-total').textContent = photos.length;
    track.replaceChildren();
    thumbs.replaceChildren();

    photos.forEach((photo, i) => {
      const slide = document.createElement('div');
      slide.className = 'project-gallery-slide';
      const img = document.createElement('img');
      img.src = project.dir + photo.file;
      img.alt = photo.alt;
      img.loading = 'lazy';
      slide.appendChild(img);
      track.appendChild(slide);

      const thumb = document.createElement('button');
      thumb.type = 'button';
      thumb.className = 'project-gallery-thumb on-dark';
      thumb.setAttribute('aria-label', 'Go to photo ' + (i + 1));
      const thumbImg = document.createElement('img');
      thumbImg.src = project.dir + 'thumbs/' + photo.file;
      thumbImg.alt = '';
      thumbImg.loading = 'lazy';
      thumb.appendChild(thumbImg);
      thumb.addEventListener('click', () => goTo(i));
      thumbs.appendChild(thumb);
    });
  }

  function render() {
    current.textContent = index + 1;
    prevBtn.disabled = index === 0;
    nextBtn.disabled = index === photos.length - 1;
    [...thumbs.children].forEach((thumb, i) => {
      if (i === index) thumb.setAttribute('aria-current', 'true');
      else thumb.removeAttribute('aria-current');
    });
    const active = thumbs.children[index];
    thumbs.scrollTo({
      left: active.offsetLeft - (thumbs.clientWidth - active.offsetWidth) / 2,
      behavior: reduceMotion ? 'auto' : 'smooth',
    });
  }

  function goTo(i, instant) {
    index = Math.max(0, Math.min(photos.length - 1, i));
    scrollTarget = instant ? null : index;
    track.scrollTo({
      left: index * track.clientWidth,
      behavior: instant || reduceMotion ? 'auto' : 'smooth',
    });
    render();
  }

  // Keeps the counter and thumbnails in step when someone swipes or scrolls the photos.
  track.addEventListener('scroll', () => {
    const atPhoto = Math.round(track.scrollLeft / track.clientWidth);
    if (scrollTarget !== null) {
      if (atPhoto === scrollTarget) scrollTarget = null;
      return;
    }
    if (atPhoto !== index) {
      index = atPhoto;
      render();
    }
  }, { passive: true });
  ['pointerdown', 'touchstart', 'wheel'].forEach((type) => {
    track.addEventListener(type, () => { scrollTarget = null; }, { passive: true });
  });

  prevBtn.addEventListener('click', () => goTo(index - 1));
  nextBtn.addEventListener('click', () => goTo(index + 1));
  document.getElementById('project-gallery-close').addEventListener('click', () => dialog.close());

  document.querySelectorAll('[data-gallery-open]').forEach((btn) => {
    btn.addEventListener('click', () => {
      loadProject(btn.dataset.galleryProject);
      dialog.showModal();
      document.documentElement.classList.add('gallery-open');
      goTo(Number(btn.dataset.galleryOpen), true);
    });
  });

  dialog.addEventListener('close', () => document.documentElement.classList.remove('gallery-open'));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
      e.preventDefault();
      goTo(index + (e.key === 'ArrowRight' ? 1 : -1));
    }
  });
  // Clicking the dark space around a photo closes the viewer.
  track.addEventListener('click', (e) => {
    if (e.target.classList.contains('project-gallery-slide')) dialog.close();
  });
  window.addEventListener('resize', () => {
    if (dialog.open) goTo(index, true);
  });
})();

['form-quick-quote', 'form-contact'].forEach((id) => {
  const form = document.getElementById(id);
  if (form) window.LEMForms.handleFormSubmit(form);
});
