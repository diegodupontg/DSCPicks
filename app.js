// ═══════════════════════════════════════════════════════
//  DUPO POLLA — Shared Utilities
// ═══════════════════════════════════════════════════════

// ── Config ───────────────────────────────────────────
// Si tu Worker está en el mismo dominio, usa '/api'.
// Si es separado: 'https://dupo-polla.YOUR_SUBDOMAIN.workers.dev/api'
const API_BASE = window.DSC_API_BASE || '/api';

// ── Auth ─────────────────────────────────────────────
function getToken()    { return localStorage.getItem('dp_token'); }
function getUser()     { return JSON.parse(localStorage.getItem('dp_user') || 'null'); }
function isSuperAdmin(){ const u = getUser(); return u?.is_super_admin === true || u?.is_super_admin === 1 || u?.username === 'diegodupontg'; }
function isAdmin()     { const u = getUser(); return u?.is_admin === true || u?.is_admin === 1 || isSuperAdmin(); }

function setAuth(token, user) {
  localStorage.setItem('dp_token', token);
  localStorage.setItem('dp_user', JSON.stringify(user));
}

function clearAuth() {
  localStorage.removeItem('dp_token');
  localStorage.removeItem('dp_user');
}

function applyTheme(theme = localStorage.getItem('dp_theme') || 'dark') {
  document.documentElement.dataset.theme = theme === 'light' ? 'light' : 'dark';
}

function toggleTheme() {
  const next = document.documentElement.dataset.theme === 'light' ? 'dark' : 'light';
  localStorage.setItem('dp_theme', next);
  applyTheme(next);
}

applyTheme();

function avatarHtml(user, className = 'navbar-avatar') {
  const label = ((user?.display_name || user?.username || '?')[0] || '?').toUpperCase();
  if (user?.avatar_url) {
    return `<img src="${user.avatar_url}" alt="${user.display_name || user.username}" class="${className} avatar-img">`;
  }
  return `<div class="${className}">${label}</div>`;
}

function brandLogoHtml(variant = 'nav') {
  const src = variant === 'auth'
    ? window.DSC_LOGOS?.square || window.DSC_LOGOS?.banner
    : window.DSC_LOGOS?.banner || window.DSC_LOGOS?.black;
  if (!src) return '<span class="brand-fallback">DSC</span>';
  return `
    <span class="brand-logo brand-logo-${variant}">
      <img src="${src}" alt="Dupo Streaming Corporation">
    </span>`;
}

function requireAuth(redirectTo = 'login.html') {
  if (!getToken()) { window.location.href = redirectTo; return false; }
  return true;
}

function requireAdmin() {
  if (!requireAuth()) return false;
  if (!isAdmin()) { window.location.href = 'dashboard.html'; return false; }
  return true;
}

function logout() {
  clearAuth();
  window.location.href = 'login.html';
}

// ── API Fetch ────────────────────────────────────────
async function api(endpoint, options = {}) {
  const token = getToken();
  const config = {
    method: options.method || 'GET',
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  };
  if (options.body) config.body = JSON.stringify(options.body);

  const res = await fetch(`${API_BASE}${endpoint}`, config);
  const data = await res.json();

  if (!res.ok) throw new Error(data.error || `Error ${res.status}`);
  return data;
}

// ── Navbar ───────────────────────────────────────────
function renderNav(activePage = '') {
  const user = getUser();
  if (!user) return;

  const nav = document.getElementById('navbar');
  if (!nav) return;

  const adminLink = isAdmin()
    ? `<li><a href="admin.html" class="${activePage==='admin'?'active':''}">⚙ Admin</a></li>`
    : '';

  nav.innerHTML = `
    <a href="dashboard.html" class="navbar-logo">
      ${brandLogoHtml('nav')}
    </a>
    <nav>
      <ul class="navbar-links">
        <li><a href="dashboard.html" class="${activePage==='dashboard'?'active':''}">Dashboard</a></li>
        <li><a href="picks.html" class="${activePage==='picks'?'active':''}">Mis Picks</a></li>
        <li><a href="brackets.html" class="${activePage==='brackets'?'active':''}">Brackets</a></li>
        ${adminLink}
      </ul>
    </nav>
    <div class="navbar-user">
      <button class="btn btn-ghost btn-sm theme-toggle" onclick="toggleTheme()" title="Cambiar tema">◐</button>
      ${avatarHtml(user)}
      <span class="navbar-username">${user.display_name || user.username}</span>
      <button class="btn btn-ghost btn-sm" onclick="logout()">Salir</button>
    </div>
  `;
}

