// Remembers the language picked in the switcher and sends returning visitors
// to their saved language version. No automatic redirect on navigator.language,
// so crawlers and shared links always get the language they asked for.

const STORAGE_KEY = 'sec-lang';
const SWITCH_SELECTOR = '.lang-switch a[data-lang]';

function readSaved() {
  try { return window.localStorage.getItem(STORAGE_KEY); } catch { return null; }
}

function save(lang) {
  try { window.localStorage.setItem(STORAGE_KEY, lang); } catch { /* storage blocked */ }
}

function redirectToSaved(links) {
  const hasTranslations = document.querySelector('link[rel="alternate"][hreflang]');
  const saved = readSaved();
  if (!hasTranslations || !saved || saved === document.documentElement.lang) return;
  const target = links.find((a) => a.dataset.lang === saved);
  if (target) window.location.replace(target.href + window.location.hash);
}

function init() {
  const links = Array.from(document.querySelectorAll(SWITCH_SELECTOR));
  links.forEach((a) => a.addEventListener('click', () => save(a.dataset.lang)));
  redirectToSaved(links);
}

init();
