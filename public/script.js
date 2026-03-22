/* ═══════════════════════════════════════════════════════════
   COSMOS WATCH v2.0 — Upgraded Frontend JavaScript
   Milky Way galaxy, search, favorites, scroll animations,
   status badges, stats counter, back-to-top
   ═══════════════════════════════════════════════════════════ */

const API_BASE = '/api';

// ─── State ────────────────────────────────────────────────
let allEvents = [];
let currentFilter = 'all';
let countdownInterval = null;
let searchQuery = '';
let showFavoritesOnly = false;

// Load favorites from localStorage
function getFavorites() {
  try { return JSON.parse(localStorage.getItem('cosmoswatch_favorites') || '[]'); }
  catch { return []; }
}
function saveFavorites(favs) {
  localStorage.setItem('cosmoswatch_favorites', JSON.stringify(favs));
}

// ─── Init ─────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  initGalaxy();
  initNavbar();
  initFilterTabs();
  initModal();
  initSearch();
  initBackToTop();
  initScrollAnimations();
  loadFeaturedEvent();
  loadAllEvents();
});

// ═══════════════════════════════════════════════════════════
// MILKY WAY GALAXY CANVAS ANIMATION
// ═══════════════════════════════════════════════════════════
function initGalaxy() {
  const canvas = document.getElementById('starfield');
  const ctx = canvas.getContext('2d');

  let stars = [];
  let galaxyParticles = [];
  let dustClouds = [];
  let shootingStars = [];
  let mouseX = 0, mouseY = 0;
  let targetOffsetX = 0, targetOffsetY = 0;
  let offsetX = 0, offsetY = 0;
  let rotation = 0;

  function resize() {
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }

  // ── Background Stars ────────────────────────────────────
  function createStars() {
    stars = [];
    const count = Math.floor((canvas.width * canvas.height) / 8000);
    for (let i = 0; i < count; i++) {
      stars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        r: Math.random() * 1.2 + 0.2,
        opacity: Math.random() * 0.7 + 0.3,
        twinkle: Math.random() * 0.03 + 0.005,
        offset: Math.random() * Math.PI * 2,
        color: ['200,220,255', '255,240,220', '180,200,255', '255,210,180', '220,200,255'][Math.floor(Math.random() * 5)]
      });
    }
  }

  // ── Galaxy Spiral Particles ─────────────────────────────
  function createGalaxyParticles() {
    galaxyParticles = [];
    const count = 1200;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const arms = 2;

    for (let i = 0; i < count; i++) {
      const armIndex = i % arms;
      const armAngle = (armIndex / arms) * Math.PI * 2;
      const dist = Math.pow(Math.random(), 0.6) * Math.min(cx, cy) * 0.85;
      const spiralAngle = armAngle + dist * 0.008 + (Math.random() - 0.5) * 0.6;
      const spread = (Math.random() - 0.5) * dist * 0.35;

      const px = Math.cos(spiralAngle) * dist + Math.sin(spiralAngle) * spread;
      const py = Math.sin(spiralAngle) * dist * 0.55 - Math.cos(spiralAngle) * spread * 0.55;

      const distRatio = dist / (Math.min(cx, cy) * 0.85);
      let r, g, b;
      if (distRatio < 0.15) {
        r = 255; g = 230 + Math.random() * 25; b = 180 + Math.random() * 40;
      } else if (distRatio < 0.4) {
        r = 180 + Math.random() * 75; g = 160 + Math.random() * 60; b = 220 + Math.random() * 35;
      } else if (distRatio < 0.7) {
        r = 100 + Math.random() * 80; g = 140 + Math.random() * 80; b = 230 + Math.random() * 25;
      } else {
        r = 80 + Math.random() * 60; g = 100 + Math.random() * 80; b = 200 + Math.random() * 55;
      }

      galaxyParticles.push({
        relX: px, relY: py,
        r: Math.random() * 1.6 + 0.3,
        color: `${Math.floor(r)},${Math.floor(g)},${Math.floor(b)}`,
        opacity: (1 - distRatio * 0.6) * (Math.random() * 0.5 + 0.5),
        twinkle: Math.random() * 0.02 + 0.005,
        offset: Math.random() * Math.PI * 2
      });
    }
  }

  // ── Dust Clouds / Nebula in Galaxy ──────────────────────
  function createDustClouds() {
    dustClouds = [];
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;
    const colors = [
      { r: 100, g: 50, b: 180 },
      { r: 50, g: 80, b: 200 },
      { r: 180, g: 50, b: 100 },
      { r: 30, g: 140, b: 180 },
      { r: 140, g: 40, b: 160 },
      { r: 200, g: 150, b: 80 },
      { r: 60, g: 100, b: 170 },
    ];
    for (let i = 0; i < 6; i++) {
      const arm = i % 2;
      const armAngle = (arm / 2) * Math.PI * 2;
      const dist = Math.random() * Math.min(cx, cy) * 0.6 + 60;
      const angle = armAngle + dist * 0.007 + (Math.random() - 0.5) * 0.5;
      const c = colors[Math.floor(Math.random() * colors.length)];
      dustClouds.push({
        relX: Math.cos(angle) * dist,
        relY: Math.sin(angle) * dist * 0.5,
        radius: Math.random() * 120 + 60,
        color: c,
        opacity: Math.random() * 0.04 + 0.015,
        pulseSpeed: Math.random() * 0.2 + 0.08,
        pulseOffset: Math.random() * Math.PI * 2
      });
    }
  }

  // ── Shooting Stars ──────────────────────────────────────
  function maybeShootingStar() {
    if (Math.random() < 0.004 && shootingStars.length < 2) {
      shootingStars.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height * 0.4,
        len: Math.random() * 80 + 50,
        speed: Math.random() * 8 + 5,
        angle: Math.PI / 4 + (Math.random() - 0.5) * 0.4,
        opacity: 1
      });
    }
  }

  // ── Mouse Parallax ──────────────────────────────────────
  document.addEventListener('mousemove', (e) => {
    mouseX = e.clientX;
    mouseY = e.clientY;
  });

  // ── Animate ─────────────────────────────────────────────
  function animate() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    const time = Date.now() * 0.001;
    const cx = canvas.width / 2;
    const cy = canvas.height / 2;

    // Parallax offset (smooth follow)
    targetOffsetX = (mouseX - cx) * 0.025;
    targetOffsetY = (mouseY - cy) * 0.025;
    offsetX += (targetOffsetX - offsetX) * 0.04;
    offsetY += (targetOffsetY - offsetY) * 0.04;

    // Slow rotation
    rotation += 0.0003;

    // ── Draw Galactic Core Glow ───────────────────────────
    const gcx = cx + offsetX;
    const gcy = cy + offsetY;

    // Outer halo
    const halo = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, Math.min(cx, cy) * 0.9);
    halo.addColorStop(0, 'rgba(255, 220, 150, 0.12)');
    halo.addColorStop(0.15, 'rgba(180, 140, 220, 0.06)');
    halo.addColorStop(0.4, 'rgba(100, 80, 200, 0.03)');
    halo.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = halo;
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Bright core
    const core = ctx.createRadialGradient(gcx, gcy, 0, gcx, gcy, 100);
    core.addColorStop(0, 'rgba(255, 245, 220, 0.4)');
    core.addColorStop(0.3, 'rgba(255, 200, 140, 0.2)');
    core.addColorStop(0.6, 'rgba(200, 150, 255, 0.08)');
    core.addColorStop(1, 'rgba(0, 0, 0, 0)');
    ctx.fillStyle = core;
    ctx.beginPath();
    ctx.arc(gcx, gcy, 100, 0, Math.PI * 2);
    ctx.fill();

    // ── Draw Dust Clouds ──────────────────────────────────
    ctx.globalCompositeOperation = 'screen';
    for (const d of dustClouds) {
      const cos = Math.cos(rotation);
      const sin = Math.sin(rotation);
      const dx = d.relX * cos - d.relY * sin + gcx;
      const dy = d.relX * sin + d.relY * cos + gcy;
      const pulse = Math.sin(time * d.pulseSpeed + d.pulseOffset) * 0.01 + 1;
      const alpha = d.opacity * pulse;

      for (let layer = 0; layer < 2; layer++) {
        const lr = d.radius * (1 - layer * 0.3);
        const la = alpha * (1 + layer * 0.3);
        const g = ctx.createRadialGradient(dx, dy, 0, dx, dy, lr);
        g.addColorStop(0, `rgba(${d.color.r},${d.color.g},${d.color.b},${la})`);
        g.addColorStop(0.5, `rgba(${d.color.r},${d.color.g},${d.color.b},${la * 0.4})`);
        g.addColorStop(1, `rgba(${d.color.r},${d.color.g},${d.color.b},0)`);
        ctx.fillStyle = g;
        ctx.beginPath();
        ctx.arc(dx, dy, lr, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalCompositeOperation = 'source-over';

    // ── Draw Galaxy Spiral Particles ──────────────────────
    const cosR = Math.cos(rotation);
    const sinR = Math.sin(rotation);
    for (const p of galaxyParticles) {
      const px = p.relX * cosR - p.relY * sinR + gcx;
      const py = p.relX * sinR + p.relY * cosR + gcy;
      const tw = Math.sin(time * p.twinkle * 8 + p.offset) * 0.35 + 0.65;
      const a = p.opacity * tw;

      ctx.beginPath();
      ctx.arc(px, py, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${a})`;
      ctx.fill();

      if (p.r > 1.4) {
        ctx.beginPath();
        ctx.arc(px, py, p.r * 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.color},${a * 0.06})`;
        ctx.fill();
      }
    }

    // ── Draw Background Stars ─────────────────────────────
    for (const s of stars) {
      const tw = Math.sin(time * s.twinkle * 10 + s.offset) * 0.4 + 0.6;
      const a = s.opacity * tw;
      // Slight parallax for stars too
      const sx = s.x + offsetX * 0.3;
      const sy = s.y + offsetY * 0.3;
      ctx.beginPath();
      ctx.arc(sx, sy, s.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${s.color},${a})`;
      ctx.fill();
    }

    // ── Draw Shooting Stars ───────────────────────────────
    maybeShootingStar();
    for (let i = shootingStars.length - 1; i >= 0; i--) {
      const ss = shootingStars[i];
      ss.x += Math.cos(ss.angle) * ss.speed;
      ss.y += Math.sin(ss.angle) * ss.speed;
      ss.opacity -= 0.014;
      if (ss.opacity <= 0) { shootingStars.splice(i, 1); continue; }
      const tx = ss.x - Math.cos(ss.angle) * ss.len;
      const ty = ss.y - Math.sin(ss.angle) * ss.len;
      const grad = ctx.createLinearGradient(tx, ty, ss.x, ss.y);
      grad.addColorStop(0, 'rgba(255,255,255,0)');
      grad.addColorStop(1, `rgba(255,255,255,${ss.opacity})`);
      ctx.beginPath();
      ctx.moveTo(tx, ty);
      ctx.lineTo(ss.x, ss.y);
      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.stroke();
    }

    requestAnimationFrame(animate);
  }

  resize();
  createStars();
  createGalaxyParticles();
  createDustClouds();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createStars();
    createGalaxyParticles();
    createDustClouds();
  });
}

// ═══════════════════════════════════════════════════════════
// NAVBAR SCROLL EFFECT
// ═══════════════════════════════════════════════════════════
function initNavbar() {
  const navbar = document.getElementById('navbar');
  window.addEventListener('scroll', () => {
    navbar.classList.toggle('scrolled', window.scrollY > 60);
  });
}

// ═══════════════════════════════════════════════════════════
// SEARCH
// ═══════════════════════════════════════════════════════════
function initSearch() {
  const input = document.getElementById('search-input');
  if (!input) return;
  input.addEventListener('input', (e) => {
    searchQuery = e.target.value.toLowerCase().trim();
    renderEvents();
  });

  const clearBtn = document.getElementById('search-clear');
  if (clearBtn) {
    clearBtn.addEventListener('click', () => {
      input.value = '';
      searchQuery = '';
      renderEvents();
    });
  }

  const favBtn = document.getElementById('favorites-toggle');
  if (favBtn) {
    favBtn.addEventListener('click', () => {
      showFavoritesOnly = !showFavoritesOnly;
      favBtn.classList.toggle('active', showFavoritesOnly);
      renderEvents();
    });
  }
}

// ═══════════════════════════════════════════════════════════
// FILTER TABS
// ═══════════════════════════════════════════════════════════
function initFilterTabs() {
  const tabs = document.querySelectorAll('.filter-tab');
  tabs.forEach(tab => {
    tab.addEventListener('click', () => {
      tabs.forEach(t => t.classList.remove('active'));
      tab.classList.add('active');
      currentFilter = tab.dataset.category;
      renderEvents();
    });
  });
}

// ═══════════════════════════════════════════════════════════
// BACK TO TOP
// ═══════════════════════════════════════════════════════════
function initBackToTop() {
  const btn = document.getElementById('back-to-top');
  if (!btn) return;

  window.addEventListener('scroll', () => {
    btn.classList.toggle('visible', window.scrollY > 500);
  });

  btn.addEventListener('click', () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
}

// ═══════════════════════════════════════════════════════════
// SCROLL ANIMATIONS (Intersection Observer)
// ═══════════════════════════════════════════════════════════
function initScrollAnimations() {
  const els = document.querySelectorAll('.scroll-reveal');
  if (!els.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('revealed');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach(el => observer.observe(el));
}

// ═══════════════════════════════════════════════════════════
// LOAD DATA FROM API
// ═══════════════════════════════════════════════════════════
async function loadFeaturedEvent() {
  try {
    const res = await fetch(`${API_BASE}/events/featured`);
    const json = await res.json();
    if (json.success) {
      renderFeatured(json.data);
      startCountdown(json.data);
    }
  } catch (err) {
    console.error('Failed to load featured event:', err);
    document.getElementById('featured-card').innerHTML = '<div class="featured-loading">Could not load featured event.</div>';
  }
}

async function loadAllEvents() {
  try {
    const res = await fetch(`${API_BASE}/events`);
    const json = await res.json();
    if (json.success) {
      allEvents = json.data;
      renderEvents();
      renderStats();
    }
  } catch (err) {
    console.error('Failed to load events:', err);
    document.getElementById('events-grid').innerHTML = '<div class="loading-state"><p>Could not load events.</p></div>';
  }
}

// ═══════════════════════════════════════════════════════════
// RENDER STATS COUNTER (animated count-up)
// ═══════════════════════════════════════════════════════════
function renderStats() {
  const now = new Date();
  const total = allEvents.length;
  const upcoming = allEvents.filter(e => new Date(e.date) >= now).length;
  const launches = allEvents.filter(e => e.category === 'launches').length;
  const eclipses = allEvents.filter(e => e.category === 'eclipses').length;

  animateCounter('stat-total', total);
  animateCounter('stat-upcoming', upcoming);
  animateCounter('stat-launches', launches);
  animateCounter('stat-eclipses', eclipses);
}

function animateCounter(id, target) {
  const el = document.getElementById(id);
  if (!el) return;
  let current = 0;
  const duration = 1500;
  const step = target / (duration / 16);
  const tick = () => {
    current += step;
    if (current >= target) {
      el.textContent = target;
      return;
    }
    el.textContent = Math.floor(current);
    requestAnimationFrame(tick);
  };
  tick();
}

// ═══════════════════════════════════════════════════════════
// RENDER FEATURED EVENT
// ═══════════════════════════════════════════════════════════
function renderFeatured(event) {
  const card = document.getElementById('featured-card');
  const dateStr = formatDate(event.date);
  const categoryLabel = formatCategory(event.category);
  const status = getEventStatus(event.date);

  card.innerHTML = `
    <div class="featured-badge">🔥 FEATURED EVENT</div>
    <span class="status-badge ${status.class}">${status.label}</span>
    <h3 class="featured-title">${event.icon} ${event.title}</h3>
    <div class="featured-meta">
      <div class="featured-meta-item"><span class="meta-icon">📅</span> ${dateStr}</div>
      <div class="featured-meta-item"><span class="meta-icon">🏷️</span> ${categoryLabel}</div>
      <div class="featured-meta-item"><span class="meta-icon">🏢</span> ${event.agency}</div>
    </div>
    <p class="featured-description">${event.description}</p>
    <div class="featured-details">
      <p class="modal-details-label">🔍 Deep Dive</p>
      <p>${event.details}</p>
    </div>
  `;
}

// ═══════════════════════════════════════════════════════════
// RENDER EVENT CARDS
// ═══════════════════════════════════════════════════════════
function renderEvents() {
  const grid = document.getElementById('events-grid');
  const favorites = getFavorites();

  let filtered = currentFilter === 'all'
    ? allEvents
    : allEvents.filter(e => e.category === currentFilter);

  if (searchQuery) {
    filtered = filtered.filter(e =>
      e.title.toLowerCase().includes(searchQuery) ||
      e.description.toLowerCase().includes(searchQuery) ||
      e.agency.toLowerCase().includes(searchQuery)
    );
  }

  if (showFavoritesOnly) {
    filtered = filtered.filter(e => favorites.includes(e.id));
  }

  if (filtered.length === 0) {
    grid.innerHTML = `<div class="loading-state"><p>${showFavoritesOnly ? 'No favorites yet. Click the ♡ on cards to save.' : searchQuery ? 'No events match your search.' : 'No events in this category.'}</p></div>`;
    return;
  }

  grid.innerHTML = filtered.map((event, i) => {
    const dateStr = formatDate(event.date);
    const categoryClass = event.category;
    const categoryLabel = formatCategory(event.category);
    const importanceDots = renderImportance(event.importance);
    const status = getEventStatus(event.date);
    const isFav = favorites.includes(event.id);

    return `
      <div class="event-card scroll-reveal" data-category="${event.category}" data-id="${event.id}" style="animation-delay: ${i * 0.06}s">
        <div class="card-header">
          <span class="card-icon">${event.icon}</span>
          <div class="card-header-right">
            <span class="status-badge ${status.class}">${status.label}</span>
            <button class="fav-btn ${isFav ? 'active' : ''}" onclick="event.stopPropagation(); toggleFavorite(${event.id})" title="${isFav ? 'Remove from favorites' : 'Add to favorites'}">
              ${isFav ? '❤️' : '🤍'}
            </button>
          </div>
        </div>
        <span class="card-category-badge ${categoryClass}">${categoryLabel}</span>
        <h3 class="card-title">${event.title}</h3>
        <div class="card-date">📅 ${dateStr}</div>
        <div class="card-agency">${event.agency}</div>
        <p class="card-description">${event.description}</p>
        <div class="card-footer">
          <div class="card-importance">
            ${importanceDots}
            <span class="importance-label">Importance</span>
          </div>
          <button class="card-details-btn" onclick="openModal(${event.id})">Details →</button>
        </div>
      </div>
    `;
  }).join('');

  // Re-init scroll animations for new cards
  initScrollAnimations();
}

function renderImportance(level) {
  let dots = '';
  for (let i = 1; i <= 5; i++) {
    dots += `<span class="importance-dot ${i <= level ? 'filled' : 'empty'}"></span>`;
  }
  return dots;
}

// ═══════════════════════════════════════════════════════════
// EVENT STATUS BADGES
// ═══════════════════════════════════════════════════════════
function getEventStatus(dateStr) {
  const now = new Date();
  const eventDate = new Date(dateStr + 'T00:00:00');
  const diffDays = (eventDate - now) / (1000 * 60 * 60 * 24);

  if (diffDays < -1) return { label: 'Past', class: 'status-past' };
  if (diffDays <= 0) return { label: '🔴 Now', class: 'status-now' };
  if (diffDays <= 7) return { label: '🟡 Soon', class: 'status-soon' };
  if (diffDays <= 30) return { label: 'This Month', class: 'status-month' };
  return { label: 'Upcoming', class: 'status-upcoming' };
}

// ═══════════════════════════════════════════════════════════
// FAVORITES
// ═══════════════════════════════════════════════════════════
function toggleFavorite(eventId) {
  let favs = getFavorites();
  if (favs.includes(eventId)) {
    favs = favs.filter(id => id !== eventId);
  } else {
    favs.push(eventId);
  }
  saveFavorites(favs);
  renderEvents();
}

// ═══════════════════════════════════════════════════════════
// COUNTDOWN TIMER
// ═══════════════════════════════════════════════════════════
function startCountdown(event) {
  const nameEl = document.getElementById('countdown-event-name');
  nameEl.textContent = event.title;
  const targetDate = new Date(event.date + 'T00:00:00');

  function update() {
    const now = new Date();
    const diff = targetDate - now;
    if (diff <= 0) {
      document.getElementById('days').textContent = '00';
      document.getElementById('hours').textContent = '00';
      document.getElementById('minutes').textContent = '00';
      document.getElementById('seconds').textContent = '00';
      nameEl.textContent = event.title + ' — Happening now!';
      return;
    }
    document.getElementById('days').textContent = String(Math.floor(diff / 86400000)).padStart(2, '0');
    document.getElementById('hours').textContent = String(Math.floor((diff % 86400000) / 3600000)).padStart(2, '0');
    document.getElementById('minutes').textContent = String(Math.floor((diff % 3600000) / 60000)).padStart(2, '0');
    document.getElementById('seconds').textContent = String(Math.floor((diff % 60000) / 1000)).padStart(2, '0');
  }

  update();
  if (countdownInterval) clearInterval(countdownInterval);
  countdownInterval = setInterval(update, 1000);
}

// ═══════════════════════════════════════════════════════════
// EVENT DETAIL MODAL
// ═══════════════════════════════════════════════════════════
function initModal() {
  const overlay = document.getElementById('modal-overlay');
  const closeBtn = document.getElementById('modal-close');
  closeBtn.addEventListener('click', closeModal);
  overlay.addEventListener('click', (e) => { if (e.target === overlay) closeModal(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeModal(); });
}

function openModal(eventId) {
  const event = allEvents.find(e => e.id === eventId);
  if (!event) return;
  const content = document.getElementById('modal-content');
  const dateStr = formatDate(event.date);
  const categoryLabel = formatCategory(event.category);
  const status = getEventStatus(event.date);

  content.innerHTML = `
    <div class="modal-icon">${event.icon}</div>
    <span class="status-badge ${status.class}" style="margin-bottom:12px;display:inline-block;">${status.label}</span>
    <h2 class="modal-title">${event.title}</h2>
    <div class="modal-meta">
      <span class="modal-meta-item">📅 ${dateStr}</span>
      <span class="modal-meta-item">🏷️ ${categoryLabel}</span>
      <span class="modal-meta-item">🏢 ${event.agency}</span>
    </div>
    <p class="modal-description">${event.description}</p>
    <div class="modal-details">
      <p class="modal-details-label">🔍 Additional Details</p>
      <p>${event.details}</p>
    </div>
  `;
  document.getElementById('modal-overlay').classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeModal() {
  document.getElementById('modal-overlay').classList.remove('active');
  document.body.style.overflow = '';
}

// ═══════════════════════════════════════════════════════════
// UTILITY FUNCTIONS
// ═══════════════════════════════════════════════════════════
function formatDate(dateString) {
  return new Date(dateString + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric', month: 'long', day: 'numeric'
  });
}

function formatCategory(category) {
  return { 'launches': 'Launch', 'eclipses': 'Eclipse', 'meteor-showers': 'Meteor Shower' }[category] || category;
}