function leagueLogoHtml(league, cls = 'league-logo-img') {
  if (league?.logo_url) return `<img class="${cls}" src="${league.logo_url}" alt="${league.name || 'Liga'}">`;
  return `<span class="${cls} fallback">${league?.logo_emoji || 'T'}</span>`;
}

function teamLogoHtml(url, name, cls = 'team-logo') {
  if (!url) {
    const flag = countryFlag(name);
    return `<span class="${cls} fallback">${flag || (displayTeamName(name) || '?').slice(0, 1).toUpperCase()}</span>`;
  }
  return `<img class="${cls}" src="${url}" alt="${name || 'Equipo'}">`;
}

const COUNTRY_ES = {
  'Argentina': 'Argentina',
  'Algeria': 'Argelia',
  'Australia': 'Australia',
  'Austria': 'Austria',
  'Belgium': 'Belgica',
  'Bosnia-Herzegovina': 'Bosnia y Herzegovina',
  'Brazil': 'Brasil',
  'Canada': 'Canada',
  'Cape Verde': 'Cabo Verde',
  'Colombia': 'Colombia',
  'Congo DR': 'RD Congo',
  'Croatia': 'Croacia',
  'Curacao': 'Curazao',
  'Czechia': 'Chequia',
  'Czech Republic': 'Republica Checa',
  'DR Congo': 'RD Congo',
  'Ecuador': 'Ecuador',
  'Egypt': 'Egipto',
  'England': 'Inglaterra',
  'France': 'Francia',
  'Germany': 'Alemania',
  'Ghana': 'Ghana',
  'Haiti': 'Haiti',
  'Iran': 'Iran',
  'IR Iran': 'Iran',
  'Iraq': 'Irak',
  'Ivory Coast': 'Costa de Marfil',
  'Japan': 'Japon',
  'Jordan': 'Jordania',
  'Mexico': 'Mexico',
  'Morocco': 'Marruecos',
  'Netherlands': 'Paises Bajos',
  'New Zealand': 'Nueva Zelanda',
  'Norway': 'Noruega',
  'Panama': 'Panama',
  'Paraguay': 'Paraguay',
  'Portugal': 'Portugal',
  'Qatar': 'Qatar',
  'Saudi Arabia': 'Arabia Saudita',
  'Scotland': 'Escocia',
  'Senegal': 'Senegal',
  'South Africa': 'Sudafrica',
  'South Korea': 'Corea del Sur',
  'Korea Republic': 'Corea del Sur',
  'Spain': 'Espana',
  'Sweden': 'Suecia',
  'Switzerland': 'Suiza',
  'Tunisia': 'Tunez',
  'Turkiye': 'Turquia',
  'Türkiye': 'Turquia',
  'United States': 'Estados Unidos',
  'USA': 'Estados Unidos',
  'Uruguay': 'Uruguay',
  'Uzbekistan': 'Uzbekistan'
};

