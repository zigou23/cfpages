const BASE_PATH = 'assets';
const DEFAULT_LANG = 'en';

// English is the HTML fallback, so there is no EN.json file.
// Add future languages here, then create the matching file in assets/i18n/.
const LANGS = [
  { code: 'en', label: 'EN', file: null, htmlLang: 'en' },
  { code: 'zh', label: 'ZH', file: 'zh.json', htmlLang: 'zh' }
];

// Browser language recognition map. Default still stays English unless the user chooses another language.
const HOME_PROJECT_LIMIT = 8;
const HOME_FRIEND_LIMIT = 6;
const VALID_VIEWS = new Set(['projects', 'friends']);

const LANGUAGE_ALIASES = {
  en: 'en',
  'en-us': 'en',
  'en-gb': 'en',
  zh: 'zh',
  'zh-cn': 'zh',
  'zh-sg': 'zh',
  'zh-hans': 'zh',
  'zh-hant': 'zh',
  'zh-tw': 'zh',
  'zh-hk': 'zh'
};

const PROJECTS = [
  {
    title: { en: 'Personal Homepage', zh: '个人主页' },
    desc: {
      en: 'A minimal responsive homepage for profile, projects, photos, and links.',
      zh: '一个极简、响应式的个人介绍页，用来放自我介绍、项目、照片和链接。'
    },
    link: ['#']
  },
  {
    title: { en: 'Bing Gallery', zh: '必应画廊' },
    desc: {
      en: 'A collection of images from the Bing Image Search API.',
      zh: '来自必应图片搜索API的图片集合。'
    },
    link: ['bing.qsim.top']
  },
  {
    title: { en: 'Lab', zh: '实验室' },
    desc: {
      en: 'A personal playground for experiments and explorations.',
      zh: '一个用于实验和探索的个人实验室'
    },
    link: ['lab.qsim.top']
  }
];
// Links are split into parts instead of being written as full URLs in HTML.  scheme: 'https', 
const LINK_REGISTRY = {
  github: {host: ['github', 'com'], path: ['zigou23'] },
  sponsor: {host: ['github', 'com'], path: ['sponsors', 'zigou23'] },
  telegram: {host: ['t', 'me'], path: ['qsims_bot'] },
  status: {host: ['qsim', 'top'], path: ['status'] }
};

// Email is assembled only when the user clicks the email button.
const CONTACT_PARTS = {
  user: ['t'],
  domain: ['qsim', 'top']
};

const state = {
  lang: DEFAULT_LANG,
  i18n: {},
  view: null,
  friends: null,
  friendsLoading: false,
  friendsLoaded: false
};

const defaultMarkup = new Map();
const i18nCache = new Map();

const header = document.getElementById('site-header');
const brand = document.getElementById('site-brand');
const heroTitle = document.getElementById('hero-title');
const menuToggle = document.getElementById('menu-toggle');
const mobileMenu = document.getElementById('mobile-menu');
const themeToggle = document.getElementById('theme-toggle');
const langToggle = document.getElementById('lang-toggle');
const allNavLinks = [...document.querySelectorAll('.nav-link, .mobile-link')];

function detectBrowserLanguage() {
  const raw = (navigator.language || navigator.userLanguage || '').toLowerCase();
  return LANGUAGE_ALIASES[raw] || LANGUAGE_ALIASES[raw.split('-')[0]] || DEFAULT_LANG;
}

function langExists(code) {
  return LANGS.some(lang => lang.code === code);
}

function getInitialLanguage() {
  const urlLang = new URLSearchParams(window.location.search).get('lang');
  const savedLang = localStorage.getItem('lang');

  if (urlLang && langExists(urlLang)) return urlLang;
  if (savedLang && langExists(savedLang)) return savedLang;

  // Keep default English as requested. Browser detection is ready for future opt-in logic.
  detectBrowserLanguage();
  return DEFAULT_LANG;
}


function getInitialView() {
  const view = new URLSearchParams(window.location.search).get('view');
  return VALID_VIEWS.has(view) ? view : null;
}

function getPlainUrl(hash = '') {
  return `${window.location.pathname}${hash}`;
}

function getViewUrl(view) {
  return `${window.location.pathname}?view=${encodeURIComponent(view)}#${view}`;
}

function tText(path, fallback) {
  return readPath(state.i18n, path) || fallback;
}

function applyViewMode() {
  state.view = getInitialView();
  document.body.dataset.view = state.view || 'home';

  document.querySelectorAll('main > section[id]').forEach(section => {
    const shouldShow = !state.view || section.id === state.view;
    section.toggleAttribute('hidden', !shouldShow);
    section.classList.toggle('is-full-view', state.view === section.id);
  });
}