const COUNTRY_FLAGS = {
  'Argentina': '🇦🇷', 'Algeria': '🇩🇿', 'Australia': '🇦🇺', 'Austria': '🇦🇹',
  'Belgium': '🇧🇪', 'Bosnia-Herzegovina': '🇧🇦', 'Brazil': '🇧🇷', 'Canada': '🇨🇦',
  'Cape Verde': '🇨🇻', 'Colombia': '🇨🇴', 'Congo DR': '🇨🇩', 'Croatia': '🇭🇷',
  'Curacao': '🇨🇼', 'Czechia': '🇨🇿', 'Czech Republic': '🇨🇿', 'DR Congo': '🇨🇩',
  'Ecuador': '🇪🇨', 'Egypt': '🇪🇬', 'England': '🏴', 'France': '🇫🇷',
  'Germany': '🇩🇪', 'Ghana': '🇬🇭', 'Haiti': '🇭🇹', 'Iran': '🇮🇷',
  'IR Iran': '🇮🇷', 'Iraq': '🇮🇶', 'Ivory Coast': '🇨🇮', 'Japan': '🇯🇵',
  'Jordan': '🇯🇴', 'Mexico': '🇲🇽', 'Morocco': '🇲🇦', 'Netherlands': '🇳🇱',
  'New Zealand': '🇳🇿', 'Norway': '🇳🇴', 'Panama': '🇵🇦', 'Paraguay': '🇵🇾',
  'Portugal': '🇵🇹', 'Qatar': '🇶🇦', 'Saudi Arabia': '🇸🇦', 'Scotland': '🏴',
  'Senegal': '🇸🇳', 'South Africa': '🇿🇦', 'South Korea': '🇰🇷', 'Korea Republic': '🇰🇷',
  'Spain': '🇪🇸', 'Sweden': '🇸🇪', 'Switzerland': '🇨🇭', 'Tunisia': '🇹🇳',
  'Turkiye': '🇹🇷', 'Türkiye': '🇹🇷', 'United States': '🇺🇸', 'USA': '🇺🇸',
  'Uruguay': '🇺🇾', 'Uzbekistan': '🇺🇿'
};

function displayTeamName(name) {
  const key = String(name || '').trim();
  return COUNTRY_ES[key] || key;
}

function countryFlag(name) {
  return COUNTRY_FLAGS[String(name || '').trim()] || '';
}

function isExpertAccount(user = getUser()) {
  return ['diegodupontg', 'pieroludena', 'matysports']
    .includes(String(user?.username || '').toLowerCase());
}

// ── Toast ────────────────────────────────────────────
function ensureToastContainer() {
  let c = document.getElementById('toast-container');
  if (!c) {
    c = document.createElement('div');
    c.id = 'toast-container';
    document.body.appendChild(c);
  }
  return c;
}

function toast(message, type = 'info', duration = 3500) {
  const container = ensureToastContainer();
  const el = document.createElement('div');
  el.className = `toast ${type}`;
  el.textContent = message;
  container.appendChild(el);
  setTimeout(() => {
    el.style.opacity = '0';
    el.style.transform = 'translateX(60px)';
    el.style.transition = '.2s ease';
    setTimeout(() => el.remove(), 200);
  }, duration);
}

// ── Date Helpers ─────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima'
  });
}

function formatDateShort(dateStr) {
  if (!dateStr) return '—';
  const d = new Date(dateStr);
  return d.toLocaleDateString('es-PE', {
    day: '2-digit', month: 'short',
    hour: '2-digit', minute: '2-digit', timeZone: 'America/Lima'
  });
}

function isDeadlinePassed(dateStr) {
  if (!dateStr) return false;
  return new Date(dateStr).getTime() < Date.now();
}

// ── Sport Badge ──────────────────────────────────────
function sportBadge(sport) {
  const map = {
    football: 'Futbol',
    basketball: 'Basketball',
    american_football: 'Football',
    baseball: 'Baseball',
    hockey: 'Hockey',
    bracket: 'Bracket'
  };
  return `<span class="badge badge-${sport}">${map[sport] || sport}</span>`;
}

// ── Rank Colors ──────────────────────────────────────
function rankClass(i) {
  if (i === 0) return 'gold';
  if (i === 1) return 'silver';
  if (i === 2) return 'bronze';
  return '';
}

// ── Tabs ──────────────────────────────────────────────
function initTabs(containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;
  const btns = container.querySelectorAll('.tab-btn');
  btns.forEach(btn => {
    btn.addEventListener('click', () => {
      const target = btn.dataset.tab;
      btns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll(`[data-panel]`).forEach(p => {
        p.classList.toggle('active', p.dataset.panel === target);
      });
    });
  });
}

// ── URL Params ───────────────────────────────────────
function getParam(name) {
  return new URLSearchParams(window.location.search).get(name);
}