function setupViewNavigation() {
  document.addEventListener('click', event => {
    const link = event.target.closest('.nav-link, .mobile-link, .brand');
    if (!link || !state.view) return;

    const hash = link.getAttribute('href') || '#home';
    if (!hash.startsWith('#')) return;

    event.preventDefault();
    window.location.href = getPlainUrl(hash);
  });
}

function getVisibleProjects() {
  return state.view === 'projects' ? PROJECTS : PROJECTS.slice(0, HOME_PROJECT_LIMIT);
}

function getVisibleFriends() {
  if (!state.friends) return [];
  return state.view === 'friends' ? state.friends : state.friends.slice(0, HOME_FRIEND_LIMIT);
}

function shuffleArray(items) {
  const copy = [...items];
  for (let i = copy.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function localizeValue(value) {
  if (value && typeof value === 'object' && !Array.isArray(value)) {
    return value[state.lang] || value[DEFAULT_LANG] || Object.values(value)[0] || '';
  }
  return value || '';
}

function readPath(obj, path) {
  return path.split('.').reduce((acc, key) => (acc && acc[key] !== undefined ? acc[key] : undefined), obj);
}

function collectDefaultMarkup() {
  document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach(el => {
    const key = el.dataset.i18n || el.dataset.i18nHtml;
    defaultMarkup.set(key, el.innerHTML);
  });
}

async function loadLanguage(langCode) {
  const config = LANGS.find(lang => lang.code === langCode) || LANGS[0];

  if (!config.file) {
    state.i18n = {};
    state.lang = DEFAULT_LANG;
    return {};
  }

  if (i18nCache.has(langCode)) {
    state.i18n = i18nCache.get(langCode);
    state.lang = langCode;
    return state.i18n;
  }

  const response = await fetch(`${BASE_PATH}/i18n/${config.file}`);
  if (!response.ok) throw new Error(`Failed to load language file: ${config.file}`);

  const data = await response.json();
  i18nCache.set(langCode, data);
  state.i18n = data;
  state.lang = langCode;
  return data;
}

function translateElement(el) {
  const key = el.dataset.i18n || el.dataset.i18nHtml;
  const fallback = defaultMarkup.get(key) || el.innerHTML;
  const translated = readPath(state.i18n, key);

  if (el.dataset.i18nHtml !== undefined) {
    el.innerHTML = translated || fallback;
  } else {
    el.textContent = translated || fallback;
  }
}

function getNextLanguage() {
  const idx = LANGS.findIndex(lang => lang.code === state.lang);
  return LANGS[(idx + 1) % LANGS.length];
}

function updateLanguageButton() {
  if (!langToggle) return;
  const next = getNextLanguage();
  langToggle.textContent = next.label;
  langToggle.setAttribute('aria-label', `Switch language to ${next.label}`);
  langToggle.setAttribute('title', `Switch to ${next.label}`);
}

function applyTranslations() {
  const langConfig = LANGS.find(lang => lang.code === state.lang) || LANGS[0];
  document.documentElement.lang = langConfig.htmlLang;
  langToggle.dataset.lang = state.lang;
  updateLanguageButton();

  document.querySelectorAll('[data-i18n], [data-i18n-html]').forEach(translateElement);
  renderProjects();
  if (state.friendsLoaded && state.friends) renderFriends(state.friends);
}

async function setLanguage(langCode) {
  try {
    await loadLanguage(langCode);
    localStorage.setItem('lang', state.lang);
    applyTranslations();
  } catch (error) {
    console.warn(error);
  }
}

function toggleLanguage() {
  const next = getNextLanguage();
  setLanguage(next.code);
}

function buildUrl(definition) {
  if (!definition) return '#';
  if (definition.kind === 'hash') return definition.value;

  const scheme = definition.scheme || 'https';
  const host = Array.isArray(definition.host) ? definition.host.join('.') : definition.host;
  const path = Array.isArray(definition.path) && definition.path.length ? `/${definition.path.join('/')}` : '';
  return `${scheme}://${host}${path}`;
}

function buildSplitUrl(link) {
  if (!Array.isArray(link) || !link[0]) return '#';

  const first = String(link[0]).trim();

  // Anchor links: ['#'], ['#projects']
  if (first.startsWith('#')) {
    return first;
  }

  // Relative / local paths: ['./demo'], ['../demo'], ['/demo']
  if (
    first.startsWith('./') ||
    first.startsWith('../') ||
    first.startsWith('/')
  ) {
    const rest = link
      .slice(1)
      .filter(Boolean)
      .map(part => String(part).trim().replace(/^\/+|\/+$/g, ''))
      .filter(Boolean)
      .join('/');

    return rest ? `${first.replace(/\/+$/, '')}/${rest}` : first;
  }

  // Single local path: ['demo'], ['projects/homepage']
  // If it does not look like a domain, treat it as a relative path.
  const looksLikeDomain =
    first.includes('.') &&
    !first.includes('/') &&
    !first.includes(' ');

  if (!looksLikeDomain) {
    const path = link
      .filter(Boolean)
      .map(part => String(part).trim().replace(/^\/+|\/+$/g, ''))
      .filter(Boolean)
      .join('/');

    return path || '#';
  }

  // External links: ['example.com'], ['example.com', 'path']
  const host = first
    .replace(/^https?:\/\//, '')
    .replace(/\/+$/, '');

  const path = link
    .slice(1)
    .filter(Boolean)
    .map(part => String(part).trim().replace(/^\/+|\/+$/g, ''))
    .filter(Boolean)
    .join('/');

  return path ? `https://${host}/${path}` : `https://${host}`;
}
function buildProjectUrl(project) {
  return buildSplitUrl(project.link);
}
function buildFriendUrl(friend) {
  return buildSplitUrl(friend.link);
}

function buildEmail() {
  return `${CONTACT_PARTS.user.join('')}@${CONTACT_PARTS.domain.join('.')}`;
}

function setupObfuscatedActions() {
  document.addEventListener('click', event => {
    const emailButton = event.target.closest('[data-email-action]');
    if (emailButton) {
      window.location.href = `mailto:${buildEmail()}`;
      return;
    }

    const linkButton = event.target.closest('[data-link-key]');
    if (linkButton) {
      const url = buildUrl(LINK_REGISTRY[linkButton.dataset.linkKey]);
      if (url.startsWith('#')) {
        window.location.hash = url;
      } else {
        window.open(url, '_blank', 'noopener');
      }
    }
  });
}

function renderProjects() {
  const grid = document.getElementById('project-grid');
  const actions = document.getElementById('project-actions');
  if (!grid) return;

  const visibleProjects = getVisibleProjects();
  
  grid.innerHTML = visibleProjects.map(project => {
    const href = buildProjectUrl(project);
    const targetAttr = href.startsWith('http') ? ' target="_blank" rel="noopener noreferrer"' : '';
    return `
      <a class="project-card" href="${href}"${targetAttr}>
        <div>
          <h3 class="project-title">${localizeValue(project.title)}</h3>
          <p class="project-desc">${localizeValue(project.desc)}</p>
        </div>
      </a>`;
  }).join('');

  if (!actions) return;

  if (state.view === 'projects') {
    actions.innerHTML = `<a class="view-all-link" href="${getPlainUrl('#projects')}">${tText('common.backHome', 'Back home')}</a>`;
  } else if (PROJECTS.length > HOME_PROJECT_LIMIT) {
    actions.innerHTML = `<a class="view-all-link" href="${getViewUrl('projects')}">${tText('projects.viewAll', 'View all projects')} →</a>`;
  } else {
    actions.innerHTML = '';
  }
}

function renderFriends(friends) {
  const list = document.getElementById('friends-list');
  const actions = document.getElementById('friends-actions');
  if (!list) return;

  if (!friends.length) {
    list.innerHTML = `<div class="lazy-note">${readPath(state.i18n, 'friends.empty') || 'No friends yet.'}</div>`;
    if (actions) actions.innerHTML = '';
    return;
  }

  const visibleFriends = getVisibleFriends();
  list.dataset.state = 'loaded';

  list.innerHTML = visibleFriends.map(friend => {
    const href = buildFriendUrl(friend);

    return `
      <a class="friend-item" href="${href}" target="_blank" rel="noopener noreferrer">
        <div>
          <div class="friend-name">${friend.name}</div>
          <div class="friend-desc">${localizeValue(friend.description)}</div>
        </div>
      </a>`;
  }).join('');

  if (!actions) return;

  if (state.view === 'friends') {
    actions.innerHTML = `<a class="view-all-link" href="${getPlainUrl('#friends')}">${tText('common.backHome', 'Back home')}</a>`;
  } else if (friends.length > HOME_FRIEND_LIMIT) {
    actions.innerHTML = `<a class="view-all-link" href="${getViewUrl('friends')}">${tText('friends.viewAll', 'View all friends')} →</a>`;
  } else {
    actions.innerHTML = '';
  }
}

function renderFriendLoading() {
  const list = document.getElementById('friends-list');
  if (!list) return;
  list.dataset.state = 'loading';
  list.innerHTML = `
    <div class="friend-skeleton" aria-label="Loading friends">
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
      <div class="skeleton-line"></div>
    </div>`;
}

function renderFriendError() {
  const list = document.getElementById('friends-list');
  if (!list) return;
  list.dataset.state = 'error';
  const text = readPath(state.i18n, 'friends.error') || 'Failed to load friends.';
  list.innerHTML = `<div class="error-state">${text}</div>`;
}

async function loadFriends() {
  if (state.friendsLoaded || state.friendsLoading) return;
  state.friendsLoading = true;
  renderFriendLoading();

  try {
    const response = await fetch(`${BASE_PATH}/data/friends.json`);
    if (!response.ok) throw new Error('Failed to load friends.json');
    const raw = await response.json();
    state.friends = shuffleArray(raw).map((friend, index) => ({ ...friend, __index: index }));
    state.friendsLoaded = true;
    renderFriends(state.friends);
  } catch (error) {
    console.warn(error);
    renderFriendError();
  } finally {
    state.friendsLoading = false;
  }
}

function setupFriendsLazyLoad() {
  const friendsSection = document.querySelector('[data-lazy-friends]');
  if (!friendsSection) return;

  if (state.view === 'friends') {
    loadFriends();
    return;
  }

  if (!('IntersectionObserver' in window)) {
    loadFriends();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    if (entries.some(entry => entry.isIntersecting)) {
      loadFriends();
      observer.disconnect();
    }
  }, { rootMargin: '160px 0px', threshold: 0.01 });

  observer.observe(friendsSection);
}

function setupFriendClicks() {
  // Friend cards are normal <a> links now, so no JS click handler is needed.
}

function applyTheme(theme) {
  document.documentElement.dataset.theme = theme;
  localStorage.setItem('theme', theme);
}

function setupTheme() {
  const saved = localStorage.getItem('theme');
  const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
  applyTheme(saved || (prefersDark ? 'dark' : 'light'));

  themeToggle.addEventListener('click', () => {
    const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    applyTheme(next);
  });
}

function setupMenu() {
  menuToggle.addEventListener('click', () => {
    const isOpen = mobileMenu.classList.toggle('open');
    menuToggle.classList.toggle('open', isOpen);
    menuToggle.setAttribute('aria-expanded', String(isOpen));
  });

  mobileMenu.addEventListener('click', event => {
    if (event.target.closest('a,button')) {
      mobileMenu.classList.remove('open');
      menuToggle.classList.remove('open');
      menuToggle.setAttribute('aria-expanded', 'false');
    }
  });
}

function setupHeaderBrandVisibility() {
  if (!brand || !heroTitle) return;

  if (!('IntersectionObserver' in window)) {
    const update = () => brand.classList.toggle('is-hidden', window.scrollY < 220);
    window.addEventListener('scroll', update, { passive: true });
    update();
    return;
  }

  const observer = new IntersectionObserver(entries => {
    const titleVisible = entries.some(entry => entry.isIntersecting);
    brand.classList.toggle('is-hidden', titleVisible);
  }, {
    rootMargin: '-72px 0px -45% 0px',
    threshold: [0, 0.05, 0.2, 0.6]
  });

  observer.observe(heroTitle);
}

function setupScrollState() {
  const sections = [...document.querySelectorAll('main section[id]')];

  const updateHeader = () => {
    header.classList.toggle('scrolled', window.scrollY > 8);
  };

  const observer = new IntersectionObserver(entries => {
    const visible = entries
      .filter(entry => entry.isIntersecting)
      .sort((a, b) => b.intersectionRatio - a.intersectionRatio)[0];

    if (!visible) return;

    allNavLinks.forEach(link => {
      link.classList.toggle('active', link.dataset.section === visible.target.id);
    });
  }, {
    rootMargin: '-35% 0px -55% 0px',
    threshold: [0, 0.1, 0.5, 1]
  });

  sections.forEach(section => observer.observe(section));
  window.addEventListener('scroll', updateHeader, { passive: true });
  updateHeader();
}

function startClock() {
  const clock = document.getElementById('clock');
  if (!clock) return;

  const tick = () => {
    const locale = state.lang === 'zh' ? 'zh-CN' : 'en-US';
    
    clock.textContent = new Date().toLocaleTimeString(locale, {
      hour: '2-digit',
      minute: '2-digit',
      hour12: true,               // 24 h false / AM/PM true
      timeZone: 'Asia/hong_kong' // Fixed timezone for consistency
    });
  };

  tick();
  window.setInterval(tick, 10000);
}

function setupLanguageToggle() {
  langToggle.addEventListener('click', toggleLanguage);
}

async function init() {
  collectDefaultMarkup();
  applyViewMode();
  setupTheme();
  setupMenu();
  setupScrollState();
  setupHeaderBrandVisibility();
  setupObfuscatedActions();
  setupViewNavigation();
  setupFriendClicks();
  setupFriendsLazyLoad();
  setupLanguageToggle();
  startClock();

  await setLanguage(getInitialLanguage());
}

init();
